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
    condition: (_e, data, matches) => {
      // If the player takes no damage, they did the mechanic correctly.
      return data.DamageFromMatches(matches) > 0;
    },
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL2J1ZmZzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAwLW1pc2MvZ2VuZXJhbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL3Rlc3QuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL2lmcml0LW5tLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1ubS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvbGV2aS1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvc2hpdmEtaG0uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3NoaXZhLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1obS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4tZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvcmFpZC9hMTJuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28ybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28zbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL283cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xMnMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvYnlha2tvLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3NoaW5yeXUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvc3VzYW5vLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vYW1hdXJvdC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2guanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uxbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMXMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTJuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uycy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lM24uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTNzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U0bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNHMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTVuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U1cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNm4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTZzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U3bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lN3MuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZThuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U4cy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lOW4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTlzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMG4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEwcy5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTFuLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMXMuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEybi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTJzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvaGFkZXMtZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2hhZGVzLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2lubm9jZW5jZS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvbGV2aS11bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXguanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9zaGl2YS11bi5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW5pYS1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdGl0YW4tdW4uanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC93b2wuanMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3dvbC1leC5qcyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLmpzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhL29vcHN5X21hbmlmZXN0LnR4dCJdLCJuYW1lcyI6WyJhYmlsaXR5Q29sbGVjdFNlY29uZHMiLCJlZmZlY3RDb2xsZWN0U2Vjb25kcyIsIm1pc3NlZEZ1bmMiLCJhcmdzIiwiaWQiLCJ0cmlnZ2VySWQiLCJuZXRSZWdleCIsImNvbmRpdGlvbiIsIl9ldnQiLCJkYXRhIiwibWF0Y2hlcyIsInNvdXJjZUlkIiwidG9VcHBlckNhc2UiLCJwYXJ0eSIsInBhcnR5SWRzIiwiaW5jbHVkZXMiLCJwZXRJZFRvT3duZXJJZCIsIm93bmVySWQiLCJjb2xsZWN0U2Vjb25kcyIsIm1pc3Rha2UiLCJfYWxsRXZlbnRzIiwiYWxsTWF0Y2hlcyIsInBhcnR5TmFtZXMiLCJnb3RCdWZmTWFwIiwibmFtZSIsImZpcnN0TWF0Y2giLCJzb3VyY2VOYW1lIiwic291cmNlIiwicGV0SWQiLCJvd25lck5hbWUiLCJuYW1lRnJvbUlkIiwiY29uc29sZSIsImVycm9yIiwiaWdub3JlU2VsZiIsInRoaW5nTmFtZSIsImZpZWxkIiwidGFyZ2V0IiwibWlzc2VkIiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlciIsIngiLCJsZW5ndGgiLCJ0eXBlIiwiYmxhbWUiLCJ0ZXh0IiwiZW4iLCJtYXAiLCJTaG9ydE5hbWUiLCJqb2luIiwiZGUiLCJmciIsImphIiwiY24iLCJrbyIsIm1pc3NlZE1pdGlnYXRpb25CdWZmIiwiZWZmZWN0SWQiLCJKU09OIiwic3RyaW5naWZ5IiwiTmV0UmVnZXhlcyIsIm1pc3NlZERhbWFnZUFiaWxpdHkiLCJhYmlsaXR5SWQiLCJtaXNzZWRIZWFsIiwibWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkiLCJ6b25lSWQiLCJab25lSWQiLCJ0cmlnZ2VycyIsInJ1biIsIl9lIiwiX2RhdGEiLCJsb3N0Rm9vZCIsImluQ29tYmF0IiwiSXNQbGF5ZXJJZCIsImxpbmUiLCJuZXRSZWdleEZyIiwibmV0UmVnZXhKYSIsIm5ldFJlZ2V4Q24iLCJuZXRSZWdleEtvIiwibWUiLCJmdWxsVGV4dCIsImRhbWFnZVJlZ2V4IiwiZSIsImF0dGFja2VyTmFtZSIsInN0cmlraW5nRHVtbXlOYW1lcyIsInRhcmdldE5hbWUiLCJib290Q291bnQiLCJhYmlsaXR5TmFtZSIsImRhbWFnZVN0ciIsImVmZmVjdCIsInN1cHByZXNzU2Vjb25kcyIsImV2ZW50cyIsInBva2VzIiwiZGFtYWdlV2FybiIsInNoYXJlV2FybiIsImRhbWFnZUZhaWwiLCJnYWluc0VmZmVjdFdhcm4iLCJnYWluc0VmZmVjdEZhaWwiLCJkZWF0aFJlYXNvbiIsInJlYXNvbiIsInNoYXJlRmFpbCIsInNlZW5EaWFtb25kRHVzdCIsInNvbG9XYXJuIiwicGFyc2VGbG9hdCIsImR1cmF0aW9uIiwiem9tYmllIiwiYWJpbGl0eSIsInNoaWVsZCIsImhhc0ltcCIsImRhbWFnZSIsImFzc2F1bHQiLCJwdXNoIiwiZGVsYXlTZWNvbmRzIiwiYWJpbGl0eVdhcm4iLCJmbGFncyIsInN1YnN0ciIsInNvbG9GYWlsIiwiY2FwdHVyZSIsIm5ldFJlZ2V4RGUiLCJwaGFzZU51bWJlciIsImluaXRpYWxpemVkIiwiZ2FtZUNvdW50IiwidGFyZ2V0SWQiLCJEYW1hZ2VGcm9tTWF0Y2hlcyIsImlzRGVjaXNpdmVCYXR0bGVFbGVtZW50IiwiaXNOZW9FeGRlYXRoIiwiaGFzQmV5b25kRGVhdGgiLCJ2dWxuIiwiaGFzRG9vbSIsImR1cmF0aW9uU2Vjb25kcyIsInNsaWNlIiwiZmF1bHRMaW5lVGFyZ2V0IiwiaGFzT3JiIiwiY2xvdWRNYXJrZXJzIiwibSIsIm5vT3JiIiwic3RyIiwiaGF0ZWQiLCJ3cm9uZ0J1ZmYiLCJub0J1ZmYiLCJoYXNBc3RyYWwiLCJoYXNVbWJyYWwiLCJmaXJzdEhlYWRtYXJrZXIiLCJwYXJzZUludCIsImdldEhlYWRtYXJrZXJJZCIsImRlY09mZnNldCIsInRvU3RyaW5nIiwicGFkU3RhcnQiLCJmaXJzdExhc2VyTWFya2VyIiwibGFzdExhc2VyTWFya2VyIiwibGFzZXJOYW1lVG9OdW0iLCJzY3VscHR1cmVZUG9zaXRpb25zIiwieSIsInNjdWxwdHVyZVRldGhlck5hbWVUb0lkIiwiYmxhZGVPZkZsYW1lQ291bnQiLCJudW1iZXIiLCJuYW1lcyIsIndpdGhOdW0iLCJvd25lcnMiLCJtaW5pbXVtWWFsbXNGb3JTdGF0dWVzIiwiaXNTdGF0dWVQb3NpdGlvbktub3duIiwiaXNTdGF0dWVOb3J0aCIsInNjdWxwdHVyZUlkcyIsIm90aGVySWQiLCJzb3VyY2VZIiwib3RoZXJZIiwieURpZmYiLCJNYXRoIiwiYWJzIiwib3duZXIiLCJvd25lck5pY2siLCJwaWxsYXJJZFRvT3duZXIiLCJwaWxsYXJPd25lciIsImZpcmUiLCJzbWFsbExpb25JZFRvT3duZXIiLCJzbWFsbExpb25Pd25lcnMiLCJoYXNTbWFsbExpb24iLCJoYXNGaXJlRGVidWZmIiwiY2VudGVyWSIsImRpck9iaiIsIk91dHB1dHMiLCJub3J0aEJpZ0xpb24iLCJzaW5nbGVUYXJnZXQiLCJvdXRwdXQiLCJzb3V0aEJpZ0xpb24iLCJzaGFyZWQiLCJmaXJlRGVidWZmIiwibGFiZWxzIiwicGFyc2VyTGFuZyIsImhhc0RhcmsiLCJqYWdkVGV0aGVyIiwiYXR0YWNrZXJJZCIsInVuZGVmaW5lZCIsImlzVGFuayIsImhhc1Rocm90dGxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0NBR0E7O0FBQ0EsTUFBTUEscUJBQXFCLEdBQUcs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dUMsZ0JBQU0sK0JBQStCLFFBQU0sc0NBQXNDLGdCQUFNLDZDQUE2Qyx1QkFBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSxzQ0FBc0MsaUJBQU0sbUNBQW1DLGNBQU0sc0NBQXNDLGlCQUFNLG1DQUFtQyxjQUFNLDZCQUE2QixRQUFNLDBCQUEwQixLQUFNLGlDQUFpQyxZQUFNLDhCQUE4QixTQUFNLDRCQUE0QixPQUFNLG1DQUFtQyxjQUFNLGdDQUFnQyxXQUFNLDZCQUE2QixRQUFNLDRCQUE0QixPQUFNLCtCQUErQixVQUFNLDZCQUE2QixRQUFNLDZCQUE2QixRQUFNLHdCQUF3QixHQUFNLDJCQUEyQixNQUFNLDZDQUE2QyxxQkFBTSxFQUFFLEUiLCJmaWxlIjoidWkvY29tbW9uL29vcHN5cmFpZHN5X2RhdGEuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIEFiaWxpdGllcyBzZWVtIGluc3RhbnQuXHJcbmNvbnN0IGFiaWxpdHlDb2xsZWN0U2Vjb25kcyA9IDAuNTtcclxuLy8gT2JzZXJ2YXRpb246IHVwIHRvIH4xLjIgc2Vjb25kcyBmb3IgYSBidWZmIHRvIHJvbGwgdGhyb3VnaCB0aGUgcGFydHkuXHJcbmNvbnN0IGVmZmVjdENvbGxlY3RTZWNvbmRzID0gMi4wO1xyXG5cclxuLy8gYXJnczogdHJpZ2dlcklkLCBuZXRSZWdleCwgZmllbGQsIHR5cGUsIGlnbm9yZVNlbGZcclxuY29uc3QgbWlzc2VkRnVuYyA9IChhcmdzKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIC8vIFN1cmUsIG5vdCBhbGwgb2YgdGhlc2UgYXJlIFwiYnVmZnNcIiBwZXIgc2UsIGJ1dCB0aGV5J3JlIGFsbCBpbiB0aGUgYnVmZnMgZmlsZS5cclxuICAgIGlkOiAnQnVmZiAnICsgYXJncy50cmlnZ2VySWQsXHJcbiAgICBuZXRSZWdleDogYXJncy5uZXRSZWdleCxcclxuICAgIGNvbmRpdGlvbjogKF9ldnQsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgY29uc3Qgc291cmNlSWQgPSBtYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgIGlmIChkYXRhLnBhcnR5LnBhcnR5SWRzLmluY2x1ZGVzKHNvdXJjZUlkKSlcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgIGlmIChkYXRhLnBldElkVG9Pd25lcklkKSB7XHJcbiAgICAgICAgY29uc3Qgb3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWRbc291cmNlSWRdO1xyXG4gICAgICAgIGlmIChvd25lcklkICYmIGRhdGEucGFydHkucGFydHlJZHMuaW5jbHVkZXMob3duZXJJZCkpXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIGNvbGxlY3RTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzLFxyXG4gICAgbWlzdGFrZTogKF9hbGxFdmVudHMsIGRhdGEsIGFsbE1hdGNoZXMpID0+IHtcclxuICAgICAgY29uc3QgcGFydHlOYW1lcyA9IGRhdGEucGFydHkucGFydHlOYW1lcztcclxuXHJcbiAgICAgIC8vIFRPRE86IGNvbnNpZGVyIGRlYWQgcGVvcGxlIHNvbWVob3dcclxuICAgICAgY29uc3QgZ290QnVmZk1hcCA9IHt9O1xyXG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgcGFydHlOYW1lcylcclxuICAgICAgICBnb3RCdWZmTWFwW25hbWVdID0gZmFsc2U7XHJcblxyXG4gICAgICBjb25zdCBmaXJzdE1hdGNoID0gYWxsTWF0Y2hlc1swXTtcclxuICAgICAgbGV0IHNvdXJjZU5hbWUgPSBmaXJzdE1hdGNoLnNvdXJjZTtcclxuICAgICAgLy8gQmxhbWUgcGV0IG1pc3Rha2VzIG9uIG93bmVycy5cclxuICAgICAgaWYgKGRhdGEucGV0SWRUb093bmVySWQpIHtcclxuICAgICAgICBjb25zdCBwZXRJZCA9IGZpcnN0TWF0Y2guc291cmNlSWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBvd25lcklkID0gZGF0YS5wZXRJZFRvT3duZXJJZFtwZXRJZF07XHJcbiAgICAgICAgaWYgKG93bmVySWQpIHtcclxuICAgICAgICAgIGNvbnN0IG93bmVyTmFtZSA9IGRhdGEucGFydHkubmFtZUZyb21JZChvd25lcklkKTtcclxuICAgICAgICAgIGlmIChvd25lck5hbWUpXHJcbiAgICAgICAgICAgIHNvdXJjZU5hbWUgPSBvd25lck5hbWU7XHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENvdWxkbid0IGZpbmQgbmFtZSBmb3IgJHtvd25lcklkfSBmcm9tIHBldCAke3BldElkfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFyZ3MuaWdub3JlU2VsZilcclxuICAgICAgICBnb3RCdWZmTWFwW3NvdXJjZU5hbWVdID0gdHJ1ZTtcclxuXHJcbiAgICAgIGNvbnN0IHRoaW5nTmFtZSA9IGZpcnN0TWF0Y2hbYXJncy5maWVsZF07XHJcbiAgICAgIGZvciAoY29uc3QgbWF0Y2hlcyBvZiBhbGxNYXRjaGVzKSB7XHJcbiAgICAgICAgLy8gSW4gY2FzZSB5b3UgaGF2ZSBtdWx0aXBsZSBwYXJ0eSBtZW1iZXJzIHdobyBoaXQgdGhlIHNhbWUgY29vbGRvd24gYXQgdGhlIHNhbWVcclxuICAgICAgICAvLyB0aW1lIChsb2w/KSwgdGhlbiBpZ25vcmUgYW55Ym9keSB3aG8gd2Fzbid0IHRoZSBmaXJzdC5cclxuICAgICAgICBpZiAobWF0Y2hlcy5zb3VyY2UgIT09IGZpcnN0TWF0Y2guc291cmNlKVxyXG4gICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgIGdvdEJ1ZmZNYXBbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbWlzc2VkID0gT2JqZWN0LmtleXMoZ290QnVmZk1hcCkuZmlsdGVyKCh4KSA9PiAhZ290QnVmZk1hcFt4XSk7XHJcbiAgICAgIGlmIChtaXNzZWQubGVuZ3RoID09PSAwKVxyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIC8vIFRPRE86IG9vcHN5IGNvdWxkIHJlYWxseSB1c2UgbW91c2VvdmVyIHBvcHVwcyBmb3IgZGV0YWlscy5cclxuICAgICAgLy8gVE9ETzogYWx0ZXJuYXRpdmVseSwgaWYgd2UgaGF2ZSBhIGRlYXRoIHJlcG9ydCwgaXQnZCBiZSBnb29kIHRvXHJcbiAgICAgIC8vIGV4cGxpY2l0bHkgY2FsbCBvdXQgdGhhdCBvdGhlciBwZW9wbGUgZ290IGEgaGVhbCB0aGlzIHBlcnNvbiBkaWRuJ3QuXHJcbiAgICAgIGlmIChtaXNzZWQubGVuZ3RoIDwgNCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiBhcmdzLnR5cGUsXHJcbiAgICAgICAgICBibGFtZTogc291cmNlTmFtZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IHRoaW5nTmFtZSArICcgbWlzc2VkICcgKyBtaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKSxcclxuICAgICAgICAgICAgZGU6IHRoaW5nTmFtZSArICcgdmVyZmVobHQgJyArIG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpLFxyXG4gICAgICAgICAgICBmcjogdGhpbmdOYW1lICsgJyBtYW5xdcOpKGUpIHN1ciAnICsgbWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJyksXHJcbiAgICAgICAgICAgIGphOiAnKCcgKyBtaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKSArICcpIOOBjCcgKyB0aGluZ05hbWUgKyAn44KS5Y+X44GR44Gq44GL44Gj44GfJyxcclxuICAgICAgICAgICAgY246IG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpICsgJyDmsqHlj5fliLAgJyArIHRoaW5nTmFtZSxcclxuICAgICAgICAgICAga286IHRoaW5nTmFtZSArICcgJyArIG1pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpICsgJ+yXkOqyjCDsoIHsmqnslYjrkKgnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIC8vIElmIHRoZXJlJ3MgdG9vIG1hbnkgcGVvcGxlLCBqdXN0IGxpc3QgdGhlIG51bWJlciBvZiBwZW9wbGUgbWlzc2VkLlxyXG4gICAgICAvLyBUT0RPOiB3ZSBjb3VsZCBhbHNvIGxpc3QgZXZlcnlib2R5IG9uIHNlcGFyYXRlIGxpbmVzP1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHR5cGU6IGFyZ3MudHlwZSxcclxuICAgICAgICBibGFtZTogc291cmNlTmFtZSxcclxuICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICBlbjogdGhpbmdOYW1lICsgJyBtaXNzZWQgJyArIG1pc3NlZC5sZW5ndGggKyAnIHBlb3BsZScsXHJcbiAgICAgICAgICBkZTogdGhpbmdOYW1lICsgJyB2ZXJmZWhsdGUgJyArIG1pc3NlZC5sZW5ndGggKyAnIFBlcnNvbmVuJyxcclxuICAgICAgICAgIGZyOiB0aGluZ05hbWUgKyAnIG1hbnF1w6koZSkgc3VyICcgKyBtaXNzZWQubGVuZ3RoICsgJyBwZXJzb25uZXMnLFxyXG4gICAgICAgICAgamE6IG1pc3NlZC5sZW5ndGggKyAn5Lq644GMJyArIHRoaW5nTmFtZSArICfjgpLlj5fjgZHjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgY246ICfmnIknICsgbWlzc2VkLmxlbmd0aCArICfkurrmsqHlj5fliLAgJyArIHRoaW5nTmFtZSxcclxuICAgICAgICAgIGtvOiB0aGluZ05hbWUgKyAnICcgKyBtaXNzZWQubGVuZ3RoICsgJ+uqheyXkOqyjCDsoIHsmqnslYjrkKgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWRNaXRpZ2F0aW9uQnVmZiA9IChhcmdzKSA9PiB7XHJcbiAgaWYgKCFhcmdzLmVmZmVjdElkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBlZmZlY3RJZDogJyArIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcclxuICByZXR1cm4gbWlzc2VkRnVuYyh7XHJcbiAgICB0cmlnZ2VySWQ6IGFyZ3MuaWQsXHJcbiAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiBhcmdzLmVmZmVjdElkIH0pLFxyXG4gICAgZmllbGQ6ICdlZmZlY3QnLFxyXG4gICAgdHlwZTogJ2hlYWwnLFxyXG4gICAgaWdub3JlU2VsZjogYXJncy5pZ25vcmVTZWxmLFxyXG4gICAgY29sbGVjdFNlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMgPyBhcmdzLmNvbGxlY3RTZWNvbmRzIDogZWZmZWN0Q29sbGVjdFNlY29uZHMsXHJcbiAgfSk7XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWREYW1hZ2VBYmlsaXR5ID0gKGFyZ3MpID0+IHtcclxuICBpZiAoIWFyZ3MuYWJpbGl0eUlkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBhYmlsaXR5SWQ6ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgcmV0dXJuIG1pc3NlZEZ1bmMoe1xyXG4gICAgdHJpZ2dlcklkOiBhcmdzLmlkLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBhcmdzLmFiaWxpdHlJZCB9KSxcclxuICAgIGZpZWxkOiAnYWJpbGl0eScsXHJcbiAgICB0eXBlOiAnZGFtYWdlJyxcclxuICAgIGlnbm9yZVNlbGY6IGFyZ3MuaWdub3JlU2VsZixcclxuICAgIGNvbGxlY3RTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzID8gYXJncy5jb2xsZWN0U2Vjb25kcyA6IGFiaWxpdHlDb2xsZWN0U2Vjb25kcyxcclxuICB9KTtcclxufTtcclxuXHJcbmNvbnN0IG1pc3NlZEhlYWwgPSAoYXJncykgPT4ge1xyXG4gIGlmICghYXJncy5hYmlsaXR5SWQpXHJcbiAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGFiaWxpdHlJZDogJyArIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcclxuICByZXR1cm4gbWlzc2VkRnVuYyh7XHJcbiAgICB0cmlnZ2VySWQ6IGFyZ3MuaWQsXHJcbiAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IGFyZ3MuYWJpbGl0eUlkIH0pLFxyXG4gICAgZmllbGQ6ICdhYmlsaXR5JyxcclxuICAgIHR5cGU6ICdoZWFsJyxcclxuICAgIGNvbGxlY3RTZWNvbmRzOiBhcmdzLmNvbGxlY3RTZWNvbmRzID8gYXJncy5jb2xsZWN0U2Vjb25kcyA6IGFiaWxpdHlDb2xsZWN0U2Vjb25kcyxcclxuICB9KTtcclxufTtcclxuXHJcbmNvbnN0IG1pc3NlZE1pdGlnYXRpb25BYmlsaXR5ID0gbWlzc2VkSGVhbDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYXRjaEFsbCxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0J1ZmYgUGV0IFRvIE93bmVyIE1hcHBlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFkZGVkQ29tYmF0YW50RnVsbCgpLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChtYXRjaGVzLm93bmVySWQgPT09ICcwJylcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgZGF0YS5wZXRJZFRvT3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWQgfHwge307XHJcbiAgICAgICAgLy8gRml4IGFueSBsb3dlcmNhc2UgaWRzLlxyXG4gICAgICAgIGRhdGEucGV0SWRUb093bmVySWRbbWF0Y2hlcy5pZC50b1VwcGVyQ2FzZSgpXSA9IG1hdGNoZXMub3duZXJJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdCdWZmIFBldCBUbyBPd25lciBDbGVhcmVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuY2hhbmdlWm9uZSgpLFxyXG4gICAgICBydW46IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIENsZWFyIHRoaXMgaGFzaCBwZXJpb2RpY2FsbHkgc28gaXQgZG9lc24ndCBoYXZlIGZhbHNlIHBvc2l0aXZlcy5cclxuICAgICAgICBkYXRhLnBldElkVG9Pd25lcklkID0ge307XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFByZWZlciBhYmlsaXRpZXMgdG8gZWZmZWN0cywgYXMgZWZmZWN0cyB0YWtlIGxvbmdlciB0byByb2xsIHRocm91Z2ggdGhlIHBhcnR5LlxyXG4gICAgLy8gSG93ZXZlciwgc29tZSB0aGluZ3MgYXJlIG9ubHkgZWZmZWN0cyBhbmQgc28gdGhlcmUgaXMgbm8gY2hvaWNlLlxyXG5cclxuICAgIC8vIEZvciB0aGluZ3MgeW91IGNhbiBzdGVwIGluIG9yIG91dCBvZiwgZ2l2ZSBhIGxvbmdlciB0aW1lcj8gIFRoaXMgaXNuJ3QgcGVyZmVjdC5cclxuICAgIC8vIFRPRE86IGluY2x1ZGUgc29pbCBoZXJlPz9cclxuICAgIG1pc3NlZE1pdGlnYXRpb25CdWZmKHsgaWQ6ICdDb2xsZWN0aXZlIFVuY29uc2Npb3VzJywgZWZmZWN0SWQ6ICczNTEnLCBjb2xsZWN0U2Vjb25kczogMTAgfSksXHJcbiAgICBtaXNzZWRNaXRpZ2F0aW9uQnVmZih7IGlkOiAnUGFzc2FnZSBvZiBBcm1zJywgZWZmZWN0SWQ6ICc0OTgnLCBpZ25vcmVTZWxmOiB0cnVlLCBjb2xsZWN0U2Vjb25kczogMTAgfSksXHJcblxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkJ1ZmYoeyBpZDogJ0RpdmluZSBWZWlsJywgZWZmZWN0SWQ6ICcyRDcnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIG1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdIZWFydCBPZiBMaWdodCcsIGFiaWxpdHlJZDogJzNGMjAnIH0pLFxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0RhcmsgTWlzc2lvbmFyeScsIGFiaWxpdHlJZDogJzQwNTcnIH0pLFxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1NoYWtlIEl0IE9mZicsIGFiaWxpdHlJZDogJzFDREMnIH0pLFxyXG5cclxuICAgIC8vIDNGNDQgaXMgdGhlIGNvcnJlY3QgUXVhZHJ1cGxlIFRlY2huaWNhbCBGaW5pc2gsIG90aGVycyBhcmUgRGlua3kgVGVjaG5pY2FsIEZpbmlzaC5cclxuICAgIG1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ1RlY2huaWNhbCBGaW5pc2gnLCBhYmlsaXR5SWQ6ICczRjRbMS00XScgfSksXHJcbiAgICBtaXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdEaXZpbmF0aW9uJywgYWJpbGl0eUlkOiAnNDBBOCcgfSksXHJcbiAgICBtaXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdCcm90aGVyaG9vZCcsIGFiaWxpdHlJZDogJzFDRTQnIH0pLFxyXG4gICAgbWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnQmF0dGxlIExpdGFueScsIGFiaWxpdHlJZDogJ0RFNScgfSksXHJcbiAgICBtaXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdFbWJvbGRlbicsIGFiaWxpdHlJZDogJzFENjAnIH0pLFxyXG4gICAgbWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnQmF0dGxlIFZvaWNlJywgYWJpbGl0eUlkOiAnNzYnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIC8vIFRvbyBub2lzeSAocHJvY3MgZXZlcnkgdGhyZWUgc2Vjb25kcywgYW5kIGJhcmRzIG9mdGVuIG9mZiBkb2luZyBtZWNoYW5pY3MpLlxyXG4gICAgLy8gbWlzc2VkRGFtYWdlQnVmZih7IGlkOiAnV2FuZGVyZXJcXCdzIE1pbnVldCcsIGVmZmVjdElkOiAnOEE4JywgaWdub3JlU2VsZjogdHJ1ZSB9KSxcclxuICAgIC8vIG1pc3NlZERhbWFnZUJ1ZmYoeyBpZDogJ01hZ2VcXCdzIEJhbGxhZCcsIGVmZmVjdElkOiAnOEE5JywgaWdub3JlU2VsZjogdHJ1ZSB9KSxcclxuICAgIC8vIG1pc3NlZERhbWFnZUJ1ZmYoeyBpZDogJ0FybXlcXCdzIFBhZW9uJywgZWZmZWN0SWQ6ICc4QUEnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG5cclxuICAgIG1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdUcm91YmFkb3VyJywgYWJpbGl0eUlkOiAnMUNFRCcgfSksXHJcbiAgICBtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnVGFjdGljaWFuJywgYWJpbGl0eUlkOiAnNDFGOScgfSksXHJcbiAgICBtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnU2hpZWxkIFNhbWJhJywgYWJpbGl0eUlkOiAnM0U4QycgfSksXHJcblxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ01hbnRyYScsIGFiaWxpdHlJZDogJzQxJyB9KSxcclxuXHJcbiAgICBtaXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdEZXZvdGlvbicsIGFiaWxpdHlJZDogJzFEMUEnIH0pLFxyXG5cclxuICAgIC8vIE1heWJlIHVzaW5nIGEgaGVhbGVyIExCMS9MQjIgc2hvdWxkIGJlIGFuIGVycm9yIGZvciB0aGUgaGVhbGVyLiBPOilcclxuICAgIC8vIG1pc3NlZEhlYWwoeyBpZDogJ0hlYWxpbmcgV2luZCcsIGFiaWxpdHlJZDogJ0NFJyB9KSxcclxuICAgIC8vIG1pc3NlZEhlYWwoeyBpZDogJ0JyZWF0aCBvZiB0aGUgRWFydGgnLCBhYmlsaXR5SWQ6ICdDRicgfSksXHJcblxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnTWVkaWNhJywgYWJpbGl0eUlkOiAnN0MnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnTWVkaWNhIElJJywgYWJpbGl0eUlkOiAnODUnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnQWZmbGF0dXMgUmFwdHVyZScsIGFiaWxpdHlJZDogJzQwOTYnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnVGVtcGVyYW5jZScsIGFiaWxpdHlJZDogJzc1MScgfSksXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdQbGVuYXJ5IEluZHVsZ2VuY2UnLCBhYmlsaXR5SWQ6ICcxRDA5JyB9KSxcclxuICAgIG1pc3NlZEhlYWwoeyBpZDogJ1B1bHNlIG9mIExpZmUnLCBhYmlsaXR5SWQ6ICdEMCcgfSksXHJcblxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnU3VjY29yJywgYWJpbGl0eUlkOiAnQkEnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnSW5kb21pdGFiaWxpdHknLCBhYmlsaXR5SWQ6ICdERkYnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnRGVwbG95bWVudCBUYWN0aWNzJywgYWJpbGl0eUlkOiAnRTAxJyB9KSxcclxuICAgIG1pc3NlZEhlYWwoeyBpZDogJ1doaXNwZXJpbmcgRGF3bicsIGFiaWxpdHlJZDogJzMyMycgfSksXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdGZXkgQmxlc3NpbmcnLCBhYmlsaXR5SWQ6ICc0MEEwJyB9KSxcclxuICAgIG1pc3NlZEhlYWwoeyBpZDogJ0NvbnNvbGF0aW9uJywgYWJpbGl0eUlkOiAnNDBBMycgfSksXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdBbmdlbFxcJ3MgV2hpc3BlcicsIGFiaWxpdHlJZDogJzQwQTYnIH0pLFxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0ZleSBJbGx1bWluYXRpb24nLCBhYmlsaXR5SWQ6ICczMjUnIH0pLFxyXG4gICAgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1NlcmFwaGljIElsbHVtaW5hdGlvbicsIGFiaWxpdHlJZDogJzQwQTcnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnQW5nZWwgRmVhdGhlcnMnLCBhYmlsaXR5SWQ6ICcxMDk3JyB9KSxcclxuXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdIZWxpb3MnLCBhYmlsaXR5SWQ6ICdFMTAnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnQXNwZWN0ZWQgSGVsaW9zJywgYWJpbGl0eUlkOiAnRTExJyB9KSxcclxuICAgIG1pc3NlZEhlYWwoeyBpZDogJ0FzcGVjdGVkIEhlbGlvcycsIGFiaWxpdHlJZDogJzMyMDAnIH0pLFxyXG4gICAgbWlzc2VkSGVhbCh7IGlkOiAnQ2VsZXN0aWFsIE9wcG9zaXRpb24nLCBhYmlsaXR5SWQ6ICc0MEE5JyB9KSxcclxuICAgIG1pc3NlZEhlYWwoeyBpZDogJ0FzdHJhbCBTdGFzaXMnLCBhYmlsaXR5SWQ6ICcxMDk4JyB9KSxcclxuXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdXaGl0ZSBXaW5kJywgYWJpbGl0eUlkOiAnMkM4RScgfSksXHJcbiAgICBtaXNzZWRIZWFsKHsgaWQ6ICdHb2Jza2luJywgYWJpbGl0eUlkOiAnNDc4MCcgfSksXHJcblxyXG4gICAgLy8gVE9ETzogZXhwb3J0IGFsbCBvZiB0aGVzZSBtaXNzZWQgZnVuY3Rpb25zIGludG8gdGhlaXIgb3duIGhlbHBlclxyXG4gICAgLy8gYW5kIHRoZW4gYWRkIHRoaXMgdG8gdGhlIERlbHVicnVtIFJlZ2luYWUgZmlsZXMgZGlyZWN0bHkuXHJcbiAgICBtaXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnTG9zdCBBZXRoZXJzaGllbGQnLCBhYmlsaXR5SWQ6ICc1NzUzJyB9KSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gR2VuZXJhbCBtaXN0YWtlczsgdGhlc2UgYXBwbHkgZXZlcnl3aGVyZS5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hdGNoQWxsLFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRyaWdnZXIgaWQgZm9yIGludGVybmFsbHkgZ2VuZXJhdGVkIGVhcmx5IHB1bGwgd2FybmluZy5cclxuICAgICAgaWQ6ICdHZW5lcmFsIEVhcmx5IFB1bGwnLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIEZvb2QgQnVmZicsXHJcbiAgICAgIC8vIFdlbGwgRmVkXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0OCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFByZXZlbnQgXCJFb3MgbG9zZXMgdGhlIGVmZmVjdCBvZiBXZWxsIEZlZCBmcm9tIENyaXRsbyBNY2dlZVwiXHJcbiAgICAgICAgcmV0dXJuIG1hdGNoZXMudGFyZ2V0ID09PSBtYXRjaGVzLnNvdXJjZTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5sb3N0Rm9vZCA9IGRhdGEubG9zdEZvb2QgfHwge307XHJcbiAgICAgICAgLy8gV2VsbCBGZWQgYnVmZiBoYXBwZW5zIHJlcGVhdGVkbHkgd2hlbiBpdCBmYWxscyBvZmYgKFdIWSksXHJcbiAgICAgICAgLy8gc28gc3VwcHJlc3MgbXVsdGlwbGUgb2NjdXJyZW5jZXMuXHJcbiAgICAgICAgaWYgKCFkYXRhLmluQ29tYmF0IHx8IGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2xvc3QgZm9vZCBidWZmJyxcclxuICAgICAgICAgICAgZGU6ICdOYWhydW5nc2J1ZmYgdmVybG9yZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0J1ZmYgbm91cnJpdHVyZSB0ZXJtaW7DqWUnLFxyXG4gICAgICAgICAgICBqYTogJ+mjr+WKueaenOOBjOWkseOBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5aSx5Y676aOf54mpQlVGRicsXHJcbiAgICAgICAgICAgIGtvOiAn7J2M7IudIOuyhO2UhCDtlbTsoJwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIFdlbGwgRmVkJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ4JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEubG9zdEZvb2QpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZGVsZXRlIGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIFJhYmJpdCBNZWRpdW0nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc4RTAnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5Jc1BsYXllcklkKG1hdGNoZXMuc291cmNlSWQpLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnNvdXJjZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdidW5ueScsXHJcbiAgICAgICAgICAgIGRlOiAnSGFzZScsXHJcbiAgICAgICAgICAgIGZyOiAnbGFwaW4nLFxyXG4gICAgICAgICAgICBqYTogJ+OBhuOBleOBjicsXHJcbiAgICAgICAgICAgIGNuOiAn5YWU5a2QJyxcclxuICAgICAgICAgICAga286ICfthqDrgbwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGVzdCBtaXN0YWtlIHRyaWdnZXJzLlxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWlkZGxlTGFOb3NjZWEsXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IEJvdycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBib3cgY291cnRlb3VzbHkgdG8gdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIHZvdXMgaW5jbGluZXogZGV2YW50IGxlIG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgavjgYrovp7lhIDjgZfjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q5oGt5pWs5Zyw5a+55pyo5Lq66KGM56S8Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleyXkOqyjCDqs7XshpDtlZjqsowg7J247IKs7ZWp64uI64ukLio/JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdwdWxsJyxcclxuICAgICAgICAgIGJsYW1lOiBkYXRhLm1lLFxyXG4gICAgICAgICAgZnVsbFRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb3cnLFxyXG4gICAgICAgICAgICBkZTogJ0JvZ2VuJyxcclxuICAgICAgICAgICAgZnI6ICdTYWx1ZXInLFxyXG4gICAgICAgICAgICBqYTogJ+OBiui+nuWEgCcsXHJcbiAgICAgICAgICAgIGNuOiAn6Z6g6LqsJyxcclxuICAgICAgICAgICAga286ICfsnbjsgqwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IFdpcGUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgYmlkIGZhcmV3ZWxsIHRvIHRoZSBzdHJpa2luZyBkdW1teS4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnVm91cyBmYWl0ZXMgdm9zIGFkaWV1eCBhdSBtYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q44Gv5pyo5Lq644Gr5Yil44KM44Gu5oyo5ou244KS44GX44GfLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuWQkeacqOS6uuWRiuWIqy4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirrgpjrrLTsnbjtmJXsl5Dqsowg7J6R67OEIOyduOyCrOulvCDtlanri4jri6QuKj8nIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dpcGUnLFxyXG4gICAgICAgICAgYmxhbWU6IGRhdGEubWUsXHJcbiAgICAgICAgICBmdWxsVGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1BhcnR5IFdpcGUnLFxyXG4gICAgICAgICAgICBkZTogJ0dydXBwZW53aXBlJyxcclxuICAgICAgICAgICAgZnI6ICdQYXJ0eSBXaXBlJyxcclxuICAgICAgICAgICAgamE6ICfjg6/jgqTjg5cnLFxyXG4gICAgICAgICAgICBjbjogJ+WboueBrScsXHJcbiAgICAgICAgICAgIGtvOiAn7YyM7YuwIOyghOupuCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgQm9vdHNoaW5lJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICczNScsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICBpZiAoZS5hdHRhY2tlck5hbWUgIT09IGRhdGEubWUpXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgY29uc3Qgc3RyaWtpbmdEdW1teU5hbWVzID0gW1xyXG4gICAgICAgICAgJ1N0cmlraW5nIER1bW15JyxcclxuICAgICAgICAgICdNYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQnLFxyXG4gICAgICAgICAgJ+acqOS6uicsIC8vIFN0cmlraW5nIER1bW15IGNhbGxlZCBg5pyo5Lq6YCBpbiBDTiBhcyB3ZWxsIGFzIEpBXHJcbiAgICAgICAgICAn64KY66y07J247ZiVJyxcclxuICAgICAgICAgIC8vIEZJWE1FOiBhZGQgb3RoZXIgbGFuZ3VhZ2VzIGhlcmVcclxuICAgICAgICBdO1xyXG4gICAgICAgIHJldHVybiBzdHJpa2luZ0R1bW15TmFtZXMuaW5jbHVkZXMoZS50YXJnZXROYW1lKTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmJvb3RDb3VudCA9IGRhdGEuYm9vdENvdW50IHx8IDA7XHJcbiAgICAgICAgZGF0YS5ib290Q291bnQrKztcclxuICAgICAgICBjb25zdCB0ZXh0ID0gZS5hYmlsaXR5TmFtZSArICcgKCcgKyBkYXRhLmJvb3RDb3VudCArICcpOiAnICsgZS5kYW1hZ2VTdHI7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZGF0YS5tZSwgdGV4dDogdGV4dCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IExlYWRlbiBGaXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzc0NScgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnNvdXJjZSA9PT0gZGF0YS5tZSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2dvb2QnLCBibGFtZTogZGF0YS5tZSwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBPb3BzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZWNobyh7IGxpbmU6ICcuKm9vcHMuKicgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMTAsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGRhdGEubWUsIHRleHQ6IG1hdGNoZXMubGluZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IFBva2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdZb3UgcG9rZSB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdG91Y2hleiBsw6lnw6hyZW1lbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50IGR1IGRvaWd0Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOCkuOBpOOBpOOBhOOBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirnlKjmiYvmjIfmiLPlkJHmnKjkurouKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7J2EIOy/oey/oSDssIzrpoXri4jri6QuKj8nIH0pLFxyXG4gICAgICBjb2xsZWN0U2Vjb25kczogNSxcclxuICAgICAgbWlzdGFrZTogKGV2ZW50cywgZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIFdoZW4gY29sbGVjdFNlY29uZHMgaXMgc3BlY2lmaWVkLCBldmVudHMgYXJlIHBhc3NlZCBhcyBhbiBhcnJheS5cclxuICAgICAgICBjb25zdCBwb2tlcyA9IGV2ZW50cy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIDEgcG9rZSBhdCBhIHRpbWUgaXMgZmluZSwgYnV0IG1vcmUgdGhhbiBvbmUgaW5zaWRlIG9mXHJcbiAgICAgICAgLy8gY29sbGVjdFNlY29uZHMgaXMgKE9CVklPVVNMWSkgYSBtaXN0YWtlLlxyXG4gICAgICAgIGlmIChwb2tlcyA8PSAxKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSB7XHJcbiAgICAgICAgICBlbjogJ1RvbyBtYW55IHBva2VzICgnICsgcG9rZXMgKyAnKScsXHJcbiAgICAgICAgICBkZTogJ1p1IHZpZWxlIFBpZWtzZXIgKCcgKyBwb2tlcyArICcpJyxcclxuICAgICAgICAgIGZyOiAnVHJvcCBkZSB0b3VjaGVzICgnICsgcG9rZXMgKyAnKScsXHJcbiAgICAgICAgICBqYTogJ+OBhOOBo+OBseOBhOOBpOOBpOOBhOOBnyAoJyArIHBva2VzICsgJyknLFxyXG4gICAgICAgICAgY246ICfmiLPlpKrlpJrkuIvllaYgKCcgKyBwb2tlcyArICcpJyxcclxuICAgICAgICAgIGtvOiAn64SI66y0IOunjuydtCDssIzrpoQgKCcgKyBwb2tlcyArICfrsogpJyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGRhdGEubWUsIHRleHQ6IHRleHQgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBJZnJpdCBTdG9yeSBNb2RlXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVCb3dsT2ZFbWJlcnMsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lmcml0Tm0gUmFkaWFudCBQbHVtZSc6ICcyREUnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnSWZyaXRObSBJbmNpbmVyYXRlJzogJzFDNScsXHJcbiAgICAnSWZyaXRObSBFcnVwdGlvbic6ICcyREQnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGl0YW4gU3RvcnkgTW9kZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTmF2ZWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuTm0gV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzNDRCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5ObSBMYW5kc2xpZGUnOiAnMjhBJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuTm0gUm9jayBCdXN0ZXInOiAnMjgxJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gSXQncyBoYXJkIHRvIGNhcHR1cmUgdGhlIHJlZmxlY3Rpb24gYWJpbGl0aWVzIGZyb20gTGV2aWF0aGFuJ3MgSGVhZCBhbmQgVGFpbCBpZiB5b3UgdXNlXHJcbi8vIHJhbmdlZCBwaHlzaWNhbCBhdHRhY2tzIC8gbWFnaWMgYXR0YWNrcyByZXNwZWN0aXZlbHksIGFzIHRoZSBhYmlsaXR5IG5hbWVzIGFyZSB0aGVcclxuLy8gYWJpbGl0eSB5b3UgdXNlZCBhbmQgZG9uJ3QgYXBwZWFyIHRvIHNob3cgdXAgaW4gdGhlIGxvZyBhcyBub3JtYWwgXCJhYmlsaXR5XCIgbGluZXMuXHJcbi8vIFRoYXQgc2FpZCwgZG90cyBzdGlsbCB0aWNrIGluZGVwZW5kZW50bHkgb24gYm90aCBzbyBpdCdzIGxpa2VseSB0aGF0IHBlb3BsZSB3aWxsIGF0YWNrXHJcbi8vIHRoZW0gYW55d2F5LlxyXG5cclxuLy8gVE9ETzogRmlndXJlIG91dCB3aHkgRHJlYWQgVGlkZSAvIFdhdGVyc3BvdXQgYXBwZWFyIGxpa2Ugc2hhcmVzIChpLmUuIDB4MTYgaWQpLlxyXG4vLyBEcmVhZCBUaWRlID0gODIzLzgyNC84MjUsIFdhdGVyc3BvdXQgPSA4MjlcclxuXHJcbi8vIExldmlhdGhhbiBFeHRyZW1lXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXaG9ybGVhdGVyRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTGV2aUV4IEdyYW5kIEZhbGwnOiAnODJGJywgLy8gdmVyeSBsYXJnZSBjaXJjdWxhciBhb2UgYmVmb3JlIHNwaW5ueSBkaXZlcywgYXBwbGllcyBoZWF2eVxyXG4gICAgJ0xldmlFeCBIeWRybyBTaG90JzogJzc0OCcsIC8vIFdhdmVzcGluZSBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIERyb3BzeSBlZmZlY3RcclxuICAgICdMZXZpRXggRHJlYWRzdG9ybSc6ICc3NDknLCAvLyBXYXZldG9vdGggU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBIeXN0ZXJpYSBlZmZlY3RcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdMZXZpRXggQm9keSBTbGFtJzogJzgyQScsIC8vIGxldmkgc2xhbSB0aGF0IHRpbHRzIHRoZSBib2F0XHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMSc6ICc4OEEnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMic6ICc4OEInLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMyc6ICc4MkMnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdMZXZpRXggRHJvcHN5JzogJzExMCcsIC8vIHN0YW5kaW5nIGluIHRoZSBoeWRybyBzaG90IGZyb20gdGhlIFdhdmVzcGluZSBTYWhhZ2luXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdMZXZpRXggSHlzdGVyaWEnOiAnMTI4JywgLy8gc3RhbmRpbmcgaW4gdGhlIGRyZWFkc3Rvcm0gZnJvbSB0aGUgV2F2ZXRvb3RoIFNhaGFnaW5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTGV2aUV4IEJvZHkgU2xhbSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzgyQScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFNoaXZhIEhhcmRcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFraEFmYWhBbXBoaXRoZWF0cmVIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIExhcmdlIHdoaXRlIGNpcmNsZXMuXHJcbiAgICAnU2hpdmFIbSBJY2ljbGUgSW1wYWN0JzogJzk5MycsXHJcbiAgICAvLyBBdm9pZGFibGUgdGFuayBzdHVuLlxyXG4gICAgJ1NoaXZhSG0gR2xhY2llciBCYXNoJzogJzlBMScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEtub2NrYmFjayB0YW5rIGNsZWF2ZS5cclxuICAgICdTaGl2YUhtIEhlYXZlbmx5IFN0cmlrZSc6ICc5QTAnLFxyXG4gICAgLy8gSGFpbHN0b3JtIHNwcmVhZCBtYXJrZXIuXHJcbiAgICAnU2hpdmFIbSBIYWlsc3Rvcm0nOiAnOTk4JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gVGFua2J1c3Rlci4gIFRoaXMgaXMgU2hpdmEgSGFyZCBtb2RlLCBub3QgU2hpdmEgRXh0cmVtZS4gIFBsZWFzZSFcclxuICAgICdTaGl2YUhtIEljZWJyYW5kJzogJzk5NicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhSG0gRGlhbW9uZCBEdXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnOThBJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuc2VlbkRpYW1vbmREdXN0ID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFIbSBEZWVwIEZyZWV6ZScsXHJcbiAgICAgIC8vIFNoaXZhIGFsc28gdXNlcyBhYmlsaXR5IDlBMyBvbiB5b3UsIGJ1dCBpdCBoYXMgdGhlIHVudHJhbnNsYXRlZCBuYW1lXHJcbiAgICAgIC8vIOmAj+aYju+8muOCt+ODtOOCoe+8muWHjee1kOODrOOCr+ODiO+8muODjuODg+OCr+ODkOODg+OCr+eUqC4gU28sIHVzZSB0aGUgZWZmZWN0IGluc3RlYWQgZm9yIGZyZWUgdHJhbnNsYXRpb24uXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxRTcnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBzbyBvbmx5IGEgbWlzdGFrZSBhZnRlciB0aGF0LlxyXG4gICAgICAgIC8vIFVubGlrZSBleHRyZW1lLCB0aGlzIGhhcyB0aGUgc2FtZSAyMCBzZWNvbmQgZHVyYXRpb24gYXMgdGhlIGludGVybWlzc2lvbi5cclxuICAgICAgICByZXR1cm4gZGF0YS5zZWVuRGlhbW9uZER1c3Q7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFNoaXZhIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFraEFmYWhBbXBoaXRoZWF0cmVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIExhcmdlIHdoaXRlIGNpcmNsZXMuXHJcbiAgICAnU2hpdmFFeCBJY2ljbGUgSW1wYWN0JzogJ0JFQicsXHJcbiAgICAvLyBcImdldCBpblwiIGFvZVxyXG4gICAgJ1NoaXZhRXggV2hpdGVvdXQnOiAnQkVDJyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFFeCBHbGFjaWVyIEJhc2gnOiAnQkU5JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIDI3MCBkZWdyZWUgYXR0YWNrLlxyXG4gICAgJ1NoaXZhRXggR2xhc3MgRGFuY2UnOiAnQkRGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gSGFpbHN0b3JtIHNwcmVhZCBtYXJrZXIuXHJcbiAgICAnU2hpdmFFeCBIYWlsc3Rvcm0nOiAnQkUyJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gTGFzZXIuICBUT0RPOiBtYXliZSBibGFtZSB0aGUgcGVyc29uIGl0J3Mgb24/P1xyXG4gICAgJ1NoaXZhRXggQXZhbGFuY2hlJzogJ0JFMCcsXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgLy8gUGFydHkgc2hhcmVkIHRhbmtidXN0ZXJcclxuICAgICdTaGl2YUV4IEljZWJyYW5kJzogJ0JFMScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhRXggRGVlcCBGcmVlemUnLFxyXG4gICAgICAvLyBTaGl2YSBhbHNvIHVzZXMgYWJpbGl0eSBDOEEgb24geW91LCBidXQgaXQgaGFzIHRoZSB1bnRyYW5zbGF0ZWQgbmFtZVxyXG4gICAgICAvLyDpgI/mmI7vvJrjgrfjg7TjgqHvvJrlh43ntZDjg6zjgq/jg4jvvJrjg47jg4Pjgq/jg5Djg4Pjgq/nlKgv44OS44Ot44Kk44OD44KvLiBTbywgdXNlIHRoZSBlZmZlY3QgaW5zdGVhZCBmb3IgZnJlZSB0cmFuc2xhdGlvbi5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFFNycgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBidXQgZm9yIGEgc2hvcnRlciBkdXJhdGlvbi5cclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSA+IDIwO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGl0YW4gSGFyZFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTmF2ZWxIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbkhtIFdlaWdodCBPZiBUaGUgTGFuZCc6ICc1NTMnLFxyXG4gICAgJ1RpdGFuSG0gQnVyc3QnOiAnNDFDJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbkhtIExhbmRzbGlkZSc6ICc1NTQnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5IbSBSb2NrIEJ1c3Rlcic6ICc1NTAnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVGl0YW5IbSBNb3VudGFpbiBCdXN0ZXInOiAnMjgzJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRpdGFuIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5FeCBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNUJFJyxcclxuICAgICdUaXRhbkV4IEJ1cnN0JzogJzVCRicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5FeCBMYW5kc2xpZGUnOiAnNUJCJyxcclxuICAgICdUaXRhbkV4IEdhb2xlciBMYW5kc2xpZGUnOiAnNUMzJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuRXggUm9jayBCdXN0ZXInOiAnNUI3JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuRXggTW91bnRhaW4gQnVzdGVyJzogJzVCOCcsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXZWVwaW5nQ2l0eU9mTWhhY2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgQ3JpdGljYWwgQml0ZSc6ICcxODQ4JywgLy8gU2Fyc3VjaHVzIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSZWFsbSBTaGFrZXInOiAnMTgzRScsIC8vIEZpcnN0IERhdWdodGVyIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIFNpbGtzY3JlZW4nOiAnMTgzQycsIC8vIEZpcnN0IERhdWdodGVyIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBTaWxrZW4gU3ByYXknOiAnMTgyNCcsIC8vIEFyYWNobmUgRXZlIHJlYXIgY29uYWwgYW9lXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAxJzogJzE4MzcnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAxXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAyJzogJzE4MzYnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAyXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAzJzogJzE4MzUnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAzXHJcbiAgICAnV2VlcGluZyBTcGlkZXIgVGhyZWFkJzogJzE4MzknLCAvLyBBcmFjaG5lIEV2ZSBzcGlkZXIgbGluZSBhb2VcclxuICAgICdXZWVwaW5nIEZpcmUgSUknOiAnMTg0RScsIC8vIEJsYWNrIE1hZ2UgQ29ycHNlIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIE5lY3JvcHVyZ2UnOiAnMTdENycsIC8vIEZvcmdhbGwgU2hyaXZlbGVkIFRhbG9uIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSb3R0ZW4gQnJlYXRoJzogJzE3RDAnLCAvLyBGb3JnYWxsIERhaGFrIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBNb3cnOiAnMTdEMicsIC8vIEZvcmdhbGwgSGFhZ2VudGkgdW5tYXJrZWQgY2xlYXZlXHJcbiAgICAnV2VlcGluZyBEYXJrIEVydXB0aW9uJzogJzE3QzMnLCAvLyBGb3JnYWxsIHB1ZGRsZSBtYXJrZXJcclxuICAgIC8vIDE4MDYgaXMgYWxzbyBGbGFyZSBTdGFyLCBidXQgaWYgeW91IGdldCBieSAxODA1IHlvdSBhbHNvIGdldCBoaXQgYnkgMTgwNj9cclxuICAgICdXZWVwaW5nIEZsYXJlIFN0YXInOiAnMTgwNScsIC8vIE96bWEgY3ViZSBwaGFzZSBkb251dFxyXG4gICAgJ1dlZXBpbmcgRXhlY3JhdGlvbic6ICcxODI5JywgLy8gT3ptYSB0cmlhbmdsZSBsYXNlclxyXG4gICAgJ1dlZXBpbmcgSGFpcmN1dCAxJzogJzE4MEInLCAvLyBDYWxvZmlzdGVyaSAxODAgY2xlYXZlIDFcclxuICAgICdXZWVwaW5nIEhhaXJjdXQgMic6ICcxODBGJywgLy8gQ2Fsb2Zpc3RlcmkgMTgwIGNsZWF2ZSAyXHJcbiAgICAnV2VlcGluZyBFbnRhbmdsZW1lbnQnOiAnMTgxRCcsIC8vIENhbG9maXN0ZXJpIGxhbmRtaW5lIHB1ZGRsZSBwcm9jXHJcbiAgICAnV2VlcGluZyBFdmlsIEN1cmwnOiAnMTgxNicsIC8vIENhbG9maXN0ZXJpIGF4ZVxyXG4gICAgJ1dlZXBpbmcgRXZpbCBUcmVzcyc6ICcxODE3JywgLy8gQ2Fsb2Zpc3RlcmkgYnVsYlxyXG4gICAgJ1dlZXBpbmcgRGVwdGggQ2hhcmdlJzogJzE4MjAnLCAvLyBDYWxvZmlzdGVyaSBjaGFyZ2UgdG8gZWRnZVxyXG4gICAgJ1dlZXBpbmcgRmVpbnQgUGFydGljbGUgQmVhbSc6ICcxOTI4JywgLy8gQ2Fsb2Zpc3Rlcmkgc2t5IGxhc2VyXHJcbiAgICAnV2VlcGluZyBFdmlsIFN3aXRjaCc6ICcxODE1JywgLy8gQ2Fsb2Zpc3RlcmkgbGFzZXJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdXZWVwaW5nIEFyYWNobmUgV2ViJzogJzE4NUUnLCAvLyBBcmFjaG5lIEV2ZSBoZWFkbWFya2VyIHdlYiBhb2VcclxuICAgICdXZWVwaW5nIEVhcnRoIEFldGhlcic6ICcxODQxJywgLy8gQXJhY2huZSBFdmUgb3Jic1xyXG4gICAgJ1dlZXBpbmcgRXBpZ3JhcGgnOiAnMTg1MicsIC8vIEhlYWRzdG9uZSB1bnRlbGVncmFwaGVkIGxhc2VyIGxpbmUgdGFuayBhdHRhY2tcclxuICAgIC8vIFRoaXMgaXMgdG9vIG5vaXN5LiAgQmV0dGVyIHRvIHBvcCB0aGUgYmFsbG9vbnMgdGhhbiB3b3JyeSBhYm91dCBmcmllbmRzLlxyXG4gICAgLy8gJ1dlZXBpbmcgRXhwbG9zaW9uJzogJzE4MDcnLCAvLyBPem1hc3BoZXJlIEN1YmUgb3JiIGV4cGxvc2lvblxyXG4gICAgJ1dlZXBpbmcgU3BsaXQgRW5kIDEnOiAnMTgwQycsIC8vIENhbG9maXN0ZXJpIHRhbmsgY2xlYXZlIDFcclxuICAgICdXZWVwaW5nIFNwbGl0IEVuZCAyJzogJzE4MTAnLCAvLyBDYWxvZmlzdGVyaSB0YW5rIGNsZWF2ZSAyXHJcbiAgICAnV2VlcGluZyBCbG9vZGllZCBOYWlsJzogJzE4MUYnLCAvLyBDYWxvZmlzdGVyaSBheGUvYnVsYiBhcHBlYXJpbmdcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgSHlzdGVyaWEnOiAnMTI4JywgLy8gQXJhY2huZSBFdmUgRnJvbmQgQWZmZWFyZFxyXG4gICAgJ1dlZXBpbmcgWm9tYmlmaWNhdGlvbic6ICcxNzMnLCAvLyBGb3JnYWxsIHRvbyBtYW55IHpvbWJpZSBwdWRkbGVzXHJcbiAgICAnV2VlcGluZyBUb2FkJzogJzFCNycsIC8vIEZvcmdhbGwgQnJhbmQgb2YgdGhlIEZhbGxlbiBmYWlsdXJlXHJcbiAgICAnV2VlcGluZyBEb29tJzogJzM4RScsIC8vIEZvcmdhbGwgSGFhZ2VudGkgTW9ydGFsIFJheVxyXG4gICAgJ1dlZXBpbmcgQXNzaW1pbGF0aW9uJzogJzQyQycsIC8vIE96bWFzaGFkZSBBc3NpbWlsYXRpb24gbG9vay1hd2F5XHJcbiAgICAnV2VlcGluZyBTdHVuJzogJzk1JywgLy8gQ2Fsb2Zpc3RlcmkgUGVuZXRyYXRpb24gbG9vay1hd2F5XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBHcmFkdWFsIFpvbWJpZmljYXRpb24gR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0MTUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuem9tYmllID0gZGF0YS56b21iaWUgfHwge307XHJcbiAgICAgICAgZGF0YS56b21iaWVbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIEdyYWR1YWwgWm9tYmlmaWNhdGlvbiBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzQxNScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPSBkYXRhLnpvbWJpZSB8fCB7fTtcclxuICAgICAgICBkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIE1lZ2EgRGVhdGgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxN0NBJyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuem9tYmllICYmICFkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgSGVhZHN0b25lIFNoaWVsZCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzE1RScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zaGllbGQgPSBkYXRhLnNoaWVsZCB8fCB7fTtcclxuICAgICAgICBkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXZWVwaW5nIEhlYWRzdG9uZSBTaGllbGQgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICcxNUUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc2hpZWxkID0gZGF0YS5zaGllbGQgfHwge307XHJcbiAgICAgICAgZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRmxhcmluZyBFcGlncmFwaCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzE4NTYnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5zaGllbGQgJiYgIWRhdGEuc2hpZWxkW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBuYW1lIGlzIGhlbHBmdWxseSBjYWxsZWQgXCJBdHRhY2tcIiBzbyBuYW1lIGl0IHNvbWV0aGluZyBlbHNlLlxyXG4gICAgICBpZDogJ1dlZXBpbmcgT3ptYSBUYW5rIExhc2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHR5cGU6ICcyMicsIGlkOiAnMTgzMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1RhbmsgTGFzZXInLFxyXG4gICAgICAgICAgICBkZTogJ1RhbmsgTGFzZXInLFxyXG4gICAgICAgICAgICBmcjogJ1RhbmsgTGFzZXInLFxyXG4gICAgICAgICAgICBqYTogJ+OCv+ODs+OCr+ODrOOCtuODvCcsXHJcbiAgICAgICAgICAgIGNuOiAn5Z2m5YWL5r+A5YWJJyxcclxuICAgICAgICAgICAga286ICftg7Hsu6Qg66CI7J207KCAJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBPem1hIEhvbHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxODJFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdTbGlkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ2lzdCBydW50ZXJnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDvvIEnLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwseuQqCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gQWV0aGVyb2NoZW1pY2FsIFJlc2VhcmNoIEZhY2lsaXR5XHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVBZXRoZXJvY2hlbWljYWxSZXNlYXJjaEZhY2lsaXR5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBUkYgR3JhbmQgU3dvcmQnOiAnMjE2JywgLy8gQ29uYWwgQW9FLCBTY3JhbWJsZWQgSXJvbiBHaWFudCB0cmFzaFxyXG4gICAgJ0FSRiBDZXJtZXQgRHJpbGwnOiAnMjBFJywgLy8gTGluZSBBb0UsIDZ0aCBMZWdpb24gTWFnaXRlayBWYW5ndWFyZCB0cmFzaFxyXG4gICAgJ0FSRiBNYWdpdGVrIFNsdWcnOiAnMTBEQicsIC8vIExpbmUgQW9FLCBib3NzIDFcclxuICAgICdBUkYgQWV0aGVyb2NoZW1pY2FsIEdyZW5hZG8nOiAnMTBFMicsIC8vIExhcmdlIHRhcmdldGVkIGNpcmNsZSBBb0UsIE1hZ2l0ZWsgVHVycmV0IElJLCBib3NzIDFcclxuICAgICdBUkYgTWFnaXRlayBTcHJlYWQnOiAnMTBEQycsIC8vIDI3MC1kZWdyZWUgcm9vbXdpZGUgQW9FLCBib3NzIDFcclxuICAgICdBUkYgRWVyaWUgU291bmR3YXZlJzogJzExNzAnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBDdWx0dXJlZCBFbXB1c2EgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgVGFpbCBTbGFwJzogJzEyNUYnLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIERhbmNlciB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBDYWxjaWZ5aW5nIE1pc3QnOiAnMTIzQScsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgTmFnYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBQdW5jdHVyZSc6ICcxMTcxJywgLy8gU2hvcnQgbGluZSBBb0UsIEN1bHR1cmVkIEVtcHVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBTaWRlc3dpcGUnOiAnMTFBNycsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgUmVwdG9pZCB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBHdXN0JzogJzM5NScsIC8vIFRhcmdldGVkIHNtYWxsIGNpcmNsZSBBb0UsIEN1bHR1cmVkIE1pcnJvcmtuaWdodCB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBNYXJyb3cgRHJhaW4nOiAnRDBFJywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBDaGltZXJhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFJpZGRsZSBPZiBUaGUgU3BoaW54JzogJzEwRTQnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBib3NzIDJcclxuICAgICdBUkYgS2EnOiAnMTA2RScsIC8vIENvbmFsIEFvRSwgYm9zcyAyXHJcbiAgICAnQVJGIFJvdG9zd2lwZSc6ICcxMUNDJywgLy8gQ29uYWwgQW9FLCBGYWNpbGl0eSBEcmVhZG5vdWdodCB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBBdXRvLWNhbm5vbnMnOiAnMTJEOScsIC8vIExpbmUgQW9FLCBNb25pdG9yaW5nIERyb25lIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIERlYXRoXFwncyBEb29yJzogJzRFQycsIC8vIExpbmUgQW9FLCBDdWx0dXJlZCBTaGFidGkgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBUkYgU3BlbGxzd29yZCc6ICc0RUInLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIFNoYWJ0aSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBFbmQgT2YgRGF5cyc6ICcxMEZEJywgLy8gTGluZSBBb0UsIGJvc3MgM1xyXG4gICAgJ0FSRiBCbGl6emFyZCBCdXJzdCc6ICcxMEZFJywgLy8gRml4ZWQgY2lyY2xlIEFvRXMsIElnZXlvcmhtLCBib3NzIDNcclxuICAgICdBUkYgRmlyZSBCdXJzdCc6ICcxMEZGJywgLy8gRml4ZWQgY2lyY2xlIEFvRXMsIExhaGFicmVhLCBib3NzIDNcclxuICAgICdBUkYgU2VhIE9mIFBpdGNoJzogJzEyREUnLCAvLyBUYXJnZXRlZCBwZXJzaXN0ZW50IGNpcmNsZSBBb0VzLCBib3NzIDNcclxuICAgICdBUkYgRGFyayBCbGl6emFyZCBJSSc6ICcxMEYzJywgLy8gUmFuZG9tIGNpcmNsZSBBb0VzLCBJZ2V5b3JobSwgYm9zcyAzXHJcbiAgICAnQVJGIERhcmsgRmlyZSBJSSc6ICcxMEY4JywgLy8gUmFuZG9tIGNpcmNsZSBBb0VzLCBMYWhhYnJlYSwgYm9zcyAzXHJcbiAgICAnQVJGIEFuY2llbnQgRXJ1cHRpb24nOiAnMTEwNCcsIC8vIFNlbGYtdGFyZ2V0ZWQgY2lyY2xlIEFvRSwgYm9zcyA0XHJcbiAgICAnQVJGIEVudHJvcGljIEZsYW1lJzogJzExMDgnLCAvLyBMaW5lIEFvRXMsICBib3NzIDRcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0FSRiBDaHRob25pYyBIdXNoJzogJzEwRTcnLCAvLyBJbnN0YW50IHRhbmsgY2xlYXZlLCBib3NzIDJcclxuICAgICdBUkYgSGVpZ2h0IE9mIENoYW9zJzogJzExMDEnLCAvLyBUYW5rIGNsZWF2ZSwgYm9zcyA0XHJcbiAgICAnQVJGIEFuY2llbnQgQ2lyY2xlJzogJzExMDInLCAvLyBUYXJnZXRlZCBkb251dCBBb0VzLCBib3NzIDRcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQVJGIFBldHJpZmFjdGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcwMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZS50YXJnZXQsIHRleHQ6IGUuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gRnJhY3RhbCBDb250aW51dW1cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUZyYWN0YWxDb250aW51dW0sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0ZyYWN0YWwgRG91YmxlIFNldmVyJzogJ0Y3RCcsIC8vIENvbmFscywgYm9zcyAxXHJcbiAgICAnRnJhY3RhbCBBZXRoZXJpYyBDb21wcmVzc2lvbic6ICdGODAnLCAvLyBHcm91bmQgQW9FIGNpcmNsZXMsIGJvc3MgMVxyXG4gICAgJ0ZyYWN0YWwgMTEtVG9uemUgU3dpcGUnOiAnRjgxJywgLy8gRnJvbnRhbCBjb25lLCBib3NzIDJcclxuICAgICdGcmFjdGFsIDEwLVRvbnplIFNsYXNoJzogJ0Y4MycsIC8vIEZyb250YWwgbGluZSwgYm9zcyAyXHJcbiAgICAnRnJhY3RhbCAxMTEtVG9uemUgU3dpbmcnOiAnRjg3JywgLy8gR2V0LW91dCBBb0UsIGJvc3MgMlxyXG4gICAgJ0ZyYWN0YWwgQnJva2VuIEdsYXNzJzogJ0Y4RScsIC8vIEdsb3dpbmcgcGFuZWxzLCBib3NzIDNcclxuICAgICdGcmFjdGFsIE1pbmVzJzogJ0Y5MCcsXHJcbiAgICAnRnJhY3RhbCBTZWVkIG9mIHRoZSBSaXZlcnMnOiAnRjkxJywgLy8gR3JvdW5kIEFvRSBjaXJjbGVzLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0ZyYWN0YWwgU2FuY3RpZmljYXRpb24nOiAnRjg5JywgLy8gSW5zdGFudCBjb25hbCBidXN0ZXIsIGJvc3MgM1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlR3JlYXRHdWJhbExpYnJhcnlIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdHdWJhbEhtIFRlcnJvciBFeWUnOiAnOTMwJywgLy8gQ2lyY2xlIEFvRSwgU3BpbmUgQnJlYWtlciB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gQmF0dGVyJzogJzE5OEEnLCAvLyBDaXJjbGUgQW9FLCB0cmFzaCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBDb25kZW1uYXRpb24nOiAnMzkwJywgLy8gQ29uYWwgQW9FLCBCaWJsaW92b3JlIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEaXNjb250aW51ZSAxJzogJzE5NDMnLCAvLyBGYWxsaW5nIGJvb2sgc2hhZG93LCBib3NzIDFcclxuICAgICdHdWJhbEhtIERpc2NvbnRpbnVlIDInOiAnMTk0MCcsIC8vIFJ1c2ggQW9FIGZyb20gZW5kcywgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBEaXNjb250aW51ZSAzJzogJzE5NDInLCAvLyBSdXNoIEFvRSBhY3Jvc3MsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRnJpZ2h0ZnVsIFJvYXInOiAnMTkzQicsIC8vIEdldC1PdXQgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIElzc3VlIDEnOiAnMTkzRCcsIC8vIEluaXRpYWwgZW5kIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gSXNzdWUgMic6ICcxOTNGJywgLy8gSW5pdGlhbCBlbmQgYm9vayB3YXJuaW5nIEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBJc3N1ZSAzJzogJzE5NDEnLCAvLyBJbml0aWFsIHNpZGUgYm9vayB3YXJuaW5nIEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBEZXNvbGF0aW9uJzogJzE5OEMnLCAvLyBMaW5lIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIERvdWJsZSBTbWFzaCc6ICcyNkEnLCAvLyBDb25hbCBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEYXJrbmVzcyc6ICczQTAnLCAvLyBDb25hbCBBb0UsIElua3N0YWluIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBGaXJld2F0ZXInOiAnM0JBJywgLy8gQ2lyY2xlIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIEVsYm93IERyb3AnOiAnQ0JBJywgLy8gQ29uYWwgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGFyayc6ICcxOURGJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgSW5rc3RhaW4gdHJhc2hcclxuICAgICdHdWJhbEhtIFNlYWxzJzogJzE5NEEnLCAvLyBTdW4vTW9vbnNlYWwgZmFpbHVyZSwgYm9zcyAyXHJcbiAgICAnR3ViYWxIbSBXYXRlciBJSUknOiAnMUM2NycsIC8vIExhcmdlIGNpcmNsZSBBb0UsIFBvcm9nbyBQZWdpc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIFJhZ2luZyBBeGUnOiAnMTcwMycsIC8vIFNtYWxsIGNvbmFsIEFvRSwgTWVjaGFub3NlcnZpdG9yIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBNYWdpYyBIYW1tZXInOiAnMTk5MCcsIC8vIExhcmdlIGNpcmNsZSBBb0UsIEFwYW5kYSBtaW5pLWJvc3NcclxuICAgICdHdWJhbEhtIFByb3BlcnRpZXMgT2YgR3Jhdml0eSc6ICcxOTUwJywgLy8gQ2lyY2xlIEFvRSBmcm9tIGdyYXZpdHkgcHVkZGxlcywgYm9zcyAzXHJcbiAgICAnR3ViYWxIbSBQcm9wZXJ0aWVzIE9mIExldml0YXRpb24nOiAnMTk0RicsIC8vIENpcmNsZSBBb0UgZnJvbSBsZXZpdGF0aW9uIHB1ZGRsZXMsIGJvc3MgM1xyXG4gICAgJ0d1YmFsSG0gQ29tZXQnOiAnMTk2OScsIC8vIFNtYWxsIGNpcmNsZSBBb0UsIGludGVybWlzc2lvbiwgYm9zcyAzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnR3ViYWxIbSBFY2xpcHRpYyBNZXRlb3InOiAnMTk1QycsIC8vIExvUyBtZWNoYW5pYywgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdHdWJhbEhtIFNlYXJpbmcgV2luZCc6ICcxOTQ0JywgLy8gVGFuayBjbGVhdmUsIGJvc3MgMlxyXG4gICAgJ0d1YmFsSG0gVGh1bmRlcic6ICcxOVtBQl0nLCAvLyBTcHJlYWQgbWFya2VyLCBib3NzIDNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEZpcmUgZ2F0ZSBpbiBoYWxsd2F5IHRvIGJvc3MgMiwgbWFnbmV0IGZhaWx1cmUgb24gYm9zcyAyXHJcbiAgICAgIGlkOiAnR3ViYWxIbSBCdXJucycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxMEInIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0LCB0ZXh0OiBlLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSGVscGVyIGZvciBUaHVuZGVyIDMgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdHdWJhbEhtIEltcCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2RScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNJbXAgPSBkYXRhLmhhc0ltcCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0ltcFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHdWJhbEhtIEltcCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2RScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNJbXAgPSBkYXRhLmhhc0ltcCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0ltcFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRhcmdldHMgd2l0aCBJbXAgd2hlbiBUaHVuZGVyIElJSSByZXNvbHZlcyByZWNlaXZlIGEgdnVsbmVyYWJpbGl0eSBzdGFjayBhbmQgYnJpZWYgc3R1blxyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIFRodW5kZXInLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzE5NVtBQl0nLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiBkYXRhLmhhc0ltcFtlLnRhcmdldE5hbWVdLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogZS50YXJnZXROYW1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1Nob2NrZWQgSW1wJyxcclxuICAgICAgICAgICAgZGU6ICdTY2hvY2tpZXJ0ZXIgSW1wJyxcclxuICAgICAgICAgICAgamE6ICfjgqvjg4Pjg5HjgpLop6PpmaTjgZfjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+ays+erpeeKtuaAgeWQg+S6huaatOmbtycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gUXVha2UnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzE5NTYnLFxyXG4gICAgICBjb25kaXRpb246IChlKSA9PiB7XHJcbiAgICAgICAgLy8gQWx3YXlzIGhpdHMgdGFyZ2V0LCBidXQgaWYgY29ycmVjdGx5IHJlc29sdmVkIHdpbGwgZGVhbCAwIGRhbWFnZVxyXG4gICAgICAgIHJldHVybiBlLmRhbWFnZSA+IDA7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiBlLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gVG9ybmFkbycsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMTk1Wzc4XScsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUpID0+IHtcclxuICAgICAgICAvLyBBbHdheXMgaGl0cyB0YXJnZXQsIGJ1dCBpZiBjb3JyZWN0bHkgcmVzb2x2ZWQgd2lsbCBkZWFsIDAgZGFtYWdlXHJcbiAgICAgICAgcmV0dXJuIGUuZGFtYWdlID4gMDtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IGUuYWJpbGl0eU5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Tb2htQWxIYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTb2htQWxIbSBEZWFkbHkgVmFwb3InOiAnMURDOScsIC8vIEVudmlyb25tZW50YWwgY2lyY2xlIEFvRXNcclxuICAgICdTb2htQWxIbSBEZWVwcm9vdCc6ICcxQ0RBJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgQmxvb21pbmcgQ2hpY2h1IHRyYXNoXHJcbiAgICAnU29obUFsSG0gT2Rpb3VzIEFpcic6ICcxQ0RCJywgLy8gQ29uYWwgQW9FLCBCbG9vbWluZyBDaGljaHUgdHJhc2hcclxuICAgICdTb2htQWxIbSBHbG9yaW91cyBCbGF6ZSc6ICcxQzMzJywgLy8gQ2lyY2xlIEFvRSwgU21hbGwgU3BvcmUgU2FjLCBib3NzIDFcclxuICAgICdTb2htQWxIbSBGb3VsIFdhdGVycyc6ICcxMThBJywgLy8gQ29uYWwgQW9FLCBNb3VudGFpbnRvcCBPcGtlbiB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFBsYWluIFBvdW5kJzogJzExODcnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBNb3VudGFpbnRvcCBIcm9wa2VuIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUGFsc3lueXhpcyc6ICcxMTYxJywgLy8gQ29uYWwgQW9FLCBPdmVyZ3Jvd24gRGlmZmx1Z2lhIHRyYXNoXHJcbiAgICAnU29obUFsSG0gU3VyZmFjZSBCcmVhY2gnOiAnMUU4MCcsIC8vIENpcmNsZSBBb0UsIEdpYW50IE5ldGhlcndvcm0gdHJhc2hcclxuICAgICdTb2htQWxIbSBGcmVzaHdhdGVyIENhbm5vbic6ICcxMTlGJywgLy8gTGluZSBBb0UsIEdpYW50IE5ldGhlcndvcm0gdHJhc2hcclxuICAgICdTb2htQWxIbSBUYWlsIFNtYXNoJzogJzFDMzUnLCAvLyBVbnRlbGVncmFwaGVkIHJlYXIgY29uYWwgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFRhaWwgU3dpbmcnOiAnMUMzNicsIC8vIFVudGVsZWdyYXBoZWQgY2lyY2xlIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBSaXBwZXIgQ2xhdyc6ICcxQzM3JywgLy8gVW50ZWxlZ3JhcGhlZCBmcm9udGFsIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBXaW5kIFNsYXNoJzogJzFDMzgnLCAvLyBDaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFdpbGQgQ2hhcmdlJzogJzFDMzknLCAvLyBEYXNoIGF0dGFjaywgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBIb3QgQ2hhcmdlJzogJzFDM0EnLCAvLyBEYXNoIGF0dGFjaywgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBGaXJlYmFsbCc6ICcxQzNCJywgLy8gVW50ZWxlZ3JhcGhlZCB0YXJnZXRlZCBjaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIExhdmEgRmxvdyc6ICcxQzNDJywgLy8gVW50ZWxlZ3JhcGhlZCBjb25hbCBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gV2lsZCBIb3JuJzogJzE1MDcnLCAvLyBDb25hbCBBb0UsIEFiYWxhdGhpYW4gQ2xheSBHb2xlbSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIExhdmEgQnJlYXRoJzogJzFDNEQnLCAvLyBDb25hbCBBb0UsIExhdmEgQ3JhYiB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFJpbmcgb2YgRmlyZSc6ICcxQzRDJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgVm9sY2FubyBBbmFsYSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIE1vbHRlbiBTaWxrIDEnOiAnMUM0MycsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIE1vbHRlbiBTaWxrIDInOiAnMUM0NCcsIC8vIDI3MC1kZWdyZWUgcmVhciBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIE1vbHRlbiBTaWxrIDMnOiAnMUM0MicsIC8vIFJpbmcgQW9FLCBMYXZhIFNjb3JwaW9uLCBib3NzIDNcclxuICAgICdTb2htQWxIbSBSZWFsbSBTaGFrZXInOiAnMUM0MScsIC8vIENpcmNsZSBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gV2FybnMgaWYgcGxheWVycyBzdGVwIGludG8gdGhlIGxhdmEgcHVkZGxlcy4gVGhlcmUgaXMgdW5mb3J0dW5hdGVseSBubyBkaXJlY3QgZGFtYWdlIGV2ZW50LlxyXG4gICAgICBpZDogJ1NvaG1BbEhtIEJ1cm5zJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzExQycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbGV4YW5kZXJUaGVTb3VsT2ZUaGVDcmVhdG9yLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBMTJOIFNhY3JhbWVudCc6ICcxQUU2JywgLy8gQ3Jvc3MgTGFzZXJzXHJcbiAgICAnQTEyTiBHcmF2aXRhdGlvbmFsIEFub21hbHknOiAnMUFFQicsIC8vIEdyYXZpdHkgUHVkZGxlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQTEyTiBEaXZpbmUgU3BlYXInOiAnMUFFMycsIC8vIEluc3RhbnQgY29uYWwgdGFuayBjbGVhdmVcclxuICAgICdBMTJOIEJsYXppbmcgU2NvdXJnZSc6ICcxQUU5JywgLy8gT3JhbmdlIGhlYWQgbWFya2VyIHNwbGFzaCBkYW1hZ2VcclxuICAgICdBMTJOIFBsYWludCBPZiBTZXZlcml0eSc6ICcxQUYxJywgLy8gQWdncmF2YXRlZCBBc3NhdWx0IHNwbGFzaCBkYW1hZ2VcclxuICAgICdBMTJOIENvbW11bmlvbic6ICcxQUZDJywgLy8gVGV0aGVyIFB1ZGRsZXNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQTEyTiBBc3NhdWx0IENvbGxlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDYxJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmFzc2F1bHQgPSBkYXRhLmFzc2F1bHQgfHwgW107XHJcbiAgICAgICAgZGF0YS5hc3NhdWx0LnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSXQgaXMgYSBmYWlsdXJlIGZvciBhIFNldmVyaXR5IG1hcmtlciB0byBzdGFjayB3aXRoIHRoZSBTb2xpZGFyaXR5IGdyb3VwLlxyXG4gICAgICBpZDogJ0ExMk4gQXNzYXVsdCBGYWlsdXJlJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICcxQUYyJyxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuYXNzYXVsdC5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0RpZG5cXCd0IFNwcmVhZCEnLFxyXG4gICAgICAgICAgICBkZTogJ05pY2h0IHZlcnRlaWx0IScsXHJcbiAgICAgICAgICAgIGZyOiAnTmUgc1xcJ2VzdCBwYXMgZGlzcGVyc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+aVo+mWi+OBl+OBquOBi+OBo+OBnyEnLFxyXG4gICAgICAgICAgICBjbjogJ+ayoeacieaVo+W8gCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdBMTJOIEFzc2F1bHQgQ2xlYW51cCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NjEnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDIwLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDUsXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuYXNzYXVsdDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbGFNaGlnbyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQWxhIE1oaWdvIE1hZ2l0ZWsgUmF5JzogJzI0Q0UnLCAvLyBMaW5lIEFvRSwgTGVnaW9uIFByZWRhdG9yIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIExvY2sgT24nOiAnMjA0NycsIC8vIEhvbWluZyBjaXJjbGVzLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAxJzogJzIwNDknLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAyJzogJzIwNEInLCAvLyBSZWFyIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAzJzogJzIwNEMnLCAvLyBSZWFyIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gU2hvdWxkZXIgQ2Fubm9uJzogJzI0RDAnLCAvLyBDaXJjbGUgQW9FLCBMZWdpb24gQXZlbmdlciB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBDYW5ub25maXJlJzogJzIzRUQnLCAvLyBFbnZpcm9ubWVudGFsIGNpcmNsZSBBb0UsIHBhdGggdG8gYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIEFldGhlcm9jaGVtaWNhbCBHcmVuYWRvJzogJzIwNUEnLCAvLyBDaXJjbGUgQW9FLCBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gSW50ZWdyYXRlZCBBZXRoZXJvbW9kdWxhdG9yJzogJzIwNUInLCAvLyBSaW5nIEFvRSwgYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIENpcmNsZSBPZiBEZWF0aCc6ICcyNEQ0JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIEhleGFkcm9uZSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBFeGhhdXN0JzogJzI0RDMnLCAvLyBMaW5lIEFvRSwgTGVnaW9uIENvbG9zc3VzIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEdyYW5kIFN3b3JkJzogJzI0RDInLCAvLyBDb25hbCBBb0UsIExlZ2lvbiBDb2xvc3N1cyB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN0b3JtIDEnOiAnMjA2NicsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBwcmUtaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTdG9ybSAyJzogJzI1ODcnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gVmVpbiBTcGxpdHRlciAxJzogJzI0QjYnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgcHJpbWFyeSBlbnRpdHksIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBWZWluIFNwbGl0dGVyIDInOiAnMjA2QycsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBoZWxwZXIgZW50aXR5LCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gTGlnaHRsZXNzIFNwYXJrJzogJzIwNkInLCAvLyBDb25hbCBBb0UsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQWxhIE1oaWdvIERlbWltYWdpY2tzJzogJzIwNUUnLFxyXG4gICAgJ0FsYSBNaGlnbyBVbm1vdmluZyBUcm9pa2EnOiAnMjA2MCcsXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dvcmQgMSc6ICcyMDY5JyxcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTd29yZCAyJzogJzI1ODknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSXQncyBwb3NzaWJsZSBwbGF5ZXJzIG1pZ2h0IGp1c3Qgd2FuZGVyIGludG8gdGhlIGJhZCBvbiB0aGUgb3V0c2lkZSxcclxuICAgICAgLy8gYnV0IG5vcm1hbGx5IHBlb3BsZSBnZXQgcHVzaGVkIGludG8gaXQuXHJcbiAgICAgIGlkOiAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dlbGwnLFxyXG4gICAgICAvLyBEYW1hZ2UgRG93blxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMkI4JyB9KSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldCwgdGV4dDogZS5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIEJhcmRhbSdzIE1ldHRsZVxyXG5cclxuXHJcbi8vIEZvciByZWFzb25zIG5vdCBjb21wbGV0ZWx5IHVuZGVyc3Rvb2QgYXQgdGhlIHRpbWUgdGhpcyB3YXMgbWVyZ2VkLFxyXG4vLyBidXQgbGlrZWx5IHJlbGF0ZWQgdG8gdGhlIGZhY3QgdGhhdCBubyBuYW1lcGxhdGVzIGFyZSB2aXNpYmxlIGR1cmluZyB0aGUgZW5jb3VudGVyLFxyXG4vLyBhbmQgdGhhdCBub3RoaW5nIGluIHRoZSBlbmNvdW50ZXIgYWN0dWFsbHkgZG9lcyBkYW1hZ2UsXHJcbi8vIHdlIGNhbid0IHVzZSBkYW1hZ2VXYXJuIG9yIGdhaW5zRWZmZWN0IGhlbHBlcnMgb24gdGhlIEJhcmRhbSBmaWdodC5cclxuLy8gSW5zdGVhZCwgd2UgdXNlIHRoaXMgaGVscGVyIGZ1bmN0aW9uIHRvIGxvb2sgZm9yIGZhaWx1cmUgZmxhZ3MuXHJcbi8vIElmIHRoZSBmbGFnIGlzIHByZXNlbnQsYSBmdWxsIHRyaWdnZXIgb2JqZWN0IGlzIHJldHVybmVkIHRoYXQgZHJvcHMgaW4gc2VhbWxlc3NseS5cclxuY29uc3QgYWJpbGl0eVdhcm4gPSAoYXJncykgPT4ge1xyXG4gIGlmICghYXJncy5hYmlsaXR5SWQpXHJcbiAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGFiaWxpdHkgJyArIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcclxuICByZXR1cm4ge1xyXG4gICAgaWQ6IGFyZ3MuaWQsXHJcbiAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBhcmdzLmFiaWxpdHlJZCB9KSxcclxuICAgIGNvbmRpdGlvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zdWJzdHIoLTIpID09PSAnMEUnLFxyXG4gICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICB9LFxyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQmFyZGFtc01ldHRsZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQmFyZGFtIERpcnR5IENsYXcnOiAnMjFBOCcsIC8vIEZyb250YWwgY2xlYXZlLCBHdWxvIEd1bG8gdHJhc2hcclxuICAgICdCYXJkYW0gRXBpZ3JhcGgnOiAnMjNBRicsIC8vIExpbmUgQW9FLCBXYWxsIG9mIEJhcmRhbSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBUaGUgRHVzayBTdGFyJzogJzIxODcnLCAvLyBDaXJjbGUgQW9FLCBlbnZpcm9ubWVudCBiZWZvcmUgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBUaGUgRGF3biBTdGFyJzogJzIxODYnLCAvLyBDaXJjbGUgQW9FLCBlbnZpcm9ubWVudCBiZWZvcmUgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBDcnVtYmxpbmcgQ3J1c3QnOiAnMUYxMycsIC8vIENpcmNsZSBBb0VzLCBHYXJ1bGEsIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gUmFtIFJ1c2gnOiAnMUVGQycsIC8vIExpbmUgQW9FcywgU3RlcHBlIFlhbWFhLCBmaXJzdCBib3NzLlxyXG4gICAgJ0JhcmRhbSBMdWxsYWJ5JzogJzI0QjInLCAvLyBDaXJjbGUgQW9FcywgU3RlcHBlIFNoZWVwLCBmaXJzdCBib3NzLlxyXG4gICAgJ0JhcmRhbSBIZWF2ZSc6ICcxRUY3JywgLy8gRnJvbnRhbCBjbGVhdmUsIEdhcnVsYSwgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBXaWRlIEJsYXN0ZXInOiAnMjRCMycsIC8vIEVub3Jtb3VzIGZyb250YWwgY2xlYXZlLCBTdGVwcGUgQ29ldXJsLCBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIERvdWJsZSBTbWFzaCc6ICcyNkEnLCAvLyBDaXJjbGUgQW9FLCBNZXR0bGluZyBEaGFyYSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBUcmFuc29uaWMgQmxhc3QnOiAnMTI2MicsIC8vIENpcmNsZSBBb0UsIFN0ZXBwZSBFYWdsZSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBXaWxkIEhvcm4nOiAnMjIwOCcsIC8vIEZyb250YWwgY2xlYXZlLCBLaHVuIEd1cnZlbCB0cmFzaFxyXG4gICAgJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMSc6ICcyNTc4JywgLy8gMSBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAyJzogJzI1NzknLCAvLyAyIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gSGVhdnkgU3RyaWtlIDMnOiAnMjU3QScsIC8vIDMgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUcmVtYmxvciAxJzogJzI1N0InLCAvLyAxIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gVHJlbWJsb3IgMic6ICcyNTdDJywgLy8gMiBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIFRocm93aW5nIFNwZWFyJzogJzI1N0YnLCAvLyBDaGVja2VyYm9hcmQgQW9FLCBUaHJvd2luZyBTcGVhciwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gQmFyZGFtXFwncyBSaW5nJzogJzI1ODEnLCAvLyBEb251dCBBb0UgaGVhZG1hcmtlcnMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gQ29tZXQnOiAnMjU3RCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIENvbWV0IEltcGFjdCc6ICcyNTgwJywgLy8gQ2lyY2xlIEFvRXMsIFN0YXIgU2hhcmQsIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIElyb24gU3BoZXJlIEF0dGFjayc6ICcxNkI2JywgLy8gQ29udGFjdCBkYW1hZ2UsIElyb24gU3BoZXJlIHRyYXNoLCBiZWZvcmUgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUb3JuYWRvJzogJzI0N0UnLCAvLyBDaXJjbGUgQW9FLCBLaHVuIFNoYXZhcmEgdHJhc2hcclxuICAgICdCYXJkYW0gUGluaW9uJzogJzFGMTEnLCAvLyBMaW5lIEFvRSwgWW9sIEZlYXRoZXIsIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gRmVhdGhlciBTcXVhbGwnOiAnMUYwRScsIC8vIERhc2ggYXR0YWNrLCBZb2wsIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gRmx1dHRlcmZhbGwgVW50YXJnZXRlZCc6ICcxRjEyJywgLy8gUm90YXRpbmcgY2lyY2xlIEFvRXMsIFlvbCwgdGhpcmQgYm9zc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQmFyZGFtIEdhcnVsYSBSdXNoJzogJzFFRjknLCAvLyBMaW5lIEFvRSwgR2FydWxhLCBmaXJzdCBib3NzLlxyXG4gICAgJ0JhcmRhbSBGbHV0dGVyZmFsbCBUYXJnZXRlZCc6ICcxRjBDJywgLy8gQ2lyY2xlIEFvRSBoZWFkbWFya2VyLCBZb2wsIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gV2luZ2JlYXQnOiAnMUYwRicsIC8vIENvbmFsIEFvRSBoZWFkbWFya2VyLCBZb2wsIHRoaXJkIGJvc3NcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0JhcmRhbSBDb25mdXNlZCc6ICcwQicsIC8vIEZhaWxlZCBnYXplIGF0dGFjaywgWW9sLCB0aGlyZCBib3NzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdCYXJkYW0gRmV0dGVycyc6ICc1NkYnLCAvLyBGYWlsaW5nIHR3byBtZWNoYW5pY3MgaW4gYW55IG9uZSBwaGFzZSBvbiBCYXJkYW0sIHNlY29uZCBib3NzLlxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIC8vIDEgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMScsIGFiaWxpdHlJZDogJzI1NzgnIH0pLFxyXG4gICAgLy8gMiBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAyJywgYWJpbGl0eUlkOiAnMjU3OScgfSksXHJcbiAgICAvLyAzIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gSGVhdnkgU3RyaWtlIDMnLCBhYmlsaXR5SWQ6ICcyNTdBJyB9KSxcclxuICAgIC8vIDEgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBUcmVtYmxvciAxJywgYWJpbGl0eUlkOiAnMjU3QicgfSksXHJcbiAgICAvLyAyIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gVHJlbWJsb3IgMicsIGFiaWxpdHlJZDogJzI1N0MnIH0pLFxyXG4gICAgLy8gQ2hlY2tlcmJvYXJkIEFvRSwgVGhyb3dpbmcgU3BlYXIsIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIFRocm93aW5nIFNwZWFyJywgYWJpbGl0eUlkOiAnMjU3RicgfSksXHJcbiAgICAvLyBHYXplIGF0dGFjaywgV2FycmlvciBvZiBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEVtcHR5IEdhemUnLCBhYmlsaXR5SWQ6ICcxRjA0JyB9KSxcclxuICAgIC8vIERvbnV0IEFvRSBoZWFkbWFya2VycywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbVxcJ3MgUmluZycsIGFiaWxpdHlJZDogJzI1ODEnIH0pLFxyXG4gICAgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gQ29tZXQnLCBhYmlsaXR5SWQ6ICcyNTdEJyB9KSxcclxuICAgIC8vIENpcmNsZSBBb0VzLCBTdGFyIFNoYXJkLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBDb21ldCBJbXBhY3QnLCBhYmlsaXR5SWQ6ICcyNTgwJyB9KSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkt1Z2FuZUNhc3RsZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnS3VnYW5lIENhc3RsZSBUZW5rYSBHb2trZW4nOiAnMjMyOScsIC8vIEZyb250YWwgY29uZSBBb0UsICBKb2kgQmxhZGUgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdLdWdhbmUgQ2FzdGxlIEtlbmtpIFJlbGVhc2UgVHJhc2gnOiAnMjMzMCcsIC8vIENoYXJpb3QgQW9FLCBKb2kgS2l5b2Z1c2EgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBDbGVhcm91dCc6ICcxRTkyJywgLy8gRnJvbnRhbCBjb25lIEFvRSwgWnVpa28tTWFydSwgYm9zcyAxXHJcbiAgICAnS3VnYW5lIENhc3RsZSBIYXJhLUtpcmkgMSc6ICcxRTk2JywgLy8gR2lhbnQgY2lyY2xlIEFvRSwgSGFyYWtpcmkgS29zaG8sIGJvc3MgMVxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSGFyYS1LaXJpIDInOiAnMjRGOScsIC8vIEdpYW50IGNpcmNsZSBBb0UsIEhhcmFraXJpIEtvc2hvLCBib3NzIDFcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBKdWppIFNodXJpa2VuIDEnOiAnMjMyRCcsIC8vIExpbmUgQW9FLCBLYXJha3VyaSBPbm1pdHN1IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSAxMDAwIEJhcmJzJzogJzIxOTgnLCAvLyBMaW5lIEFvRSwgSm9pIEtvamEgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBKdWppIFNodXJpa2VuIDInOiAnMUU5OCcsIC8vIExpbmUgQW9FLCBEb2p1biBNYXJ1LCBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIFRhdGFtaS1HYWVzaGknOiAnMUU5RCcsIC8vIEZsb29yIHRpbGUgbGluZSBhdHRhY2ssIEVsa2l0ZSBPbm1pdHN1LCBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIEp1amkgU2h1cmlrZW4gMyc6ICcxRUEwJywgLy8gTGluZSBBb0UsIEVsaXRlIE9ubWl0c3UsIGJvc3MgMlxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIEF1dG8gQ3Jvc3Nib3cnOiAnMjMzMycsIC8vIEZyb250YWwgY29uZSBBb0UsIEthcmFrdXJpIEhhbnlhIHRyYXNoLCBhZnRlciBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIEhhcmFraXJpIDMnOiAnMjNDOScsIC8vIEdpYW50IENpcmNsZSBBb0UsIEhhcmFraXJpICBIYW55YSB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSWFpLUdpcmknOiAnMUVBMicsIC8vIENoYXJpb3QgQW9FLCBZb2ppbWJvLCBib3NzIDNcclxuICAgICdLdWdhbmUgQ2FzdGxlIEZyYWdpbGl0eSc6ICcxRUFBJywgLy8gQ2hhcmlvdCBBb0UsIElub3NoaWthY2hvLCBib3NzIDNcclxuICAgICdLdWdhbmUgQ2FzdGxlIERyYWdvbmZpcmUnOiAnMUVBQicsIC8vIExpbmUgQW9FLCBEcmFnb24gSGVhZCwgYm9zcyAzXHJcbiAgfSxcclxuXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnS3VnYW5lIENhc3RsZSBJc3Nlbic6ICcxRTk3JywgLy8gSW5zdGFudCBmcm9udGFsIGNsZWF2ZSwgRG9qdW4gTWFydSwgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBDbG9ja3dvcmsgUmFpdG9uJzogJzFFOUInLCAvLyBMYXJnZSBsaWdodG5pbmcgc3ByZWFkIGNpcmNsZXMsIERvanVuIE1hcnUsIGJvc3MgMlxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gU3RhY2sgbWFya2VyLCBadWlrbyBNYXJ1LCBib3NzIDFcclxuICAgICAgaWQ6ICdLdWdhbmUgQ2FzdGxlIEhlbG0gQ3JhY2snLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxRTk0JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnR5cGUgPT09ICcyMScsIC8vIFRha2luZyB0aGUgc3RhY2sgc29sbyBpcyAqcHJvYmFibHkqIGEgbWlzdGFrZS5cclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbG9uZSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxsZWluKWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChzZXVsKGUpKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjkuIDkuropYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOWNleWQgylgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo7Zi87J6QIOunnuydjClgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5TYWludE1vY2lhbm5lc0FyYm9yZXR1bUhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgTXVkc3RyZWFtJzogJzMwRDknLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBJbW1hY3VsYXRlIEFwYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU2lsa2VuIFNwcmF5JzogJzMzODUnLCAvLyBSZWFyIGNvbmUgQW9FLCBXaXRoZXJlZCBCZWxsYWRvbm5hIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBNdWRkeSBQdWRkbGVzJzogJzMwREEnLCAvLyBTbWFsbCB0YXJnZXRlZCBjaXJjbGUgQW9FcywgRG9ycG9ra3VyIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBPZGlvdXMgQWlyJzogJzJFNDknLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFNMdWRnZSBCb21iJzogJzJFNEUnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FcywgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBPZGlvdXMgQXRtb3NwaGVyZSc6ICcyRTUxJywgLy8gQ2hhbm5lbGVkIDMvNCBhcmVuYSBjbGVhdmUsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgQ3JlZXBpbmcgSXZ5JzogJzMxQTUnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBXaXRoZXJlZCBLdWxhayB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUm9ja3NsaWRlJzogJzMxMzQnLCAvLyBMaW5lIEFvRSwgU2lsdCBHb2xlbSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBFYXJ0aHF1YWtlIElubmVyJzogJzMxMkUnLCAvLyBDaGFyaW90IEFvRSwgTGFraGFtdSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBFYXJ0aHF1YWtlIE91dGVyJzogJzMxMkYnLCAvLyBEeW5hbW8gQW9FLCBMYWtoYW11LCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVtYmFsbWluZyBFYXJ0aCc6ICczMUE2JywgLy8gTGFyZ2UgQ2hhcmlvdCBBb0UsIE11ZGR5IE1hdGEsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUXVpY2ttaXJlJzogJzMxMzYnLCAvLyBTZXdhZ2Ugc3VyZ2UgYXZvaWRlZCBvbiBwbGF0Zm9ybXMsIFRva2thcGNoaSwgYm9zcyAzXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBRdWFnbWlyZSBQbGF0Zm9ybXMnOiAnMzEzOScsIC8vIFF1YWdtaXJlIGV4cGxvc2lvbiBvbiBwbGF0Zm9ybXMsIFRva2thcGNoaSwgYm9zcyAzXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBGZWN1bGVudCBGbG9vZCc6ICczMTNDJywgLy8gVGFyZ2V0ZWQgdGhpbiBjb25lIEFvRSwgVG9ra2FwY2hpLCBib3NzIDNcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIENvcnJ1cHR1cmUnOiAnMzNBMCcsIC8vIE11ZCBTbGltZSBleHBsb3Npb24sIGJvc3MgMy4gKE5vIGV4cGxvc2lvbiBpZiBkb25lIGNvcnJlY3RseS4pXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFRhcHJvb3QnOiAnMkU0QycsIC8vIExhcmdlIG9yYW5nZSBzcHJlYWQgY2lyY2xlcywgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBFYXJ0aCBTaGFrZXInOiAnMzEzMScsIC8vIEVhcnRoIFNoYWtlciwgTGFraGFtdSwgYm9zcyAyXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFNlZHVjZWQnOiAnM0RGJywgLy8gR2F6ZSBmYWlsdXJlLCBXaXRoZXJlZCBCZWxsYWRvbm5hIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBQb2xsZW4nOiAnMTMnLCAvLyBTbHVkZ2UgcHVkZGxlcywgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBUcmFuc2ZpZ3VyYXRpb24nOiAnNjQ4JywgLy8gUm9seS1Qb2x5IEFvRSBjaXJjbGUgZmFpbHVyZSwgQkxvb21pbmcgQmlsb2tvIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBHYXplIGZhaWx1cmUsIExha2hhbXUsIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU3RhYiBXb3VuZCc6ICc0NUQnLCAvLyBBcmVuYSBvdXRlciB3YWxsIGVmZmVjdCwgYm9zcyAyXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRmF1bHQgV2FycmVuJzogJzJFNEEnLCAvLyBTdGFjayBtYXJrZXIsIE51bGxjaHUsIGJvc3MgMVxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlU3dhbGxvd3NDb21wYXNzLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEl2eSBGZXR0ZXJzJzogJzJDMDQnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRSwgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgV2lsZHN3aW5kIDEnOiAnMkMwNScsIC8vIFRvcm5hZG8gZ3JvdW5kIEFvRSwgcGxhY2VkIGJ5IFNhaSBUYWlzdWkgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBZYW1hLUthZ3VyYSc6ICcyQjk2JywgLy8gRnJvbnRhbCBsaW5lIEFvRSwgT3Rlbmd1LCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEZsYW1lcyBPZiBIYXRlJzogJzJCOTgnLCAvLyBGaXJlIG9yYiBleHBsb3Npb25zLCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIENvbmZsYWdyYXRlJzogJzJCOTknLCAvLyBDb2xsaXNpb24gd2l0aCBmaXJlIG9yYiwgYm9zcyAxXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVXB3ZWxsJzogJzJDMDYnLCAvLyBUYXJnZXRlZCBjaXJjbGUgZ3JvdW5kIEFvRSwgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQmFkIEJyZWF0aCc6ICcyQzA3JywgLy8gRnJvbnRhbCBjbGVhdmUsIEppbm1lbmp1IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgR3JlYXRlciBQYWxtIDEnOiAnMkI5RCcsIC8vIEhhbGYgYXJlbmEgcmlnaHQgY2xlYXZlLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEdyZWF0ZXIgUGFsbSAyJzogJzJCOUUnLCAvLyBIYWxmIGFyZW5hIGxlZnQgY2xlYXZlLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFRyaWJ1dGFyeSc6ICcyQkEwJywgLy8gVGFyZ2V0ZWQgdGhpbiBjb25hbCBncm91bmQgQW9FcywgRGFpZGFyYWJvdGNoaSwgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgV2lsZHN3aW5kIDInOiAnMkMwNicsIC8vIENpcmNsZSBncm91bmQgQW9FLCBlbnZpcm9ubWVudCwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMyc6ICcyQzA3JywgLy8gQ2lyY2xlIGdyb3VuZCBBb0UsIHBsYWNlZCBieSBTYWkgVGFpc3VpIHRyYXNoLCBhZnRlciBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEZpbG9wbHVtZXMnOiAnMkM3NicsIC8vIEZyb250YWwgcmVjdGFuZ2xlIEFvRSwgRHJhZ29uIEJpIEZhbmcgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyAxJzogJzJCQTgnLCAvLyBDaGFyaW90IEFvRSwgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDInOiAnMkJBOScsIC8vIER5bmFtbyBBb0UsIFFpdGlhbiBEYXNoZW5nLCBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyAzJzogJzJCQUUnLCAvLyBDaGFyaW90IEFvRSwgU2hhZG93IE9mIFRoZSBTYWdlLCBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyA0JzogJzJCQUYnLCAvLyBEeW5hbW8gQW9FLCBTaGFkb3cgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRXF1YWwgT2YgSGVhdmVuJzogJzJCQjQnLCAvLyBTbWFsbCBjaXJjbGUgZ3JvdW5kIEFvRXMsIFFpdGlhbiBEYXNoZW5nLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgTWlyYWdlJzogJzJCQTInLCAvLyBQcmV5LWNoYXNpbmcgcHVkZGxlcywgRGFpZGFyYWJvdGNoaSwgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBNb3VudGFpbiBGYWxscyc6ICcyQkE1JywgLy8gQ2lyY2xlIHNwcmVhZCBtYXJrZXJzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFRoZSBMb25nIEVuZCc6ICcyQkE3JywgLy8gTGFzZXIgdGV0aGVyLCBRaXRpYW4gRGFzaGVuZyAgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBUaGUgTG9uZyBFbmQgMic6ICcyQkFEJywgLy8gTGFzZXIgVGV0aGVyLCBTaGFkb3dzIE9mIFRoZSBTYWdlLCBib3NzIDNcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgSHlzdGVyaWEnOiAnMTI4JywgLy8gR2F6ZSBhdHRhY2sgZmFpbHVyZSwgT3Rlbmd1LCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJsZWVkaW5nJzogJzExMkYnLCAvLyBTdGVwcGluZyBvdXRzaWRlIHRoZSBhcmVuYSwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBTdGFuZGluZyBpbiB0aGUgbGFrZSwgRGlhZGFyYWJvdGNoaSwgYm9zcyAyXHJcbiAgICAgIGlkOiAnU3dhbGxvd3MgQ29tcGFzcyBTaXggRnVsbXMgVW5kZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMjM3JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBTdGFjayBtYXJrZXIsIGJvc3MgM1xyXG4gICAgICBpZDogJ1N3YWxsb3dzIENvbXBhc3MgRml2ZSBGaW5nZXJlZCBQdW5pc2htZW50JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzJCQUInLCAnMkJCMCddLCBzb3VyY2U6IFsnUWl0aWFuIERhc2hlbmcnLCAnU2hhZG93IE9mIFRoZSBTYWdlJ10gfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnR5cGUgPT09ICcyMScsIC8vIFRha2luZyB0aGUgc3RhY2sgc29sbyBpcyAqcHJvYmFibHkqIGEgbWlzdGFrZS5cclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbG9uZSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxsZWluKWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChzZXVsKGUpKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjkuIDkuropYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOWNleWQgylgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo7Zi87J6QIOunnuydjClgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVUZW1wbGVPZlRoZUZpc3QsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RlbXBsZSBGaXJlIEJyZWFrJzogJzIxRUQnLCAvLyBDb25hbCBBb0UsIEJsb29kZ2xpZGVyIE1vbmsgdHJhc2hcclxuICAgICdUZW1wbGUgUmFkaWFsIEJsYXN0ZXInOiAnMUZEMycsIC8vIENpcmNsZSBBb0UsIGJvc3MgMVxyXG4gICAgJ1RlbXBsZSBXaWRlIEJsYXN0ZXInOiAnMUZENCcsIC8vIENvbmFsIEFvRSwgYm9zcyAxXHJcbiAgICAnVGVtcGxlIENyaXBwbGluZyBCbG93JzogJzIwMTYnLCAvLyBMaW5lIEFvRXMsIGVudmlyb25tZW50YWwsIGJlZm9yZSBib3NzIDJcclxuICAgICdUZW1wbGUgQnJva2VuIEVhcnRoJzogJzIzNkUnLCAvLyBDaXJjbGUgQW9FLCBTaW5naGEgdHJhc2hcclxuICAgICdUZW1wbGUgU2hlYXInOiAnMUZERCcsIC8vIER1YWwgY29uYWwgQW9FLCBib3NzIDJcclxuICAgICdUZW1wbGUgQ291bnRlciBQYXJyeSc6ICcxRkUwJywgLy8gUmV0YWxpYXRpb24gZm9yIGluY29ycmVjdCBkaXJlY3Rpb24gYWZ0ZXIgS2lsbGVyIEluc3RpbmN0LCBib3NzIDJcclxuICAgICdUZW1wbGUgVGFwYXMnOiAnJywgLy8gVHJhY2tpbmcgY2lyY3VsYXIgZ3JvdW5kIEFvRXMsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBIZWxsc2VhbCc6ICcyMDBGJywgLy8gUmVkL0JsdWUgc3ltYm9sIGZhaWx1cmUsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBQdXJlIFdpbGwnOiAnMjAxNycsIC8vIENpcmNsZSBBb0UsIFNwaXJpdCBGbGFtZSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBNZWdhYmxhc3Rlcic6ICcxNjMnLCAvLyBDb25hbCBBb0UsIENvZXVybCBQcmFuYSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBXaW5kYnVybic6ICcxRkU4JywgLy8gQ2lyY2xlIEFvRSwgVHdpc3RlciB3aW5kLCBib3NzIDNcclxuICAgICdUZW1wbGUgSHVycmljYW5lIEtpY2snOiAnMUZFNScsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBTaWxlbnQgUm9hcic6ICcxRkVCJywgLy8gRnJvbnRhbCBsaW5lIEFvRSwgYm9zcyAzXHJcbiAgICAnVGVtcGxlIE1pZ2h0eSBCbG93JzogJzFGRUEnLCAvLyBDb250YWN0IHdpdGggY29ldXJsIGhlYWQsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGVtcGxlIEhlYXQgTGlnaHRuaW5nJzogJzFGRDcnLCAvLyBQdXJwbGUgc3ByZWFkIGNpcmNsZXMsIGJvc3MgMVxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUJ1cm4sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RoZSBCdXJuIEZhbGxpbmcgUm9jayc6ICczMUEzJywgLy8gRW52aXJvbm1lbnRhbCBsaW5lIEFvRVxyXG4gICAgJ1RoZSBCdXJuIEFldGhlcmlhbCBCbGFzdCc6ICczMjhCJywgLy8gTGluZSBBb0UsIEt1a3Vsa2FuIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gTW9sZS1hLXdoYWNrJzogJzMyOEQnLCAvLyBDaXJjbGUgQW9FLCBEZXNlcnQgRGVzbWFuIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gSGVhZCBCdXR0JzogJzMyOEUnLCAvLyBTbWFsbCBjb25hbCBBb0UsIERlc2VydCBEZXNtYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBTaGFyZGZhbGwnOiAnMzE5MScsIC8vIFJvb213aWRlIEFvRSwgTG9TIGZvciBzYWZldHksIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIERpc3NvbmFuY2UnOiAnMzE5MicsIC8vIERvbnV0IEFvRSwgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gQ3J5c3RhbGxpbmUgRnJhY3R1cmUnOiAnMzE5NycsIC8vIENpcmNsZSBBb0UsIERpbSBDcnlzdGFsLCBib3NzIDFcclxuICAgICdUaGUgQnVybiBSZXNvbmFudCBGcmVxdWVuY3knOiAnMzE5OCcsIC8vIENpcmNsZSBBb0UsIERpbSBDcnlzdGFsLCBib3NzIDFcclxuICAgICdUaGUgQnVybiBSb3Rvc3dpcGUnOiAnMzI5MScsIC8vIEZyb250YWwgY29uZSBBb0UsIENoYXJyZWQgRHJlYWRuYXVnaHQgdHJhc2hcclxuICAgICdUaGUgQnVybiBXcmVja2luZyBCYWxsJzogJzMyOTInLCAvLyBDaXJjbGUgQW9FLCBDaGFycmVkIERyZWFkbmF1Z2h0IHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gU2hhdHRlcic6ICczMjk0JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgQ2hhcnJlZCBEb2JseW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBBdXRvLUNhbm5vbnMnOiAnMzI5NScsIC8vIExpbmUgQW9FLCBDaGFycmVkIERyb25lIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gU2VsZi1EZXRvbmF0ZSc6ICczMjk2JywgLy8gQ2lyY2xlIEFvRSwgQ2hhcnJlZCBEcm9uZSB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIEZ1bGwgVGhyb3R0bGUnOiAnMkQ3NScsIC8vIExpbmUgQW9FLCBEZWZlY3RpdmUgRHJvbmUsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIFRocm90dGxlJzogJzJENzYnLCAvLyBMaW5lIEFvRSwgTWluaW5nIERyb25lIGFkZHMsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIEFkaXQgRHJpdmVyJzogJzJENzgnLCAvLyBMaW5lIEFvRSwgUm9jayBCaXRlciBhZGRzLCBib3NzIDJcclxuICAgICdUaGUgQnVybiBUcmVtYmxvcic6ICczMjk3JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgVmVpbGVkIEdpZ2F3b3JtIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gRGVzZXJ0IFNwaWNlJzogJzMyOTgnLCAvLyBUaGUgZnJvbnRhbCBjbGVhdmVzIG11c3QgZmxvd1xyXG4gICAgJ1RoZSBCdXJuIFRveGljIFNwcmF5JzogJzMyOUEnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBHaWdhd29ybSBTdGFsa2VyIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gVmVub20gU3ByYXknOiAnMzI5QicsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEdpZ2F3b3JtIFN0YWxrZXIgdHJhc2hcclxuICAgICdUaGUgQnVybiBXaGl0ZSBEZWF0aCc6ICczMTQzJywgLy8gUmVhY3RpdmUgZHVyaW5nIGludnVsbmVyYWJpbGl0eSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZvZyBQbHVtZSAxJzogJzMxNDUnLCAvLyBTdGFyIEFvRSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZvZyBQbHVtZSAyJzogJzMxNDYnLCAvLyBMaW5lIEFvRXMgYWZ0ZXIgc3RhcnMsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICAgICdUaGUgQnVybiBDYXV0ZXJpemUnOiAnMzE0OCcsIC8vIExpbmUvU3dvb3AgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGhlIEJ1cm4gQ29sZCBGb2cnOiAnMzE0MicsIC8vIEdyb3dpbmcgY2lyY2xlIEFvRSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gSGFpbGZpcmUnOiAnMzE5NCcsIC8vIEhlYWQgbWFya2VyIGxpbmUgQW9FLCBIZWRldGV0LCBib3NzIDFcclxuICAgICdUaGUgQnVybiBTaGFyZHN0cmlrZSc6ICczMTk1JywgLy8gT3JhbmdlIHNwcmVhZCBoZWFkIG1hcmtlcnMsIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIENoaWxsaW5nIEFzcGlyYXRpb24nOiAnMzE0RCcsIC8vIEhlYWQgbWFya2VyIGNsZWF2ZSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZyb3N0IEJyZWF0aCc6ICczMTRDJywgLy8gVGFuayBjbGVhdmUsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1RoZSBCdXJuIExlYWRlbic6ICc0MycsIC8vIFB1ZGRsZSBlZmZlY3QsIGJvc3MgMi4gKEFsc28gaW5mbGljdHMgMTFGLCBTbHVkZ2UuKVxyXG4gICAgJ1RoZSBCdXJuIFB1ZGRsZSBGcm9zdGJpdGUnOiAnMTFEJywgLy8gSWNlIHB1ZGRsZSBlZmZlY3QsIGJvc3MgMy4gKE5PVCB0aGUgY29uYWwtaW5mbGljdGVkIG9uZSwgMTBDLilcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIE8xTiAtIERlbHRhc2NhcGUgMS4wIE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYxMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzFOIEJ1cm4nOiAnMjNENScsIC8vIEZpcmViYWxsIGV4cGxvc2lvbiBjaXJjbGUgQW9Fc1xyXG4gICAgJ08xTiBDbGFtcCc6ICcyM0UyJywgLy8gRnJvbnRhbCByZWN0YW5nbGUga25vY2tiYWNrIEFvRSwgQWx0ZSBSb2l0ZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzFOIExldmluYm9sdCc6ICcyM0RBJywgLy8gc21hbGwgc3ByZWFkIGNpcmNsZXNcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gTzJOIC0gRGVsdGFzY2FwZSAyLjAgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjIwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMk4gTWFpbiBRdWFrZSc6ICcyNEE1JywgLy8gTm9uLXRlbGVncmFwaGVkIGNpcmNsZSBBb0UsIEZsZXNoeSBNZW1iZXJcclxuICAgICdPMk4gRXJvc2lvbic6ICcyNTkwJywgLy8gU21hbGwgY2lyY2xlIEFvRXMsIEZsZXNoeSBNZW1iZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08yTiBQYXJhbm9ybWFsIFdhdmUnOiAnMjUwRScsIC8vIEluc3RhbnQgdGFuayBjbGVhdmVcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFdlIGNvdWxkIHRyeSB0byBzZXBhcmF0ZSBvdXQgdGhlIG1pc3Rha2UgdGhhdCBsZWQgdG8gdGhlIHBsYXllciBiZWluZyBwZXRyaWZpZWQuXHJcbiAgICAgIC8vIEhvd2V2ZXIsIGl0J3MgTm9ybWFsIG1vZGUsIHdoeSBvdmVydGhpbmsgaXQ/XHJcbiAgICAgIGlkOiAnTzJOIFBldHJpZmljYXRpb24nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMjYyJyB9KSxcclxuICAgICAgLy8gVGhlIHVzZXIgbWlnaHQgZ2V0IGhpdCBieSBhbm90aGVyIHBldHJpZnlpbmcgYWJpbGl0eSBiZWZvcmUgdGhlIGVmZmVjdCBlbmRzLlxyXG4gICAgICAvLyBUaGVyZSdzIG5vIHBvaW50IGluIG5vdGlmeWluZyBmb3IgdGhhdC5cclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxMCxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldCwgdGV4dDogZS5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzJOIEVhcnRocXVha2UnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzI1MTUnLFxyXG4gICAgICBjb25kaXRpb246IChlKSA9PiB7XHJcbiAgICAgICAgLy8gVGhpcyBkZWFscyBkYW1hZ2Ugb25seSB0byBub24tZmxvYXRpbmcgdGFyZ2V0cy5cclxuICAgICAgICByZXR1cm4gZS5kYW1hZ2UgPiAwO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgbmFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiBlLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBPM04gLSBEZWx0YXNjYXBlIDMuMCBOb3JtYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWMzAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08zTiBTcGVsbGJsYWRlIEZpcmUgSUlJJzogJzI0NjAnLCAvLyBEb251dCBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gU3BlbGxibGFkZSBCbGl6emFyZCBJSUknOiAnMjQ2MScsIC8vIENpcmNsZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gU3BlbGxibGFkZSBUaHVuZGVyIElJSSc6ICcyNDYyJywgLy8gTGluZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gQ3Jvc3MgUmVhcGVyJzogJzI0NkInLCAvLyBDaXJjbGUgQW9FLCBTb3VsIFJlYXBlclxyXG4gICAgJ08zTiBHdXN0aW5nIEdvdWdlJzogJzI0NkMnLCAvLyBHcmVlbiBsaW5lIEFvRSwgU291bCBSZWFwZXJcclxuICAgICdPM04gU3dvcmQgRGFuY2UnOiAnMjQ3MCcsIC8vIFRhcmdldGVkIHRoaW4gY29uZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gVXBsaWZ0JzogJzI0NzMnLCAvLyBHcm91bmQgc3BlYXJzLCBRdWVlbidzIFdhbHR6IGVmZmVjdCwgSGFsaWNhcm5hc3N1c1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ08zTiBVbHRpbXVtJzogJzI0NzcnLCAvLyBJbnN0YW50IGtpbGwuIFVzZWQgaWYgdGhlIHBsYXllciBkb2VzIG5vdCBleGl0IHRoZSBzYW5kIG1hemUgZmFzdCBlbm91Z2guXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPM04gSG9seSBCbHVyJzogMjQ2MywgLy8gU3ByZWFkIGNpcmNsZXMuXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ08zTiBQaGFzZSBUcmFja2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICdIYWxpY2FybmFzc3VzJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICdIYWxpa2FybmFzc29zJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICdIYWxpY2FybmFzc2UnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ+ODj+ODquOCq+ODq+ODiuODg+OCveOCuScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAn5ZOI5Yip5Y2h57qz6IuP5pavJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICftlaDrpqzsubTrpbTrgpjshozsiqQnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnBoYXNlTnVtYmVyICs9IDE7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSdzIGEgbG90IHRvIHRyYWNrLCBhbmQgaW4gb3JkZXIgdG8gbWFrZSBpdCBhbGwgY2xlYW4sIGl0J3Mgc2FmZXN0IGp1c3QgdG9cclxuICAgICAgLy8gaW5pdGlhbGl6ZSBpdCBhbGwgdXAgZnJvbnQgaW5zdGVhZCBvZiB0cnlpbmcgdG8gZ3VhcmQgYWdhaW5zdCB1bmRlZmluZWQgY29tcGFyaXNvbnMuXHJcbiAgICAgIGlkOiAnTzNOIEluaXRpYWxpemluZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICdIYWxpa2FybmFzc29zJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAnSGFsaWNhcm5hc3NlJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn5ZOI5Yip5Y2h57qz6IuP5pavJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn7ZWg66as7Lm066W064KY7IaM7IqkJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhKSA9PiAhZGF0YS5pbml0aWFsaXplZCxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmdhbWVDb3VudCA9IDA7XHJcbiAgICAgICAgLy8gSW5kZXhpbmcgcGhhc2VzIGF0IDEgc28gYXMgdG8gbWFrZSBwaGFzZXMgbWF0Y2ggd2hhdCBodW1hbnMgZXhwZWN0LlxyXG4gICAgICAgIC8vIDE6IFdlIHN0YXJ0IGhlcmUuXHJcbiAgICAgICAgLy8gMjogQ2F2ZSBwaGFzZSB3aXRoIFVwbGlmdHMuXHJcbiAgICAgICAgLy8gMzogUG9zdC1pbnRlcm1pc3Npb24sIHdpdGggZ29vZCBhbmQgYmFkIGZyb2dzLlxyXG4gICAgICAgIGRhdGEucGhhc2VOdW1iZXIgPSAxO1xyXG4gICAgICAgIGRhdGEuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPM04gUmliYml0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQ2NicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gV2UgRE8gd2FudCB0byBiZSBoaXQgYnkgVG9hZC9SaWJiaXQgaWYgdGhlIG5leHQgY2FzdCBvZiBUaGUgR2FtZVxyXG4gICAgICAgIC8vIGlzIDR4IHRvYWQgcGFuZWxzLlxyXG4gICAgICAgIHJldHVybiAhKGRhdGEucGhhc2VOdW1iZXIgPT09IDMgJiYgZGF0YS5nYW1lQ291bnQgJSAyID09PSAwKSAmJiBtYXRjaGVzLnRhcmdldElkICE9PSAnRTAwMDAwMDAnO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlcmUncyBhIGxvdCB3ZSBjb3VsZCBkbyB0byB0cmFjayBleGFjdGx5IGhvdyB0aGUgcGxheWVyIGZhaWxlZCBUaGUgR2FtZS5cclxuICAgICAgLy8gV2h5IG92ZXJ0aGluayBOb3JtYWwgbW9kZSwgaG93ZXZlcj9cclxuICAgICAgaWQ6ICdPM04gVGhlIEdhbWUnLFxyXG4gICAgICAvLyBHdWVzcyB3aGF0IHlvdSBqdXN0IGxvc3Q/XHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0NkQnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIElmIHRoZSBwbGF5ZXIgdGFrZXMgbm8gZGFtYWdlLCB0aGV5IGRpZCB0aGUgbWVjaGFuaWMgY29ycmVjdGx5LlxyXG4gICAgICAgIHJldHVybiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMDtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmdhbWVDb3VudCArPSAxO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gTzROIC0gRGVsdGFzY2FwZSA0LjAgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjQwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPNE4gQmxpenphcmQgSUlJJzogJzI0QkMnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FcywgRXhkZWF0aFxyXG4gICAgJ080TiBFbXBvd2VyZWQgVGh1bmRlciBJSUknOiAnMjRDMScsIC8vIFVudGVsZWdyYXBoZWQgbGFyZ2UgY2lyY2xlIEFvRSwgRXhkZWF0aFxyXG4gICAgJ080TiBab21iaWUgQnJlYXRoJzogJzI0Q0InLCAvLyBDb25hbCwgdHJlZSBoZWFkIGFmdGVyIERlY2lzaXZlIEJhdHRsZVxyXG4gICAgJ080TiBDbGVhcm91dCc6ICcyNENDJywgLy8gT3ZlcmxhcHBpbmcgY29uZSBBb0VzLCBEZWF0aGx5IFZpbmUgKHRlbnRhY2xlcyBhbG9uZ3NpZGUgdHJlZSBoZWFkKVxyXG4gICAgJ080TiBCbGFjayBTcGFyayc6ICcyNEM5JywgLy8gRXhwbG9kaW5nIEJsYWNrIEhvbGVcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gRW1wb3dlcmVkIEZpcmUgSUlJIGluZmxpY3RzIHRoZSBQeXJldGljIGRlYnVmZiwgd2hpY2ggZGVhbHMgZGFtYWdlIGlmIHRoZSBwbGF5ZXJcclxuICAgIC8vIG1vdmVzIG9yIGFjdHMgYmVmb3JlIHRoZSBkZWJ1ZmYgZmFsbHMuIFVuZm9ydHVuYXRlbHkgaXQgZG9lc24ndCBsb29rIGxpa2UgdGhlcmUnc1xyXG4gICAgLy8gY3VycmVudGx5IGEgbG9nIGxpbmUgZm9yIHRoaXMsIHNvIHRoZSBvbmx5IHdheSB0byBjaGVjayBmb3IgdGhpcyBpcyB0byBjb2xsZWN0XHJcbiAgICAvLyB0aGUgZGVidWZmcyBhbmQgdGhlbiB3YXJuIGlmIGEgcGxheWVyIHRha2VzIGFuIGFjdGlvbiBkdXJpbmcgdGhhdCB0aW1lLiBOb3Qgd29ydGggaXRcclxuICAgIC8vIGZvciBOb3JtYWwuXHJcbiAgICAnTzROIFN0YW5kYXJkIEZpcmUnOiAnMjRCQScsXHJcbiAgICAnTzROIEJ1c3RlciBUaHVuZGVyJzogJzI0QkUnLCAvLyBBIGNsZWF2aW5nIHRhbmsgYnVzdGVyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ080TiBEb29tJywgLy8gS2lsbHMgdGFyZ2V0IGlmIG5vdCBjbGVhbnNlZFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IGUudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnQ2xlYW5zZXJzIG1pc3NlZCBEb29tIScsXHJcbiAgICAgICAgICAgIGRlOiAnRG9vbS1SZWluaWd1bmcgdmVyZ2Vzc2VuIScsXHJcbiAgICAgICAgICAgIGZyOiAnTlxcJ2EgcGFzIMOpdMOpIGRpc3NpcMOpKGUpIGR1IEdsYXMgIScsXHJcbiAgICAgICAgICAgIGphOiAn5q2744Gu5a6j5ZGKJyxcclxuICAgICAgICAgICAgY246ICfmsqHop6PmrbvlrqMnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNE4gVmFjdXVtIFdhdmUnLCAvLyBTaG9ydCBrbm9ja2JhY2sgZnJvbSBFeGRlYXRoXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMjRCOCcsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080TiBFbXBvd2VyZWQgQmxpenphcmQnLCAvLyBSb29tLXdpZGUgQW9FLCBmcmVlemVzIG5vbi1tb3ZpbmcgdGFyZ2V0c1xyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNEU2JyB9KSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldCwgdGV4dDogZS5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIE80UyAtIERlbHRhc2NhcGUgNC4wIFNhdmFnZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVY0MFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzRTMiBOZW8gVmFjdXVtIFdhdmUnOiAnMjQxRCcsXHJcbiAgICAnTzRTMiBBY2NlbGVyYXRpb24gQm9tYic6ICcyNDMxJyxcclxuICAgICdPNFMyIEVtcHRpbmVzcyc6ICcyNDIyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPNFMyIERvdWJsZSBMYXNlcic6ICcyNDE1JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBEZWNpc2l2ZSBCYXR0bGUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyNDA4JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzEgVmFjdXVtIFdhdmUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyM0ZFJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEFsbWFnZXN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQxNycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuaXNOZW9FeGRlYXRoID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCbGl6emFyZCBJSUknLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzIzRjgnLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gSWdub3JlIHVuYXZvaWRhYmxlIHJhaWQgYW9lIEJsaXp6YXJkIElJSS5cclxuICAgICAgICByZXR1cm4gZGF0YS5Jc1BsYXllcklkKGUudGFyZ2V0SWQpICYmICFkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50O1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogZS5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIFRodW5kZXIgSUlJJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICcyM0ZEJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIE9ubHkgY29uc2lkZXIgdGhpcyBkdXJpbmcgcmFuZG9tIG1lY2hhbmljIGFmdGVyIGRlY2lzaXZlIGJhdHRsZS5cclxuICAgICAgICByZXR1cm4gZGF0YS5Jc1BsYXllcklkKGUudGFyZ2V0SWQpICYmIGRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQ7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiBlLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgUGV0cmlmaWVkJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIE9uIE5lbywgYmVpbmcgcGV0cmlmaWVkIGlzIGJlY2F1c2UgeW91IGxvb2tlZCBhdCBTaHJpZWssIHNvIHlvdXIgZmF1bHQuXHJcbiAgICAgICAgaWYgKGRhdGEuaXNOZW9FeGRlYXRoKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgICAgLy8gT24gbm9ybWFsIEV4RGVhdGgsIHRoaXMgaXMgZHVlIHRvIFdoaXRlIEhvbGUuXHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBuYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBGb3JrZWQgTGlnaHRuaW5nJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICcyNDJFJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4gZGF0YS5Jc1BsYXllcklkKGUudGFyZ2V0SWQpLFxyXG4gICAgICBtaXN0YWtlOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBlLmFiaWxpdHlOYW1lICsgJyA9PiAnICsgZGF0YS5TaG9ydE5hbWUoZS50YXJnZXROYW1lKTtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBlLmF0dGFja2VyTmFtZSwgdGV4dDogdGV4dCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIERvdWJsZSBBdHRhY2snLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzI0MUMnLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiBkYXRhLklzUGxheWVySWQoZS50YXJnZXRJZCksXHJcbiAgICAgIGNvbGxlY3RTZWNvbmRzOiAwLjUsXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgaWYgKGUubGVuZ3RoIDw9IDIpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgLy8gSGFyZCB0byBrbm93IHdobyBzaG91bGQgYmUgaW4gdGhpcyBhbmQgd2hvIHNob3VsZG4ndCwgYnV0XHJcbiAgICAgICAgLy8gaXQgc2hvdWxkIG5ldmVyIGhpdCAzIHBlb3BsZS5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGZ1bGxUZXh0OiBlWzBdLmFiaWxpdHlOYW1lICsgJyB4ICcgKyBlLmxlbmd0aCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEJleW9uZCBEZWF0aCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA9IGRhdGEuaGFzQmV5b25kRGVhdGggfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEJleW9uZCBEZWF0aCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA9IGRhdGEuaGFzQmV5b25kRGVhdGggfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gTzdTIC0gU2lnbWFzY2FwZSAzLjAgU2F2YWdlXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5TaWdtYXNjYXBlVjMwU2F2YWdlLFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPN1MgTWlzc2lsZSc6ICcyNzgyJyxcclxuICAgICdPN1MgQ2hhaW4gQ2Fubm9uJzogJzI3OEYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ083UyBTZWFyaW5nIFdpbmQnOiAnMjc3NycsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ083UyBTdG9uZXNraW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyQUI1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMuc291cmNlLCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IGNvdWxkIGFkZCBQYXRjaCB3YXJuaW5ncyBmb3IgZG91YmxlL3VuYnJva2VuIHRldGhlcnNcclxuLy8gVE9ETzogSGVsbG8gV29ybGQgY291bGQgaGF2ZSBhbnkgd2FybmluZ3MgKHNvcnJ5KVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFscGhhc2NhcGVWNDBTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08xMlMxIFN1cGVybGltaW5hbCBNb3Rpb24gMSc6ICczMzM0JywgLy8gMzAwKyBkZWdyZWUgY2xlYXZlIHdpdGggYmFjayBzYWZlIGFyZWFcclxuICAgICdPMTJTMSBFZmZpY2llbnQgQmxhZGV3b3JrIDEnOiAnMzMyOScsIC8vIE9tZWdhLU0gXCJnZXQgb3V0XCIgY2VudGVyZWQgYW9lIGFmdGVyIHNwbGl0XHJcbiAgICAnTzEyUzEgRWZmaWNpZW50IEJsYWRld29yayAyJzogJzMzMkEnLCAvLyBPbWVnYS1NIFwiZ2V0IG91dFwiIGNlbnRlcmVkIGFvZSBkdXJpbmcgYmxhZGVzXHJcbiAgICAnTzEyUzEgQmV5b25kIFN0cmVuZ3RoJzogJzMzMjgnLCAvLyBPbWVnYS1NIFwiZ2V0IGluXCIgY2VudGVyZWQgYW9lIGR1cmluZyBzaGllbGRcclxuICAgICdPMTJTMSBTdXBlcmxpbWluYWwgU3RlZWwgMSc6ICczMzMwJywgLy8gT21lZ2EtRiBcImdldCBmcm9udC9iYWNrXCIgYmxhZGVzIHBoYXNlXHJcbiAgICAnTzEyUzEgU3VwZXJsaW1pbmFsIFN0ZWVsIDInOiAnMzMzMScsIC8vIE9tZWdhLUYgXCJnZXQgZnJvbnQvYmFja1wiIGJsYWRlcyBwaGFzZVxyXG4gICAgJ08xMlMxIE9wdGltaXplZCBCbGl6emFyZCBJSUknOiAnMzMzMicsIC8vIE9tZWdhLUYgZ2lhbnQgY3Jvc3NcclxuICAgICdPMTJTMiBEaWZmdXNlIFdhdmUgQ2Fubm9uJzogJzMzNjknLCAvLyBiYWNrL3NpZGVzIGxhc2Vyc1xyXG4gICAgJ08xMlMyIFJpZ2h0IEFybSBVbml0IEh5cGVyIFB1bHNlIDEnOiAnMzM1QScsIC8vIFJvdGF0aW5nIEFyY2hpdmUgUGVyaXBoZXJhbCBsYXNlcnNcclxuICAgICdPMTJTMiBSaWdodCBBcm0gVW5pdCBIeXBlciBQdWxzZSAyJzogJzMzNUInLCAvLyBSb3RhdGluZyBBcmNoaXZlIFBlcmlwaGVyYWwgbGFzZXJzXHJcbiAgICAnTzEyUzIgUmlnaHQgQXJtIFVuaXQgQ29sb3NzYWwgQmxvdyc6ICczMzVGJywgLy8gRXhwbG9kaW5nIEFyY2hpdmUgQWxsIGhhbmRzXHJcbiAgICAnTzEyUzIgTGVmdCBBcm0gVW5pdCBDb2xvc3NhbCBCbG93JzogJzMzNjAnLCAvLyBFeHBsb2RpbmcgQXJjaGl2ZSBBbGwgaGFuZHNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPMTJTMSBPcHRpY2FsIExhc2VyJzogJzMzNDcnLCAvLyBtaWRkbGUgbGFzZXIgZnJvbSBleWVcclxuICAgICdPMTJTMSBBZHZhbmNlZCBPcHRpY2FsIExhc2VyJzogJzMzNEEnLCAvLyBnaWFudCBjaXJjbGUgY2VudGVyZWQgb24gZXllXHJcbiAgICAnTzEyUzIgUmVhciBQb3dlciBVbml0IFJlYXIgTGFzZXJzIDEnOiAnMzM2MScsIC8vIEFyY2hpdmUgQWxsIGluaXRpYWwgbGFzZXJcclxuICAgICdPMTJTMiBSZWFyIFBvd2VyIFVuaXQgUmVhciBMYXNlcnMgMic6ICczMzYyJywgLy8gQXJjaGl2ZSBBbGwgcm90YXRpbmcgbGFzZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08xMlMxIE9wdGltaXplZCBGaXJlIElJSSc6ICczMzM3JywgLy8gZmlyZSBzcHJlYWRcclxuICAgICdPMTJTMiBIeXBlciBQdWxzZSBUZXRoZXInOiAnMzM1QycsIC8vIEluZGV4IEFuZCBBcmNoaXZlIFBlcmlwaGVyYWwgdGV0aGVyc1xyXG4gICAgJ08xMlMyIFdhdmUgQ2Fubm9uJzogJzMzNkInLCAvLyBJbmRleCBBbmQgQXJjaGl2ZSBQZXJpcGhlcmFsIGJhaXRlZCBsYXNlcnNcclxuICAgICdPMTJTMiBPcHRpbWl6ZWQgRmlyZSBJSUknOiAnMzM3OScsIC8vIEFyY2hpdmUgQWxsIHNwcmVhZFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnTzEyUzEgT3B0aW1pemVkIFNhZ2l0dGFyaXVzIEFycm93JzogJzMzNEQnLCAvLyBPbWVnYS1NIGJhcmQgbGltaXQgYnJlYWtcclxuICAgICdPMTJTMiBPdmVyc2FtcGxlZCBXYXZlIENhbm5vbic6ICczMzY2JywgLy8gTW9uaXRvciB0YW5rIGJ1c3RlcnNcclxuICAgICdPMTJTMiBTYXZhZ2UgV2F2ZSBDYW5ub24nOiAnMzM2RCcsIC8vIFRhbmsgYnVzdGVyIHdpdGggdGhlIHZ1bG4gZmlyc3RcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgRGlzY2hhcmdlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzMzMjcnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NzInIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEudnVsbiA9IGRhdGEudnVsbiB8fCB7fTtcclxuICAgICAgICBkYXRhLnZ1bG5bbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgTWFnaWMgVnVsbmVyYWJpbGl0eSBVcCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzQ3MicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS52dWxuID0gZGF0YS52dWxuIHx8IHt9O1xyXG4gICAgICAgIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgTWFnaWMgVnVsbmVyYWJpbGl0eSBEYW1hZ2UnLFxyXG4gICAgICAvLyAzMzJFID0gUGlsZSBQaXRjaCBzdGFja1xyXG4gICAgICAvLyAzMzNFID0gRWxlY3RyaWMgU2xpZGUgKE9tZWdhLU0gc3F1YXJlIDEtNCBkYXNoZXMpXHJcbiAgICAgIC8vIDMzM0YgPSBFbGVjdHJpYyBTbGlkZSAoT21lZ2EtRiB0cmlhbmdsZSAxLTQgZGFzaGVzKVxyXG4gICAgICBkYW1hZ2VSZWdleDogWyczMzJFJywgJzMzM0UnLCAnMzMzRiddLFxyXG4gICAgICBjb25kaXRpb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS52dWxuICYmIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAod2l0aCB2dWxuKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChtaXQgVmVyd3VuZGJhcmtlaXQpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOiiq+ODgOODoeODvOOCuOS4iuaYhylgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5bim5piT5LykKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gQnlha2tvIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUphZGVTdG9hRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBQb3BwaW5nIFVucmVsZW50aW5nIEFuZ3Vpc2ggYnViYmxlc1xyXG4gICAgJ0J5YUV4IEFyYXRhbWEnOiAnMjdGNicsXHJcbiAgICAvLyBTdGVwcGluZyBpbiBncm93aW5nIG9yYlxyXG4gICAgJ0J5YUV4IFZhY3V1bSBDbGF3JzogJzI3RTknLFxyXG4gICAgLy8gTGlnaHRuaW5nIFB1ZGRsZXNcclxuICAgICdCeWFFeCBIdW5kZXJmb2xkIEhhdm9jIDEnOiAnMjdFNScsXHJcbiAgICAnQnlhRXggSHVuZGVyZm9sZCBIYXZvYyAyJzogJzI3RTYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0J5YUV4IFN3ZWVwIFRoZSBMZWcnOiAnMjdEQicsXHJcbiAgICAnQnlhRXggRmlyZSBhbmQgTGlnaHRuaW5nJzogJzI3REUnLFxyXG4gICAgJ0J5YUV4IERpc3RhbnQgQ2xhcCc6ICcyN0REJyxcclxuICAgIC8vIE1pZHBoYXNlIGxpbmUgYXR0YWNrXHJcbiAgICAnQnlhRXggSW1wZXJpYWwgR3VhcmQnOiAnMjdGMScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBQaW5rIGJ1YmJsZSBjb2xsaXNpb25cclxuICAgICAgaWQ6ICdCeWFFeCBPbWlub3VzIFdpbmQnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzI3RUMnLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiBkYXRhLklzUGxheWVySWQoZS50YXJnZXRJZCksXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnYnViYmxlIGNvbGxpc2lvbicsXHJcbiAgICAgICAgICAgIGRlOiAnQmxhc2VuIHNpbmQgenVzYW1tZW5nZXN0b8OfZW4nLFxyXG4gICAgICAgICAgICBmcjogJ2NvbGxpc2lvbiBkZSBidWxsZXMnLFxyXG4gICAgICAgICAgICBqYTogJ+ihneeqgScsXHJcbiAgICAgICAgICAgIGNuOiAn55u45pKeJyxcclxuICAgICAgICAgICAga286ICfsnqXtjJAg6rK57LOQ7IScIO2EsOynkCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBTaGlucnl1IE5vcm1hbFxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVJveWFsTWVuYWdlcmllLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTaGlucnl1IEFraCBSaGFpJzogJzFGQTYnLCAvLyBTa3kgbGFzZXJzIGFsb25nc2lkZSBBa2ggTW9ybi5cclxuICAgICdTaGlucnl1IEJsYXppbmcgVHJhaWwnOiAnMjIxQScsIC8vIFJlY3RhbmdsZSBBb0VzLCBpbnRlcm1pc3Npb24gYWRkcy5cclxuICAgICdTaGlucnl1IENvbGxhcHNlJzogJzIyMTgnLCAvLyBDaXJjbGUgQW9FcywgaW50ZXJtaXNzaW9uIGFkZHNcclxuICAgICdTaGlucnl1IERyYWdvbmZpc3QnOiAnMjRGMCcsIC8vIEdpYW50IHB1bmNoeSBjaXJjbGUgaW4gdGhlIGNlbnRlci5cclxuICAgICdTaGlucnl1IEVhcnRoIEJyZWF0aCc6ICcxRjlEJywgLy8gQ29uYWwgYXR0YWNrcyB0aGF0IGFyZW4ndCBhY3R1YWxseSBFYXJ0aCBTaGFrZXJzLlxyXG4gICAgJ1NoaW5yeXUgR3lyZSBDaGFyZ2UnOiAnMUZBOCcsIC8vIEdyZWVuIGRpdmUgYm9tYiBhdHRhY2suXHJcbiAgICAnU2hpbnJ5dSBTcGlrZXNpY2xlJzogJzFGQWAnLCAvLyBCbHVlLWdyZWVuIGxpbmUgYXR0YWNrcyBmcm9tIGJlaGluZC5cclxuICAgICdTaGlucnl1IFRhaWwgU2xhcCc6ICcxRjkzJywgLy8gUmVkIHNxdWFyZXMgaW5kaWNhdGluZyB0aGUgdGFpbCdzIGxhbmRpbmcgc3BvdHMuXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdTaGlucnl1IExldmluYm9sdCc6ICcxRjlDJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEljeSBmbG9vciBhdHRhY2suXHJcbiAgICAgIGlkOiAnU2hpbnJ5dSBEaWFtb25kIER1c3QnLFxyXG4gICAgICAvLyBUaGluIEljZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhGJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdTbGlkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5ruR44Gj44GfJyxcclxuICAgICAgICAgICAgY246ICfmu5HokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGlucnl1IFRpZGFsIFdhdmUnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzFGOEInLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogZS50YXJnZXROYW1lLFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXNjaHVic3QhJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn6JC944Gh44GfJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gS25vY2tiYWNrIGZyb20gY2VudGVyLlxyXG4gICAgICBpZDogJ1NoaW5yeXUgQWVyaWFsIEJsYXN0JyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICcxRjkwJyxcclxuICAgICAgZGVhdGhSZWFzb246IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IGUudGFyZ2V0TmFtZSxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1B1c2hlZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VzY2h1YnN0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBwb3Vzc2VyICEnLFxyXG4gICAgICAgICAgICBqYTogJ+iQveOBoeOBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gU3VzYW5vIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVBvb2xPZlRyaWJ1dGVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTdXNFeCBDaHVybmluZyc6ICcyMDNGJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdTdXNFeCBSYXNlbiBLYWlreW8nOiAnMjAyRScsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFVsdGltYSBXZWFwb24gVWx0aW1hdGVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdlYXBvbnNSZWZyYWluVWx0aW1hdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1VXVSBTZWFyaW5nIFdpbmQnOiAnMkI1QycsXHJcbiAgICAnVVdVIEVydXB0aW9uJzogJzJCNUEnLFxyXG4gICAgJ1VXVSBXZWlnaHQnOiAnMkI2NScsXHJcbiAgICAnVVdVIExhbmRzbGlkZTEnOiAnMkI3MCcsXHJcbiAgICAnVVdVIExhbmRzbGlkZTInOiAnMkI3MScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVVdVIEdyZWF0IFdoaXJsd2luZCc6ICcyQjQxJyxcclxuICAgICdVV1UgU2xpcHN0cmVhbSc6ICcyQjUzJyxcclxuICAgICdVV1UgV2lja2VkIFdoZWVsJzogJzJCNEUnLFxyXG4gICAgJ1VXVSBXaWNrZWQgVG9ybmFkbyc6ICcyQjRGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVVdVIFdpbmRidXJuJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0VCJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAyLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0LCB0ZXh0OiBlLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gRmVhdGhlcmxhbmNlIGV4cGxvc2lvbi4gIEl0IHNlZW1zIGxpa2UgdGhlIHBlcnNvbiB3aG8gcG9wcyBpdCBpcyB0aGVcclxuICAgICAgLy8gZmlyc3QgcGVyc29uIGxpc3RlZCBkYW1hZ2Utd2lzZSwgc28gdGhleSBhcmUgbGlrZWx5IHRoZSBjdWxwcml0LlxyXG4gICAgICBpZDogJ1VXVSBGZWF0aGVybGFuY2UnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzJCNDMnLFxyXG4gICAgICBjb2xsZWN0U2Vjb25kczogMC41LFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDUsXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZVswXS50YXJnZXROYW1lLCB0ZXh0OiBlWzBdLmF0dGFja2VyTmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVUNVIC0gVGhlIFVuZW5kaW5nIENvaWwgT2YgQmFoYW11dCAoVWx0aW1hdGUpXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVVbmVuZGluZ0NvaWxPZkJhaGFtdXRVbHRpbWF0ZSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVUNVIEx1bmFyIER5bmFtbyc6ICcyNkJDJyxcclxuICAgICdVQ1UgSXJvbiBDaGFyaW90JzogJzI2QkInLFxyXG4gICAgJ1VDVSBFeGFmbGFyZSc6ICcyNkVGJyxcclxuICAgICdVQ1UgV2luZ3MgT2YgU2FsdmF0aW9uJzogJzI2Q0EnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgVHdpc3RlciBEZWF0aCcsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnMjZBQicsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICAvLyBJbnN0YW50IGRlYXRoIHVzZXMgJzM2JyBhcyBpdHMgZmxhZ3MsIGRpZmZlcmVudGlhdGluZ1xyXG4gICAgICAgIC8vIGZyb20gdGhlIGV4cGxvc2lvbiBkYW1hZ2UgeW91IHRha2Ugd2hlbiBzb21lYm9keSBlbHNlXHJcbiAgICAgICAgLy8gcG9wcyBvbmUuXHJcbiAgICAgICAgcmV0dXJuIGRhdGEuSXNQbGF5ZXJJZChlLnRhcmdldElkKSAmJiBlLmZsYWdzID09PSAnMzYnO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogZS50YXJnZXROYW1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1R3aXN0ZXIgUG9wJyxcclxuICAgICAgICAgICAgZGU6ICdXaXJiZWxzdHVybSBiZXLDvGhydCcsXHJcbiAgICAgICAgICAgIGZyOiAnQXBwYXJpdGlvbiBkZXMgdG9ybmFkZXMnLFxyXG4gICAgICAgICAgICBqYTogJ+ODhOOCpOOCueOCv+ODvCcsXHJcbiAgICAgICAgICAgIGNuOiAn5peL6aOOJyxcclxuICAgICAgICAgICAga286ICftmozsmKTrpqwg67Cf7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIFRoZXJtaW9uaWMgQnVyc3QnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzI2QjknLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiBkYXRhLklzUGxheWVySWQoZS50YXJnZXRJZCksXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUGl6emEgU2xpY2UnLFxyXG4gICAgICAgICAgICBkZTogJ1Bpenphc3TDvGNrJyxcclxuICAgICAgICAgICAgZnI6ICdQYXJ0cyBkZSBwaXp6YScsXHJcbiAgICAgICAgICAgIGphOiAn44K144O844Of44Kq44OL44OD44Kv44OQ44O844K544OIJyxcclxuICAgICAgICAgICAgY246ICflpKnltKnlnLDoo4InLFxyXG4gICAgICAgICAgICBrbzogJ+yepe2MkOyXkCDrp57snYwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgQ2hhaW4gTGlnaHRuaW5nJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICcyNkM4JyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4gZGF0YS5Jc1BsYXllcklkKGUudGFyZ2V0SWQpLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIC8vIEl0J3MgaGFyZCB0byBhc3NpZ24gYmxhbWUgZm9yIGxpZ2h0bmluZy4gIFRoZSBkZWJ1ZmZzXHJcbiAgICAgICAgLy8gZ28gb3V0IGFuZCB0aGVuIGV4cGxvZGUgaW4gb3JkZXIsIGJ1dCB0aGUgYXR0YWNrZXIgaXNcclxuICAgICAgICAvLyB0aGUgZHJhZ29uIGFuZCBub3QgdGhlIHBsYXllci5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgbmFtZTogZS50YXJnZXROYW1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2hpdCBieSBsaWdodG5pbmcnLFxyXG4gICAgICAgICAgICBkZTogJ3ZvbSBCbGl0eiBnZXRyb2ZmZW4nLFxyXG4gICAgICAgICAgICBmcjogJ2ZyYXBww6koZSkgcGFyIGxhIGZvdWRyZScsXHJcbiAgICAgICAgICAgIGphOiAn44OB44Kn44Kk44Oz44Op44Kk44OI44OL44Oz44KwJyxcclxuICAgICAgICAgICAgY246ICfpm7flhYnpk74nLFxyXG4gICAgICAgICAgICBrbzogJ+uyiOqwnCDrp57snYwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgQnVybnMnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRkEnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0LCB0ZXh0OiBlLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgU2x1ZGdlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzExRicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZS50YXJnZXQsIHRleHQ6IGUuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBEb29tIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRDInIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA9IGRhdGEuaGFzRG9vbSB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIERvb20gTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICdEMicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID0gZGF0YS5oYXNEb29tIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXJlIGlzIG5vIGNhbGxvdXQgZm9yIFwieW91IGZvcmdvdCB0byBjbGVhciBkb29tXCIuICBUaGUgbG9ncyBsb29rXHJcbiAgICAgIC8vIHNvbWV0aGluZyBsaWtlIHRoaXM6XHJcbiAgICAgIC8vICAgWzIwOjAyOjMwLjU2NF0gMUE6T2tvbm9taSBZYWtpIGdhaW5zIHRoZSBlZmZlY3Qgb2YgRG9vbSBmcm9tICBmb3IgNi4wMCBTZWNvbmRzLlxyXG4gICAgICAvLyAgIFsyMDowMjozNi40NDNdIDFFOk9rb25vbWkgWWFraSBsb3NlcyB0aGUgZWZmZWN0IG9mIFByb3RlY3QgZnJvbSBUYWtvIFlha2kuXHJcbiAgICAgIC8vICAgWzIwOjAyOjM2LjQ0M10gMUU6T2tvbm9taSBZYWtpIGxvc2VzIHRoZSBlZmZlY3Qgb2YgRG9vbSBmcm9tIC5cclxuICAgICAgLy8gICBbMjA6MDI6MzguNTI1XSAxOTpPa29ub21pIFlha2kgd2FzIGRlZmVhdGVkIGJ5IEZpcmVob3JuLlxyXG4gICAgICAvLyBJbiBvdGhlciB3b3JkcywgZG9vbSBlZmZlY3QgaXMgcmVtb3ZlZCArLy0gbmV0d29yayBsYXRlbmN5LCBidXQgY2FuJ3RcclxuICAgICAgLy8gdGVsbCB1bnRpbCBsYXRlciB0aGF0IGl0IHdhcyBhIGRlYXRoLiAgQXJndWFibHksIHRoaXMgY291bGQgaGF2ZSBiZWVuIGFcclxuICAgICAgLy8gY2xvc2UtYnV0LXN1Y2Nlc3NmdWwgY2xlYXJpbmcgb2YgZG9vbSBhcyB3ZWxsLiAgSXQgbG9va3MgdGhlIHNhbWUuXHJcbiAgICAgIC8vIFN0cmF0ZWd5OiBpZiB5b3UgaGF2ZW4ndCBjbGVhcmVkIGRvb20gd2l0aCAxIHNlY29uZCB0byBnbyB0aGVuIHlvdSBwcm9iYWJseVxyXG4gICAgICAvLyBkaWVkIHRvIGRvb20uICBZb3UgY2FuIGdldCBub24tZmF0YWxseSBpY2ViYWxsZWQgb3IgYXV0bydkIGluIGJldHdlZW4sXHJcbiAgICAgIC8vIGJ1dCB3aGF0IGNhbiB5b3UgZG8uXHJcbiAgICAgIGlkOiAnVUNVIERvb20gRGVhdGgnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRDInIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAxLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGUsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbSB8fCAhZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBsZXQgcmVhc29uO1xyXG4gICAgICAgIGlmIChlLmR1cmF0aW9uU2Vjb25kcyA8IDkpXHJcbiAgICAgICAgICByZWFzb24gPSBtYXRjaGVzLmVmZmVjdCArICcgIzEnO1xyXG4gICAgICAgIGVsc2UgaWYgKGUuZHVyYXRpb25TZWNvbmRzIDwgMTQpXHJcbiAgICAgICAgICByZWFzb24gPSBtYXRjaGVzLmVmZmVjdCArICcgIzInO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIHJlYXNvbiA9IG1hdGNoZXMuZWZmZWN0ICsgJyAjMyc7XHJcbiAgICAgICAgcmV0dXJuIHsgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHJlYXNvbjogcmVhc29uIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVGhlIENvcGllZCBGYWN0b3J5XHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDb3BpZWRGYWN0b3J5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iJzogJzQ4QjQnLFxyXG4gICAgLy8gTWFrZSBzdXJlIGVuZW1pZXMgYXJlIGlnbm9yZWQgb24gdGhlc2VcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iYXJkbWVudCc6ICc0OEI4JyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBBc3NhdWx0JzogJzQ4QjYnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzQ4QzUnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gU3BpbiAxJzogJzQ4Q0InLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gMic6ICc0OENDJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIENlbnRyaWZ1Z2FsIFNwaW4nOiAnNDhDOScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBBaXItVG8tU3VyZmFjZSBFbmVyZ3knOiAnNDhCQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBIaWdoLUNhbGliZXIgTGFzZXInOiAnNDhGQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyAxJzogJzQ4QkMnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgMic6ICc0OEJEJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDMnOiAnNDhCRScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyA0JzogJzQ4QzAnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgNSc6ICc0OEMxJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDYnOiAnNDhDMicsXHJcblxyXG4gICAgJ0NvcGllZCBUcmFzaCBFbmVyZ3kgQm9tYic6ICc0OTFEJyxcclxuICAgICdDb3BpZWQgVHJhc2ggRnJvbnRhbCBTb21lcnNhdWx0JzogJzQ5MUInLFxyXG4gICAgJ0NvcGllZCBUcmFzaCBIaWdoLUZyZXF1ZW5jeSBMYXNlcic6ICc0OTFFJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ja2luZyBEaXNjaGFyZ2UnOiAnNDgwQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCAxJzogJzQ5QzUnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgMic6ICc0OUM2JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDMnOiAnNDlDNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCA0JzogJzQ4MEYnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgNSc6ICc0ODEwJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDYnOiAnNDgxMScsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAxJzogJzQ4MDInLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAyJzogJzQ4MDMnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAzJzogJzQ4MDQnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIFRvd2VyZmFsbCc6ICc0ODEzJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDEnOiAnNDgxNicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDInOiAnNDgxNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDMnOiAnNDgxOCcsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgT2lsIFdlbGwnOiAnNDgxQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBFbGVjdHJvbWFnbmV0aWMgUHVsc2UnOiAnNDgxOScsXHJcbiAgICAvLyBUT0RPOiB3aGF0J3MgdGhlIGVsZWN0cmlmaWVkIGZsb29yIHdpdGggY29udmV5b3IgYmVsdHM/XHJcblxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDEnOiAnNDkzNycsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgMic6ICc0OTM4JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyAzJzogJzQ5MzknLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDQnOiAnNDkzQScsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgNSc6ICc0OTM3JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBMYXNlciBUdXJyZXQnOiAnNDhFNicsXHJcblxyXG4gICAgJ0NvcGllZCBGbGlnaHQgVW5pdCBBcmVhIEJvbWJpbmcnOiAnNDk0MycsXHJcbiAgICAnQ29waWVkIEZsaWdodCBVbml0IExpZ2h0ZmFzdCBCbGFkZSc6ICc0OTQwJyxcclxuXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDEnOiAnNDcyOScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDInOiAnNDcyOCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDMnOiAnNDcyRicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDQnOiAnNDczMScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDUnOiAnNDcyQicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDYnOiAnNDcyRCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDcnOiAnNDczMicsXHJcblxyXG4gICAgJ0NvcGllZCBFbmdlbHMgSW5jZW5kaWFyeSBCb21iaW5nJzogJzQ3MzknLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgR3VpZGVkIE1pc3NpbGUnOiAnNDczNicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBTdXJmYWNlIE1pc3NpbGUnOiAnNDczNCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBMYXNlciBTaWdodCc6ICc0NzNCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIEZyYWNrJzogJzQ3NEQnLFxyXG5cclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggQ3J1c2gnOiAnNDhGQycsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBDcnVzaGluZyBXaGVlbCc6ICc0NzRCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggVGhydXN0JzogJzQ4RkMnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTGFzZXIgU3VwcHJlc3Npb24nOiAnNDhFMCcsIC8vIENhbm5vbnNcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCAxJzogJzQ5NzQnLFxyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDInOiAnNDhEQycsXHJcbiAgICAnQ29waWVkIDlTIEJhbGxpc3RpYyBJbXBhY3QgMyc6ICc0OEU0JyxcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCA0JzogJzQ4RTAnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTWFyeCBJbXBhY3QnOiAnNDhENCcsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBUYW5rIERlc3RydWN0aW9uIDEnOiAnNDhFOCcsXHJcbiAgICAnQ29waWVkIDlTIFRhbmsgRGVzdHJ1Y3Rpb24gMic6ICc0OEU5JyxcclxuXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDEnOiAnNDhBNScsXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDInOiAnNDhBNycsXHJcblxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ydC1SYW5nZSBNaXNzaWxlJzogJzQ4MTUnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogNTA5MyB0YWtpbmcgSGlnaC1Qb3dlcmVkIExhc2VyIHdpdGggYSB2dWxuIChiZWNhdXNlIG9mIHRha2luZyB0d28pXHJcbi8vIFRPRE86IDRGQjUgdGFraW5nIEhpZ2gtUG93ZXJlZCBMYXNlciB3aXRoIGEgdnVsbiAoYmVjYXVzZSBvZiB0YWtpbmcgdHdvKVxyXG4vLyBUT0RPOiA1MEQzIEFlcmlhbCBTdXBwb3J0OiBCb21iYXJkbWVudCBnb2luZyBvZmYgZnJvbSBhZGRcclxuLy8gVE9ETzogNTIxMSBNYW5ldXZlcjogVm9sdCBBcnJheSBub3QgZ2V0dGluZyBpbnRlcnJ1cHRlZFxyXG4vLyBUT0RPOiA0RkY0LzRGRjUgT25lIG9mIHRoZXNlIGlzIGZhaWxpbmcgY2hlbWljYWwgY29uZmxhZ3JhdGlvblxyXG4vLyBUT0RPOiBzdGFuZGluZyBpbiB3cm9uZyB0ZWxlcG9ydGVyPz8gbWF5YmUgNTM2Mz9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVQdXBwZXRzQnVua2VyLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdQdXBwZXQgQWVnaXMgQmVhbSBDYW5ub25zIDEnOiAnNTA3NCcsIC8vIHJvdGF0aW5nIHNlcGFyYXRpbmcgd2hpdGUgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBBZWdpcyBCZWFtIENhbm5vbnMgMic6ICc1MDc1JywgLy8gcm90YXRpbmcgc2VwYXJhdGluZyB3aGl0ZSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEFlZ2lzIEJlYW0gQ2Fubm9ucyAzJzogJzUwNzYnLCAvLyByb3RhdGluZyBzZXBhcmF0aW5nIHdoaXRlIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQWVnaXMgQ29sbGlkZXIgQ2Fubm9ucyc6ICc1MDdFJywgLy8gcm90YXRpbmcgcmVkIGdyb3VuZCBhb2UgcGlud2hlZWxcclxuICAgICdQdXBwZXQgQWVnaXMgU3VyZmFjZSBMYXNlciAxJzogJzUwOTEnLCAvLyBjaGFzaW5nIGxhc2VyIGluaXRpYWxcclxuICAgICdQdXBwZXQgQWVnaXMgU3VyZmFjZSBMYXNlciAyJzogJzUwOTInLCAvLyBjaGFzaW5nIGxhc2VyIGNoYXNpbmdcclxuICAgICdQdXBwZXQgQWVnaXMgRmxpZ2h0IFBhdGgnOiAnNTA4QycsIC8vIGJsdWUgbGluZSBhb2UgZnJvbSBmbHlpbmcgdW50YXJnZXRhYmxlIGFkZHNcclxuICAgICdQdXBwZXQgQWVnaXMgUmVmcmFjdGlvbiBDYW5ub25zIDEnOiAnNTA4MScsIC8vIHJlZnJhY3Rpb24gY2Fubm9ucyBiZXR3ZWVuIHdpbmdzXHJcbiAgICAnUHVwcGV0IEFlZ2lzIExpZmVcXCdzIExhc3QgU29uZyc6ICc1M0IzJywgLy8gcmluZyBhb2Ugd2l0aCBnYXBcclxuICAgICdQdXBwZXQgTGlnaHQgTG9uZy1CYXJyZWxlZCBMYXNlcic6ICc1MjEyJywgLy8gbGluZSBhb2UgZnJvbSBhZGRcclxuICAgICdQdXBwZXQgTGlnaHQgU3VyZmFjZSBNaXNzaWxlIEltcGFjdCc6ICc1MjBGJywgLy8gdW50YXJnZXRlZCBncm91bmQgYW9lIGZyb20gTm8gUmVzdHJpY3Rpb25zXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIEluY2VuZGlhcnkgQm9tYmluZyc6ICc0RkI5JywgLy8gZmlyZSBwdWRkbGUgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTaGFycCBUdXJuJzogJzUwNkQnLCAvLyBzaGFycCB0dXJuIGRhc2hcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU3RhbmRhcmQgU3VyZmFjZSBNaXNzaWxlIDEnOiAnNEZCMScsIC8vIExldGhhbCBSZXZvbHV0aW9uIGNpcmNsZXNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU3RhbmRhcmQgU3VyZmFjZSBNaXNzaWxlIDInOiAnNEZCMicsIC8vIExldGhhbCBSZXZvbHV0aW9uIGNpcmNsZXNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU3RhbmRhcmQgU3VyZmFjZSBNaXNzaWxlIDMnOiAnNEZCMycsIC8vIExldGhhbCBSZXZvbHV0aW9uIGNpcmNsZXNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU2xpZGluZyBTd2lwZSAxJzogJzUwNkYnLCAvLyByaWdodC1oYW5kZWQgc2xpZGluZyBzd2lwZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTbGlkaW5nIFN3aXBlIDInOiAnNTA3MCcsIC8vIGxlZnQtaGFuZGVkIHNsaWRpbmcgc3dpcGVcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgR3VpZGVkIE1pc3NpbGUnOiAnNEZCOCcsIC8vIGdyb3VuZCBhb2UgZHVyaW5nIEFyZWEgQm9tYmFyZG1lbnRcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgSGlnaC1PcmRlciBFeHBsb3NpdmUgQmxhc3QgMSc6ICc0RkMwJywgLy8gc3RhciBhb2VcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgSGlnaC1PcmRlciBFeHBsb3NpdmUgQmxhc3QgMic6ICc0RkMxJywgLy8gc3RhciBhb2VcclxuICAgICdQdXBwZXQgSGVhdnkgRW5lcmd5IEJvbWJhcmRtZW50JzogJzRGRkMnLCAvLyBjb2xvcmVkIG1hZ2ljIGhhbW1lci15IGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgSGVhdnkgUmV2b2x2aW5nIExhc2VyJzogJzUwMDAnLCAvLyBnZXQgdW5kZXIgbGFzZXJcclxuICAgICdQdXBwZXQgSGVhdnkgRW5lcmd5IEJvbWInOiAnNEZGQScsIC8vIGdldHRpbmcgaGl0IGJ5IGJhbGwgZHVyaW5nIEFjdGl2ZSBTdXBwcmVzc2l2ZSBVbml0XHJcbiAgICAnUHVwcGV0IEhlYXZ5IFIwMTAgTGFzZXInOiAnNEZGMCcsIC8vIGxhc2VyIHBvZFxyXG4gICAgJ1B1cHBldCBIZWF2eSBSMDMwIEhhbW1lcic6ICc0RkYxJywgLy8gY2lyY2xlIGFvZSBwb2RcclxuICAgICdQdXBwZXQgSGFsbHdheSBIaWdoLVBvd2VyZWQgTGFzZXInOiAnNTBCMScsIC8vIGxvbmcgYW9lIGluIHRoZSBoYWxsd2F5IHNlY3Rpb25cclxuICAgICdQdXBwZXQgSGFsbHdheSBFbmVyZ3kgQm9tYic6ICc1MEIyJywgLy8gcnVubmluZyBpbnRvIGEgZmxvYXRpbmcgb3JiXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2hhbmljYWwgRGlzc2VjdGlvbic6ICc1MUIzJywgLy8gc3Bpbm5pbmcgdmVydGljYWwgbGFzZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaGFuaWNhbCBEZWNhcGl0YXRpb24nOiAnNTFCNCcsIC8vIGdldCB1bmRlciBsYXNlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBNZWNobmljYWwgQ29udHVzaW9uIFVudGFyZ2V0ZWQnOiAnNTFCNycsIC8vIHVudGFyZ2V0ZWQgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBSZWxlbnRsZXNzIFNwaXJhbCAxJzogJzUxQUEnLCAvLyB0cmlwbGUgdW50YXJnZXRlZCBncm91bmQgYW9lc1xyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBSZWxlbnRsZXNzIFNwaXJhbCAyJzogJzUxQ0InLCAvLyB0cmlwbGUgdW50YXJnZXRlZCBncm91bmQgYW9lc1xyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBPdXQgMSc6ICc1NDFGJywgLy8gMlAgcHJpbWUgYmxhZGUgZ2V0IG91dFxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBPdXQgMic6ICc1MTk4JywgLy8gMlAvcHVwcGV0IHRlbGVwb3J0aW5nL3JlcHJvZHVjZSBwcmltZSBibGFkZSBnZXQgb3V0XHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEJlaGluZCAxJzogJzU0MjAnLCAvLyAyUCBwcmltZSBibGFkZSBnZXQgYmVoaW5kXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEJlaGluZCAyJzogJzUxOTknLCAvLyAyUCB0ZWxlcG9ydGluZyBwcmltZSBibGFkZSBnZXQgYmVoaW5kXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEluIDEnOiAnNTQyMScsIC8vIDJQIHByaW1lIGJsYWRlIGdldCBpblxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBJbiAyJzogJzUxOUEnLCAvLyAyUC9wdXBwZXQgdGVsZXBvcnRpbmcvcmVwcm9kdWNlIHByaW1lIGJsYWRlIGdldCBpblxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBSMDEyIExhc2VyIEdyb3VuZCc6ICc1MUFFJywgLy8gdW50YXJnZXRlZCBncm91bmQgY2lyY2xlXHJcbiAgICAvLyBUaGlzIGlzLi4uIHRvbyBub2lzeS5cclxuICAgIC8vICdQdXBwZXQgQ29tcG91bmQgMlAgRm91ciBQYXJ0cyBSZXNvbHZlIDEnOiAnNTFBMCcsIC8vIGZvdXIgcGFydHMgcmVzb2x2ZSBqdW1wXHJcbiAgICAvLyAnUHVwcGV0IENvbXBvdW5kIDJQIEZvdXIgUGFydHMgUmVzb2x2ZSAyJzogJzUxOUYnLCAvLyBmb3VyIHBhcnRzIHJlc29sdmUgY2xlYXZlXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnUHVwcGV0IEhlYXZ5IFVwcGVyIExhc2VyIDEnOiAnNTA4NycsIC8vIHVwcGVyIGxhc2VyIGluaXRpYWxcclxuICAgICdQdXBwZXQgSGVhdnkgVXBwZXIgTGFzZXIgMic6ICc0RkY3JywgLy8gdXBwZXIgbGFzZXIgY29udGludW91c1xyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciAxJzogJzUwODYnLCAvLyBsb3dlciBsYXNlciBmaXJzdCBzZWN0aW9uIGluaXRpYWxcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgMic6ICc0RkY2JywgLy8gbG93ZXIgbGFzZXIgZmlyc3Qgc2VjdGlvbiBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDMnOiAnNTA4OCcsIC8vIGxvd2VyIGxhc2VyIHNlY29uZCBzZWN0aW9uIGluaXRpYWxcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgNCc6ICc0RkY4JywgLy8gbG93ZXIgbGFzZXIgc2Vjb25kIHNlY3Rpb24gY29udGludW91c1xyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA1JzogJzUwODknLCAvLyBsb3dlciBsYXNlciB0aGlyZCBzZWN0aW9uIGluaXRpYWxcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgNic6ICc0RkY5JywgLy8gbG93ZXIgbGFzZXIgdGhpcmQgc2VjdGlvbiBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIEluY29uZ3J1b3VzIFNwaW4nOiAnNTFCMicsIC8vIGZpbmQgdGhlIHNhZmUgc3BvdCBkb3VibGUgZGFzaFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBUaGlzIGlzIHByZXR0eSBsYXJnZSBhbmQgZ2V0dGluZyBoaXQgYnkgaW5pdGlhbCB3aXRob3V0IGJ1cm5zIHNlZW1zIGZpbmUuXHJcbiAgICAvLyAnUHVwcGV0IExpZ2h0IEhvbWluZyBNaXNzaWxlIEltcGFjdCc6ICc1MjEwJywgLy8gdGFyZ2V0ZWQgZmlyZSBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgSGVhdnkgVW5jb252ZW50aW9uYWwgVm9sdGFnZSc6ICc1MDA0JyxcclxuICAgIC8vIFByZXR0eSBub2lzeS5cclxuICAgICdQdXBwZXQgTWFuZXV2ZXIgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzUwMDInLCAvLyB0YW5rIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVGFyZ2V0ZWQnOiAnNTFCNicsIC8vIHRhcmdldGVkIHNwcmVhZCBtYXJrZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBUYW5rJzogJzUxQUUnLCAvLyB0YXJnZXRlZCBzcHJlYWQgcG9kIGxhc2VyIG9uIG5vbi10YW5rXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdQdXBwZXQgQWVnaXMgQW50aS1QZXJzb25uZWwgTGFzZXInOiAnNTA5MCcsIC8vIHRhbmsgYnVzdGVyIG1hcmtlclxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBQcmVjaXNpb24tR3VpZGVkIE1pc3NpbGUnOiAnNEZDNScsXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgVGFuayc6ICc1MUFEJywgLy8gdGFyZ2V0ZWQgcG9kIGxhc2VyIG9uIHRhbmtcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1B1cHBldCBCdXJucyc6ICcxMEInLCAvLyBzdGFuZGluZyBpbiBtYW55IHZhcmlvdXMgZmlyZSBhb2VzXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IG1pc3NpbmcgU2hvY2sgQmxhY2sgMj9cclxuLy8gVE9ETzogV2hpdGUvQmxhY2sgRGlzc29uYW5jZSBkYW1hZ2UgaXMgbWF5YmUgd2hlbiBmbGFncyBlbmQgaW4gMDM/XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlVG93ZXJBdFBhcmFkaWdtc0JyZWFjaCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IENlbnRlciAxJzogJzVFQTcnLCAvLyBDZW50ZXIgYW9lIGZyb20gS25hdmUgYW5kIGNsb25lc1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBDZW50ZXIgMic6ICc2MEM4JywgLy8gQ2VudGVyIGFvZSBmcm9tIEtuYXZlIGR1cmluZyBsdW5nZVxyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDEnOiAnNUVBNScsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGFuZCBjbG9uZXNcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSAyJzogJzVFQTYnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBhbmQgY2xvbmVzXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgMyc6ICc2MEM2JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgZHVyaW5nIGx1bmdlXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgNCc6ICc2MEM3JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgZHVyaW5nIGx1bmdlXHJcbiAgICAnVG93ZXIgS25hdmUgQnVyc3QnOiAnNUVENCcsIC8vIFNwaGVyb2lkIEtuYXZpc2ggQnVsbGV0cyBjb2xsaXNpb25cclxuICAgICdUb3dlciBLbmF2ZSBNYWdpYyBCYXJyYWdlJzogJzVFQUMnLCAvLyBTcGhlcm9pZCBsaW5lIGFvZXNcclxuICAgICdUb3dlciBIYW5zZWwgUmVwYXknOiAnNUM3MCcsIC8vIFNoaWVsZCBkYW1hZ2VcclxuICAgICdUb3dlciBIYW5zZWwgRXhwbG9zaW9uJzogJzVDNjcnLCAvLyBCZWluZyBoaXQgYnkgTWFnaWMgQnVsbGV0IGR1cmluZyBQYXNzaW5nIExhbmNlXHJcbiAgICAnVG93ZXIgSGFuc2VsIEltcGFjdCc6ICc1QzVDJywgLy8gQmVpbmcgaGl0IGJ5IE1hZ2ljYWwgQ29uZmx1ZW5jZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCAxJzogJzVDNkMnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aG91dCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDInOiAnNUM2RCcsIC8vIER1YWwgY2xlYXZlcyB3aXRob3V0IHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgMyc6ICc1QzZFJywgLy8gRHVhbCBjbGVhdmVzIHdpdGggdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCA0JzogJzVDNkYnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgUGFzc2luZyBMYW5jZSc6ICc1QzY2JywgLy8gVGhlIFBhc3NpbmcgTGFuY2UgY2hhcmdlIGl0c2VsZlxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCcmVhdGh0aHJvdWdoIDEnOiAnNTVCMycsIC8vIGhhbGYgcm9vbSBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCcmVhdGh0aHJvdWdoIDInOiAnNUM1RCcsIC8vIGhhbGYgcm9vbSBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCcmVhdGh0aHJvdWdoIDMnOiAnNUM1RScsIC8vIGhhbGYgcm9vbSBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBIdW5ncnkgTGFuY2UgMSc6ICc1QzcxJywgLy8gMnhsYXJnZSBjb25hbCBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBIdW5ncnkgTGFuY2UgMic6ICc1QzcyJywgLy8gMnhsYXJnZSBjb25hbCBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEZsaWdodCBVbml0IExpZ2h0ZmFzdCBCbGFkZSc6ICc1QkZFJywgLy8gbGFyZ2Ugcm9vbSBjbGVhdmVcclxuICAgICdUb3dlciBGbGlnaHQgVW5pdCBTdGFuZGFyZCBMYXNlcic6ICc1QkZGJywgLy8gdHJhY2tpbmcgbGFzZXJcclxuICAgICdUb3dlciAyUCBXaGlybGluZyBBc3NhdWx0JzogJzVCRkInLCAvLyBsaW5lIGFvZSBmcm9tIDJQIGNsb25lc1xyXG4gICAgJ1Rvd2VyIDJQIEJhbGFuY2VkIEVkZ2UnOiAnNUJGQScsIC8vIGNpcmN1bGFyIGFvZSBvbiAyUCBjbG9uZXNcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDEnOiAnNjAwNicsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDInOiAnNjAwNycsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDMnOiAnNjAwOCcsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDQnOiAnNjAwOScsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDUnOiAnNjMxMCcsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDYnOiAnNjMxMScsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDcnOiAnNjMxMicsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDgnOiAnNjMxMycsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBTaG9jayBXaGl0ZSAxJzogJzYwMEYnLCAvLyB3aGl0ZSBzaG9ja3dhdmUgY2lyY2xlIG5vdCBkcm9wcGVkIG9uIGJsYWNrXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgU2hvY2sgV2hpdGUgMic6ICc2MDEwJywgLy8gd2hpdGUgc2hvY2t3YXZlIGNpcmNsZSBub3QgZHJvcHBlZCBvbiBibGFja1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFNob2NrIEJsYWNrIDEnOiAnNjAxMScsIC8vIGJsYWNrIHNob2Nrd2F2ZSBjaXJjbGUgbm90IGRyb3BwZWQgb24gd2hpdGVcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBXaGl0ZSAxJzogJzYwMUYnLCAvLyBiZWluZyBoaXQgYnkgYSB3aGl0ZSBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IFdoaXRlIDInOiAnNjAyMScsIC8vIGJlaW5nIGhpdCBieSBhIHdoaXRlIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgQmxhY2sgMSc6ICc2MDIwJywgLy8gYmVpbmcgaGl0IGJ5IGEgYmxhY2sgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBCbGFjayAyJzogJzYwMjInLCAvLyBiZWluZyBoaXQgYnkgYSBibGFjayBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFdpcGUgV2hpdGUnOiAnNjAwQycsIC8vIG5vdCBsaW5lIG9mIHNpZ2h0aW5nIHRoZSB3aGl0ZSBtZXRlb3JcclxuICAgICdUb3dlciBSZWQgR2lybCBXaXBlIEJsYWNrJzogJzYwMEQnLCAvLyBub3QgbGluZSBvZiBzaWdodGluZyB0aGUgYmxhY2sgbWV0ZW9yXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgRGlmZnVzZSBFbmVyZ3knOiAnNjA1NicsIC8vIHJvdGF0aW5nIGNsb25lIGJ1YmJsZSBjbGVhdmVzXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUHlsb24gQmlnIEV4cGxvc2lvbic6ICc2MDI3JywgLy8gbm90IGtpbGxpbmcgYSBweWxvbiBkdXJpbmcgaGFja2luZyBwaGFzZVxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFB5bG9uIEV4cGxvc2lvbic6ICc2MDI2JywgLy8gcHlsb24gZHVyaW5nIENoaWxkJ3MgcGxheVxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgTWlkZGxlJzogJzVDMDInLCAvLyBtaWRkbGUgbGFzZXJcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIFNpZGVzJzogJzVDMDUnLCAvLyBzaWRlcyBsYXNlclxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgMyc6ICc2MDc4JywgLy8gZ29lcyB3aXRoIDVDMDFcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIDQnOiAnNjA3OScsIC8vIGdvZXMgd2l0aCA1QzA0XHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRW5lcmd5IEJvbWInOiAnNUMwNScsIC8vIHBpbmsgYnViYmxlXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBNYWRlIE1hZ2ljIFJpZ2h0JzogJzVCRDcnLCAvLyByb3RhdGluZyB3aGVlbCBnb2luZyByaWdodFxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTWFkZSBNYWdpYyBMZWZ0JzogJzVCRDYnLCAvLyByb3RhdGluZyB3aGVlbCBnb2luZyBsZWZ0XHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBMaWdodGVyIE5vdGUnOiAnNUJEQScsIC8vIGxpZ2h0ZXIgbm90ZSBtb3ZpbmcgYW9lc1xyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTWFnaWNhbCBJbnRlcmZlcmVuY2UnOiAnNUJENScsIC8vIGxhc2VycyBkdXJpbmcgUmh5dGhtIFJpbmdzXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBTY2F0dGVyZWQgTWFnaWMnOiAnNUJERicsIC8vIGNpcmNsZSBhb2VzIGZyb20gU2VlZCBPZiBNYWdpY1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIFVuZXZlbiBGb3R0aW5nJzogJzVCRTInLCAvLyBidWlsZGluZyBmcm9tIFJlY3JlYXRlIFN0cnVjdHVyZVxyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIENyYXNoJzogJzVCRTUnLCAvLyB0cmFpbnMgZnJvbSBNaXhlZCBTaWduYWxzXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgSGVhdnkgQXJtcyAxJzogJzVCRUQnLCAvLyBoZWF2eSBhcm1zIGZyb250L2JhY2sgYXR0YWNrXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgSGVhdnkgQXJtcyAyJzogJzVCRUYnLCAvLyBoZWF2eSBhcm1zIHNpZGVzIGF0dGFja1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIEVuZXJneSBTY2F0dGVyZWQgTWFnaWMnOiAnNUJFOCcsIC8vIG9yYnMgZnJvbSBSZWQgR2lybCBieSB0cmFpblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIFBsYWNlIE9mIFBvd2VyJzogJzVDMEQnLCAvLyBpbnN0YWRlYXRoIG1pZGRsZSBjaXJjbGUgYmVmb3JlIGJsYWNrL3doaXRlIHJpbmdzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUb3dlciBLbmF2ZSBNYWdpYyBBcnRpbGxlcnkgQWxwaGEnOiAnNUVBQicsIC8vIFNwcmVhZFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBTZWVkIE9mIE1hZ2ljIEFscGhhJzogJzVDNjEnLCAvLyBTcHJlYWRcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1Rvd2VyIEtuYXZlIE1hZ2ljIEFydGlsbGVyeSBCZXRhJzogJzVFQjMnLCAvLyBUYW5rYnVzdGVyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgTWFuaXB1bGF0ZSBFbmVyZ3knOiAnNjAxQScsIC8vIFRhbmtidXN0ZXJcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIERhcmtlciBOb3RlJzogJzVCREMnLCAvLyBUYW5rYnVzdGVyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1Rvd2VyIEtub2NrZWQgT2ZmJyxcclxuICAgICAgLy8gNUVCMSA9IEtuYXZlIEx1bmdlXHJcbiAgICAgIC8vIDVCRjIgPSBIZXIgSW5mbG9yZXNlbmNlIFNob2Nrd2F2ZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNUVCMScsICc1QkYyJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQWthZGFlbWlhQW55ZGVyLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbnlkZXIgQWNyaWQgU3RyZWFtJzogJzQzMDQnLFxyXG4gICAgJ0FueWRlciBXYXRlcnNwb3V0JzogJzQzMDYnLFxyXG4gICAgJ0FueWRlciBSYWdpbmcgV2F0ZXJzJzogJzQzMDInLFxyXG4gICAgJ0FueWRlciBWaW9sZW50IEJyZWFjaCc6ICc0MzA1JyxcclxuICAgICdBbnlkZXIgVGlkYWwgR3VpbGxvdGluZSAxJzogJzNFMDgnLFxyXG4gICAgJ0FueWRlciBUaWRhbCBHdWlsbG90aW5lIDInOiAnM0UwQScsXHJcbiAgICAnQW55ZGVyIFBlbGFnaWMgQ2xlYXZlciAxJzogJzNFMDknLFxyXG4gICAgJ0FueWRlciBQZWxhZ2ljIENsZWF2ZXIgMic6ICczRTBCJyxcclxuICAgICdBbnlkZXIgQXF1YXRpYyBMYW5jZSc6ICczRTA1JyxcclxuICAgICdBbnlkZXIgU3lydXAgU3BvdXQnOiAnNDMwOCcsXHJcbiAgICAnQW55ZGVyIE5lZWRsZSBTdG9ybSc6ICc0MzA5JyxcclxuICAgICdBbnlkZXIgRXh0ZW5zaWJsZSBUZW5kcmlscyAxJzogJzNFMTAnLFxyXG4gICAgJ0FueWRlciBFeHRlbnNpYmxlIFRlbmRyaWxzIDInOiAnM0UxMScsXHJcbiAgICAnQW55ZGVyIFB1dHJpZCBCcmVhdGgnOiAnM0UxMicsXHJcbiAgICAnQW55ZGVyIERldG9uYXRvcic6ICc0MzBGJyxcclxuICAgICdBbnlkZXIgRG9taW5pb24gU2xhc2gnOiAnNDMwRCcsXHJcbiAgICAnQW55ZGVyIFF1YXNhcic6ICc0MzBCJyxcclxuICAgICdBbnlkZXIgRGFyayBBcnJpdmlzbWUnOiAnNDMwRScsXHJcbiAgICAnQW55ZGVyIFRodW5kZXJzdG9ybSc6ICczRTFDJyxcclxuICAgICdBbnlkZXIgV2luZGluZyBDdXJyZW50JzogJzNFMUYnLFxyXG4gICAgLy8gM0UyMCBpcyBiZWluZyBoaXQgYnkgdGhlIGdyb3dpbmcgb3JicywgbWF5YmU/XHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQW1hdXJvdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQW1hdXJvdCBCdXJuaW5nIFNreSc6ICczNTRBJyxcclxuICAgICdBbWF1cm90IFdoYWNrJzogJzM1M0MnLFxyXG4gICAgJ0FtYXVyb3QgQWV0aGVyc3Bpa2UnOiAnMzUzQicsXHJcbiAgICAnQW1hdXJvdCBWZW5lbW91cyBCcmVhdGgnOiAnM0NDRScsXHJcbiAgICAnQW1hdXJvdCBDb3NtaWMgU2hyYXBuZWwnOiAnNEQyNicsXHJcbiAgICAnQW1hdXJvdCBFYXJ0aHF1YWtlJzogJzNDQ0QnLFxyXG4gICAgJ0FtYXVyb3QgTWV0ZW9yIFJhaW4nOiAnM0NDNicsXHJcbiAgICAnQW1hdXJvdCBGaW5hbCBTa3knOiAnM0NDQicsXHJcbiAgICAnQW1hdXJvdCBNYWxldm9sZW5jZSc6ICczNTQxJyxcclxuICAgICdBbWF1cm90IFR1cm5hYm91dCc6ICczNTQyJyxcclxuICAgICdBbWF1cm90IFNpY2tseSBJbmZlcm5vJzogJzNERTMnLFxyXG4gICAgJ0FtYXVyb3QgRGlzcXVpZXRpbmcgR2xlYW0nOiAnMzU0NicsXHJcbiAgICAnQW1hdXJvdCBCbGFjayBEZWF0aCc6ICczNTQzJyxcclxuICAgICdBbWF1cm90IEZvcmNlIG9mIExvYXRoaW5nJzogJzM1NDQnLFxyXG4gICAgJ0FtYXVyb3QgRGFtbmluZyBSYXkgMSc6ICczRTAwJyxcclxuICAgICdBbWF1cm90IERhbW5pbmcgUmF5IDInOiAnM0UwMScsXHJcbiAgICAnQW1hdXJvdCBEZWFkbHkgVGVudGFjbGVzJzogJzM1NDcnLFxyXG4gICAgJ0FtYXVyb3QgTWlzZm9ydHVuZSc6ICczQ0UyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdBbWF1cm90IEFwb2thbHlwc2lzJzogJzNDRDcnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFuYW1uZXNpc0FueWRlcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBQaHVhYm8gU3BpbmUgTGFzaCc6ICc0RDFBJywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggQW5lbW9uZSBGYWxsaW5nIFJvY2snOiAnNEUzNycsIC8vIGdyb3VuZCBjaXJjbGUgYW9lIGZyb20gVHJlbmNoIEFuZW1vbmUgc2hvd2luZyB1cFxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggRGFnb25pdGUgU2V3ZXIgV2F0ZXInOiAnNEQxQycsIC8vIGZyb250YWwgY29uYWwgZnJvbSBUcmVuY2ggQW5lbW9uZSAoPyEpXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBZb3ZyYSBSb2NrIEhhcmQnOiAnNEQyMScsIC8vIHRhcmdldGVkIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFlvdnJhIFRvcnJlbnRpYWwgVG9ybWVudCc6ICc0RDIxJywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIEx1bWlub3VzIFJheSc6ICc0RTI3JywgLy8gVW5rbm93biBsaW5lIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFNpbnN0ZXIgQnViYmxlIEV4cGxvc2lvbic6ICc0QjZFJywgLy8gVW5rbm93biBleHBsb3Npb25zIGR1cmluZyBTY3J1dGlueVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFJlZmxlY3Rpb24nOiAnNEI2RicsIC8vIFVua25vd24gY29uYWwgYXR0YWNrIGR1cmluZyBTY3J1dGlueVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIENsZWFyb3V0IDEnOiAnNEI3NCcsIC8vIFVua25vd24gZnJvbnRhbCBjb25lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gQ2xlYXJvdXQgMic6ICc0QjZCJywgLy8gVW5rbm93biBmcm9udGFsIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBTZXRiYWNrIDEnOiAnNEI3NScsIC8vIFVua25vd24gcmVhciBjb25lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gU2V0YmFjayAyJzogJzVCNkMnLCAvLyBVbmtub3duIHJlYXIgY29uZVxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgQ2xpb25pZCBBY3JpZCBTdHJlYW0nOiAnNEQyNCcsIC8vIHRhcmdldGVkIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgQW55ZGVyIERpdmluZXIgRHJlYWRzdG9ybSc6ICc0RDI4JywgLy8gZ3JvdW5kIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyAyMDAwLU1pbmEgU3dpbmcnOiAnNEI1NScsIC8vIEt5a2xvcHMgZ2V0IG91dCBtZWNoYW5pY1xyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIFRlcnJpYmxlIEhhbW1lcic6ICc0QjVEJywgLy8gS3lrbG9wcyBIYW1tZXIvQmxhZGUgYWx0ZXJuYXRpbmcgc3F1YXJlc1xyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIFRlcnJpYmxlIEJsYWRlJzogJzRCNUUnLCAvLyBLeWtsb3BzIEhhbW1lci9CbGFkZSBhbHRlcm5hdGluZyBzcXVhcmVzXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgUmFnaW5nIEdsb3dlcic6ICc0QjU2JywgLy8gS3lrbG9wcyBsaW5lIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIEV5ZSBPZiBUaGUgQ3ljbG9uZSc6ICc0QjU3JywgLy8gS3lrbG9wcyBkb251dFxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgSGFycG9vbmVyIEh5ZHJvYmFsbCc6ICc0RDI2JywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBSdWtzaHMgU3dpZnQgU2hpZnQnOiAnNEI4MycsIC8vIFJ1a3NocyBEZWVtIHRlbGVwb3J0IE4vU1xyXG4gICAgJ0FuYW1uZXNpcyBSdWtzaHMgRGVwdGggR3JpcCBXYXZlYnJlYWtlcic6ICczM0Q0JywgLy8gUnVrc2hzIERlZW0gaGFuZCBhdHRhY2tzXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBSaXNpbmcgVGlkZSc6ICc0QjhCJywgLy8gUnVrc2hzIERlZW0gY3Jvc3MgYW9lXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBDb21tYW5kIEN1cnJlbnQnOiAnNEI4MicsIC8vIFJ1a3NocyBEZWVtIHByb3RlYW4taXNoIGdyb3VuZCBhb2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFh6b21pdCBNYW50bGUgRHJpbGwnOiAnNEQxOScsIC8vIGNoYXJnZSBhdHRhY2tcclxuICAgICdBbmFtbmVzaXMgSW8gT3VzaWEgQmFycmVsaW5nIFNtYXNoJzogJzRFMjQnLCAvLyBjaGFyZ2UgYXR0YWNrXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgV2FuZGVyZXJcXCdzIFB5cmUnOiAnNEI1RicsIC8vIEt5a2xvcHMgc3ByZWFkIGF0dGFja1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBNaXNzaW5nIEdyb3dpbmcgdGV0aGVycyBvbiBib3NzIDIuXHJcbi8vIChNYXliZSBnYXRoZXIgcGFydHkgbWVtYmVyIG5hbWVzIG9uIHRoZSBwcmV2aW91cyBUSUlJSU1CRUVFRUVFUiBjYXN0IGZvciBjb21wYXJpc29uPylcclxuLy8gVE9ETzogRmFpbGluZyB0byBpbnRlcnJ1cHQgRG9obmZhdXN0IEZ1YXRoIG9uIFdhdGVyaW5nIFdoZWVsIGNhc3RzP1xyXG4vLyAoMTU6Li4uLi4uLi46RG9obmZhc3QgRnVhdGg6M0RBQTpXYXRlcmluZyBXaGVlbDouLi4uLi4uLjooXFx5e05hbWV9KTopXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRG9obk1oZWcsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RvaG4gTWhlZyBHZXlzZXInOiAnMjI2MCcsIC8vIFdhdGVyIGVydXB0aW9ucywgYm9zcyAxXHJcbiAgICAnRG9obiBNaGVnIEh5ZHJvZmFsbCc6ICcyMkJEJywgLy8gR3JvdW5kIEFvRSBtYXJrZXIsIGJvc3MgMVxyXG4gICAgJ0RvaG4gTWhlZyBMYXVnaGluZyBMZWFwJzogJzIyOTQnLCAvLyBHcm91bmQgQW9FIG1hcmtlciwgYm9zcyAxXHJcbiAgICAnRG9obiBNaGVnIFN3aW5nZSc6ICcyMkNBJywgLy8gRnJvbnRhbCBjb25lLCBib3NzIDJcclxuICAgICdEb2huIE1oZWcgQ2Fub3B5JzogJzNEQjAnLCAvLyBGcm9udGFsIGNvbmUsIERvaG5mYXVzdCBSb3dhbnMgdGhyb3VnaG91dCBpbnN0YW5jZVxyXG4gICAgJ0RvaG4gTWhlZyBQaW5lY29uZSBCb21iJzogJzNEQjEnLCAvLyBDaXJjdWxhciBncm91bmQgQW9FIG1hcmtlciwgRG9obmZhdXN0IFJvd2FucyB0aHJvdWdob3V0IGluc3RhbmNlXHJcbiAgICAnRG9obiBNaGVnIEJpbGUgQm9tYmFyZG1lbnQnOiAnMzRFRScsIC8vIEdyb3VuZCBBb0UgbWFya2VyLCBib3NzIDNcclxuICAgICdEb2huIE1oZWcgQ29ycm9zaXZlIEJpbGUnOiAnMzRFQycsIC8vIEZyb250YWwgY29uZSwgYm9zcyAzXHJcbiAgICAnRG9obiBNaGVnIEZsYWlsaW5nIFRlbnRhY2xlcyc6ICczNjgxJyxcclxuXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0RvaG4gTWhlZyBJbXAgQ2hvaXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdEb2huIE1oZWcgVG9hZCBDaG9pcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxQjcnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0RvaG4gTWhlZyBGb29sXFwncyBUdW1ibGUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTgzJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IEJlcnNlcmtlciAybmQvM3JkIHdpbGQgYW5ndWlzaCBzaG91bGQgYmUgc2hhcmVkIHdpdGgganVzdCBhIHJvY2tcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVIZXJvZXNHYXVudGxldCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVEhHIEJsYWRlXFwncyBCZW5pc29uJzogJzUyMjgnLCAvLyBwbGQgY29uYWxcclxuICAgICdUSEcgQWJzb2x1dGUgSG9seSc6ICc1MjRCJywgLy8gd2htIHZlcnkgbGFyZ2UgYW9lXHJcbiAgICAnVEhHIEhpc3NhdHN1OiBHb2thJzogJzUyM0QnLCAvLyBzYW0gbGluZSBhb2VcclxuICAgICdUSEcgV2hvbGUgU2VsZic6ICc1MjJEJywgLy8gbW5rIHdpZGUgbGluZSBhb2VcclxuICAgICdUSEcgUmFuZGdyaXRoJzogJzUyMzInLCAvLyBkcmcgdmVyeSBiaWcgbGluZSBhb2VcclxuICAgICdUSEcgVmFjdXVtIEJsYWRlIDEnOiAnNTA2MScsIC8vIFNwZWN0cmFsIFRoaWVmIGNpcmN1bGFyIGdyb3VuZCBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgVmFjdXVtIEJsYWRlIDInOiAnNTA2MicsIC8vIFNwZWN0cmFsIFRoaWVmIGNpcmN1bGFyIGdyb3VuZCBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgQ293YXJkXFwncyBDdW5uaW5nJzogJzRGRDcnLCAvLyBTcGVjdHJhbCBUaGllZiBDaGlja2VuIEtuaWZlIGxhc2VyXHJcbiAgICAnVEhHIFBhcGVyY3V0dGVyIDEnOiAnNEZEMScsIC8vIFNwZWN0cmFsIFRoaWVmIGxpbmUgYW9lIGZyb20gbWFya2VyXHJcbiAgICAnVEhHIFBhcGVyY3V0dGVyIDInOiAnNEZEMicsIC8vIFNwZWN0cmFsIFRoaWVmIGxpbmUgYW9lIGZyb20gbWFya2VyXHJcbiAgICAnVEhHIFJpbmcgb2YgRGVhdGgnOiAnNTIzNicsIC8vIGRyZyBjaXJjdWxhciBhb2VcclxuICAgICdUSEcgTHVuYXIgRWNsaXBzZSc6ICc1MjI3JywgLy8gcGxkIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1RIRyBBYnNvbHV0ZSBHcmF2aXR5JzogJzUyNDgnLCAvLyBpbmsgbWFnZSBjaXJjdWxhclxyXG4gICAgJ1RIRyBSYWluIG9mIExpZ2h0JzogJzUyNDInLCAvLyBiYXJkIGxhcmdlIGNpcmN1bGUgYW9lXHJcbiAgICAnVEhHIERvb21pbmcgRm9yY2UnOiAnNTIzOScsIC8vIGRyZyBsaW5lIGFvZVxyXG4gICAgJ1RIRyBBYnNvbHV0ZSBEYXJrIElJJzogJzRGNjEnLCAvLyBOZWNyb21hbmNlciAxMjAgZGVncmVlIGNvbmFsXHJcbiAgICAnVEhHIEJ1cnN0JzogJzUzQjcnLCAvLyBOZWNyb21hbmNlciBuZWNyb2J1cnN0IHNtYWxsIHpvbWJpZSBleHBsb3Npb25cclxuICAgICdUSEcgUGFpbiBNaXJlJzogJzRGQTQnLCAvLyBOZWNyb21hbmNlciB2ZXJ5IGxhcmdlIGdyZWVuIGJsZWVkIHB1ZGRsZVxyXG4gICAgJ1RIRyBEYXJrIERlbHVnZSc6ICc0RjVEJywgLy8gTmVjcm9tYW5jZXIgZ3JvdW5kIGFvZVxyXG4gICAgJ1RIRyBUZWtrYSBHb2ppbic6ICc1MjNFJywgLy8gc2FtIDkwIGRlZ3JlZSBjb25hbFxyXG4gICAgJ1RIRyBSYWdpbmcgU2xpY2UgMSc6ICc1MjBBJywgLy8gQmVyc2Vya2VyIGxpbmUgY2xlYXZlXHJcbiAgICAnVEhHIFJhZ2luZyBTbGljZSAyJzogJzUyMEInLCAvLyBCZXJzZXJrZXIgbGluZSBjbGVhdmVcclxuICAgICdUSEcgV2lsZCBSYWdlJzogJzUyMDMnLCAvLyBCZXJzZXJrZXIgYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVEhHIEFic29sdXRlIFRodW5kZXIgSVYnOiAnNTI0NScsIC8vIGhlYWRtYXJrZXIgYW9lIGZyb20gYmxtXHJcbiAgICAnVEhHIE1vb25kaXZlcic6ICc1MjMzJywgLy8gaGVhZG1hcmtlciBhb2UgZnJvbSBkcmdcclxuICAgICdUSEcgU3BlY3RyYWwgR3VzdCc6ICc1M0NGJywgLy8gU3BlY3RyYWwgVGhpZWYgaGVhZG1hcmtlciBhb2VcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RIRyBGYWxsaW5nIFJvY2snOiAnNTIwNScsIC8vIEJlcnNlcmtlciBoZWFkbWFya2VyIGFvZSB0aGF0IGNyZWF0ZXMgcnViYmxlXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdUSEcgQmxlZWRpbmcnOiAnODI4JywgLy8gU3RhbmRpbmcgaW4gdGhlIE5lY3JvbWFuY2VyIHB1ZGRsZSBvciBvdXRzaWRlIHRoZSBCZXJzZXJrZXIgYXJlbmFcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ1RIRyBUcnVseSBCZXJzZXJrJzogJzkwNicsIC8vIFN0YW5kaW5nIGluIHRoZSBjcmF0ZXIgdG9vIGxvbmdcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAvLyBUaGlzIHNob3VsZCBhbHdheXMgYmUgc2hhcmVkLiAgT24gYWxsIHRpbWVzIGJ1dCB0aGUgMm5kIGFuZCAzcmQsIGl0J3MgYSBwYXJ0eSBzaGFyZS5cclxuICAgIC8vIFRPRE86IG9uIHRoZSAybmQgYW5kIDNyZCB0aW1lIHRoaXMgc2hvdWxkIG9ubHkgYmUgc2hhcmVkIHdpdGggYSByb2NrLlxyXG4gICAgLy8gVE9ETzogYWx0ZXJuYXRpdmVseSB3YXJuIG9uIHRha2luZyBvbmUgb2YgdGhlc2Ugd2l0aCBhIDQ3MiBNYWdpYyBWdWxuZXJhYmlsaXR5IFVwIGVmZmVjdFxyXG4gICAgJ1RIRyBXaWxkIEFuZ3Vpc2gnOiAnNTIwOScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1RIRyBXaWxkIFJhbXBhZ2UnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzUyMDcnLFxyXG4gICAgICAvLyBUaGlzIGlzIHplcm8gZGFtYWdlIGlmIHlvdSBhcmUgaW4gdGhlIGNyYXRlci5cclxuICAgICAgY29uZGl0aW9uOiAoZSkgPT4gZS5kYW1hZ2UgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Ib2xtaW5zdGVyU3dpdGNoLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdIb2xtaW5zdGVyIFRodW1ic2NyZXcnOiAnM0RDNicsXHJcbiAgICAnSG9sbWluc3RlciBXb29kZW4gaG9yc2UnOiAnM0RDNycsXHJcbiAgICAnSG9sbWluc3RlciBMaWdodCBTaG90JzogJzNEQzgnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgSGVyZXRpY1xcJ3MgRm9yayc6ICczRENFJyxcclxuICAgICdIb2xtaW5zdGVyIEhvbHkgV2F0ZXInOiAnM0RENCcsXHJcbiAgICAnSG9sbWluc3RlciBGaWVyY2UgQmVhdGluZyAxJzogJzNEREQnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgRmllcmNlIEJlYXRpbmcgMic6ICczRERFJyxcclxuICAgICdIb2xtaW5zdGVyIEZpZXJjZSBCZWF0aW5nIDMnOiAnM0RERicsXHJcbiAgICAnSG9sbWluc3RlciBDYXQgT1xcJyBOaW5lIFRhaWxzJzogJzNERTEnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgUmlnaHQgS25vdXQnOiAnM0RFNicsXHJcbiAgICAnSG9sbWluc3RlciBMZWZ0IEtub3V0JzogJzNERTcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgQWV0aGVyc3VwJzogJzNERTknLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnSG9sbWluc3RlciBGbGFnZWxsYXRpb24nOiAnM0RENicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdIb2xtaW5zdGVyIFRhcGhlcGhvYmlhJzogJzQxODEnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hbGlrYWhzV2VsbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTWFsaWthaCBGYWxsaW5nIFJvY2snOiAnM0NFQScsXHJcbiAgICAnTWFsaWthaCBXZWxsYm9yZSc6ICczQ0VEJyxcclxuICAgICdNYWxpa2FoIEdleXNlciBFcnVwdGlvbic6ICczQ0VFJyxcclxuICAgICdNYWxpa2FoIFN3aWZ0IFNwaWxsJzogJzNDRjAnLFxyXG4gICAgJ01hbGlrYWggQnJlYWtpbmcgV2hlZWwgMSc6ICczQ0Y1JyxcclxuICAgICdNYWxpa2FoIENyeXN0YWwgTmFpbCc6ICczQ0Y3JyxcclxuICAgICdNYWxpa2FoIEhlcmV0aWNcXCdzIEZvcmsgMSc6ICczQ0Y5JyxcclxuICAgICdNYWxpa2FoIEJyZWFraW5nIFdoZWVsIDInOiAnM0NGQScsXHJcbiAgICAnTWFsaWthaCBIZXJldGljXFwncyBGb3JrIDInOiAnM0UwRScsXHJcbiAgICAnTWFsaWthaCBFYXJ0aHNoYWtlJzogJzNFMzknLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogY291bGQgaW5jbHVkZSA1NDg0IE11ZG1hbiBSb2NreSBSb2xsIGFzIGEgc2hhcmVXYXJuLCBidXQgaXQncyBsb3cgZGFtYWdlIGFuZCBjb21tb24uXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuTWF0b3lhc1JlbGljdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTWF0b3lhIFJlbGljdCBXZXJld29vZCBPdmF0aW9uJzogJzU1MTgnLCAvLyBsaW5lIGFvZVxyXG4gICAgJ01hdG95YSBDYXZlIFRhcmFudHVsYSBIYXdrIEFwaXRveGluJzogJzU1MTknLCAvLyBiaWcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBTcHJpZ2dhbiBTdG9uZWJlYXJlciBSb21wJzogJzU1MUEnLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgU29ubnkgT2YgWmlnZ3kgSml0dGVyaW5nIEdsYXJlJzogJzU1MUMnLCAvLyBsb25nIG5hcnJvdyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIFF1YWdtaXJlJzogJzU0ODEnLCAvLyBNdWRtYW4gYW9lIHB1ZGRsZXNcclxuICAgICdNYXRveWEgTXVkbWFuIEJyaXR0bGUgQnJlY2NpYSAxJzogJzU0OEUnLCAvLyBleHBhbmRpbmcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gQnJpdHRsZSBCcmVjY2lhIDInOiAnNTQ4RicsIC8vIGV4cGFuZGluZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBCcml0dGxlIEJyZWNjaWEgMyc6ICc1NDkwJywgLy8gZXhwYW5kaW5nIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIE11ZCBCdWJibGUnOiAnNTQ4NycsIC8vIHN0YW5kaW5nIGluIG11ZCBwdWRkbGU/XHJcbiAgICAnTWF0b3lhIENhdmUgUHVnaWwgU2NyZXdkcml2ZXInOiAnNTUxRScsIC8vIGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBOaXhpZSBHdXJnbGUnOiAnNTk5MicsIC8vIE5peGllIHdhbGwgZmx1c2hcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIFB5cm9jbGFzdGljIFNob3QnOiAnNTdFQicsIC8vIHRoZSBsaW5lIGFvZXMgYXMgeW91IHJ1biB0byB0cmFzaFxyXG4gICAgJ01hdG95YSBSZWxpY3QgRmxhbiBGbG9vZCc6ICc1NTIzJywgLy8gYmlnIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUHlyb2R1Y3QgRWxkdGh1cnMgTWFzaCc6ICc1NTI3JywgLy8gbGluZSBhb2VcclxuICAgICdNYXR5b2EgUHlyb2R1Y3QgRWxkdGh1cnMgU3Bpbic6ICc1NTI4JywgLy8gdmVyeSBsYXJnZSBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBCYXZhcm9pcyBUaHVuZGVyIElJSSc6ICc1NTI1JywgLy8gY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgTWFyc2htYWxsb3cgQW5jaWVudCBBZXJvJzogJzU1MjQnLCAvLyB2ZXJ5IGxhcmdlIGxpbmUgZ3JvYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBQdWRkaW5nIEZpcmUgSUknOiAnNTUyMicsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIEhvdCBMYXZhJzogJzU3RTknLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIFZvbGNhbmljIERyb3AnOiAnNTdFOCcsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBNZWRpdW0gUmVhcic6ICc1OTFEJywgLy8ga25vY2tiYWNrIGludG8gc2FmZSBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgQmFyYmVxdWUgTGluZSc6ICc1OTE3JywgLy8gbGluZSBhb2UgZHVyaW5nIGJicVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIEJhcmJlcXVlIENpcmNsZSc6ICc1OTE4JywgLy8gY2lyY2xlIGFvZSBkdXJpbmcgYmJxXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgVG8gQSBDcmlzcCc6ICc1OTI1JywgLy8gZ2V0dGluZyB0byBjbG9zZSB0byBib3NzIGR1cmluZyBiYnFcclxuICAgICdNYXRveWEgTW90aGVyIFByb3hpZSBCdWZmZXQnOiAnNTkyNicsIC8vIEFlb2xpYW4gQ2F2ZSBTcHJpdGUgbGluZSBhb2UgKGlzIHRoaXMgYSBwdW4/KVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ01hdG95YSBOaXhpZSBTZWEgU2hhbnR5JzogJzU5OEMnLCAvLyBOb3QgdGFraW5nIHRoZSBwdWRkbGUgdXAgdG8gdGhlIHRvcD8gRmFpbGluZyBhZGQgZW5yYWdlP1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTWF0b3lhIE5peGllIENyYWNrJzogJzU5OTAnLCAvLyBOaXhpZSBDcmFzaC1TbWFzaCB0YW5rIHRldGhlcnNcclxuICAgICdNYXRveWEgTml4aWUgU3B1dHRlcic6ICc1OTkzJywgLy8gTml4aWUgc3ByZWFkIG1hcmtlclxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk10R3VsZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnR3VsZyBJbW1vbGF0aW9uJzogJzQxQUEnLFxyXG4gICAgJ0d1bGcgVGFpbCBTbWFzaCc6ICc0MUFCJyxcclxuICAgICdHdWxnIEhlYXZlbnNsYXNoJzogJzQxQTknLFxyXG4gICAgJ0d1bGcgVHlwaG9vbiBXaW5nIDEnOiAnM0QwMCcsXHJcbiAgICAnR3VsZyBUeXBob29uIFdpbmcgMic6ICczRDAxJyxcclxuICAgICdHdWxnIEh1cnJpY2FuZSBXaW5nJzogJzNEMDMnLFxyXG4gICAgJ0d1bGcgRWFydGggU2hha2VyJzogJzM3RjUnLFxyXG4gICAgJ0d1bGcgU2FuY3RpZmljYXRpb24nOiAnNDFBRScsXHJcbiAgICAnR3VsZyBFeGVnZXNpcyc6ICczRDA3JyxcclxuICAgICdHdWxnIFBlcmZlY3QgQ29udHJpdGlvbic6ICczRDBFJyxcclxuICAgICdHdWxnIFNhbmN0aWZpZWQgQWVybyc6ICc0MUFEJyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDEnOiAnM0QxNicsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyAyJzogJzNEMTgnLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gMyc6ICc0NjY5JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDQnOiAnM0QxOScsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyA1JzogJzNEMjEnLFxyXG4gICAgJ0d1bGcgQ29udmljdGlvbiBNYXJjYXRvIDEnOiAnM0QxQScsXHJcbiAgICAnR3VsZyBDb252aWN0aW9uIE1hcmNhdG8gMic6ICczRDFCJyxcclxuICAgICdHdWxnIENvbnZpY3Rpb24gTWFyY2F0byAzJzogJzNEMjAnLFxyXG4gICAgJ0d1bGcgVmVuYSBBbW9yaXMnOiAnM0QyNycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnR3VsZyBMdW1lbiBJbmZpbml0dW0nOiAnNDFCMicsXHJcbiAgICAnR3VsZyBSaWdodCBQYWxtJzogJzM3RjgnLFxyXG4gICAgJ0d1bGcgTGVmdCBQYWxtJzogJzM3RkEnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogV2hhdCB0byBkbyBhYm91dCBLYWhuIFJhaSA1QjUwP1xyXG4vLyBJdCBzZWVtcyBpbXBvc3NpYmxlIGZvciB0aGUgbWFya2VkIHBlcnNvbiB0byBhdm9pZCBlbnRpcmVseS5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5QYWdsdGhhbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUGFnbHRoYW4gVGVsb3ZvdWl2cmUgUGxhZ3VlIFN3aXBlJzogJzYwRkMnLCAvLyBmcm9udGFsIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIExlc3NlciBUZWxvZHJhZ29uIEVuZ3VsZmluZyBGbGFtZXMnOiAnNjBGNScsIC8vIGZyb250YWwgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBMaWdodG5pbmcgQm9sdCc6ICc1QzRDJywgLy8gY2lyY3VsYXIgbGlnaHRuaW5nIGFvZSAob24gc2VsZiBvciBwb3N0KVxyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgQmFsbCBPZiBMZXZpbiBTaG9jayc6ICc1QzUyJywgLy8gcHVsc2luZyBzbWFsbCBjaXJjdWxhciBhb2VzXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBTdXBlcmNoYXJnZWQgQmFsbCBPZiBMZXZpbiBTaG9jayc6ICc1QzUzJywgLy8gcHVsc2luZyBsYXJnZSBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIFdpZGUgQmxhc3Rlcic6ICc2MEM1JywgLy8gcmVhciBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBUZWxvYnJvYmlueWFrIEZhbGwgT2YgTWFuJzogJzYxNDgnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvdGVrIFJlYXBlciBNYWdpdGVrIENhbm5vbic6ICc2MTIxJywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb2RyYWdvbiBTaGVldCBvZiBJY2UnOiAnNjBGOCcsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gRnJvc3QgQnJlYXRoJzogJzYwRjcnLCAvLyB2ZXJ5IGxhcmdlIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIE1hZ2l0ZWsgQ29yZSBTdGFibGUgQ2Fubm9uJzogJzVDOTQnLCAvLyBsYXJnZSBsaW5lIGFvZXNcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIENvcmUgMi1Ub256ZSBNYWdpdGVrIE1pc3NpbGUnOiAnNUM5NScsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG90ZWsgU2t5IEFybW9yIEFldGhlcnNob3QnOiAnNUM5QycsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIE1hcmsgSUkgVGVsb3RlayBDb2xvc3N1cyBFeGhhdXN0JzogJzVDOTknLCAvLyBsYXJnZSBsaW5lIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIE1hZ2l0ZWsgTWlzc2lsZSBFeHBsb3NpdmUgRm9yY2UnOiAnNUM5OCcsIC8vIHNsb3cgbW92aW5nIGhvcml6b250YWwgbWlzc2lsZXNcclxuICAgICdQYWdsdGhhbiBUaWFtYXQgRmxhbWlzcGhlcmUnOiAnNjEwRicsIC8vIHZlcnkgbG9uZyBsaW5lIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIEFybW9yZWQgVGVsb2RyYWdvbiBUb3J0b2lzZSBTdG9tcCc6ICc2MTRCJywgLy8gbGFyZ2UgY2lyY3VsYXIgYW9lIGZyb20gdHVydGxlXHJcbiAgICAnUGFnbHRoYW4gVGVsb2RyYWdvbiBUaHVuZGVyb3VzIEJyZWF0aCc6ICc2MTQ5JywgLy8gbGFyZ2UgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBMdW5hciBOYWlsIFVwYnVyc3QnOiAnNjA1QicsIC8vIHNtYWxsIGFvZXMgYmVmb3JlIEJpZyBCdXJzdFxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgTmFpbCBCaWcgQnVyc3QnOiAnNUI0OCcsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZXMgZnJvbSBuYWlsc1xyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgUGVyaWdlYW4gQnJlYXRoJzogJzVCNTknLCAvLyBsYXJnZSBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSc6ICc1QjRFJywgLy8gbWVnYWZsYXJlIHBlcHBlcm9uaVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTWVnYWZsYXJlIERpdmUnOiAnNUI1MicsIC8vIG1lZ2FmbGFyZSBsaW5lIGFvZSBhY3Jvc3MgdGhlIGFyZW5hXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBMdW5hciBGbGFyZSc6ICc1QjRBJywgLy8gbGFyZ2UgcHVycGxlIHNocmlua2luZyBjaXJjbGVzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSc6ICc1QjREJywgLy8gbWVnYWZsYXJlIHNwcmVhZCBtYXJrZXJzXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUWl0YW5hUmF2ZWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1FpdGFuYSBTdW4gVG9zcyc6ICczQzhBJywgLy8gR3JvdW5kIEFvRSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgUm9ua2FuIExpZ2h0IDEnOiAnM0M4QycsIC8vIFN0YXR1ZSBhdHRhY2ssIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIExvemF0bFxcJ3MgRnVyeSAxJzogJzNDOEYnLCAvLyBTZW1pY2lyY2xlIGNsZWF2ZSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgTG96YXRsXFwncyBGdXJ5IDInOiAnM0M5MCcsIC8vIFNlbWljaXJjbGUgY2xlYXZlLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBGYWxsaW5nIFJvY2snOiAnM0M5NicsIC8vIFNtYWxsIGdyb3VuZCBBb0UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIEZhbGxpbmcgQm91bGRlcic6ICczQzk3JywgLy8gTGFyZ2UgZ3JvdW5kIEFvRSwgYm9zcyB0d29cclxuICAgICdRaXRhbmEgVG93ZXJmYWxsJzogJzNDOTgnLCAvLyBQaWxsYXIgY29sbGFwc2UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIFZpcGVyIFBvaXNvbiAyJzogJzNDOUUnLCAvLyBTdGF0aW9uYXJ5IHBvaXNvbiBwdWRkbGVzLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMSc6ICczQ0EyJywgLy8gRGFuZ2Vyb3VzIG1pZGRsZSBkdXJpbmcgc3ByZWFkIGNpcmNsZXMsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCAzJzogJzNDQTYnLCAvLyBEYW5nZXJvdXMgc2lkZXMgZHVyaW5nIHN0YWNrIG1hcmtlciwgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDQnOiAnM0NBNycsIC8vIERhbmdlcm91cyBzaWRlcyBkdXJpbmcgc3RhY2sgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIFJvbmthbiBMaWdodCAyJzogJzNENkQnLCAvLyBTdGF0dWUgYXR0YWNrLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBXcmF0aCBvZiB0aGUgUm9ua2EnOiAnM0UyQycsIC8vIFN0YXR1ZSBsaW5lIGF0dGFjayBmcm9tIG1pbmktYm9zc2VzIGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnUWl0YW5hIFNpbnNwaXR0ZXInOiAnM0UzNicsIC8vIEdvcmlsbGEgYm91bGRlciB0b3NzIEFvRSBiZWZvcmUgdGhpcmQgYm9zc1xyXG4gICAgJ1FpdGFuYSBIb3VuZCBvdXQgb2YgSGVhdmVuJzogJzQyQjgnLCAvLyBUZXRoZXIgZXh0ZW5zaW9uIGZhaWx1cmUsIGJvc3MgdGhyZWU7IDQyQjcgaXMgY29ycmVjdCBleGVjdXRpb25cclxuICAgICdRaXRhbmEgUm9ua2FuIEFieXNzJzogJzQzRUInLCAvLyBHcm91bmQgQW9FIGZyb20gbWluaS1ib3NzZXMgYmVmb3JlIGZpcnN0IGJvc3NcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1FpdGFuYSBWaXBlciBQb2lzb24gMSc6ICczQzlEJywgLy8gQW9FIGZyb20gdGhlIDAwQUIgcG9pc29uIGhlYWQgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMic6ICczQ0EzJywgLy8gT3ZlcmxhcHBlZCBjaXJjbGVzIGZhaWx1cmUgb24gdGhlIHNwcmVhZCBjaXJjbGVzIHZlcnNpb24gb2YgdGhlIG1lY2hhbmljXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUaGUgR3JhbmQgQ29zbW9zXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVHcmFuZENvc21vcyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQ29zbW9zIElyb24gSnVzdGljZSc6ICc0OTFGJyxcclxuICAgICdDb3Ntb3MgU21pdGUgT2YgUmFnZSc6ICc0OTIxJyxcclxuXHJcbiAgICAnQ29zbW9zIFRyaWJ1bGF0aW9uJzogJzQ5QTQnLFxyXG4gICAgJ0Nvc21vcyBEYXJrIFNob2NrJzogJzQ3NkYnLFxyXG4gICAgJ0Nvc21vcyBTd2VlcCc6ICc0NzcwJyxcclxuICAgICdDb3Ntb3MgRGVlcCBDbGVhbic6ICc0NzcxJyxcclxuXHJcbiAgICAnQ29zbW9zIFNoYWRvdyBCdXJzdCc6ICc0OTI0JyxcclxuICAgICdDb3Ntb3MgQmxvb2R5IENhcmVzcyc6ICc0OTI3JyxcclxuICAgICdDb3Ntb3MgTmVwZW50aGljIFBsdW5nZSc6ICc0OTI4JyxcclxuICAgICdDb3Ntb3MgQnJld2luZyBTdG9ybSc6ICc0OTI5JyxcclxuXHJcbiAgICAnQ29zbW9zIE9kZSBUbyBGYWxsZW4gUGV0YWxzJzogJzQ5NTAnLFxyXG4gICAgJ0Nvc21vcyBGYXIgV2luZCBHcm91bmQnOiAnNDI3MycsXHJcblxyXG4gICAgJ0Nvc21vcyBGaXJlIEJyZWF0aCc6ICc0OTJCJyxcclxuICAgICdDb3Ntb3MgUm9ua2FuIEZyZWV6ZSc6ICc0OTJFJyxcclxuICAgICdDb3Ntb3MgT3ZlcnBvd2VyJzogJzQ5MkQnLFxyXG5cclxuICAgICdDb3Ntb3MgU2NvcmNoaW5nIExlZnQnOiAnNDc2MycsXHJcbiAgICAnQ29zbW9zIFNjb3JjaGluZyBSaWdodCc6ICc0NzYyJyxcclxuICAgICdDb3Ntb3MgT3RoZXJ3b3JkbHkgSGVhdCc6ICc0NzVDJyxcclxuICAgICdDb3Ntb3MgRmlyZVxcJ3MgSXJlJzogJzQ3NjEnLFxyXG4gICAgJ0Nvc21vcyBQbHVtbWV0JzogJzQ3NjcnLFxyXG5cclxuICAgICdDb3Ntb3MgRmlyZVxcJ3MgRG9tYWluIFRldGhlcic6ICc0NzVGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0Nvc21vcyBEYXJrIFdlbGwnOiAnNDc2RCcsXHJcbiAgICAnQ29zbW9zIEZhciBXaW5kIFNwcmVhZCc6ICc0NzI0JyxcclxuICAgICdDb3Ntb3MgQmxhY2sgRmxhbWUnOiAnNDc1RCcsXHJcbiAgICAnQ29zbW9zIEZpcmVcXCdzIERvbWFpbic6ICc0NzYwJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVUd2lubmluZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVHdpbm5pbmcgQXV0byBDYW5ub25zJzogJzQzQTknLFxyXG4gICAgJ1R3aW5uaW5nIEhlYXZlJzogJzNEQjknLFxyXG4gICAgJ1R3aW5uaW5nIDMyIFRvbnplIFN3aXBlJzogJzNEQkInLFxyXG4gICAgJ1R3aW5uaW5nIFNpZGVzd2lwZSc6ICczREJGJyxcclxuICAgICdUd2lubmluZyBXaW5kIFNwb3V0JzogJzNEQkUnLFxyXG4gICAgJ1R3aW5uaW5nIFNob2NrJzogJzNERjEnLFxyXG4gICAgJ1R3aW5uaW5nIExhc2VyYmxhZGUnOiAnM0RFQycsXHJcbiAgICAnVHdpbm5pbmcgVm9ycGFsIEJsYWRlJzogJzNEQzInLFxyXG4gICAgJ1R3aW5uaW5nIFRocm93biBGbGFtZXMnOiAnM0RDMycsXHJcbiAgICAnVHdpbm5pbmcgTWFnaXRlayBSYXknOiAnM0RGMycsXHJcbiAgICAnVHdpbm5pbmcgSGlnaCBHcmF2aXR5JzogJzNERkEnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1R3aW5uaW5nIDEyOCBUb256ZSBTd2lwZSc6ICczREJBJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IERlYWQgSXJvbiA1QUIwIChlYXJ0aHNoYWtlcnMsIGJ1dCBvbmx5IGlmIHlvdSB0YWtlIHR3bz8pXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdWJydW1SZWdpbmFlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY3kgRm91cmZvbGQnOiAnNUIzNCcsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBCYWxlZnVsIFN3YXRoZSc6ICc1QUI0JywgLy8gR3JvdW5kIGFvZSB0byBlaXRoZXIgc2lkZSBvZiBib3NzXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIEJhbGVmdWwgQmxhZGUnOiAnNUIyOCcsIC8vIEhpZGUgYmVoaW5kIHBpbGxhcnMgYXR0YWNrXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAxJzogJzVBQTQnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAyJzogJzVBQTUnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAzJzogJzVBQTYnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMSc6ICc1QUE3JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAyJzogJzVBQTgnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDMnOiAnNUFBOScsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIFNjb3JjaGluZyBTaGFja2xlJzogJzVBQUUnLCAvLyBDaGFpbiBkYW1hZ2VcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY2lmdWwgQnJlZXplJzogJzVBQUInLCAvLyBXYWZmbGUgY3Jpc3MtY3Jvc3MgZmxvb3IgbWFya2Vyc1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBCbG9vbXMnOiAnNUFBRCcsIC8vIFB1cnBsZSBncm93aW5nIGNpcmNsZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlJzogJzU3NjEnLCAvLyBSaWdodCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlJzogJzU3NjInLCAvLyBMZWZ0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgRmlyZWJyZWF0aGUnOiAnNTc2NScsIC8vIENvbmFsIGJyZWF0aFxyXG4gICAgJ0RlbHVicnVtIERhaHUgRmlyZWJyZWF0aGUgUm90YXRpbmcnOiAnNTc1QScsIC8vIENvbmFsIGJyZWF0aCwgcm90YXRpbmdcclxuICAgICdEZWx1YnJ1bSBEYWh1IEhlYWQgRG93bic6ICc1NzU2JywgLy8gbGluZSBhb2UgY2hhcmdlIGZyb20gTWFyY2hvc2lhcyBhZGRcclxuICAgICdEZWx1YnJ1bSBEYWh1IEh1bnRlclxcJ3MgQ2xhdyc6ICc1NzU3JywgLy8gY2lyY3VsYXIgZ3JvdW5kIGFvZSBjZW50ZXJlZCBvbiBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtIERhaHUgRmFsbGluZyBSb2NrJzogJzU3NUMnLCAvLyBncm91bmQgYW9lIGZyb20gUmV2ZXJiZXJhdGluZyBSb2FyXHJcbiAgICAnRGVsdWJydW0gRGFodSBIb3QgQ2hhcmdlJzogJzU3NjQnLCAvLyBkb3VibGUgY2hhcmdlXHJcbiAgICAnRGVsdWJydW0gRGFodSBSaXBwZXIgQ2xhdyc6ICc1NzVEJywgLy8gZnJvbnRhbCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBEYWh1IFRhaWwgU3dpbmcnOiAnNTc1RicsIC8vIHRhaWwgc3dpbmcgOylcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBQYXduIE9mZic6ICc1ODA2JywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW0gR3VhcmQgVHVycmV0XFwncyBUb3VyIDEnOiAnNTgwRCcsIC8vIFF1ZWVuJ3MgR3VubmVyIHJlZmxlY3RpdmUgdHVycmV0IHNob3RcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgMic6ICc1ODBFJywgLy8gUXVlZW4ncyBHdW5uZXIgcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFR1cnJldFxcJ3MgVG91ciAzJzogJzU4MEYnLCAvLyBRdWVlbidzIEd1bm5lciByZWZsZWN0aXZlIHR1cnJldCBzaG90XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1N0YzJywgLy8gUXVlZW4ncyBLbmlnaHQgc2hpZWxkIGdldCB1bmRlclxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIE9wdGltYWwgUGxheSBTd29yZCc6ICc1N0YyJywgLy8gUXVlZW4ncyBLbmlnaHQgc3dvcmQgZ2V0IG91dFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIENvdW50ZXJwbGF5JzogJzU3RjYnLCAvLyBIaXR0aW5nIGFldGhlcmlhbCB3YXJkIGRpcmVjdGlvbmFsIGJhcnJpZXJcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAxJzogJzU3QTknLCAvLyBJbml0aWFsIHBoYW50b20gZG9udXQgYW9lIGZyb20gY2lyY2xlXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBTd2lybGluZyBNaWFzbWEgMic6ICc1N0FBJywgLy8gTW92aW5nIHBoYW50b20gZG9udXQgYW9lcyBmcm9tIGNpcmNsZVxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gQ3JlZXBpbmcgTWlhc21hJzogJzU3QTUnLCAvLyBwaGFudG9tIGxpbmUgYW9lIGZyb20gc3F1YXJlXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBWaWxlIFdhdmUnOiAnNTdCMScsIC8vIHBoYW50b20gY29uYWwgYW9lXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEZ1cnkgT2YgQm96amEnOiAnNTk3MycsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwib3V0XCJcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgRmxhc2h2YW5lJzogJzU5NzInLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBiZWhpbmRcIlxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBJbmZlcm5hbCBTbGFzaCc6ICc1OTcxJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgZnJvbnRcIlxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBGbGFtZXMgT2YgQm96amEnOiAnNTk2OCcsIC8vIDgwJSBmbG9vciBhb2UgYmVmb3JlIHNoaW1tZXJpbmcgc2hvdCBzd29yZHNcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgR2xlYW1pbmcgQXJyb3cnOiAnNTk3NCcsIC8vIFRyaW5pdHkgQXZhdGFyIGxpbmUgYW9lcyBmcm9tIG91dHNpZGVcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgTWVhbnMgMSc6ICc1OUJCJywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIE1lYW5zIDInOiAnNTlCRCcsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBFbmQgMSc6ICc1OUJBJywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgRW5kIDInOiAnNTlCQycsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gTm9ydGhzd2FpblxcJ3MgR2xvdyc6ICc1OUM0JywgLy8gZXhwYW5kaW5nIGxpbmVzIHdpdGggZXhwbG9zaW9uIGludGVyc2VjdGlvbnNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0JzogJzVCODMnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggbGVmdCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBKdWRnbWVudCBCbGFkZSBSaWdodCc6ICc1QjgzJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIHJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFF1ZWVuXFwncyBKdXN0aWNlJzogJzU5QkYnLCAvLyBmYWlsaW5nIHRvIHdhbGsgdGhlIHJpZ2h0IG51bWJlciBvZiBzcXVhcmVzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVHVycmV0XFwncyBUb3VyIDEnOiAnNTlFMCcsIC8vIHJlZmxlY3RpdmUgdHVycmV0IHNob3QgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVHVycmV0XFwncyBUb3VyIDInOiAnNTlFMScsIC8vIHJlZmxlY3RpdmUgdHVycmV0IHNob3QgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVHVycmV0XFwncyBUb3VyIDMnOiAnNTlFMicsIC8vIHJlZmxlY3RpdmUgdHVycmV0IHNob3QgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gUGF3biBPZmYnOiAnNTlEQScsIC8vIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lIGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIE9wdGltYWwgUGxheSBTaGllbGQnOiAnNTlDRScsIC8vIFF1ZWVuJ3MgS25pZ2h0IHNoaWVsZCBnZXQgdW5kZXIgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU5Q0MnLCAvLyBRdWVlbidzIEtuaWdodCBzd29yZCBnZXQgb3V0IGR1cmluZyBRdWVlblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RlbHVicnVtIEhpZGRlbiBUcmFwIE1hc3NpdmUgRXhwbG9zaW9uJzogJzVBNkUnLCAvLyBleHBsb3Npb24gdHJhcFxyXG4gICAgJ0RlbHVicnVtIEhpZGRlbiBUcmFwIFBvaXNvbiBUcmFwJzogJzVBNkYnLCAvLyBwb2lzb24gdHJhcFxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBIZWF0IFNob2NrJzogJzU5NUUnLCAvLyB0b28gbXVjaCBoZWF0IG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgQ29sZCBTaG9jayc6ICc1OTVGJywgLy8gdG9vIG11Y2ggY29sZCBvciBmYWlsaW5nIHRvIHJlZ3VsYXRlIHRlbXBlcmF0dXJlXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdEZWx1YnJ1bSBEYWh1IEhlYXQgQnJlYXRoJzogJzU3NjYnLCAvLyB0YW5rIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBXcmF0aCBPZiBCb3pqYSc6ICc1OTc1JywgLy8gdGFuayBjbGVhdmVcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBNb29uJzogJzI2MicsIC8vIFwiUGV0cmlmaWNhdGlvblwiIGZyb20gQWV0aGVyaWFsIE9yYiBsb29rYXdheVxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gQXQgbGVhc3QgZHVyaW5nIFRoZSBRdWVlbiwgdGhlc2UgYWJpbGl0eSBpZHMgY2FuIGJlIG9yZGVyZWQgZGlmZmVyZW50bHksXHJcbiAgICAgIC8vIGFuZCB0aGUgZmlyc3QgZXhwbG9zaW9uIFwiaGl0c1wiIGV2ZXJ5b25lLCBhbHRob3VnaCB3aXRoIFwiMUJcIiBmbGFncy5cclxuICAgICAgaWQ6ICdEZWx1YnJ1bSBMb3RzIENhc3QnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogWyc1NjVBJywgJzU2NUInLCAnNTdGRCcsICc1N0ZFJywgJzVCODYnLCAnNUI4NycsICc1OUQyJywgJzVEOTMnXSxcclxuICAgICAgY29uZGl0aW9uOiAoZSkgPT4gZS5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBEYWh1IDU3NzYgU3BpdCBGbGFtZSBzaG91bGQgYWx3YXlzIGhpdCBhIE1hcmNob3NpYXNcclxuLy8gVE9ETzogaGl0dGluZyBwaGFudG9tIHdpdGggaWNlIHNwaWtlcyB3aXRoIGFueXRoaW5nIGJ1dCBkaXNwZWw/XHJcbi8vIFRPRE86IGZhaWxpbmcgaWN5L2ZpZXJ5IHBvcnRlbnQgKGd1YXJkIGFuZCBxdWVlbilcclxuLy8gICAgICAgYDE4OlB5cmV0aWMgRG9UIFRpY2sgb24gJHtuYW1lfSBmb3IgJHtkYW1hZ2V9IGRhbWFnZS5gXHJcbi8vIFRPRE86IFdpbmRzIE9mIEZhdGUgLyBXZWlnaHQgT2YgRm9ydHVuZT9cclxuLy8gVE9ETzogVHVycmV0J3MgVG91cj9cclxuLy8gZ2VuZXJhbCB0cmFwczogZXhwbG9zaW9uOiA1QTcxLCBwb2lzb24gdHJhcDogNUE3MiwgbWluaTogNUE3M1xyXG4vLyBkdWVsIHRyYXBzOiBtaW5pOiA1N0ExLCBpY2U6IDU3OUYsIHRvYWQ6IDU3QTBcclxuLy8gVE9ETzogdGFraW5nIG1hbmEgZmxhbWUgd2l0aG91dCByZWZsZWN0XHJcbi8vIFRPRE86IHRha2luZyBNYWVsc3Ryb20ncyBCb2x0IHdpdGhvdXQgbGlnaHRuaW5nIGJ1ZmZcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx1YnJ1bVJlZ2luYWVTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBTbGltZXMgSGVsbGlzaCBTbGFzaCc6ICc1N0VBJywgLy8gQm96amFuIFNvbGRpZXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIFNsaW1lcyBWaXNjb3VzIFJ1cHR1cmUnOiAnNTAxNicsIC8vIEZ1bGx5IG1lcmdlZCB2aXNjb3VzIHNsaW1lIGFvZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgR29sZW1zIERlbW9saXNoJzogJzU4ODAnLCAvLyBpbnRlcnJ1cHRpYmxlIFJ1aW5zIEdvbGVtIGNhc3RcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgU3dhdGhlJzogJzVBRDEnLCAvLyBHcm91bmQgYW9lIHRvIGVpdGhlciBzaWRlIG9mIGJvc3NcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBCbGFkZSc6ICc1QjJBJywgLy8gSGlkZSBiZWhpbmQgcGlsbGFycyBhdHRhY2tcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgU2NvcmNoaW5nIFNoYWNrbGUnOiAnNUFDQicsIC8vIENoYWluc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCAxJzogJzVCOTQnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgMic6ICc1QUI5JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDMnOiAnNUFCQScsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCA0JzogJzVBQkInLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgNSc6ICc1QUJDJywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmNpZnVsIEJyZWV6ZSc6ICc1QUM4JywgLy8gV2FmZmxlIGNyaXNzLWNyb3NzIGZsb29yIG1hcmtlcnNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBDb21ldCc6ICc1QUQ3JywgLy8gQ2xvbmUgbWV0ZW9yIGRyb3BwaW5nIGJlZm9yZSBjaGFyZ2VzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgRmlyZXN0b3JtJzogJzVBRDgnLCAvLyBDbG9uZSBjaGFyZ2UgYWZ0ZXIgQmFsZWZ1bCBDb21ldFxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFJvc2UnOiAnNUFEOScsIC8vIENsb25lIGxpbmUgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMSc6ICc1QUMxJywgLy8gQmx1ZSByaW4gZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDInOiAnNUFDMicsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDMnOiAnNUFDMycsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAxJzogJzVBQzQnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDInOiAnNUFDNScsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMyc6ICc1QUM2JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQWN0IE9mIE1lcmN5JzogJzVBQ0YnLCAvLyBjcm9zcy1zaGFwZWQgbGluZSBhb2VzXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlIDEnOiAnNTc3MCcsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlIDInOiAnNTc3MicsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgTGVmdC1TaWRlZCBTaG9ja3dhdmUgMSc6ICc1NzZGJywgLy8gTGVmdCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlIDInOiAnNTc3MScsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGaXJlYnJlYXRoZSc6ICc1Nzc0JywgLy8gQ29uYWwgYnJlYXRoXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGaXJlYnJlYXRoZSBSb3RhdGluZyc6ICc1NzZDJywgLy8gQ29uYWwgYnJlYXRoLCByb3RhdGluZ1xyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgSGVhZCBEb3duJzogJzU3NjgnLCAvLyBsaW5lIGFvZSBjaGFyZ2UgZnJvbSBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgSHVudGVyXFwncyBDbGF3JzogJzU3NjknLCAvLyBjaXJjdWxhciBncm91bmQgYW9lIGNlbnRlcmVkIG9uIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGYWxsaW5nIFJvY2snOiAnNTc2RScsIC8vIGdyb3VuZCBhb2UgZnJvbSBSZXZlcmJlcmF0aW5nIFJvYXJcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEhvdCBDaGFyZ2UnOiAnNTc3MycsIC8vIGRvdWJsZSBjaGFyZ2VcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBNYXNzaXZlIEV4cGxvc2lvbic6ICc1NzlFJywgLy8gYm9tYnMgYmVpbmcgY2xlYXJlZFxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgVmljaW91cyBTd2lwZSc6ICc1Nzk3JywgLy8gY2lyY3VsYXIgYW9lIGFyb3VuZCBib3NzXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGb2N1c2VkIFRyZW1vciAxJzogJzU3OEYnLCAvLyBzcXVhcmUgZmxvb3IgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRm9jdXNlZCBUcmVtb3IgMic6ICc1NzkxJywgLy8gc3F1YXJlIGZsb29yIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIERldm91cic6ICc1Nzg5JywgLy8gY29uYWwgYW9lIGFmdGVyIHdpdGhlcmluZyBjdXJzZVxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRmxhaWxpbmcgU3RyaWtlIDEnOiAnNTc4QycsIC8vIGluaXRpYWwgcm90YXRpbmcgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGbGFpbGluZyBTdHJpa2UgMic6ICc1NzhEJywgLy8gcm90YXRpbmcgY2xlYXZlc1xyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIE9mZmVuc2l2ZSBTd29yZCc6ICc1ODE5JywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgT2ZmZW5zaXZlIFNoaWVsZCc6ICc1ODFBJywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBTd29yZCc6ICc1ODE2JywgLy8gT3B0aW1hbCBQbGF5IFN3b3JkIFwiZ2V0IG91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1ODE3JywgLy8gT3B0aW1hbCBwbGF5IHNoaWVsZCBcImdldCBpblwiXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBQbGF5IENsZWF2ZSc6ICc1ODE4JywgLy8gT3B0aW1hbCBQbGF5IGNsZWF2ZXMgZm9yIHN3b3JkL3NoaWVsZFxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFVubHVja3kgTG90JzogJzU4MUQnLCAvLyBRdWVlbidzIEtuaWdodCBvcmIgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQnVybiAxJzogJzU4M0QnLCAvLyBzbWFsbCBmaXJlIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBCdXJuIDInOiAnNTgzRScsIC8vIGxhcmdlIGZpcmUgYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFBhd24gT2ZmJzogJzU4M0EnLCAvLyBRdWVlbidzIFNvbGRpZXIgU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDEnOiAnNTg0NycsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDFcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDInOiAnNTg0OCcsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDJcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDMnOiAnNTg0OScsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBzZWNvbmQgbGluZXNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBDb3VudGVycGxheSc6ICc1OEY1JywgLy8gSGl0dGluZyBhZXRoZXJpYWwgd2FyZCBkaXJlY3Rpb25hbCBiYXJyaWVyXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDEnOiAnNTdCOCcsIC8vIEluaXRpYWwgcGhhbnRvbSBkb251dCBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAyJzogJzU3QjknLCAvLyBNb3ZpbmcgcGhhbnRvbSBkb251dCBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEgMSc6ICc1N0I0JywgLy8gSW5pdGlhbCBwaGFudG9tIGxpbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEgMic6ICc1N0I1JywgLy8gTGF0ZXIgcGhhbnRvbSBsaW5lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gTGluZ2VyaW5nIE1pYXNtYSAxJzogJzU3QjYnLCAvLyBJbml0aWFsIHBoYW50b20gY2lyY2xlIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gTGluZ2VyaW5nIE1pYXNtYSAyJzogJzU3QjcnLCAvLyBNb3ZpbmcgcGhhbnRvbSBjaXJjbGUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBWaWxlIFdhdmUnOiAnNTdCRicsIC8vIHBoYW50b20gY29uYWwgYW9lXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBGdXJ5IE9mIEJvemphJzogJzU5NEMnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcIm91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEZsYXNodmFuZSc6ICc1OTRCJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgYmVoaW5kXCJcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgSW5mZXJuYWwgU2xhc2gnOiAnNTk0QScsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGZyb250XCJcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgRmxhbWVzIE9mIEJvemphJzogJzU5MzknLCAvLyA4MCUgZmxvb3IgYW9lIGJlZm9yZSBzaGltbWVyaW5nIHNob3Qgc3dvcmRzXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEdsZWFtaW5nIEFycm93JzogJzU5NEQnLCAvLyBUcmluaXR5IEF2YXRhciBsaW5lIGFvZXMgZnJvbSBvdXRzaWRlXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgV2hhY2snOiAnNTdEMCcsIC8vIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRGV2YXN0YXRpbmcgQm9sdCAxJzogJzU3QzUnLCAvLyBsaWdodG5pbmcgcmluZ3NcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIERldmFzdGF0aW5nIEJvbHQgMic6ICc1N0M2JywgLy8gbGlnaHRuaW5nIHJpbmdzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBFbGVjdHJvY3V0aW9uJzogJzU3Q0MnLCAvLyByYW5kb20gY2lyY2xlIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIFJhcGlkIEJvbHRzJzogJzU3QzMnLCAvLyBkcm9wcGVkIGxpZ2h0bmluZyBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCAxMTExLVRvbnplIFN3aW5nJzogJzU3RDgnLCAvLyB2ZXJ5IGxhcmdlIFwiZ2V0IG91dFwiIHN3aW5nXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBNb25rIEF0dGFjayc6ICc1NUE2JywgLy8gTW9uayBhZGQgYXV0by1hdHRhY2tcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gTm9ydGhzd2FpblxcJ3MgR2xvdyc6ICc1OUY0JywgLy8gZXhwYW5kaW5nIGxpbmVzIHdpdGggZXhwbG9zaW9uIGludGVyc2VjdGlvbnNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgTWVhbnMgMSc6ICc1OUU3JywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIE1lYW5zIDInOiAnNTlFQScsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFRoZSBFbmQgMSc6ICc1OUU4JywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgRW5kIDInOiAnNTlFOScsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBPZmZlbnNpdmUgU3dvcmQnOiAnNUEwMicsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIE9mZmVuc2l2ZSBTaGllbGQnOiAnNUEwMycsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0IDEnOiAnNTlGMicsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIExlZnQgMic6ICc1Qjg1JywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIGxlZnQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gSnVkZ21lbnQgQmxhZGUgUmlnaHQgMSc6ICc1OUYxJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIHJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0IDInOiAnNUI4NCcsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBQYXduIE9mZic6ICc1QTFEJywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU5RkYnLCAvLyBPcHRpbWFsIFBsYXkgU3dvcmQgXCJnZXQgb3V0XCJcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzVBMDAnLCAvLyBPcHRpbWFsIHBsYXkgc2hpZWxkIFwiZ2V0IGluXCJcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIFBsYXkgQ2xlYXZlJzogJzVBMDEnLCAvLyBPcHRpbWFsIFBsYXkgY2xlYXZlcyBmb3Igc3dvcmQvc2hpZWxkXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAxJzogJzVBMjgnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAxXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAyJzogJzVBMkEnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAyXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAzJzogJzVBMjknLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgc2Vjb25kIGxpbmVzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEhlYXQgU2hvY2snOiAnNTkyNycsIC8vIHRvbyBtdWNoIGhlYXQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBDb2xkIFNob2NrJzogJzU5MjgnLCAvLyB0b28gbXVjaCBjb2xkIG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBRdWVlblxcJ3MgSnVzdGljZSc6ICc1OUVCJywgLy8gZmFpbGluZyB0byB3YWxrIHRoZSByaWdodCBudW1iZXIgb2Ygc3F1YXJlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEd1bm5oaWxkclxcJ3MgQmxhZGVzJzogJzVCMjInLCAvLyBub3QgYmVpbmcgaW4gdGhlIGNoZXNzIGJsdWUgc2FmZSBzcXVhcmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBVbmx1Y2t5IExvdCc6ICc1NUI2JywgLy8gbGlnaHRuaW5nIG9yYiBhdHRhY2tcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBQaGFudG9tIEJhbGVmdWwgT25zbGF1Z2h0JzogJzVBRDYnLCAvLyBzb2xvIHRhbmsgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBGb2UgU3BsaXR0ZXInOiAnNTdENycsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY2lmdWwgTW9vbic6ICcyNjInLCAvLyBcIlBldHJpZmljYXRpb25cIiBmcm9tIEFldGhlcmlhbCBPcmIgbG9va2F3YXlcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXNlIGFiaWxpdHkgaWRzIGNhbiBiZSBvcmRlcmVkIGRpZmZlcmVudGx5IGFuZCBcImhpdFwiIHBlb3BsZSB3aGVuIGxldml0YXRpbmcuXHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgR3VhcmQgTG90cyBDYXN0JyxcclxuICAgICAgZGFtYWdlUmVnZXg6IFsnNTgyNycsICc1ODI4JywgJzVCNkMnLCAnNUI2RCcsICc1QkI2JywgJzVCQjcnLCAnNUI4OCcsICc1Qjg5J10sXHJcbiAgICAgIGNvbmRpdGlvbjogKGUpID0+IGUuZmxhZ3Muc2xpY2UoLTIpID09PSAnMDMnLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdEZWx1YnJ1bVNhdiBHb2xlbSBDb21wYWN0aW9uJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTc0NicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGZ1bGxUZXh0OiBgJHttYXRjaGVzLnNvdXJjZX06ICR7bWF0Y2hlcy5hYmlsaXR5fWAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgU2xpbWUgU2FuZ3VpbmUgRnVzaW9uJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTU0RCcgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGZ1bGxUZXh0OiBgJHttYXRjaGVzLnNvdXJjZX06ICR7bWF0Y2hlcy5hYmlsaXR5fWAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlUmVzdXJyZWN0aW9uLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMU4gRWRlblxcJ3MgVGh1bmRlciBJSUknOiAnNDRFRCcsXHJcbiAgICAnRTFOIEVkZW5cXCdzIEJsaXp6YXJkIElJSSc6ICc0NEVDJyxcclxuICAgICdFMU4gUHVyZSBCZWFtJzogJzNEOUUnLFxyXG4gICAgJ0UxTiBQYXJhZGlzZSBMb3N0JzogJzNEQTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxTiBFZGVuXFwncyBGbGFyZSc6ICczRDk3JyxcclxuICAgICdFMU4gUHVyZSBMaWdodCc6ICczREEzJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxTiBGaXJlIElJSSc6ICc0NEVCJyxcclxuICAgICdFMU4gVmljZSBPZiBWYW5pdHknOiAnNDRFNycsIC8vIHRhbmsgbGFzZXJzXHJcbiAgICAnRTFOIFZpY2UgT2YgQXBhdGh5JzogJzQ0RTgnLCAvLyBkcHMgcHVkZGxlc1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogZmFpbGluZyB0byBpbnRlcnJ1cHQgTWFuYSBCb29zdCAoM0Q4RClcclxuLy8gVE9ETzogZmFpbGluZyB0byBwYXNzIGhlYWxlciBkZWJ1ZmY/XHJcbi8vIFRPRE86IHdoYXQgaGFwcGVucyBpZiB5b3UgZG9uJ3Qga2lsbCBhIG1ldGVvciBkdXJpbmcgZm91ciBvcmJzP1xyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlUmVzdXJyZWN0aW9uU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMVMgRWRlblxcJ3MgVGh1bmRlciBJSUknOiAnNDRGNycsXHJcbiAgICAnRTFTIEVkZW5cXCdzIEJsaXp6YXJkIElJSSc6ICc0NEY2JyxcclxuICAgICdFMVMgRWRlblxcJ3MgUmVnYWluZWQgQmxpenphcmQgSUlJJzogJzQ0RkEnLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gVHJpZGVudCAxJzogJzNEODMnLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gVHJpZGVudCAyJzogJzNEODQnLFxyXG4gICAgJ0UxUyBQYXJhZGlzZSBMb3N0JzogJzNEODcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxUyBFZGVuXFwncyBGbGFyZSc6ICczRDczJyxcclxuICAgICdFMVMgUHVyZSBMaWdodCc6ICczRDhBJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxUyBGaXJlL1RodW5kZXIgSUlJJzogJzQ0RkInLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gU2luZ2xlJzogJzNEODEnLFxyXG4gICAgJ0UxUyBWaWNlIE9mIFZhbml0eSc6ICc0NEYxJywgLy8gdGFuayBsYXNlcnNcclxuICAgICdFMVMgVmljZSBvZiBBcGF0aHknOiAnNDRGMicsIC8vIGRwcyBwdWRkbGVzXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBzaGFkb3dleWUgZmFpbHVyZSAodG9wIGxpbmUgZmFpbCwgYm90dG9tIGxpbmUgc3VjY2VzcywgZWZmZWN0IHRoZXJlIHRvbylcclxuLy8gWzE2OjE3OjM1Ljk2Nl0gMTY6NDAwMTEwRkU6Vm9pZHdhbGtlcjo0MEI3OlNoYWRvd2V5ZToxMDYxMjM0NTpUaW5pIFBvdXRpbmk6RjoxMDAwMDoxMDAxOTBGOlxyXG4vLyBbMTY6MTc6MzUuOTY2XSAxNjo0MDAxMTBGRTpWb2lkd2Fsa2VyOjQwQjc6U2hhZG93ZXllOjEwNjc4OTBBOlBvdGF0byBDaGlwcHk6MTowOjFDOjgwMDA6XHJcbi8vIGdhaW5zIHRoZSBlZmZlY3Qgb2YgUGV0cmlmaWNhdGlvbiBmcm9tIFZvaWR3YWxrZXIgZm9yIDEwLjAwIFNlY29uZHMuXHJcbi8vIFRPRE86IHB1ZGRsZSBmYWlsdXJlP1xyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlRGVzY2VudCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTJOIERvb212b2lkIFNsaWNlcic6ICczRTNDJyxcclxuICAgICdFMk4gRG9vbXZvaWQgR3VpbGxvdGluZSc6ICczRTNCJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTJOIE55eCcsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnM0UzRCcsXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnQm9vcGVkJyxcclxuICAgICAgICAgICAgZGU6IGUuYWJpbGl0eU5hbWUsXHJcbiAgICAgICAgICAgIGZyOiAnTWFsdXMgZGUgZMOpZ8OidHMnLFxyXG4gICAgICAgICAgICBqYTogZS5hYmlsaXR5TmFtZSxcclxuICAgICAgICAgICAgY246IGUuYWJpbGl0eU5hbWUsXHJcbiAgICAgICAgICAgIGtvOiAn64uJ7IqkJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IHNoYWRvd2V5ZSBmYWlsdXJlXHJcbi8vIFRPRE86IEVtcHR5IEhhdGUgKDNFNTkvM0U1QSkgaGl0cyBldmVyeWJvZHksIHNvIGhhcmQgdG8gdGVsbCBhYm91dCBrbm9ja2JhY2tcclxuLy8gVE9ETzogbWF5YmUgbWFyayBoZWxsIHdpbmQgcGVvcGxlIHdobyBnb3QgY2xpcHBlZCBieSBzdGFjaz9cclxuLy8gVE9ETzogbWlzc2luZyBwdWRkbGVzP1xyXG4vLyBUT0RPOiBtaXNzaW5nIGxpZ2h0L2RhcmsgY2lyY2xlIHN0YWNrXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVEZXNjZW50U2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMlMgRG9vbXZvaWQgU2xpY2VyJzogJzNFNTAnLFxyXG4gICAgJ0UzUyBFbXB0eSBSYWdlJzogJzNFNkMnLFxyXG4gICAgJ0UzUyBEb29tdm9pZCBHdWlsbG90aW5lJzogJzNFNEYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTJTIERvb212b2lkIENsZWF2ZXInOiAnM0U2NCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UyUyBTaGFkb3dleWUnLFxyXG4gICAgICAvLyBTdG9uZSBDdXJzZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTg5JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMlMgTnl4JyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICczRTUxJyxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IGUudGFyZ2V0TmFtZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb29wZWQnLFxyXG4gICAgICAgICAgICBkZTogZS5hYmlsaXR5TmFtZSxcclxuICAgICAgICAgICAgZnI6ICdNYWx1cyBkZSBkw6lnw6J0cycsXHJcbiAgICAgICAgICAgIGphOiBlLmFiaWxpdHlOYW1lLFxyXG4gICAgICAgICAgICBjbjogJ+aUu+WHu+S8pOWus+mZjeS9jicsXHJcbiAgICAgICAgICAgIGtvOiAn64uJ7IqkJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlSW51bmRhdGlvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTNOIE1vbnN0ZXIgV2F2ZSAxJzogJzNGQ0EnLFxyXG4gICAgJ0UzTiBNb25zdGVyIFdhdmUgMic6ICczRkU5JyxcclxuICAgICdFM04gTWFlbHN0cm9tJzogJzNGRDknLFxyXG4gICAgJ0UzTiBTd2lybGluZyBUc3VuYW1pJzogJzNGRDUnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UzTiBUZW1wb3JhcnkgQ3VycmVudCAxJzogJzNGQ0UnLFxyXG4gICAgJ0UzTiBUZW1wb3JhcnkgQ3VycmVudCAyJzogJzNGQ0QnLFxyXG4gICAgJ0UzTiBTcGlubmluZyBEaXZlJzogJzNGREInLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTNOIFJpcCBDdXJyZW50JzogJzNGQzcnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogU2NvdXJpbmcgVHN1bmFtaSAoM0NFMCkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXRcclxuLy8gVE9ETzogU3dlZXBpbmcgVHN1bmFtaSAoM0ZGNSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YW5rc1xyXG4vLyBUT0RPOiBSaXAgQ3VycmVudCAoM0ZFMCwgM0ZFMSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXQvdGFua3NcclxuLy8gVE9ETzogQm9pbGVkIEFsaXZlICg0MDA2KSBpcyBmYWlsaW5nIHB1ZGRsZXM/Pz9cclxuLy8gVE9ETzogZmFpbGluZyB0byBjbGVhbnNlIFNwbGFzaGluZyBXYXRlcnNcclxuLy8gVE9ETzogZG9lcyBnZXR0aW5nIGhpdCBieSB1bmRlcnNlYSBxdWFrZSBjYXVzZSBhbiBhYmlsaXR5P1xyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlSW51bmRhdGlvblNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTNTIE1vbnN0ZXIgV2F2ZSAxJzogJzNGRTUnLFxyXG4gICAgJ0UzUyBNb25zdGVyIFdhdmUgMic6ICczRkU5JyxcclxuICAgICdFM1MgTWFlbHN0cm9tJzogJzNGRkInLFxyXG4gICAgJ0UzUyBTd2lybGluZyBUc3VuYW1pJzogJzNGRjQnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAxJzogJzNGRUEnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAyJzogJzNGRUInLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAzJzogJzNGRUMnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCA0JzogJzNGRUQnLFxyXG4gICAgJ0UzUyBTcGlubmluZyBEaXZlJzogJzNGRkQnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVNlcHVsdHVyZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTROIFdlaWdodCBvZiB0aGUgTGFuZCc6ICc0MEVCJyxcclxuICAgICdFNE4gRXZpbCBFYXJ0aCc6ICc0MEVGJyxcclxuICAgICdFNE4gQWZ0ZXJzaG9jayAxJzogJzQxQjQnLFxyXG4gICAgJ0U0TiBBZnRlcnNob2NrIDInOiAnNDBGMCcsXHJcbiAgICAnRTROIEV4cGxvc2lvbiAxJzogJzQwRUQnLFxyXG4gICAgJ0U0TiBFeHBsb3Npb24gMic6ICc0MEY1JyxcclxuICAgICdFNE4gTGFuZHNsaWRlJzogJzQxMUInLFxyXG4gICAgJ0U0TiBSaWdodHdhcmQgTGFuZHNsaWRlJzogJzQxMDAnLFxyXG4gICAgJ0U0TiBMZWZ0d2FyZCBMYW5kc2xpZGUnOiAnNDBGRicsXHJcbiAgICAnRTROIE1hc3NpdmUgTGFuZHNsaWRlJzogJzQwRkMnLFxyXG4gICAgJ0U0TiBTZWlzbWljIFdhdmUnOiAnNDBGMycsXHJcbiAgICAnRTROIEZhdWx0IExpbmUnOiAnNDEwMScsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIHBlb3BsZSBnZXQgaGl0dGluZyBieSBtYXJrZXJzIHRoZXkgc2hvdWxkbid0XHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIG5vbi10YW5rcyBnZXR0aW5nIGhpdCBieSB0YW5rYnVzdGVycywgbWVnYWxpdGhzXHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIG5vbi10YXJnZXQgZ2V0dGluZyBoaXQgYnkgdGFua2J1c3RlclxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlU2VwdWx0dXJlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNFMgV2VpZ2h0IG9mIHRoZSBMYW5kJzogJzQxMDgnLFxyXG4gICAgJ0U0UyBFdmlsIEVhcnRoJzogJzQxMEMnLFxyXG4gICAgJ0U0UyBBZnRlcnNob2NrIDEnOiAnNDFCNScsXHJcbiAgICAnRTRTIEFmdGVyc2hvY2sgMic6ICc0MTBEJyxcclxuICAgICdFNFMgRXhwbG9zaW9uJzogJzQxMEEnLFxyXG4gICAgJ0U0UyBMYW5kc2xpZGUnOiAnNDExQicsXHJcbiAgICAnRTRTIFJpZ2h0d2FyZCBMYW5kc2xpZGUnOiAnNDExRCcsXHJcbiAgICAnRTRTIExlZnR3YXJkIExhbmRzbGlkZSc6ICc0MTFDJyxcclxuICAgICdFNFMgTWFzc2l2ZSBMYW5kc2xpZGUgMSc6ICc0MTE4JyxcclxuICAgICdFNFMgTWFzc2l2ZSBMYW5kc2xpZGUgMic6ICc0MTE5JyxcclxuICAgICdFNFMgU2Vpc21pYyBXYXZlJzogJzQxMTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U0UyBEdWFsIEVhcnRoZW4gRmlzdHMgMSc6ICc0MTM1JyxcclxuICAgICdFNFMgRHVhbCBFYXJ0aGVuIEZpc3RzIDInOiAnNDY4NycsXHJcbiAgICAnRTRTIFBsYXRlIEZyYWN0dXJlJzogJzQzRUEnLFxyXG4gICAgJ0U0UyBFYXJ0aGVuIEZpc3QgMSc6ICc0M0NBJyxcclxuICAgICdFNFMgRWFydGhlbiBGaXN0IDInOiAnNDNDOScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U0UyBGYXVsdCBMaW5lIENvbGxlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ+OCv+OCpOOCv+ODsycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICfms7DlnaYnIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAn7YOA7J207YOEJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZhdWx0TGluZVRhcmdldCA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNFMgRmF1bHQgTGluZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNDExRScsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IGRhdGEuZmF1bHRMaW5lVGFyZ2V0ICE9PSBlLnRhcmdldE5hbWUsXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUnVuIE92ZXInLFxyXG4gICAgICAgICAgICBkZTogZS5hYmlsaXR5TmFtZSxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIMOpY3Jhc8OpKGUpJyxcclxuICAgICAgICAgICAgamE6IGUuYWJpbGl0eU5hbWUsXHJcbiAgICAgICAgICAgIGNuOiBlLmFiaWxpdHlOYW1lLFxyXG4gICAgICAgICAgICBrbzogZS5hYmlsaXR5TmFtZSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVsbWluYXRpb24sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U1TiBJbXBhY3QnOiAnNEUzQScsIC8vIFN0cmF0b3NwZWFyIGxhbmRpbmcgQW9FXHJcbiAgICAnRTVOIExpZ2h0bmluZyBCb2x0JzogJzRCOUMnLCAvLyBTdG9ybWNsb3VkIHN0YW5kYXJkIGF0dGFja1xyXG4gICAgJ0U1TiBHYWxsb3AnOiAnNEI5NycsIC8vIFNpZGV3YXlzIGFkZCBjaGFyZ2VcclxuICAgICdFNU4gU2hvY2sgU3RyaWtlJzogJzRCQTEnLCAvLyBTbWFsbCBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgICAnRTVOIFZvbHQgU3RyaWtlJzogJzRDRjInLCAvLyBMYXJnZSBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTVOIEp1ZGdtZW50IEpvbHQnOiAnNEI4RicsIC8vIFN0cmF0b3NwZWFyIGV4cGxvc2lvbnNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgaGFwcGVucyB3aGVuIGEgcGxheWVyIGdldHMgNCsgc3RhY2tzIG9mIG9yYnMuIERvbid0IGJlIGdyZWVkeSFcclxuICAgICAgaWQ6ICdFNU4gU3RhdGljIENvbmRlbnNhdGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIG9yYiBwaWNrdXAgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdFNU4gT3JiIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc09yYiA9IGRhdGEuaGFzT3JiIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBPcmIgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID0gZGF0YS5oYXNPcmIgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBEaXZpbmUgSnVkZ2VtZW50IFZvbHRzJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0QjlBJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4gIWRhdGEuaGFzT3JiW2UudGFyZ2V0TmFtZV0sXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBlLmFiaWxpdHlOYW1lICsgJyAobm8gb3JiKScsXHJcbiAgICAgICAgICAgIGRlOiBlLmFiaWxpdHlOYW1lICsgJyAoa2VpbiBPcmIpJyxcclxuICAgICAgICAgICAgZnI6IGUuYWJpbGl0eU5hbWUgKyAnKHBhcyBkXFwnb3JiZSknLFxyXG4gICAgICAgICAgICBqYTogZS5hYmlsaXR5TmFtZSArICco6Zu3546J54Sh44GXKScsXHJcbiAgICAgICAgICAgIGNuOiBlLmFiaWxpdHlOYW1lICsgJyjmsqHlkIPnkIMpJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIFN0b3JtY2xvdWQgVGFyZ2V0IFRyYWNraW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMgPSBkYXRhLmNsb3VkTWFya2VycyB8fCBbXTtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2Vycy5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBpcyBzZWVuIG9ubHkgaWYgcGxheWVycyBzdGFja2VkIHRoZSBjbG91ZHMgaW5zdGVhZCBvZiBzcHJlYWRpbmcgdGhlbS5cclxuICAgICAgaWQ6ICdFNU4gVGhlIFBhcnRpbmcgQ2xvdWRzJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0QjlEJyxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAzMCxcclxuICAgICAgbWlzdGFrZTogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICBmb3IgKGNvbnN0IG0gb2YgZGF0YS5jbG91ZE1hcmtlcnMpIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgICAgYmxhbWU6IGRhdGEuY2xvdWRNYXJrZXJzW21dLFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGUuYWJpbGl0eU5hbWUgKyAnKGNsb3VkcyB0b28gY2xvc2UpJyxcclxuICAgICAgICAgICAgICBkZTogZS5hYmlsaXR5TmFtZSArICcoV29sa2VuIHp1IG5haGUpJyxcclxuICAgICAgICAgICAgICBmcjogZS5hYmlsaXR5TmFtZSArICcobnVhZ2VzIHRyb3AgcHJvY2hlcyknLFxyXG4gICAgICAgICAgICAgIGphOiBlLmFiaWxpdHlOYW1lICsgJyjpm7Lov5HjgZnjgY4pJyxcclxuICAgICAgICAgICAgICBjbjogZS5hYmlsaXR5TmFtZSArICco6Zu35LqR6YeN5Y+gKScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIFN0b3JtY2xvdWQgY2xlYW51cCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDMwLCAvLyBTdG9ybWNsb3VkcyByZXNvbHZlIHdlbGwgYmVmb3JlIHRoaXMuXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuY2xvdWRNYXJrZXJzO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogaXMgdGhlcmUgYSBkaWZmZXJlbnQgYWJpbGl0eSBpZiB0aGUgc2hpZWxkIGR1dHkgYWN0aW9uIGlzbid0IHVzZWQgcHJvcGVybHk/XHJcbi8vIFRPRE86IGlzIHRoZXJlIGFuIGFiaWxpdHkgZnJvbSBSYWlkZW4gKHRoZSBiaXJkKSBpZiB5b3UgZ2V0IGVhdGVuP1xyXG4vLyBUT0RPOiBtYXliZSBjaGFpbiBsaWdodG5pbmcgd2FybmluZyBpZiB5b3UgZ2V0IGhpdCB3aGlsZSB5b3UgaGF2ZSBzeXN0ZW0gc2hvY2sgKDhCOClcclxuXHJcbmNvbnN0IG5vT3JiID0gKHN0cikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAobm8gb3JiKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBPcmIpJyxcclxuICAgIGZyOiBzdHIgKyAnIChwYXMgZFxcJ29yYmUpJyxcclxuICAgIGphOiBzdHIgKyAnICjpm7fnjonnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHlkIPnkIMpJyxcclxuICAgIGtvOiBzdHIgKyAnICjqtazsiqwg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVsbWluYXRpb25TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U1UyBJbXBhY3QnOiAnNEUzQicsIC8vIFN0cmF0b3NwZWFyIGxhbmRpbmcgQW9FXHJcbiAgICAnRTVTIEdhbGxvcCc6ICc0QkI0JywgLy8gU2lkZXdheXMgYWRkIGNoYXJnZVxyXG4gICAgJ0U1UyBTaG9jayBTdHJpa2UnOiAnNEJDMScsIC8vIFNtYWxsIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgU3RlcHBlZCBMZWFkZXIgVHdpc3Rlcic6ICc0QkM3JywgLy8gVHdpc3RlciBzdGVwcGVkIGxlYWRlclxyXG4gICAgJ0U1UyBTdGVwcGVkIExlYWRlciBEb251dCc6ICc0QkM4JywgLy8gRG9udXQgc3RlcHBlZCBsZWFkZXJcclxuICAgICdFNVMgU2hvY2snOiAnNEUzRCcsIC8vIEhhdGVkIG9mIExldmluIFN0b3JtY2xvdWQtY2xlYW5zYWJsZSBleHBsb2RpbmcgZGVidWZmXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTVTIEp1ZGdtZW50IEpvbHQnOiAnNEJBNycsIC8vIFN0cmF0b3NwZWFyIGV4cGxvc2lvbnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U1UyBWb2x0IFN0cmlrZSBEb3VibGUnOiAnNEJDMycsIC8vIExhcmdlIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgQ3JpcHBsaW5nIEJsb3cnOiAnNEJDQScsXHJcbiAgICAnRTVTIENoYWluIExpZ2h0bmluZyBEb3VibGUnOiAnNEJDNScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIG9yYiBwaWNrdXAgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdFNVMgT3JiIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc09yYiA9IGRhdGEuaGFzT3JiIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBPcmIgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID0gZGF0YS5oYXNPcmIgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBEaXZpbmUgSnVkZ2VtZW50IFZvbHRzJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0QkI3JyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4gIWRhdGEuaGFzT3JiIHx8ICFkYXRhLmhhc09yYltlLnRhcmdldE5hbWVdLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogbm9PcmIoZS5hYmlsaXR5TmFtZSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIFZvbHQgU3RyaWtlIE9yYicsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNEJDMycsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbZS50YXJnZXROYW1lXSxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IG5vT3JiKGUuYWJpbGl0eU5hbWUpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBEZWFkbHkgRGlzY2hhcmdlIEJpZyBLbm9ja2JhY2snLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzRCQjInLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiAhZGF0YS5oYXNPcmIgfHwgIWRhdGEuaGFzT3JiW2UudGFyZ2V0TmFtZV0sXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiBub09yYihlLmFiaWxpdHlOYW1lKSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgTGlnaHRuaW5nIEJvbHQnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzRCQjknLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gSGF2aW5nIGEgbm9uLWlkZW1wb3RlbnQgY29uZGl0aW9uIGZ1bmN0aW9uIGlzIGEgYml0IDxfPFxyXG4gICAgICAgIC8vIE9ubHkgY29uc2lkZXIgbGlnaHRuaW5nIGJvbHQgZGFtYWdlIGlmIHlvdSBoYXZlIGEgZGVidWZmIHRvIGNsZWFyLlxyXG4gICAgICAgIGlmICghZGF0YS5oYXRlZCB8fCAhZGF0YS5oYXRlZFtlLnRhcmdldE5hbWVdKVxyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmhhdGVkW2UudGFyZ2V0TmFtZV07XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogZS5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgSGF0ZWQgb2YgTGV2aW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMEQyJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhdGVkID0gZGF0YS5oYXRlZCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIFRhcmdldCBUcmFja2luZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuY2xvdWRNYXJrZXJzID0gZGF0YS5jbG91ZE1hcmtlcnMgfHwgW107XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgaXMgc2VlbiBvbmx5IGlmIHBsYXllcnMgc3RhY2tlZCB0aGUgY2xvdWRzIGluc3RlYWQgb2Ygc3ByZWFkaW5nIHRoZW0uXHJcbiAgICAgIGlkOiAnRTVTIFRoZSBQYXJ0aW5nIENsb3VkcycsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNEJCQScsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMzAsXHJcbiAgICAgIG1pc3Rha2U6IChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBtIG9mIGRhdGEuY2xvdWRNYXJrZXJzKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBkYXRhLmNsb3VkTWFya2Vyc1ttXSxcclxuICAgICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICAgIGVuOiBlLmFiaWxpdHlOYW1lICsgJyhjbG91ZHMgdG9vIGNsb3NlKScsXHJcbiAgICAgICAgICAgICAgZGU6IGUuYWJpbGl0eU5hbWUgKyAnKFdvbGtlbiB6dSBuYWhlKScsXHJcbiAgICAgICAgICAgICAgZnI6IGUuYWJpbGl0eU5hbWUgKyAnKG51YWdlcyB0cm9wIHByb2NoZXMpJyxcclxuICAgICAgICAgICAgICBqYTogZS5hYmlsaXR5TmFtZSArICco6Zuy6L+R44GZ44GOKScsXHJcbiAgICAgICAgICAgICAgY246IGUuYWJpbGl0eU5hbWUgKyAnKOmbt+S6kemHjeWPoCknLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIGNsZWFudXAnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMDZFJyB9KSxcclxuICAgICAgLy8gU3Rvcm1jbG91ZHMgcmVzb2x2ZSB3ZWxsIGJlZm9yZSB0aGlzLlxyXG4gICAgICBkZWxheVNlY29uZHM6IDMwLFxyXG4gICAgICBydW46IChfZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmNsb3VkTWFya2VycztcclxuICAgICAgICBkZWxldGUgZGF0YS5oYXRlZDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1cm9yLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNk4gVGhvcm5zJzogJzRCREEnLCAvLyBBb0UgbWFya2VycyBhZnRlciBFbnVtZXJhdGlvblxyXG4gICAgJ0U2TiBGZXJvc3Rvcm0gMSc6ICc0QkREJyxcclxuICAgICdFNk4gRmVyb3N0b3JtIDInOiAnNEJFNScsXHJcbiAgICAnRTZOIFN0b3JtIE9mIEZ1cnkgMSc6ICc0QkUwJywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tR2FydWRhXHJcbiAgICAnRTZOIFN0b3JtIE9mIEZ1cnkgMic6ICc0QkU2JywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tUmFrdGFwYWtzYVxyXG4gICAgJ0U2TiBFeHBsb3Npb24nOiAnNEJFMicsIC8vIEFvRSBjaXJjbGVzLCBHYXJ1ZGEgb3Jic1xyXG4gICAgJ0U2TiBIZWF0IEJ1cnN0JzogJzRCRUMnLFxyXG4gICAgJ0U2TiBDb25mbGFnIFN0cmlrZSc6ICc0QkVFJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRVxyXG4gICAgJ0U2TiBTcGlrZSBPZiBGbGFtZSc6ICc0QkYwJywgLy8gT3JiIGV4cGxvc2lvbnMgYWZ0ZXIgU3RyaWtlIFNwYXJrXHJcbiAgICAnRTZOIFJhZGlhbnQgUGx1bWUnOiAnNEJGMicsXHJcbiAgICAnRTZOIEVydXB0aW9uJzogJzRCRjQnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U2TiBWYWN1dW0gU2xpY2UnOiAnNEJENScsIC8vIERhcmsgbGluZSBBb0UgZnJvbSBHYXJ1ZGFcclxuICAgICdFNk4gRG93bmJ1cnN0JzogJzRCREInLCAvLyBCbHVlIGtub2NrYmFjayBjaXJjbGUuIEFjdHVhbCBrbm9ja2JhY2sgaXMgdW5rbm93biBhYmlsaXR5IDRDMjBcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gS2lsbHMgbm9uLXRhbmtzIHdobyBnZXQgaGl0IGJ5IGl0LlxyXG4gICAgJ0U2TiBJbnN0YW50IEluY2luZXJhdGlvbic6ICc0QkVEJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IGNoZWNrIHRldGhlcnMgYmVpbmcgY3V0ICh3aGVuIHRoZXkgc2hvdWxkbid0KVxyXG4vLyBUT0RPOiBjaGVjayBmb3IgY29uY3Vzc2VkIGRlYnVmZlxyXG4vLyBUT0RPOiBjaGVjayBmb3IgdGFraW5nIHRhbmtidXN0ZXIgd2l0aCBsaWdodGhlYWRlZFxyXG4vLyBUT0RPOiBjaGVjayBmb3Igb25lIHBlcnNvbiB0YWtpbmcgbXVsdGlwbGUgU3Rvcm0gT2YgRnVyeSBUZXRoZXJzICg0QzAxLzRDMDgpXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1cm9yU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIEl0J3MgY29tbW9uIHRvIGp1c3QgaWdub3JlIGZ1dGJvbCBtZWNoYW5pY3MsIHNvIGRvbid0IHdhcm4gb24gU3RyaWtlIFNwYXJrLlxyXG4gICAgLy8gJ1NwaWtlIE9mIEZsYW1lJzogJzRDMTMnLCAvLyBPcmIgZXhwbG9zaW9ucyBhZnRlciBTdHJpa2UgU3BhcmtcclxuXHJcbiAgICAnRTZTIFRob3Jucyc6ICc0QkZBJywgLy8gQW9FIG1hcmtlcnMgYWZ0ZXIgRW51bWVyYXRpb25cclxuICAgICdFNlMgRmVyb3N0b3JtIDEnOiAnNEJGRCcsXHJcbiAgICAnRTZTIEZlcm9zdG9ybSAyJzogJzRDMDYnLFxyXG4gICAgJ0U2UyBTdG9ybSBPZiBGdXJ5IDEnOiAnNEMwMCcsIC8vIENpcmNsZSBBb0UgZHVyaW5nIHRldGhlcnMtLUdhcnVkYVxyXG4gICAgJ0U2UyBTdG9ybSBPZiBGdXJ5IDInOiAnNEMwNycsIC8vIENpcmNsZSBBb0UgZHVyaW5nIHRldGhlcnMtLVJha3RhcGFrc2FcclxuICAgICdFNlMgRXhwbG9zaW9uJzogJzRDMDMnLCAvLyBBb0UgY2lyY2xlcywgR2FydWRhIG9yYnNcclxuICAgICdFNlMgSGVhdCBCdXJzdCc6ICc0QzFGJyxcclxuICAgICdFNlMgQ29uZmxhZyBTdHJpa2UnOiAnNEMxMCcsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0VcclxuICAgICdFNlMgUmFkaWFudCBQbHVtZSc6ICc0QzE1JyxcclxuICAgICdFNlMgRXJ1cHRpb24nOiAnNEMxNycsXHJcbiAgICAnRTZTIFdpbmQgQ3V0dGVyJzogJzRDMDInLCAvLyBUZXRoZXItY3V0dGluZyBsaW5lIGFvZVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U2UyBWYWN1dW0gU2xpY2UnOiAnNEJGNScsIC8vIERhcmsgbGluZSBBb0UgZnJvbSBHYXJ1ZGFcclxuICAgICdFNlMgRG93bmJ1cnN0IDEnOiAnNEJGQicsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZSAoR2FydWRhKS5cclxuICAgICdFNlMgRG93bmJ1cnN0IDInOiAnNEJGQycsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZSAoUmFrdGFwYWtzYSkuXHJcbiAgICAnRTZTIE1ldGVvciBTdHJpa2UnOiAnNEMwRicsIC8vIEZyb250YWwgYXZvaWRhYmxlIHRhbmsgYnVzdGVyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFNlMgSGFuZHMgb2YgSGVsbCc6ICc0QzBbQkNdJywgLy8gVGV0aGVyIGNoYXJnZVxyXG4gICAgJ0U2UyBIYW5kcyBvZiBGbGFtZSc6ICc0QzBBJywgLy8gRmlyc3QgVGFua2J1c3RlclxyXG4gICAgJ0U2UyBJbnN0YW50IEluY2luZXJhdGlvbic6ICc0QzBFJywgLy8gU2Vjb25kIFRhbmtidXN0ZXJcclxuICAgICdFNlMgQmxhemUnOiAnNEMxQicsIC8vIEZsYW1lIFRvcm5hZG8gQ2xlYXZlXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgJ0U2UyBBaXIgQnVtcCc6ICc0QkY5JyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuY29uc3Qgd3JvbmdCdWZmID0gKHN0cikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAod3JvbmcgYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGZhbHNjaGVyIEJ1ZmYpJyxcclxuICAgIGZyOiBzdHIgKyAnIChtYXV2YWlzIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjkuI3pganliIfjgarjg5Djg5UpJyxcclxuICAgIGNuOiBzdHIgKyAnIChCdWZm6ZSZ5LqGKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIO2LgOumvCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCBub0J1ZmYgPSAoc3RyKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyjrsoTtlIQg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlSWNvbm9jbGFzbSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTdOIFN0eWdpYW4gU3dvcmQnOiAnNEM1NScsIC8vIENpcmNsZSBncm91bmQgQW9FcyBhZnRlciBGYWxzZSBUd2lsaWdodFxyXG4gICAgJ0U3TiBTdHJlbmd0aCBJbiBOdW1iZXJzIERvbnV0JzogJzRDNEMnLCAvLyBMYXJnZSBkb251dCBncm91bmQgQW9FcywgaW50ZXJtaXNzaW9uXHJcbiAgICAnRTdOIFN0cmVuZ3RoIEluIE51bWJlcnMgMic6ICc0QzREJywgLy8gTGFyZ2UgY2lyY2xlIGdyb3VuZCBBb0VzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U3TiBTdHlnaWFuIFN0YWtlJzogJzRDMzMnLCAvLyBMYXNlciB0YW5rIGJ1c3Rlciwgb3V0c2lkZSBpbnRlcm1pc3Npb24gcGhhc2VcclxuICAgICdFNU4gU2lsdmVyIFNob3QnOiAnNEU3RCcsIC8vIFNwcmVhZCBtYXJrZXJzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIEFzdHJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIEFzdHJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gTGlnaHRcXCdzIENvdXJzZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiBbJzRDM0UnLCAnNEM0MCcsICc0QzIyJywgJzRDM0MnLCAnNEU2MyddLFxyXG4gICAgICBjb25kaXRpb246IChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc1VtYnJhbCB8fCAhZGF0YS5oYXNVbWJyYWxbZS50YXJnZXROYW1lXTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNBc3RyYWwgJiYgZGF0YS5oYXNBc3RyYWxbZS50YXJnZXROYW1lXSlcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogd3JvbmdCdWZmKGUuYWJpbGl0eU5hbWUpIH07XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiBub0J1ZmYoZS5hYmlsaXR5TmFtZSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIERhcmtzXFwncyBDb3Vyc2UnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogWyc0QzNEJywgJzRDMjMnLCAnNEM0MScsICc0QzQzJ10sXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzQXN0cmFsIHx8ICFkYXRhLmhhc0FzdHJhbFtlLnRhcmdldE5hbWVdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc1VtYnJhbCAmJiBkYXRhLmhhc1VtYnJhbFtlLnRhcmdldE5hbWVdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiB3cm9uZ0J1ZmYoZS5hYmlsaXR5TmFtZSkgfTtcclxuICAgICAgICAvLyBUaGlzIGNhc2UgaXMgcHJvYmFibHkgaW1wb3NzaWJsZSwgYXMgdGhlIGRlYnVmZiB0aWNrcyBhZnRlciBkZWF0aCxcclxuICAgICAgICAvLyBidXQgbGVhdmluZyBpdCBoZXJlIGluIGNhc2UgdGhlcmUncyBzb21lIHJleiBvciBkaXNjb25uZWN0IHRpbWluZ1xyXG4gICAgICAgIC8vIHRoYXQgY291bGQgbGVhZCB0byB0aGlzLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogbm9CdWZmKGUuYWJpbGl0eU5hbWUpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBtaXNzaW5nIGFuIG9yYiBkdXJpbmcgdG9ybmFkbyBwaGFzZVxyXG4vLyBUT0RPOiBqdW1waW5nIGluIHRoZSB0b3JuYWRvIGRhbWFnZT8/XHJcbi8vIFRPRE86IHRha2luZyBzdW5ncmFjZSg0QzgwKSBvciBtb29uZ3JhY2UoNEM4Mikgd2l0aCB3cm9uZyBkZWJ1ZmZcclxuLy8gVE9ETzogc3R5Z2lhbiBzcGVhci9zaWx2ZXIgc3BlYXIgd2l0aCB0aGUgd3JvbmcgZGVidWZmXHJcbi8vIFRPRE86IHRha2luZyBleHBsb3Npb24gZnJvbSB0aGUgd3JvbmcgQ2hpYXJvL1NjdXJvIG9yYlxyXG4vLyBUT0RPOiBoYW5kbGUgNEM4OSBTaWx2ZXIgU3Rha2UgdGFua2J1c3RlciAybmQgaGl0LCBhcyBpdCdzIG9rIHRvIGhhdmUgdHdvIGluLlxyXG5cclxuY29uc3Qgd3JvbmdCdWZmID0gKHN0cikgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAod3JvbmcgYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGZhbHNjaGVyIEJ1ZmYpJyxcclxuICAgIGZyOiBzdHIgKyAnIChtYXV2YWlzIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjkuI3pganliIfjgarjg5Djg5UpJyxcclxuICAgIGNuOiBzdHIgKyAnIChCdWZm6ZSZ5LqGKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIO2LgOumvCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCBub0J1ZmYgPSAoc3RyKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIOyXhuydjCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUljb25vY2xhc21TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U3UyBTaWx2ZXIgU3dvcmQnOiAnNEM4RScsIC8vIGdyb3VuZCBhb2VcclxuICAgICdFN1MgT3ZlcndoZWxtaW5nIEZvcmNlJzogJzRDNzMnLCAvLyBhZGQgcGhhc2UgZ3JvdW5kIGFvZVxyXG4gICAgJ0U3UyBTdHJlbmd0aCBpbiBOdW1iZXJzIDEnOiAnNEM3MCcsIC8vIGFkZCBnZXQgdW5kZXJcclxuICAgICdFN1MgU3RyZW5ndGggaW4gTnVtYmVycyAyJzogJzRDNzEnLCAvLyBhZGQgZ2V0IG91dFxyXG4gICAgJ0U3UyBQYXBlciBDdXQnOiAnNEM3RCcsIC8vIHRvcm5hZG8gZ3JvdW5kIGFvZXNcclxuICAgICdFN1MgQnVmZmV0JzogJzRDNzcnLCAvLyB0b3JuYWRvIGdyb3VuZCBhb2VzIGFsc28/P1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U3UyBCZXR3aXh0IFdvcmxkcyc6ICc0QzZCJywgLy8gcHVycGxlIGdyb3VuZCBsaW5lIGFvZXNcclxuICAgICdFN1MgQ3J1c2FkZSc6ICc0QzU4JywgLy8gYmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChzdGFuZGluZyBpbiBpdClcclxuICAgICdFN1MgRXhwbG9zaW9uJzogJzRDNkYnLCAvLyBkaWRuJ3Qga2lsbCBhbiBhZGRcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U3UyBTdHlnaWFuIFN0YWtlJzogJzRDMzQnLCAvLyBMYXNlciB0YW5rIGJ1c3RlciAxXHJcbiAgICAnRTdTIFNpbHZlciBTaG90JzogJzRDOTInLCAvLyBTcHJlYWQgbWFya2Vyc1xyXG4gICAgJ0U3UyBTaWx2ZXIgU2NvdXJnZSc6ICc0QzkzJywgLy8gSWNlIG1hcmtlcnNcclxuICAgICdFN1MgQ2hpYXJvIFNjdXJvIEV4cGxvc2lvbiAxJzogJzREMTQnLCAvLyBvcmIgZXhwbG9zaW9uXHJcbiAgICAnRTdTIENoaWFybyBTY3VybyBFeHBsb3Npb24gMic6ICc0RDE1JywgLy8gb3JiIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSW50ZXJydXB0XHJcbiAgICAgIGlkOiAnRTdTIEFkdmVudCBPZiBMaWdodCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRDNkUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVE9ETzogaXMgdGhpcyBibGFtZSBjb3JyZWN0PyBkb2VzIHRoaXMgaGF2ZSBhIHRhcmdldD9cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBBc3RyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbCA9IGRhdGEuaGFzQXN0cmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBBc3RyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbCA9IGRhdGEuaGFzQXN0cmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgVW1icmFsIEVmZmVjdCBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPSBkYXRhLmhhc1VtYnJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgVW1icmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPSBkYXRhLmhhc1VtYnJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIExpZ2h0XFwncyBDb3Vyc2UnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogWyc0QzYyJywgJzRDNjMnLCAnNEM2NCcsICc0QzVCJywgJzRDNUYnXSxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNVbWJyYWwgfHwgIWRhdGEuaGFzVW1icmFsW2UudGFyZ2V0TmFtZV07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChlLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEuaGFzQXN0cmFsICYmIGRhdGEuaGFzQXN0cmFsW2UudGFyZ2V0TmFtZV0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IHdyb25nQnVmZihlLmFiaWxpdHlOYW1lKSB9O1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogbm9CdWZmKGUuYWJpbGl0eU5hbWUpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBEYXJrc1xcJ3MgQ291cnNlJyxcclxuICAgICAgZGFtYWdlUmVnZXg6IFsnNEM2NScsICc0QzY2JywgJzRDNjcnLCAnNEM1QScsICc0QzYwJ10sXHJcbiAgICAgIGNvbmRpdGlvbjogKGUsIGRhdGEpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzQXN0cmFsIHx8ICFkYXRhLmhhc0FzdHJhbFtlLnRhcmdldE5hbWVdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc1VtYnJhbCAmJiBkYXRhLmhhc1VtYnJhbFtlLnRhcmdldE5hbWVdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiB3cm9uZ0J1ZmYoZS5hYmlsaXR5TmFtZSkgfTtcclxuICAgICAgICAvLyBUaGlzIGNhc2UgaXMgcHJvYmFibHkgaW1wb3NzaWJsZSwgYXMgdGhlIGRlYnVmZiB0aWNrcyBhZnRlciBkZWF0aCxcclxuICAgICAgICAvLyBidXQgbGVhdmluZyBpdCBoZXJlIGluIGNhc2UgdGhlcmUncyBzb21lIHJleiBvciBkaXNjb25uZWN0IHRpbWluZ1xyXG4gICAgICAgIC8vIHRoYXQgY291bGQgbGVhZCB0byB0aGlzLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogbm9CdWZmKGUuYWJpbGl0eU5hbWUpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBDcnVzYWRlIEtub2NrYmFjaycsXHJcbiAgICAgIC8vIDRDNzYgaXMgdGhlIGtub2NrYmFjayBkYW1hZ2UsIDRDNTggaXMgdGhlIGRhbWFnZSBmb3Igc3RhbmRpbmcgb24gdGhlIHB1Y2suXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNEM3NicsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlUmVmdWxnZW5jZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRThOIEJpdGluZyBGcm9zdCc6ICc0RERCJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgU2hpdmFcclxuICAgICdFOE4gRHJpdmluZyBGcm9zdCc6ICc0RERDJywgLy8gUmVhciBjb25lIEFvRSwgU2hpdmFcclxuICAgICdFOE4gRnJpZ2lkIFN0b25lJzogJzRFNjYnLCAvLyBTbWFsbCBzcHJlYWQgY2lyY2xlcywgcGhhc2UgMVxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgQXhlIEtpY2snOiAnNEUwMCcsIC8vIExhcmdlIGNpcmNsZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOE4gUmVmbGVjdGVkIFNjeXRoZSBLaWNrJzogJzRFMDEnLCAvLyBEb251dCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOE4gRnJpZ2lkIEVydXB0aW9uJzogJzRFMDknLCAvLyBTbWFsbCBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOE4gSWNpY2xlIEltcGFjdCc6ICc0RTBBJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThOIEF4ZSBLaWNrJzogJzRERTInLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBTY3l0aGUgS2ljayc6ICc0REUzJywgLy8gRG9udXQgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgQml0aW5nIEZyb3N0JzogJzRERkUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThOIFJlZmxlY3RlZCBEcml2aW5nIEZyb3N0JzogJzRERkYnLCAvLyBDb25lIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOE4gU2hpbmluZyBBcm1vcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc5NScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThOIEhlYXZlbmx5IFN0cmlrZScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNEREOCcsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBlLnRhcmdldE5hbWUsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc3Rvw59lbiEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67Cx65CoIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBGcm9zdCBBcm1vcicsXHJcbiAgICAgIC8vIFRoaW4gSWNlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEYnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ1NsaWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAncnVudGVyZ2VydXRzY2h0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSBnbGlzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+a7keOBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5ruR6JC9JyxcclxuICAgICAgICAgICAga286ICfrr7jrgYTrn6zsp5AhJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IHJ1c2ggaGl0dGluZyB0aGUgY3J5c3RhbFxyXG4vLyBUT0RPOiBhZGRzIG5vdCBiZWluZyBraWxsZWRcclxuLy8gVE9ETzogdGFraW5nIHRoZSBydXNoIHR3aWNlICh3aGVuIHlvdSBoYXZlIGRlYnVmZilcclxuLy8gVE9ETzogbm90IGhpdHRpbmcgdGhlIGRyYWdvbiBmb3VyIHRpbWVzIGR1cmluZyB3eXJtJ3MgbGFtZW50XHJcbi8vIFRPRE86IGRlYXRoIHJlYXNvbnMgZm9yIG5vdCBwaWNraW5nIHVwIHB1ZGRsZVxyXG4vLyBUT0RPOiBub3QgYmVpbmcgaW4gdGhlIHRvd2VyIHdoZW4geW91IHNob3VsZFxyXG4vLyBUT0RPOiBwaWNraW5nIHVwIHRvbyBtYW55IHN0YWNrc1xyXG5cclxuLy8gTm90ZTogQmFuaXNoIElJSSAoNERBOCkgYW5kIEJhbmlzaCBJaWkgRGl2aWRlZCAoNERBOSkgYm90aCBhcmUgdHlwZT0weDE2IGxpbmVzLlxyXG4vLyBUaGUgc2FtZSBpcyB0cnVlIGZvciBCYW5pc2ggKDREQTYpIGFuZCBCYW5pc2ggRGl2aWRlZCAoNERBNykuXHJcbi8vIEknbSBub3Qgc3VyZSB0aGlzIG1ha2VzIGFueSBzZW5zZT8gQnV0IGNhbid0IHRlbGwgaWYgdGhlIHNwcmVhZCB3YXMgYSBtaXN0YWtlIG9yIG5vdC5cclxuLy8gTWF5YmUgd2UgY291bGQgY2hlY2sgZm9yIFwiTWFnaWMgVnVsbmVyYWJpbGl0eSBVcFwiP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VSZWZ1bGdlbmNlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOFMgQml0aW5nIEZyb3N0JzogJzRENjYnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBEcml2aW5nIEZyb3N0JzogJzRENjcnLCAvLyBSZWFyIGNvbmUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBBeGUgS2ljayc6ICc0RDZEJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgU2hpdmFcclxuICAgICdFOFMgU2N5dGhlIEtpY2snOiAnNEQ2RScsIC8vIERvbnV0IEFvRSwgU2hpdmFcclxuICAgICdFOFMgUmVmbGVjdGVkIEF4ZSBLaWNrJzogJzREQjknLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBTY3l0aGUgS2ljayc6ICc0REJBJywgLy8gRG9udXQgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIEZyaWdpZCBFcnVwdGlvbic6ICc0RDlGJywgLy8gU21hbGwgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThTIEZyaWdpZCBOZWVkbGUnOiAnNEQ5RCcsIC8vIDgtd2F5IFwiZmxvd2VyXCIgZXhwbG9zaW9uXHJcbiAgICAnRThTIEljaWNsZSBJbXBhY3QnOiAnNERBMCcsIC8vIExhcmdlIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgQml0aW5nIEZyb3N0IDEnOiAnNERCNycsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIEJpdGluZyBGcm9zdCAyJzogJzREQzMnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBEcml2aW5nIEZyb3N0IDEnOiAnNERCOCcsIC8vIENvbmUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBEcml2aW5nIEZyb3N0IDInOiAnNERDNCcsIC8vIENvbmUgQW9FLCBGcm96ZW4gTWlycm9yXHJcblxyXG4gICAgJ0U4UyBIYWxsb3dlZCBXaW5ncyAxJzogJzRENzUnLCAvLyBMZWZ0IGNsZWF2ZVxyXG4gICAgJ0U4UyBIYWxsb3dlZCBXaW5ncyAyJzogJzRENzYnLCAvLyBSaWdodCBjbGVhdmVcclxuICAgICdFOFMgSGFsbG93ZWQgV2luZ3MgMyc6ICc0RDc3JywgLy8gS25vY2tiYWNrIGZyb250YWwgY2xlYXZlXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyAxJzogJzREOTAnLCAvLyBSZWZsZWN0ZWQgbGVmdCAyXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyAyJzogJzREQkInLCAvLyBSZWZsZWN0ZWQgbGVmdCAxXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyAzJzogJzREQzcnLCAvLyBSZWZsZWN0ZWQgcmlnaHQgMlxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgNCc6ICc0RDkxJywgLy8gUmVmbGVjdGVkIHJpZ2h0IDFcclxuICAgICdFOFMgVHdpbiBTdGlsbG5lc3MgMSc6ICc0RDY4JyxcclxuICAgICdFOFMgVHdpbiBTdGlsbG5lc3MgMic6ICc0RDZCJyxcclxuICAgICdFOFMgVHdpbiBTaWxlbmNlIDEnOiAnNEQ2OScsXHJcbiAgICAnRThTIFR3aW4gU2lsZW5jZSAyJzogJzRENkEnLFxyXG4gICAgJ0U4UyBBa2ggUmhhaSc6ICc0RDk5JyxcclxuICAgICdFOFMgRW1iaXR0ZXJlZCBEYW5jZSAxJzogJzRENzAnLFxyXG4gICAgJ0U4UyBFbWJpdHRlcmVkIERhbmNlIDInOiAnNEQ3MScsXHJcbiAgICAnRThTIFNwaXRlZnVsIERhbmNlIDEnOiAnNEQ2RicsXHJcbiAgICAnRThTIFNwaXRlZnVsIERhbmNlIDInOiAnNEQ3MicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyBCcm9rZW4gdGV0aGVyLlxyXG4gICAgJ0U4UyBSZWZ1bGdlbnQgRmF0ZSc6ICc0REE0JyxcclxuICAgIC8vIFNoYXJlZCBvcmIsIGNvcnJlY3QgaXMgQnJpZ2h0IFB1bHNlICg0RDk1KVxyXG4gICAgJ0U4UyBCbGluZGluZyBQdWxzZSc6ICc0RDk2JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0U4UyBQYXRoIG9mIExpZ2h0JzogJzREQTEnLCAvLyBQcm90ZWFuXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U4UyBTaGluaW5nIEFybW9yJyxcclxuICAgICAgLy8gU3R1blxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOTUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBJbnRlcnJ1cHRcclxuICAgICAgaWQ6ICdFOFMgU3RvbmVza2luJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEQ4NScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZVVtYnJhLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOU4gVGhlIEFydCBPZiBEYXJrbmVzcyAxJzogJzUyMjMnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5TiBUaGUgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTIyNCcsIC8vIGxlZnQtcmlnaHQgY2xlYXZlXHJcbiAgICAnRTlOIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1QUZGJywgLy8gZnJvbnRhbCBjbGVhdmUgdHV0b3JpYWwgbWVjaGFuaWNcclxuICAgICdFOU4gV2lkZS1BbmdsZSBQaGFzZXInOiAnNTVFMScsIC8vIHdpZGUtYW5nbGUgXCJzaWRlc1wiXHJcbiAgICAnRTlOIEJhZCBWaWJyYXRpb25zJzogJzU1RTYnLCAvLyB0ZXRoZXJlZCBvdXRzaWRlIGdpYW50IHRyZWUgZ3JvdW5kIGFvZXNcclxuICAgICdFOU4gRWFydGgtU2hhdHRlcmluZyBQYXJ0aWNsZSBCZWFtJzogJzUyMjUnLCAvLyBtaXNzaW5nIHRvd2Vycz9cclxuICAgICdFOU4gQW50aS1BaXIgUGFydGljbGUgQmVhbSc6ICc1NURDJywgLy8gXCJnZXQgb3V0XCIgZHVyaW5nIHBhbmVsc1xyXG4gICAgJ0U5TiBaZXJvLUZvcm0gUGFydGljbGUgQmVhbSAyJzogJzU1REInLCAvLyBDbG9uZSBsaW5lIGFvZXMgdy8gQW50aS1BaXIgUGFydGljbGUgQmVhbVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U5TiBXaXRoZHJhdyc6ICc1NTM0JywgLy8gU2xvdyB0byBicmVhayBzZWVkIGNoYWluLCBnZXQgc3Vja2VkIGJhY2sgaW4geWlrZXNcclxuICAgICdFOU4gQWV0aGVyb3N5bnRoZXNpcyc6ICc1NTM1JywgLy8gU3RhbmRpbmcgb24gc2VlZHMgZHVyaW5nIGV4cGxvc2lvbiAocG9zc2libHkgdmlhIFdpdGhkcmF3KVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTlOIFplcm8tRm9ybSBQYXJ0aWNsZSBCZWFtIDEnOiAnNTVFQicsIC8vIHRhbmsgbGFzZXIgd2l0aCBtYXJrZXJcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRPRE86IDU2MUQgRXZpbCBTZWVkIGhpdHMgZXZlcnlvbmUsIGhhcmQgdG8ga25vdyBpZiB0aGVyZSdzIGEgZG91YmxlIHRhcFxyXG4vLyBUT0RPOiBmYWxsaW5nIHRocm91Z2ggcGFuZWwganVzdCBkb2VzIGRhbWFnZSB3aXRoIG5vIGFiaWxpdHkgbmFtZSwgbGlrZSBhIGRlYXRoIHdhbGxcclxuLy8gVE9ETzogd2hhdCBoYXBwZW5zIGlmIHlvdSBqdW1wIGluIHNlZWQgdGhvcm5zP1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZVVtYnJhU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOVMgQmFkIFZpYnJhdGlvbnMnOiAnNTYxQycsIC8vIHRldGhlcmVkIG91dHNpZGUgZ2lhbnQgdHJlZSBncm91bmQgYW9lc1xyXG4gICAgJ0U5UyBXaWRlLUFuZ2xlIFBhcnRpY2xlIEJlYW0nOiAnNUIwMCcsIC8vIGFudGktYWlyIFwic2lkZXNcIlxyXG4gICAgJ0U5UyBXaWRlLUFuZ2xlIFBoYXNlciBVbmxpbWl0ZWQnOiAnNTYwRScsIC8vIHdpZGUtYW5nbGUgXCJzaWRlc1wiXHJcbiAgICAnRTlTIEFudGktQWlyIFBhcnRpY2xlIEJlYW0nOiAnNUIwMScsIC8vIHdpZGUtYW5nbGUgXCJvdXRcIlxyXG4gICAgJ0U5UyBUaGUgU2Vjb25kIEFydCBPZiBEYXJrbmVzcyAxJzogJzU2MDEnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgU2Vjb25kIEFydCBPZiBEYXJrbmVzcyAyJzogJzU2MDInLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIDEnOiAnNUE5NScsIC8vIGJvc3MgbGVmdC1yaWdodCBzdW1tb24vcGFuZWwgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgMic6ICc1QTk2JywgLy8gYm9zcyBsZWZ0LXJpZ2h0IHN1bW1vbi9wYW5lbCBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyBDbG9uZSAxJzogJzU2MUUnLCAvLyBjbG9uZSBsZWZ0LXJpZ2h0IHN1bW1vbiBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyBDbG9uZSAyJzogJzU2MUYnLCAvLyBjbG9uZSBsZWZ0LXJpZ2h0IHN1bW1vbiBjbGVhdmVcclxuICAgICdFOVMgVGhlIFRoaXJkIEFydCBPZiBEYXJrbmVzcyAxJzogJzU2MDMnLCAvLyB0aGlyZCBhcnQgbGVmdC1yaWdodCBjbGVhdmUgaW5pdGlhbFxyXG4gICAgJ0U5UyBUaGUgVGhpcmQgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTYwNCcsIC8vIHRoaXJkIGFydCBsZWZ0LXJpZ2h0IGNsZWF2ZSBpbml0aWFsXHJcbiAgICAnRTlTIEFydCBPZiBEYXJrbmVzcyc6ICc1NjA2JywgLy8gdGhpcmQgYXJ0IGxlZnQtcmlnaHQgY2xlYXZlIGZpbmFsXHJcbiAgICAnRTlTIEZ1bGwtUGVyaW1pdGVyIFBhcnRpY2xlIEJlYW0nOiAnNTYyOScsIC8vIHBhbmVsIFwiZ2V0IGluXCJcclxuICAgICdFOVMgRGFyayBDaGFpbnMnOiAnNUZBQycsIC8vIFNsb3cgdG8gYnJlYWsgcGFydG5lciBjaGFpbnNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFOVMgV2l0aGRyYXcnOiAnNTYxQScsIC8vIFNsb3cgdG8gYnJlYWsgc2VlZCBjaGFpbiwgZ2V0IHN1Y2tlZCBiYWNrIGluIHlpa2VzXHJcbiAgICAnRTlTIEFldGhlcm9zeW50aGVzaXMnOiAnNTYxQicsIC8vIFN0YW5kaW5nIG9uIHNlZWRzIGR1cmluZyBleHBsb3Npb24gKHBvc3NpYmx5IHZpYSBXaXRoZHJhdylcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U5UyBIeXBlci1Gb2N1c2VkIFBhcnRpY2xlIEJlYW0nOiAnNTVGRCcsIC8vIEFydCBPZiBEYXJrbmVzcyBwcm90ZWFuXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFOVMgQ29uZGVuc2VkIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1NjEwJywgLy8gd2lkZS1hbmdsZSBcInRhbmsgbGFzZXJcIlxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnRTlTIFN0eWdpYW4gVGVuZHJpbHMnOiAnOTUyJywgLy8gc3RhbmRpbmcgaW4gdGhlIGJyYW1ibGVzXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ0U5UyBNdWx0aS1Qcm9uZ2VkIFBhcnRpY2xlIEJlYW0nOiAnNTYwMCcsIC8vIEFydCBPZiBEYXJrbmVzcyBQYXJ0bmVyIFN0YWNrXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBBbnRpLWFpciBcInRhbmsgc3ByZWFkXCIuICBUaGlzIGNhbiBiZSBzdGFja2VkIGJ5IHR3byB0YW5rcyBpbnZ1bG5pbmcuXHJcbiAgICAgIC8vIE5vdGU6IHRoaXMgd2lsbCBzdGlsbCBzaG93IHNvbWV0aGluZyBmb3IgaG9sbWdhbmcvbGl2aW5nLCBidXRcclxuICAgICAgLy8gYXJndWFibHkgYSBoZWFsZXIgbWlnaHQgbmVlZCB0byBkbyBzb21ldGhpbmcgYWJvdXQgdGhhdCwgc28gbWF5YmVcclxuICAgICAgLy8gaXQncyBvayB0byBzdGlsbCBzaG93IGFzIGEgd2FybmluZz8/XHJcbiAgICAgIGlkOiAnRTlTIENvbmRlbnNlZCBBbnRpLUFpciBQYXJ0aWNsZSBCZWFtJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc1NjE1JyxcclxuICAgICAgY29uZGl0aW9uOiAoZSkgPT4gZS50eXBlICE9PSAnMTUnICYmIGUuZGFtYWdlID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEFudGktYWlyIFwib3V0XCIuICBUaGlzIGNhbiBiZSBpbnZ1bG5lZCBieSBhIHRhbmsgYWxvbmcgd2l0aCB0aGUgc3ByZWFkIGFib3ZlLlxyXG4gICAgICBpZDogJ0U5UyBBbnRpLUFpciBQaGFzZXIgVW5saW1pdGVkJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc1NjEyJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSkgPT4gZS5kYW1hZ2UgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VMaXRhbnksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxME4gRm9yd2FyZCBJbXBsb3Npb24nOiAnNTZCNCcsIC8vIGhvd2wgYm9zcyBpbXBsb3Npb25cclxuICAgICdFMTBOIEZvcndhcmQgU2hhZG93IEltcGxvc2lvbic6ICc1NkI1JywgLy8gaG93bCBzaGFkb3cgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBCYWNrd2FyZCBJbXBsb3Npb24nOiAnNTZCNycsIC8vIHRhaWwgYm9zcyBpbXBsb3Npb25cclxuICAgICdFMTBOIEJhY2t3YXJkIFNoYWRvdyBJbXBsb3Npb24nOiAnNTZCOCcsIC8vIHRhaWwgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxME4gQmFyYnMgT2YgQWdvbnkgMSc6ICc1NkQ5JywgLy8gU2hhZG93IFdhcnJpb3IgMyBkb2cgcm9vbSBjbGVhdmVcclxuICAgICdFMTBOIEJhcmJzIE9mIEFnb255IDInOiAnNUIyNicsIC8vIFNoYWRvdyBXYXJyaW9yIDMgZG9nIHJvb20gY2xlYXZlXHJcbiAgICAnRTEwTiBDbG9hayBPZiBTaGFkb3dzJzogJzVCMTEnLCAvLyBub24tc3F1aWdnbHkgbGluZSBleHBsb3Npb25zXHJcbiAgICAnRTEwTiBUaHJvbmUgT2YgU2hhZG93JzogJzU2QzcnLCAvLyBzdGFuZGluZyB1cCBnZXQgb3V0XHJcbiAgICAnRTEwTiBSaWdodCBHaWdhIFNsYXNoJzogJzU2QUUnLCAvLyBib3NzIHJpZ2h0IGdpZ2Egc2xhc2hcclxuICAgICdFMTBOIFJpZ2h0IFNoYWRvdyBTbGFzaCc6ICc1NkFGJywgLy8gZ2lnYSBzbGFzaCBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxME4gTGVmdCBHaWdhIFNsYXNoJzogJzU2QjEnLCAvLyBib3NzIGxlZnQgZ2lnYSBzbGFzaFxyXG4gICAgJ0UxME4gTGVmdCBTaGFkb3cgU2xhc2gnOiAnNTZCRCcsIC8vIGdpZ2Egc2xhc2ggZnJvbSBzaGFkb3dcclxuICAgICdFMTBOIFNoYWRvd3kgRXJ1cHRpb24nOiAnNTZFMScsIC8vIGJhaXRlZCBncm91bmQgYW9lIG1hcmtlcnMgcGFpcmVkIHdpdGggYmFyYnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxME4gU2hhZG93XFwncyBFZGdlJzogJzU2REInLCAvLyBUYW5rYnVzdGVyIHNpbmdsZSB0YXJnZXQgZm9sbG93dXBcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogaGl0dGluZyBzaGFkb3cgb2YgdGhlIGhlcm8gd2l0aCBhYmlsaXRpZXMgY2FuIGNhdXNlIHlvdSB0byB0YWtlIGRhbWFnZSwgbGlzdCB0aG9zZT9cclxuLy8gICAgICAgZS5nLiBwaWNraW5nIHVwIHlvdXIgZmlyc3QgcGl0Y2ggYm9nIHB1ZGRsZSB3aWxsIGNhdXNlIHlvdSB0byBkaWUgdG8gdGhlIGRhbWFnZVxyXG4vLyAgICAgICB5b3VyIHNoYWRvdyB0YWtlcyBmcm9tIERlZXBzaGFkb3cgTm92YSBvciBEaXN0YW50IFNjcmVhbS5cclxuLy8gVE9ETzogNTczQiBCbGlnaHRpbmcgQmxpdHogaXNzdWVzIGR1cmluZyBsaW1pdCBjdXQgbnVtYmVyc1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUxpdGFueVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEwUyBJbXBsb3Npb24gU2luZ2xlIDEnOiAnNTZGMicsIC8vIHNpbmdsZSB0YWlsIHVwIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBTIEltcGxvc2lvbiBTaW5nbGUgMic6ICc1NkVGJywgLy8gc2luZ2xlIGhvd2wgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFF1YWRydXBsZSAxJzogJzU2RUYnLCAvLyBxdWFkcnVwbGUgc2V0IG9mIHNoYWRvdyBpbXBsb3Npb25zXHJcbiAgICAnRTEwUyBJbXBsb3Npb24gUXVhZHJ1cGxlIDInOiAnNTZGMicsIC8vIHF1YWRydXBsZSBzZXQgb2Ygc2hhZG93IGltcGxvc2lvbnNcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggU2luZ2xlIDEnOiAnNTZFQycsIC8vIEdpZ2Egc2xhc2ggc2luZ2xlIGZyb20gc2hhZG93XHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFNpbmdsZSAyJzogJzU2RUQnLCAvLyBHaWdhIHNsYXNoIHNpbmdsZSBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBCb3ggMSc6ICc1NzA5JywgLy8gR2lnYSBzbGFzaCBib3ggZnJvbSBmb3VyIGdyb3VuZCBzaGFkb3dzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIEJveCAyJzogJzU3MEQnLCAvLyBHaWdhIHNsYXNoIGJveCBmcm9tIGZvdXIgZ3JvdW5kIHNoYWRvd3NcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggUXVhZHJ1cGxlIDEnOiAnNTZFQycsIC8vIHF1YWRydXBsZSBzZXQgb2YgZ2lnYSBzbGFzaCBjbGVhdmVzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFF1YWRydXBsZSAyJzogJzU2RTknLCAvLyBxdWFkcnVwbGUgc2V0IG9mIGdpZ2Egc2xhc2ggY2xlYXZlc1xyXG4gICAgJ0UxMFMgQ2xvYWsgT2YgU2hhZG93cyAxJzogJzVCMTMnLCAvLyBpbml0aWFsIG5vbi1zcXVpZ2dseSBsaW5lIGV4cGxvc2lvbnNcclxuICAgICdFMTBTIENsb2FrIE9mIFNoYWRvd3MgMic6ICc1QjE0JywgLy8gc2Vjb25kIHNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxMFMgVGhyb25lIE9mIFNoYWRvdyc6ICc1NzE3JywgLy8gc3RhbmRpbmcgdXAgZ2V0IG91dFxyXG4gICAgJ0UxMFMgU2hhZG93eSBFcnVwdGlvbic6ICc1NzM4JywgLy8gYmFpdGVkIGdyb3VuZCBhb2UgZHVyaW5nIGFtcGxpZmllclxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMFMgU3dhdGggT2YgU2lsZW5jZSAxJzogJzU3MUEnLCAvLyBTaGFkb3cgY2xvbmUgY2xlYXZlICh0b28gY2xvc2UpXHJcbiAgICAnRTEwUyBTd2F0aCBPZiBTaWxlbmNlIDInOiAnNUJCRicsIC8vIFNoYWRvdyBjbG9uZSBjbGVhdmUgKHRpbWVkKVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEwUyBTaGFkZWZpcmUnOiAnNTczMicsIC8vIHB1cnBsZSB0YW5rIHVtYnJhbCBvcmJzXHJcbiAgICAnRTEwUyBQaXRjaCBCb2cnOiAnNTcyMicsIC8vIG1hcmtlciBzcHJlYWQgdGhhdCBkcm9wcyBhIHNoYWRvdyBwdWRkbGVcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMFMgU2hhZG93XFwncyBFZGdlJzogJzU3MjUnLCAvLyBUYW5rYnVzdGVyIHNpbmdsZSB0YXJnZXQgZm9sbG93dXBcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEwUyBEYW1hZ2UgRG93biBPcmJzJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdGbGFtZXNoYWRvdycsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NjaGF0dGVuZmxhbW1lJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnRmxhbW1lIG9tYnJhbGUnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICfjgrfjg6Pjg4njgqbjg5Xjg6zjgqTjg6AnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZGFtYWdlJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBgJHttYXRjaGVzLmVmZmVjdH0gKHBhcnRpYWwgc3RhY2spYCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTBTIERhbWFnZSBEb3duIEJvc3MnLFxyXG4gICAgICAvLyBTaGFja2xlcyBiZWluZyBtZXNzZWQgdXAgYXBwZWFyIHRvIGp1c3QgZ2l2ZSB0aGUgRGFtYWdlIERvd24sIHdpdGggbm90aGluZyBlbHNlLlxyXG4gICAgICAvLyBNZXNzaW5nIHVwIHRvd2VycyBpcyB0aGUgVGhyaWNlLUNvbWUgUnVpbiBlZmZlY3QgKDlFMiksIGJ1dCBhbHNvIERhbWFnZSBEb3duLlxyXG4gICAgICAvLyBUT0RPOiBzb21lIG9mIHRoZXNlIHdpbGwgYmUgZHVwbGljYXRlZCB3aXRoIG90aGVycywgbGlrZSBgRTEwUyBUaHJvbmUgT2YgU2hhZG93YC5cclxuICAgICAgLy8gTWF5YmUgaXQnZCBiZSBuaWNlIHRvIGZpZ3VyZSBvdXQgaG93IHRvIHB1dCB0aGUgZGFtYWdlIG1hcmtlciBvbiB0aGF0P1xyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NoYWRvd2tlZXBlcicsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NjaGF0dGVua8O2bmlnJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnUm9pIERlIExcXCdPbWJyZScsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ+W9seOBrueOiycsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdkYW1hZ2UnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IGAke21hdGNoZXMuZWZmZWN0fWAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFNoYWRvdyBXYXJyaW9yIDQgZG9nIHJvb20gY2xlYXZlXHJcbiAgICAgIC8vIFRoaXMgY2FuIGJlIG1pdGlnYXRlZCBieSB0aGUgd2hvbGUgZ3JvdXAsIHNvIGFkZCBhIGRhbWFnZSBjb25kaXRpb24uXHJcbiAgICAgIGlkOiAnRTEwUyBCYXJicyBPZiBBZ29ueScsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiBbJzU3MkEnLCAnNUIyNyddLFxyXG4gICAgICBjb25kaXRpb246IChlKSA9PiBlLmRhbWFnZSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlQW5hbW9ycGhvc2lzLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTFOIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTYyRScsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjJDJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFOIEJ1cm50IFN0cmlrZSBIb2x5JzogJzU2MzAnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gQnVybm91dCc6ICc1NjJGJywgLy8gQnVybnQgU3RyaWtlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFOIFNoaW5pbmcgQmxhZGUnOiAnNTYzMScsIC8vIEJhaXRlZCBleHBsb3Npb25cclxuICAgICdFMTFOIEhhbG8gT2YgRmxhbWUgQnJpZ2h0ZmlyZSc6ICc1NjNCJywgLy8gUmVkIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExTiBIYWxvIE9mIExldmluIEJyaWdodGZpcmUnOiAnNTYzQycsIC8vIEJsdWUgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFOIFJlc291bmRpbmcgQ3JhY2snOiAnNTY0RCcsIC8vIERlbWktR3VrdW1hdHogMjcwIGRlZ3JlZSBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjQ1JywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2NDMnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybm91dCc6ICc1NjQ2JywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMU4gQmxhc3RpbmcgWm9uZSc6ICc1NjNFJywgLy8gUHJpc21hdGljIERlY2VwdGlvbiBjaGFyZ2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTFOIEJ1cm4gTWFyayc6ICc1NjRGJywgLy8gUG93ZGVyIE1hcmsgZGVidWZmIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTFOIEJsYXN0YnVybiBLbm9ja2VkIE9mZicsXHJcbiAgICAgIC8vIDU2MkQgPSBCdXJudCBTdHJpa2UgZmlyZSBmb2xsb3d1cCBkdXJpbmcgbW9zdCBvZiB0aGUgZmlnaHRcclxuICAgICAgLy8gNTY0NCA9IHNhbWUgdGhpbmcsIGJ1dCBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU2MkQnLCAnNTY0NCddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyA1NjVBLzU2OEQgU2luc21va2UgQm91bmQgT2YgRmFpdGggc2hhcmVcclxuLy8gNTY1RS81Njk5IEJvd3Nob2NrIGhpdHMgdGFyZ2V0IG9mIDU2NUQgKHR3aWNlKSBhbmQgdHdvIG90aGVyc1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUFuYW1vcnBob3Npc1NhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjUyJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY1NCcsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgSG9seSc6ICc1NjU2JywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIFNoaW5pbmcgQmxhZGUnOiAnNTY1NycsIC8vIEJhaXRlZCBleHBsb3Npb25cclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBDeWNsZSBGaXJlJzogJzU2OEUnLCAvLyBMaW5lIGNsZWF2ZSBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBDeWNsZSBMaWdodG5pbmcnOiAnNTY5NScsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIEhvbHknOiAnNTY5RCcsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgU2hpbmluZyBCbGFkZSBDeWNsZSc6ICc1NjlFJywgLy8gQmFpdGVkIGV4cGxvc2lvbiBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIEhhbG8gT2YgRmxhbWUgQnJpZ2h0ZmlyZSc6ICc1NjZEJywgLy8gUmVkIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBIYWxvIE9mIExldmluIEJyaWdodGZpcmUnOiAnNTY2QycsIC8vIEJsdWUgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFBvcnRhbCBPZiBGbGFtZSBCcmlnaHQgUHVsc2UnOiAnNTY3MScsIC8vIFJlZCBjYXJkIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFBvcnRhbCBPZiBMZXZpbiBCcmlnaHQgUHVsc2UnOiAnNTY3MCcsIC8vIEJsdWUgY2FyZCBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBSZXNvbmFudCBXaW5kcyc6ICc1Njg5JywgLy8gRGVtaS1HdWt1bWF0eiBcImdldCBpblwiXHJcbiAgICAnRTExUyBSZXNvdW5kaW5nIENyYWNrJzogJzU2ODgnLCAvLyBEZW1pLUd1a3VtYXR6IDI3MCBkZWdyZWUgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFMTFTIEltYWdlIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY3QicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJub3V0JzogJzU2N0MnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgRmlyZSc6ICc1Njc5JywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBIb2x5JzogJzU2N0InLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgU2hpbmluZyBCbGFkZSc6ICc1NjdFJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgYmFpdGVkIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMVMgQnVybm91dCc6ICc1NjU1JywgLy8gQnVybnQgU3RyaWtlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFTIEJ1cm5vdXQgQ3ljbGUnOiAnNTY5NicsIC8vIEJ1cm50IFN0cmlrZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExUyBCbGFzdGluZyBab25lJzogJzU2NzQnLCAvLyBQcmlzbWF0aWMgRGVjZXB0aW9uIGNoYXJnZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMVMgRWxlbWVudGFsIEJyZWFrJzogJzU2NjQnLCAvLyBFbGVtZW50YWwgQnJlYWsgcHJvdGVhblxyXG4gICAgJ0UxMVMgRWxlbWVudGFsIEJyZWFrIEN5Y2xlJzogJzU2OEMnLCAvLyBFbGVtZW50YWwgQnJlYWsgcHJvdGVhbiBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIFNpbnNtaXRlJzogJzU2NjcnLCAvLyBMaWdodG5pbmcgRWxlbWVudGFsIEJyZWFrIHNwcmVhZFxyXG4gICAgJ0UxMVMgU2luc21pdGUgQ3ljbGUnOiAnNTY5NCcsIC8vIExpZ2h0bmluZyBFbGVtZW50YWwgQnJlYWsgc3ByZWFkIGR1cmluZyBDeWNsZVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTExUyBCdXJuIE1hcmsnOiAnNTZBMycsIC8vIFBvd2RlciBNYXJrIGRlYnVmZiBleHBsb3Npb25cclxuICAgICdFMTFTIFNpbnNpZ2h0IDEnOiAnNTY2MScsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyXHJcbiAgICAnRTExUyBTaW5zaWdodCAyJzogJzVCQzcnLCAvLyBIb2x5IEJvdW5kIE9mIEZhaXRoIHRldGhlciBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICdFMTFTIFNpbnNpZ2h0IDMnOiAnNTZBMCcsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyIGR1cmluZyBDeWNsZVxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgICdFMTFTIEhvbHkgU2luc2lnaHQgR3JvdXAgU2hhcmUnOiAnNTY2OScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMVMgQmxhc3RidXJuIEtub2NrZWQgT2ZmJyxcclxuICAgICAgLy8gNTY1MyA9IEJ1cm50IFN0cmlrZSBmaXJlIGZvbGxvd3VwIGR1cmluZyBtb3N0IG9mIHRoZSBmaWdodFxyXG4gICAgICAvLyA1NjdBID0gc2FtZSB0aGluZywgYnV0IGZyb20gRmF0ZWJyZWFrZXIncyBJbWFnZVxyXG4gICAgICAvLyA1NjhGID0gc2FtZSB0aGluZywgYnV0IGR1cmluZyBDeWNsZSBvZiBGYWl0aFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTY1MycsICc1NjdBJywgJzU2OEYnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VFdGVybml0eSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEyTiBKdWRnbWVudCBKb2x0IFNpbmdsZSc6ICc1ODVGJywgLy8gUmFtdWggZ2V0IG91dCBjYXN0XHJcbiAgICAnRTEyTiBKdWRnbWVudCBKb2x0JzogJzRFMzAnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3RcclxuICAgICdFMTJOIFRlbXBvcmFyeSBDdXJyZW50IFNpbmdsZSc6ICc1ODVDJywgLy8gTGV2aSBnZXQgdW5kZXIgY2FzdFxyXG4gICAgJ0UxMk4gVGVtcG9yYXJ5IEN1cnJlbnQnOiAnNEUyRCcsIC8vIExldmkgZ2V0IHVuZGVyIGNhc3RcclxuICAgICdFMTJOIENvbmZsYWcgU3RyaWtlIFNpbmdsZSc6ICc1ODVEJywgLy8gSWZyaXQgZ2V0IHNpZGVzIGNhc3RcclxuICAgICdFMTJOIENvbmZsYWcgU3RyaWtlJzogJzRFMkUnLCAvLyBJZnJpdCBnZXQgc2lkZXMgY2FzdFxyXG4gICAgJ0UxMk4gRmVyb3N0b3JtIFNpbmdsZSc6ICc1ODVFJywgLy8gR2FydWRhIGdldCBpbnRlcmNhcmRpbmFscyBjYXN0XHJcbiAgICAnRTEyTiBGZXJvc3Rvcm0nOiAnNEUyRicsIC8vIEdhcnVkYSBnZXQgaW50ZXJjYXJkaW5hbHMgY2FzdFxyXG4gICAgJ0UxMk4gUmFwdHVyb3VzIFJlYWNoIDEnOiAnNTg3OCcsIC8vIEhhaXJjdXRcclxuICAgICdFMTJOIFJhcHR1cm91cyBSZWFjaCAyJzogJzU4NzcnLCAvLyBIYWlyY3V0XHJcbiAgICAnRTEyTiBCb21iIEV4cGxvc2lvbic6ICc1ODZEJywgLy8gU21hbGwgYm9tYiBleHBsb3Npb25cclxuICAgICdFMTJOIFRpdGFuaWMgQm9tYiBFeHBsb3Npb24nOiAnNTg2RicsIC8vIExhcmdlIGJvbWIgZXhwbG9zaW9uXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTJOIEVhcnRoc2hha2VyJzogJzU4ODUnLCAvLyBFYXJ0aHNoYWtlciBvbiBmaXJzdCBwbGF0Zm9ybVxyXG4gICAgJ0UxMk4gUHJvbWlzZSBGcmlnaWQgU3RvbmUgMSc6ICc1ODY3JywgLy8gU2hpdmEgc3ByZWFkIHdpdGggc2xpZGluZ1xyXG4gICAgJ0UxMk4gUHJvbWlzZSBGcmlnaWQgU3RvbmUgMic6ICc1ODY5JywgLy8gU2hpdmEgc3ByZWFkIHdpdGggUmFwdHVyb3VzIFJlYWNoXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgT3V0cHV0cyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvb3V0cHV0cyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogYWRkIHNlcGFyYXRlIGRhbWFnZVdhcm4tZXNxdWUgaWNvbiBmb3IgZGFtYWdlIGRvd25zP1xyXG4vLyBUT0RPOiA1OEE2IFVuZGVyIFRoZSBXZWlnaHQgLyA1OEIyIENsYXNzaWNhbCBTY3VscHR1cmUgbWlzc2luZyBzb21lYm9keSBpbiBwYXJ0eSB3YXJuaW5nP1xyXG4vLyBUT0RPOiA1OENBIERhcmsgV2F0ZXIgSUlJIC8gNThDNSBTaGVsbCBDcnVzaGVyIHNob3VsZCBoaXQgZXZlcnlvbmUgaW4gcGFydHlcclxuLy8gVE9ETzogRGFyayBBZXJvIElJSSA1OEQ0IHNob3VsZCBub3QgYmUgYSBzaGFyZSBleGNlcHQgb24gYWR2YW5jZWQgcmVsYXRpdml0eSBmb3IgZG91YmxlIGFlcm8uXHJcbi8vIChmb3IgZ2FpbnMgZWZmZWN0LCBzaW5nbGUgYWVybyA9IH4yMyBzZWNvbmRzLCBkb3VibGUgYWVybyA9IH4zMSBzZWNvbmRzIGR1cmF0aW9uKVxyXG5cclxuLy8gRHVlIHRvIGNoYW5nZXMgaW50cm9kdWNlZCBpbiBwYXRjaCA1LjIsIG92ZXJoZWFkIG1hcmtlcnMgbm93IGhhdmUgYSByYW5kb20gb2Zmc2V0XHJcbi8vIGFkZGVkIHRvIHRoZWlyIElELiBUaGlzIG9mZnNldCBjdXJyZW50bHkgYXBwZWFycyB0byBiZSBzZXQgcGVyIGluc3RhbmNlLCBzb1xyXG4vLyB3ZSBjYW4gZGV0ZXJtaW5lIHdoYXQgaXQgaXMgZnJvbSB0aGUgZmlyc3Qgb3ZlcmhlYWQgbWFya2VyIHdlIHNlZS5cclxuLy8gVGhlIGZpcnN0IDFCIG1hcmtlciBpbiB0aGUgZW5jb3VudGVyIGlzIHRoZSBmb3JtbGVzcyB0YW5rYnVzdGVyLCBJRCAwMDRGLlxyXG5jb25zdCBmaXJzdEhlYWRtYXJrZXIgPSBwYXJzZUludCgnMDBEQScsIDE2KTtcclxuY29uc3QgZ2V0SGVhZG1hcmtlcklkID0gKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAvLyBJZiB3ZSBuYWl2ZWx5IGp1c3QgY2hlY2sgIWRhdGEuZGVjT2Zmc2V0IGFuZCBsZWF2ZSBpdCwgaXQgYnJlYWtzIGlmIHRoZSBmaXJzdCBtYXJrZXIgaXMgMDBEQS5cclxuICAvLyAoVGhpcyBtYWtlcyB0aGUgb2Zmc2V0IDAsIGFuZCAhMCBpcyB0cnVlLilcclxuICBpZiAodHlwZW9mIGRhdGEuZGVjT2Zmc2V0ID09PSAndW5kZWZpbmVkJylcclxuICAgIGRhdGEuZGVjT2Zmc2V0ID0gcGFyc2VJbnQobWF0Y2hlcy5pZCwgMTYpIC0gZmlyc3RIZWFkbWFya2VyO1xyXG4gIC8vIFRoZSBsZWFkaW5nIHplcm9lcyBhcmUgc3RyaXBwZWQgd2hlbiBjb252ZXJ0aW5nIGJhY2sgdG8gc3RyaW5nLCBzbyB3ZSByZS1hZGQgdGhlbSBoZXJlLlxyXG4gIC8vIEZvcnR1bmF0ZWx5LCB3ZSBkb24ndCBoYXZlIHRvIHdvcnJ5IGFib3V0IHdoZXRoZXIgb3Igbm90IHRoaXMgaXMgcm9idXN0LFxyXG4gIC8vIHNpbmNlIHdlIGtub3cgYWxsIHRoZSBJRHMgdGhhdCB3aWxsIGJlIHByZXNlbnQgaW4gdGhlIGVuY291bnRlci5cclxuICByZXR1cm4gKHBhcnNlSW50KG1hdGNoZXMuaWQsIDE2KSAtIGRhdGEuZGVjT2Zmc2V0KS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKS5wYWRTdGFydCg0LCAnMCcpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUV0ZXJuaXR5U2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTJTIFByb21pc2UgUmFwdHVyb3VzIFJlYWNoIExlZnQnOiAnNThBRCcsIC8vIEhhaXJjdXQgd2l0aCBsZWZ0IHNhZmUgc2lkZVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBSYXB0dXJvdXMgUmVhY2ggUmlnaHQnOiAnNThBRScsIC8vIEhhaXJjdXQgd2l0aCByaWdodCBzYWZlIHNpZGVcclxuICAgICdFMTJTIFByb21pc2UgVGVtcG9yYXJ5IEN1cnJlbnQnOiAnNEU0NCcsIC8vIExldmkgZ2V0IHVuZGVyIGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBDb25mbGFnIFN0cmlrZSc6ICc0RTQ1JywgLy8gSWZyaXQgZ2V0IHNpZGVzIGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBGZXJvc3Rvcm0nOiAnNEU0NicsIC8vIEdhcnVkYSBnZXQgaW50ZXJjYXJkaW5hbHMgY2FzdCAoZGFtYWdlIGRvd24pXHJcbiAgICAnRTEyUyBQcm9taXNlIEp1ZGdtZW50IEpvbHQnOiAnNEU0NycsIC8vIFJhbXVoIGdldCBvdXQgY2FzdCAoZGFtYWdlIGRvd24pXHJcbiAgICAnRTEyUyBQcm9taXNlIFNoYXR0ZXInOiAnNTg5QycsIC8vIEljZSBQaWxsYXIgZXhwbG9zaW9uIGlmIHRldGhlciBub3QgZ290dGVuXHJcbiAgICAnRTEyUyBQcm9taXNlIEltcGFjdCc6ICc1OEExJywgLy8gVGl0YW4gYm9tYiBkcm9wXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFyayBCbGl6emFyZCBJSUknOiAnNThEMycsIC8vIFJlbGF0aXZpdHkgZG9udXQgbWVjaGFuaWNcclxuICAgICdFMTJTIE9yYWNsZSBBcG9jYWx5cHNlJzogJzU4RTYnLCAvLyBMaWdodCB1cCBjaXJjbGUgZXhwbG9zaW9ucyAoZGFtYWdlIGRvd24pXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTEyUyBPcmFjbGUgTWFlbHN0cm9tJzogJzU4REEnLCAvLyBBZHZhbmNlZCBSZWxhdGl2aXR5IHRyYWZmaWMgbGlnaHQgYW9lXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTJTIFByb21pc2UgRnJpZ2lkIFN0b25lJzogJzU4OUUnLCAvLyBTaGl2YSBzcHJlYWRcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrZXN0IERhbmNlJzogJzRFMzMnLCAvLyBGYXJ0aGVzdCB0YXJnZXQgYmFpdCArIGp1bXAgYmVmb3JlIGtub2NrYmFja1xyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgQ3VycmVudCc6ICc1OEQ4JywgLy8gQmFpdGVkIHRyYWZmaWMgbGlnaHQgbGFzZXJzXHJcbiAgICAnRTEyUyBPcmFjbGUgU3Bpcml0IFRha2VyJzogJzU4QzYnLCAvLyBSYW5kb20ganVtcCBzcHJlYWQgbWVjaGFuaWMgYWZ0ZXIgU2hlbGwgQ3J1c2hlclxyXG4gICAgJ0UxMlMgT3JhY2xlIFNvbWJlciBEYW5jZSAxJzogJzU4QkYnLCAvLyBGYXJ0aGVzdCB0YXJnZXQgYmFpdCBmb3IgRHVhbCBBcG9jYWx5cHNlXHJcbiAgICAnRTEyUyBPcmFjbGUgU29tYmVyIERhbmNlIDInOiAnNThDMCcsIC8vIFNlY29uZCBzb21iZXIgZGFuY2UganVtcFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIFdlaWdodCBPZiBUaGUgV29ybGQnOiAnNThBNScsIC8vIFRpdGFuIGJvbWIgYmx1ZSBtYXJrZXJcclxuICAgICdFMTJTIFByb21pc2UgUHVsc2UgT2YgVGhlIExhbmQnOiAnNThBMycsIC8vIFRpdGFuIGJvbWIgeWVsbG93IG1hcmtlclxyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgRXJ1cHRpb24gMSc6ICc1OENFJywgLy8gSW5pdGlhbCB3YXJtdXAgc3ByZWFkIG1lY2hhbmljXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFyayBFcnVwdGlvbiAyJzogJzU4Q0QnLCAvLyBSZWxhdGl2aXR5IHNwcmVhZCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIEJsYWNrIEhhbG8nOiAnNThDNycsIC8vIFRhbmtidXN0ZXIgY2xlYXZlXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdFMTJTIE9yYWNsZSBEb29tJzogJzlENCcsIC8vIFJlbGF0aXZpdHkgcHVuaXNobWVudCBmb3IgbXVsdGlwbGUgbWlzdGFrZXNcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIEZvcmNlIE9mIFRoZSBMYW5kJzogJzU4QTQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gQmlnIGNpcmNsZSBncm91bmQgYW9lcyBkdXJpbmcgU2hpdmEganVuY3Rpb24uXHJcbiAgICAgIC8vIFRoaXMgY2FuIGJlIHNoaWVsZGVkIHRocm91Z2ggYXMgbG9uZyBhcyB0aGF0IHBlcnNvbiBkb2Vzbid0IHN0YWNrLlxyXG4gICAgICBpZDogJ0UxMlMgSWNpY2xlIEltcGFjdCcsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNEU1QScsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUpID0+IGUuZGFtYWdlID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBIZWFkbWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7fSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBnZXRIZWFkbWFya2VySWQoZGF0YSwgbWF0Y2hlcyk7XHJcbiAgICAgICAgY29uc3QgZmlyc3RMYXNlck1hcmtlciA9ICcwMDkxJztcclxuICAgICAgICBjb25zdCBsYXN0TGFzZXJNYXJrZXIgPSAnMDA5OCc7XHJcbiAgICAgICAgaWYgKGlkID49IGZpcnN0TGFzZXJNYXJrZXIgJiYgaWQgPD0gbGFzdExhc2VyTWFya2VyKSB7XHJcbiAgICAgICAgICAvLyBpZHMgYXJlIHNlcXVlbnRpYWw6ICMxIHNxdWFyZSwgIzIgc3F1YXJlLCAjMyBzcXVhcmUsICM0IHNxdWFyZSwgIzEgdHJpYW5nbGUgZXRjXHJcbiAgICAgICAgICBjb25zdCBkZWNPZmZzZXQgPSBwYXJzZUludChpZCwgMTYpIC0gcGFyc2VJbnQoZmlyc3RMYXNlck1hcmtlciwgMTYpO1xyXG5cclxuICAgICAgICAgIC8vIGRlY09mZnNldCBpcyAwLTcsIHNvIG1hcCAwLTMgdG8gMS00IGFuZCA0LTcgdG8gMS00LlxyXG4gICAgICAgICAgZGF0YS5sYXNlck5hbWVUb051bSA9IGRhdGEubGFzZXJOYW1lVG9OdW0gfHwge307XHJcbiAgICAgICAgICBkYXRhLmxhc2VyTmFtZVRvTnVtW21hdGNoZXMudGFyZ2V0XSA9IGRlY09mZnNldCAlIDQgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXNlIHNjdWxwdHVyZXMgYXJlIGFkZGVkIGF0IHRoZSBzdGFydCBvZiB0aGUgZmlnaHQsIHNvIHdlIG5lZWQgdG8gY2hlY2sgd2hlcmUgdGhleVxyXG4gICAgICAvLyB1c2UgdGhlIFwiQ2xhc3NpY2FsIFNjdWxwdHVyZVwiIGFiaWxpdHkgYW5kIGVuZCB1cCBvbiB0aGUgYXJlbmEgZm9yIHJlYWwuXHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIENoaXNlbGVkIFNjdWxwdHVyZSBDbGFzc2ljYWwgU2N1bHB0dXJlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdDaGlzZWxlZCBTY3VscHR1cmUnLCBpZDogJzU4QjInIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRoaXMgd2lsbCBydW4gcGVyIHBlcnNvbiB0aGF0IGdldHMgaGl0IGJ5IHRoZSBzYW1lIHNjdWxwdHVyZSwgYnV0IHRoYXQncyBmaW5lLlxyXG4gICAgICAgIC8vIFJlY29yZCB0aGUgeSBwb3NpdGlvbiBvZiBlYWNoIHNjdWxwdHVyZSBzbyB3ZSBjYW4gdXNlIGl0IGZvciBiZXR0ZXIgdGV4dCBsYXRlci5cclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnMgPSBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnMgfHwge307XHJcbiAgICAgICAgZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV0gPSBwYXJzZUZsb2F0KG1hdGNoZXMueSk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGUgc291cmNlIG9mIHRoZSB0ZXRoZXIgaXMgdGhlIHBsYXllciwgdGhlIHRhcmdldCBpcyB0aGUgc2N1bHB0dXJlLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBDaGlzZWxlZCBTY3VscHR1cmUgVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgdGFyZ2V0OiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkID0gZGF0YS5zY3VscHR1cmVUZXRoZXJOYW1lVG9JZCB8fCB7fTtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkW21hdGNoZXMuc291cmNlXSA9IG1hdGNoZXMudGFyZ2V0SWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEJsYWRlIE9mIEZsYW1lIENvdW50ZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICc1OEIzJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAxLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDEsXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5ibGFkZU9mRmxhbWVDb3VudCA9IGRhdGEuYmxhZGVPZkZsYW1lQ291bnQgfHwgMDtcclxuICAgICAgICBkYXRhLmJsYWRlT2ZGbGFtZUNvdW50Kys7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGlzIHRoZSBDaGlzZWxlZCBTY3VscHR1cmUgbGFzZXIgd2l0aCB0aGUgbGltaXQgY3V0IGRvdHMuXHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEJsYWRlIE9mIEZsYW1lJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHR5cGU6ICcyMicsIHNvdXJjZTogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnNThCMycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5sYXNlck5hbWVUb051bSB8fCAhZGF0YS5zY3VscHR1cmVUZXRoZXJOYW1lVG9JZCB8fCAhZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBGaW5kIHRoZSBwZXJzb24gd2hvIGhhcyB0aGlzIGxhc2VyIG51bWJlciBhbmQgaXMgdGV0aGVyZWQgdG8gdGhpcyBzdGF0dWUuXHJcbiAgICAgICAgY29uc3QgbnVtYmVyID0gKGRhdGEuYmxhZGVPZkZsYW1lQ291bnQgfHwgMCkgKyAxO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZUlkID0gbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIGNvbnN0IG5hbWVzID0gT2JqZWN0LmtleXMoZGF0YS5sYXNlck5hbWVUb051bSk7XHJcbiAgICAgICAgY29uc3Qgd2l0aE51bSA9IG5hbWVzLmZpbHRlcigobmFtZSkgPT4gZGF0YS5sYXNlck5hbWVUb051bVtuYW1lXSA9PT0gbnVtYmVyKTtcclxuICAgICAgICBjb25zdCBvd25lcnMgPSB3aXRoTnVtLmZpbHRlcigobmFtZSkgPT4gZGF0YS5zY3VscHR1cmVUZXRoZXJOYW1lVG9JZFtuYW1lXSA9PT0gc291cmNlSWQpO1xyXG5cclxuICAgICAgICAvLyBpZiBzb21lIGxvZ2ljIGVycm9yLCBqdXN0IGFib3J0LlxyXG4gICAgICAgIGlmIChvd25lcnMubGVuZ3RoICE9PSAxKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBUaGUgb3duZXIgaGl0dGluZyB0aGVtc2VsdmVzIGlzbid0IGEgbWlzdGFrZS4uLnRlY2huaWNhbGx5LlxyXG4gICAgICAgIGlmIChvd25lcnNbMF0gPT09IG1hdGNoZXMudGFyZ2V0KVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBOb3cgdHJ5IHRvIGZpZ3VyZSBvdXQgd2hpY2ggc3RhdHVlIGlzIHdoaWNoLlxyXG4gICAgICAgIC8vIFBlb3BsZSBjYW4gcHV0IHRoZXNlIHdoZXJldmVyLiAgVGhleSBjb3VsZCBnbyBzaWRld2F5cywgb3IgZGlhZ29uYWwsIG9yIHdoYXRldmVyLlxyXG4gICAgICAgIC8vIEl0IHNlZW1zIG1vb29vb3N0IHBlb3BsZSBwdXQgdGhlc2Ugbm9ydGggLyBzb3V0aCAob24gdGhlIHNvdXRoIGVkZ2Ugb2YgdGhlIGFyZW5hKS5cclxuICAgICAgICAvLyBMZXQncyBzYXkgYSBtaW5pbXVtIG9mIDIgeWFsbXMgYXBhcnQgaW4gdGhlIHkgZGlyZWN0aW9uIHRvIGNvbnNpZGVyIHRoZW0gXCJub3J0aC9zb3V0aFwiLlxyXG4gICAgICAgIGNvbnN0IG1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMgPSAyO1xyXG5cclxuICAgICAgICBsZXQgaXNTdGF0dWVQb3NpdGlvbktub3duID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGlzU3RhdHVlTm9ydGggPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBzY3VscHR1cmVJZHMgPSBPYmplY3Qua2V5cyhkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnMpO1xyXG4gICAgICAgIGlmIChzY3VscHR1cmVJZHMubGVuZ3RoID09PSAyICYmIHNjdWxwdHVyZUlkcy5pbmNsdWRlcyhzb3VyY2VJZCkpIHtcclxuICAgICAgICAgIGNvbnN0IG90aGVySWQgPSBzY3VscHR1cmVJZHNbMF0gPT09IHNvdXJjZUlkID8gc2N1bHB0dXJlSWRzWzFdIDogc2N1bHB0dXJlSWRzWzBdO1xyXG4gICAgICAgICAgY29uc3Qgc291cmNlWSA9IGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9uc1tzb3VyY2VJZF07XHJcbiAgICAgICAgICBjb25zdCBvdGhlclkgPSBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnNbb3RoZXJJZF07XHJcbiAgICAgICAgICBjb25zdCB5RGlmZiA9IE1hdGguYWJzKHNvdXJjZVkgLSBvdGhlclkpO1xyXG4gICAgICAgICAgaWYgKHlEaWZmID4gbWluaW11bVlhbG1zRm9yU3RhdHVlcykge1xyXG4gICAgICAgICAgICBpc1N0YXR1ZVBvc2l0aW9uS25vd24gPSB0cnVlO1xyXG4gICAgICAgICAgICBpc1N0YXR1ZU5vcnRoID0gc291cmNlWSA8IG90aGVyWTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG93bmVyID0gb3duZXJzWzBdO1xyXG4gICAgICAgIGNvbnN0IG93bmVyTmljayA9IGRhdGEuU2hvcnROYW1lKG93bmVyKTtcclxuICAgICAgICBsZXQgdGV4dCA9IHtcclxuICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke293bmVyTmlja30sICMke251bWJlcn0pYCxcclxuICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke293bmVyTmlja33jgYvjgonjgIEjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6IeqJHtvd25lck5pY2t977yMIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogpYCxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChpc1N0YXR1ZVBvc2l0aW9uS25vd24gJiYgaXNTdGF0dWVOb3J0aCkge1xyXG4gICAgICAgICAgdGV4dCA9IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9IG5vcnRoKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9IG5vcmRlbilgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5YyX44GuJHtvd25lck5pY2t944GL44KJ44CBIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6Ieq5YyX5pa5JHtvd25lck5pY2t977yMIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtvd25lck5pY2t9XCIsICR7bnVtYmVyfeuyiCDrtoHsqr0pYCxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc1N0YXR1ZVBvc2l0aW9uS25vd24gJiYgIWlzU3RhdHVlTm9ydGgpIHtcclxuICAgICAgICAgIHRleHQgPSB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBzb3V0aClgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBTw7xkZW4pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOWNl+OBriR7b3duZXJOaWNrfeOBi+OCieOAgSMke251bWJlcn0pYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHquWNl+aWuSR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogg64Ko7Kq9KWAsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgYmxhbWU6IG93bmVyLFxyXG4gICAgICAgICAgdGV4dDogdGV4dCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgSWNlIFBpbGxhciBUcmFja2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnSWNlIFBpbGxhcicsIGlkOiBbJzAwMDEnLCAnMDAzOSddIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEucGlsbGFySWRUb093bmVyID0gZGF0YS5waWxsYXJJZFRvT3duZXIgfHwge307XHJcbiAgICAgICAgZGF0YS5waWxsYXJJZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZF0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEljZSBQaWxsYXIgTWlzdGFrZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdJY2UgUGlsbGFyJywgaWQ6ICc1ODlCJyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEucGlsbGFySWRUb093bmVyKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBtYXRjaGVzLnRhcmdldCAhPT0gZGF0YS5waWxsYXJJZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZF07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBpbGxhck93bmVyID0gZGF0YS5TaG9ydE5hbWUoZGF0YS5waWxsYXJJZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZF0pO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtwaWxsYXJPd25lcn0pYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKGRlICR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke3BpbGxhck93bmVyfeOBi+OCiSlgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6IeqJHtwaWxsYXJPd25lcn0pYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7cGlsbGFyT3duZXJ9XCIpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEdhaW4gRmlyZSBSZXNpc3RhbmNlIERvd24gSUknLFxyXG4gICAgICAvLyBUaGUgQmVhc3RseSBTY3VscHR1cmUgZ2l2ZXMgYSAzIHNlY29uZCBkZWJ1ZmYsIHRoZSBSZWdhbCBTY3VscHR1cmUgZ2l2ZXMgYSAxNHMgb25lLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnODMyJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZpcmUgPSBkYXRhLmZpcmUgfHwge307XHJcbiAgICAgICAgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBMb3NlIEZpcmUgUmVzaXN0YW5jZSBEb3duIElJJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzgzMicgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5maXJlID0gZGF0YS5maXJlIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIFNtYWxsIExpb24gVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQmVhc3RseSBTY3VscHR1cmUnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0FiYmlsZCBFaW5lcyBMw7Z3ZW4nLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0Nyw6lhdGlvbiBMw6lvbmluZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAn5Ym144KJ44KM44Gf542F5a2QJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbklkVG9Pd25lciA9IGRhdGEuc21hbGxMaW9uSWRUb093bmVyIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uSWRUb093bmVyW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbk93bmVycyA9IGRhdGEuc21hbGxMaW9uT3duZXJzIHx8IFtdO1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uT3duZXJzLnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgU21hbGwgTGlvbiBMaW9uc2JsYXplJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdCZWFzdGx5IFNjdWxwdHVyZScsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdBYmJpbGQgRWluZXMgTMO2d2VuJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0Nyw6lhdGlvbiBMw6lvbmluZScsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICflibXjgonjgozjgZ/njYXlrZAnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBGb2xrcyBiYWl0aW5nIHRoZSBiaWcgbGlvbiBzZWNvbmQgY2FuIHRha2UgdGhlIGZpcnN0IHNtYWxsIGxpb24gaGl0LFxyXG4gICAgICAgIC8vIHNvIGl0J3Mgbm90IHN1ZmZpY2llbnQgdG8gY2hlY2sgb25seSB0aGUgb3duZXIuXHJcbiAgICAgICAgaWYgKCFkYXRhLnNtYWxsTGlvbk93bmVycylcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zdCBvd25lciA9IGRhdGEuc21hbGxMaW9uSWRUb093bmVyW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV07XHJcbiAgICAgICAgaWYgKCFvd25lcilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAobWF0Y2hlcy50YXJnZXQgPT09IG93bmVyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgdGFyZ2V0IGFsc28gaGFzIGEgc21hbGwgbGlvbiB0ZXRoZXIsIHRoYXQgaXMgYWx3YXlzIGEgbWlzdGFrZS5cclxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0J3Mgb25seSBhIG1pc3Rha2UgaWYgdGhlIHRhcmdldCBoYXMgYSBmaXJlIGRlYnVmZi5cclxuICAgICAgICBjb25zdCBoYXNTbWFsbExpb24gPSBkYXRhLnNtYWxsTGlvbk93bmVycy5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgICAgY29uc3QgaGFzRmlyZURlYnVmZiA9IGRhdGEuZmlyZSAmJiBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdO1xyXG5cclxuICAgICAgICBpZiAoaGFzU21hbGxMaW9uIHx8IGhhc0ZpcmVEZWJ1ZmYpIHtcclxuICAgICAgICAgIGNvbnN0IG93bmVyTmljayA9IGRhdGEuU2hvcnROYW1lKG93bmVyKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBjZW50ZXJZID0gLTc1O1xyXG4gICAgICAgICAgY29uc3QgeCA9IHBhcnNlRmxvYXQobWF0Y2hlcy54KTtcclxuICAgICAgICAgIGNvbnN0IHkgPSBwYXJzZUZsb2F0KG1hdGNoZXMueSk7XHJcbiAgICAgICAgICBsZXQgZGlyT2JqID0gbnVsbDtcclxuICAgICAgICAgIGlmICh5IDwgY2VudGVyWSkge1xyXG4gICAgICAgICAgICBpZiAoeCA+IDApXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJORTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyTlc7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoeCA+IDApXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJTRTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyU1c7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgICBibGFtZTogb3duZXIsXHJcbiAgICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtvd25lck5pY2t9LCAke2Rpck9ialsnZW4nXX0pYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2RlJ119KWAsXHJcbiAgICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKGRlICR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2ZyJ119KWAsXHJcbiAgICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7b3duZXJOaWNrfeOBi+OCiSwgJHtkaXJPYmpbJ2phJ119KWAsXHJcbiAgICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2NuJ119YCxcclxuICAgICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtvd25lck5pY2t9XCIsICR7ZGlyT2JqWydrbyddfSlgLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBOb3J0aCBCaWcgTGlvbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFkZGVkQ29tYmF0YW50RnVsbCh7IG5hbWU6ICdSZWdhbCBTY3VscHR1cmUnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHkgPSBwYXJzZUZsb2F0KG1hdGNoZXMueSk7XHJcbiAgICAgICAgY29uc3QgY2VudGVyWSA9IC03NTtcclxuICAgICAgICBpZiAoeSA8IGNlbnRlclkpXHJcbiAgICAgICAgICBkYXRhLm5vcnRoQmlnTGlvbiA9IG1hdGNoZXMuaWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEJpZyBMaW9uIEtpbmdzYmxhemUnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnUmVnYWwgU2N1bHB0dXJlJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnQWJiaWxkIGVpbmVzIGdyb8OfZW4gTMO2d2VuJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnY3LDqWF0aW9uIGzDqW9uaW5lIHJveWFsZScsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ+WJteOCieOCjOOBn+eNheWtkOeOiycsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNpbmdsZVRhcmdldCA9IG1hdGNoZXMudHlwZSA9PT0gJzIxJztcclxuICAgICAgICBjb25zdCBoYXNGaXJlRGVidWZmID0gZGF0YS5maXJlICYmIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF07XHJcblxyXG4gICAgICAgIC8vIFN1Y2Nlc3MgaWYgb25seSBvbmUgcGVyc29uIHRha2VzIGl0IGFuZCB0aGV5IGhhdmUgbm8gZmlyZSBkZWJ1ZmYuXHJcbiAgICAgICAgaWYgKHNpbmdsZVRhcmdldCAmJiAhaGFzRmlyZURlYnVmZilcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0ge1xyXG4gICAgICAgICAgbm9ydGhCaWdMaW9uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnbm9ydGggYmlnIGxpb24nLFxyXG4gICAgICAgICAgICBkZTogJ05vcmRlbSwgZ3Jvw59lciBMw7Z3ZScsXHJcbiAgICAgICAgICAgIGphOiAn5aSn44Op44Kk44Kq44OzKOWMlyknLFxyXG4gICAgICAgICAgICBjbjogJ+WMl+aWueWkp+eLruWtkCcsXHJcbiAgICAgICAgICAgIGtvOiAn67aB7Kq9IO2BsCDsgqzsnpAnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNvdXRoQmlnTGlvbjoge1xyXG4gICAgICAgICAgICBlbjogJ3NvdXRoIGJpZyBsaW9uJyxcclxuICAgICAgICAgICAgZGU6ICdTw7xkZW4sIGdyb8OfZXIgTMO2d2UnLFxyXG4gICAgICAgICAgICBqYTogJ+Wkp+ODqeOCpOOCquODsyjljZcpJyxcclxuICAgICAgICAgICAgY246ICfljZfmlrnlpKfni67lrZAnLFxyXG4gICAgICAgICAgICBrbzogJ+uCqOyqvSDtgbAg7IKs7J6QJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzaGFyZWQ6IHtcclxuICAgICAgICAgICAgZW46ICdzaGFyZWQnLFxyXG4gICAgICAgICAgICBkZTogJ2dldGVpbHQnLFxyXG4gICAgICAgICAgICBqYTogJ+mHjeOBreOBnycsXHJcbiAgICAgICAgICAgIGNuOiAn6YeN5Y+gJyxcclxuICAgICAgICAgICAga286ICfqsJnsnbQg66ee7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBmaXJlRGVidWZmOiB7XHJcbiAgICAgICAgICAgIGVuOiAnaGFkIGZpcmUnLFxyXG4gICAgICAgICAgICBkZTogJ2hhdHRlIEZldWVyJyxcclxuICAgICAgICAgICAgamE6ICfngo7ku5jjgY0nLFxyXG4gICAgICAgICAgICBjbjogJ+eBq0RlYnVmZicsXHJcbiAgICAgICAgICAgIGtvOiAn7ZmU7Je8IOuUlOuyhO2UhCDrsJvsnYwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBsYWJlbHMgPSBbXTtcclxuICAgICAgICBpZiAoZGF0YS5ub3J0aEJpZ0xpb24pIHtcclxuICAgICAgICAgIGlmIChkYXRhLm5vcnRoQmlnTGlvbiA9PT0gbWF0Y2hlcy5zb3VyY2VJZClcclxuICAgICAgICAgICAgbGFiZWxzLnB1c2gob3V0cHV0Lm5vcnRoQmlnTGlvbltkYXRhLnBhcnNlckxhbmddIHx8IG91dHB1dC5ub3J0aEJpZ0xpb25bJ2VuJ10pO1xyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBsYWJlbHMucHVzaChvdXRwdXQuc291dGhCaWdMaW9uW2RhdGEucGFyc2VyTGFuZ10gfHwgb3V0cHV0LnNvdXRoQmlnTGlvblsnZW4nXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc2luZ2xlVGFyZ2V0KVxyXG4gICAgICAgICAgbGFiZWxzLnB1c2gob3V0cHV0LnNoYXJlZFtkYXRhLnBhcnNlckxhbmddIHx8IG91dHB1dC5zaGFyZWRbJ2VuJ10pO1xyXG4gICAgICAgIGlmIChoYXNGaXJlRGVidWZmKVxyXG4gICAgICAgICAgbGFiZWxzLnB1c2gob3V0cHV0LmZpcmVEZWJ1ZmZbZGF0YS5wYXJzZXJMYW5nXSB8fCBvdXRwdXQuZmlyZURlYnVmZlsnZW4nXSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7bGFiZWxzLmpvaW4oJywgJyl9KWAsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBLbm9ja2VkIE9mZicsXHJcbiAgICAgIC8vIDU4OUEgPSBJY2UgUGlsbGFyIChwcm9taXNlIHNoaXZhIHBoYXNlKVxyXG4gICAgICAvLyA1OEI2ID0gUGFsbSBPZiBUZW1wZXJhbmNlIChwcm9taXNlIHN0YXR1ZSBoYW5kKVxyXG4gICAgICAvLyA1OEI3ID0gTGFzZXIgRXllIChwcm9taXNlIGxpb24gcGhhc2UpXHJcbiAgICAgIC8vIDU4QzEgPSBEYXJrZXN0IERhbmNlIChvcmFjbGUgdGFuayBqdW1wICsga25vY2tiYWNrIGluIGJlZ2lubmluZyBhbmQgdHJpcGxlIGFwb2MpXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1ODlBJywgJzU4QjYnLCAnNThCNycsICc1OEMxJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBPcmFjbGUgU2hhZG93ZXllJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc1OEQyJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSkgPT4gZS5kYW1hZ2UgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogd2FybmluZyBmb3IgdGFraW5nIERpYW1vbmQgRmxhc2ggKDVGQTEpIHN0YWNrIG9uIHlvdXIgb3duP1xyXG5cclxuLy8gRGlhbW9uZCBXZWFwb24gRXh0cmVtZVxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ2xvdWREZWNrRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyAxJzogJzVGQUYnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDInOiAnNUZCMicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgMyc6ICc1RkNEJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA0JzogJzVGQ0UnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDUnOiAnNUZDRicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNic6ICc1RkY4JywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA3JzogJzYxNTknLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXJ0aWN1bGF0ZWQgQml0IEFldGhlcmlhbCBCdWxsZXQnOiAnNUZBQicsIC8vIGJpdCBsYXNlcnMgZHVyaW5nIGFsbCBwaGFzZXNcclxuICAgICdEaWFtb25kRXggRGlhbW9uZCBTaHJhcG5lbCAxJzogJzVGQ0InLCAvLyBjaGFzaW5nIGNpcmNsZXNcclxuICAgICdEaWFtb25kRXggRGlhbW9uZCBTaHJhcG5lbCAyJzogJzVGQ0MnLCAvLyBjaGFzaW5nIGNpcmNsZXNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEaWFtb25kRXggQ2xhdyBTd2lwZSBMZWZ0JzogJzVGQzInLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmRFeCBDbGF3IFN3aXBlIFJpZ2h0JzogJzVGQzMnLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEN5Y2xvbmUgMSc6ICc1RkQxJywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kRXggQXVyaSBDeWNsb25lIDInOiAnNUZEMicsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZEV4IEFpcnNoaXBcXCdzIEJhbmUgMSc6ICc1RkZFJywgLy8gZGVzdHJveWluZyBvbmUgb2YgdGhlIHBsYXRmb3JtcyBhZnRlciBBdXJpIEN5Y2xvbmVcclxuICAgICdEaWFtb25kRXggQWlyc2hpcFxcJ3MgQmFuZSAyJzogJzVGRDMnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRGlhbW9uZEV4IFRhbmsgTGFzZXJzJzogJzVGQzgnLCAvLyBjbGVhdmluZyB5ZWxsb3cgbGFzZXJzIG9uIHRvcCB0d28gZW5taXR5XHJcbiAgICAnRGlhbW9uZEV4IEhvbWluZyBMYXNlcic6ICc1RkM0JywgLy8gQWRhbWFudGUgUHVyZ2Ugc3ByZWFkXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdEaWFtb25kRXggRmxvb2QgUmF5JzogJzVGQzcnLCAvLyBcImxpbWl0IGN1dFwiIGNsZWF2ZXNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGlhbW9uZEV4IFZlcnRpY2FsIENsZWF2ZSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzVGRDAnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBEaWFtb25kIFdlYXBvbiBOb3JtYWxcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNsb3VkRGVjayxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBBcnRzJzogJzVGRTMnLCAvLyBBdXJpIEFydHMgZGFzaGVzXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBJbml0aWFsJzogJzVGRTEnLCAvLyBpbml0aWFsIGNpcmNsZSBvZiBEaWFtb25kIFNocmFwbmVsXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBDaGFzaW5nJzogJzVGRTInLCAvLyBmb2xsb3d1cCBjaXJjbGVzIGZyb20gRGlhbW9uZCBTaHJhcG5lbFxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEFldGhlcmlhbCBCdWxsZXQnOiAnNUZENScsIC8vIGJpdCBsYXNlcnNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEaWFtb25kIFdlYXBvbiBDbGF3IFN3aXBlIExlZnQnOiAnNUZEOScsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQ2xhdyBTd2lwZSBSaWdodCc6ICc1RkRBJywgLy8gQWRhbWFudCBQdXJnZSBwbGF0Zm9ybSBjbGVhdmVcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMSc6ICc1RkU2JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMic6ICc1RkU3JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBaXJzaGlwXFwncyBCYW5lIDEnOiAnNUZFOCcsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQWlyc2hpcFxcJ3MgQmFuZSAyJzogJzVGRkUnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gSG9taW5nIExhc2VyJzogJzVGREInLCAvLyBzcHJlYWQgbWFya2Vyc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEaWFtb25kIFdlYXBvbiBWZXJ0aWNhbCBDbGVhdmUgS25vY2tlZCBPZmYnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1RkU1JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DYXN0cnVtTWFyaW51bUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGRFeCBIZWF0IFJheSc6ICc1QkQzJywgLy8gRW1lcmFsZCBCZWFtIGluaXRpYWwgY29uYWxcclxuICAgICdFbWVyYWxkRXggUGhvdG9uIExhc2VyIDEnOiAnNTU3QicsIC8vIEVtZXJhbGQgQmVhbSBpbnNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZEV4IFBob3RvbiBMYXNlciAyJzogJzU1N0QnLCAvLyBFbWVyYWxkIEJlYW0gb3V0c2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkRXggSGVhdCBSYXkgMSc6ICc1NTdBJywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkRXggSGVhdCBSYXkgMic6ICc1NTc5JywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkRXggRXhwbG9zaW9uJzogJzU1OTYnLCAvLyBNYWdpdGVrIE1pbmUgZXhwbG9zaW9uXHJcbiAgICAnRW1lcmFsZEV4IFRlcnRpdXMgVGVybWludXMgRXN0IEluaXRpYWwnOiAnNTVDRCcsIC8vIHN3b3JkIGluaXRpYWwgcHVkZGxlc1xyXG4gICAgJ0VtZXJhbGRFeCBUZXJ0aXVzIFRlcm1pbnVzIEVzdCBFeHBsb3Npb24nOiAnNTVDRScsIC8vIHN3b3JkIGV4cGxvc2lvbnNcclxuICAgICdFbWVyYWxkRXggQWlyYm9ybmUgRXhwbG9zaW9uJzogJzU1QkQnLCAvLyBleGFmbGFyZVxyXG4gICAgJ0VtZXJhbGRFeCBTaWRlc2NhdGhlIDEnOiAnNTVENCcsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZEV4IFNpZGVzY2F0aGUgMic6ICc1NUQ1JywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkRXggU2hvdHMgRmlyZWQnOiAnNTVCNycsIC8vIHJhbmsgYW5kIGZpbGUgc29sZGllcnNcclxuICAgICdFbWVyYWxkRXggU2VjdW5kdXMgVGVybWludXMgRXN0JzogJzU1Q0InLCAvLyBkcm9wcGVkICsgYW5kIHggaGVhZG1hcmtlcnNcclxuICAgICdFbWVyYWxkRXggRXhwaXJlJzogJzU1RDEnLCAvLyBncm91bmQgYW9lIG9uIGJvc3MgXCJnZXQgb3V0XCJcclxuICAgICdFbWVyYWxkRXggQWlyZSBUYW0gU3Rvcm0nOiAnNTVEMCcsIC8vIGV4cGFuZGluZyByZWQgYW5kIGJsYWNrIGdyb3VuZCBhb2VcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGRFeCBEaXZpZGUgRXQgSW1wZXJhJzogJzU1RDknLCAvLyBub24tdGFuayBwcm90ZWFuIHNwcmVhZFxyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDEnOiAnNTVDNCcsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDInOiAnNTVDNScsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDMnOiAnNTVDNicsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gICAgJ0VtZXJhbGRFeCBQcmltdXMgVGVybWludXMgRXN0IDQnOiAnNTVDNycsIC8vIGtub2NrYmFjayBhcnJvd1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2FzdHJ1bU1hcmludW0sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEhlYXQgUmF5JzogJzRGOUQnLCAvLyBFbWVyYWxkIEJlYW0gaW5pdGlhbCBjb25hbFxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAxJzogJzU1MzQnLCAvLyBFbWVyYWxkIEJlYW0gaW5zaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAyJzogJzU1MzYnLCAvLyBFbWVyYWxkIEJlYW0gbWlkZGxlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAzJzogJzU1MzgnLCAvLyBFbWVyYWxkIEJlYW0gb3V0c2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBIZWF0IFJheSAxJzogJzU1MzInLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEhlYXQgUmF5IDInOiAnNTUzMycsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gTWFnbmV0aWMgTWluZSBFeHBsb3Npb24nOiAnNUIwNCcsIC8vIHJlcHVsc2luZyBtaW5lIGV4cGxvc2lvbnNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDEnOiAnNTUzRicsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSAyJzogJzU1NDAnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgMyc6ICc1NTQxJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDQnOiAnNTU0MicsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gQml0IFN0b3JtJzogJzU1NEEnLCAvLyBcImdldCBpblwiXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRW1lcmFsZCBDcnVzaGVyJzogJzU1M0MnLCAvLyBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUHVsc2UgTGFzZXInOiAnNTU0OCcsIC8vIGxpbmUgYW9lXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRW5lcmd5IEFldGhlcm9wbGFzbSc6ICc1NTUxJywgLy8gaGl0dGluZyBhIGdsb3d5IG9yYlxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIERpdmlkZSBFdCBJbXBlcmEgR3JvdW5kJzogJzU1NkYnLCAvLyBwYXJ0eSB0YXJnZXRlZCBncm91bmQgY29uZXNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQcmltdXMgVGVybWludXMgRXN0JzogJzRCM0UnLCAvLyBncm91bmQgY2lyY2xlIGR1cmluZyBhcnJvdyBoZWFkbWFya2Vyc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNlY3VuZHVzIFRlcm1pbnVzIEVzdCc6ICc1NTZBJywgLy8gWCAvICsgaGVhZG1hcmtlcnNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBUZXJ0aXVzIFRlcm1pbnVzIEVzdCc6ICc1NTZEJywgLy8gdHJpcGxlIHN3b3Jkc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNob3RzIEZpcmVkJzogJzU1NUYnLCAvLyBsaW5lIGFvZXMgZnJvbSBzb2xkaWVyc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRGl2aWRlIEV0IEltcGVyYSBQMSc6ICc1NTRFJywgLy8gdGFua2J1c3RlciwgcHJvYmFibHkgY2xlYXZlcywgcGhhc2UgMVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIERpdmlkZSBFdCBJbXBlcmEgUDInOiAnNTU3MCcsIC8vIHRhbmtidXN0ZXIsIHByb2JhYmx5IGNsZWF2ZXMsIHBoYXNlIDJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRW1lcmFsZCBXZWFwb24gRW1lcmFsZCBDcnVzaGVyIEtub2NrZWQgT2ZmJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTUzRScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgcmVhc29uOiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEdldHRpbmcga25vY2tlZCBpbnRvIGEgd2FsbCBmcm9tIHRoZSBhcnJvdyBoZWFkbWFya2VyLlxyXG4gICAgICBpZDogJ0VtZXJhbGQgV2VhcG9uIFByaW11cyBUZXJtaW51cyBFc3QgV2FsbCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1NTYzJywgJzU1NjQnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgaW50byB3YWxsJyxcclxuICAgICAgICAgICAgZGU6ICdSw7xja3N0b8OfIGluIGRpZSBXYW5kJyxcclxuICAgICAgICAgICAgamE6ICflo4Hjgbjjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOiHs+WimScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIEhhZGVzIEV4XHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVNaW5zdHJlbHNCYWxsYWRIYWRlc3NFbGVneSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3ByZWFkIDInOiAnNDdBQScsXHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3ByZWFkIDMnOiAnNDdFNCcsXHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3ByZWFkIDQnOiAnNDdFNScsXHJcbiAgICAvLyBFdmVyeWJvZHkgc3RhY2tzIGluIGdvb2QgZmFpdGggZm9yIEJhZCBGYWl0aCwgc28gZG9uJ3QgY2FsbCBpdCBhIG1pc3Rha2UuXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggMSc6ICc0N0FEJyxcclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCAyJzogJzQ3QjAnLFxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDMnOiAnNDdBRScsXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggNCc6ICc0N0FGJyxcclxuICAgICdIYWRlc0V4IEJyb2tlbiBGYWl0aCc6ICc0N0IyJyxcclxuICAgICdIYWRlc0V4IE1hZ2ljIFNwZWFyJzogJzQ3QjYnLFxyXG4gICAgJ0hhZGVzRXggTWFnaWMgQ2hha3JhbSc6ICc0N0I1JyxcclxuICAgICdIYWRlc0V4IEZvcmtlZCBMaWdodG5pbmcnOiAnNDdDOScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEN1cnJlbnQgMSc6ICc0N0YxJyxcclxuICAgICdIYWRlc0V4IERhcmsgQ3VycmVudCAyJzogJzQ3RjInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0hhZGVzRXggQ29tZXQnOiAnNDdCOScsIC8vIG1pc3NlZCB0b3dlclxyXG4gICAgJ0hhZGVzRXggQW5jaWVudCBFcnVwdGlvbic6ICc0N0QzJyxcclxuICAgICdIYWRlc0V4IFB1cmdhdGlvbiAxJzogJzQ3RUMnLFxyXG4gICAgJ0hhZGVzRXggUHVyZ2F0aW9uIDInOiAnNDdFRCcsXHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3RyZWFtJzogJzQ3RUEnLFxyXG4gICAgJ0hhZGVzRXggRGVhZCBTcGFjZSc6ICc0N0VFJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCBJbml0aWFsJzogJzQ3QTknLFxyXG4gICAgJ0hhZGVzRXggUmF2ZW5vdXMgQXNzYXVsdCc6ICcoPzo0N0E2fDQ3QTcpJyxcclxuICAgICdIYWRlc0V4IERhcmsgRmxhbWUgMSc6ICc0N0M2JyxcclxuICAgICdIYWRlc0V4IERhcmsgRnJlZXplIDEnOiAnNDdDNCcsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZyZWV6ZSAyJzogJzQ3REYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERhcmsgSUkgVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnU2hhZG93IG9mIHRoZSBBbmNpZW50cycsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEYXJrID0gZGF0YS5oYXNEYXJrIHx8IFtdO1xyXG4gICAgICAgIGRhdGEuaGFzRGFyay5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEYXJrIElJJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0N0JBJyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIERvbid0IGJsYW1lIHBlb3BsZSB3aG8gZG9uJ3QgaGF2ZSB0ZXRoZXJzLlxyXG4gICAgICAgIHJldHVybiBlLnR5cGUgIT09ICcxNScgJiYgZGF0YS5tZSBpbiBkYXRhLmhhc0Rhcms7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiBlLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQm9zcyBUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6IFsnSWdleW9yaG1cXCdzIFNoYWRlJywgJ0xhaGFicmVhXFwncyBTaGFkZSddLCBpZDogJzAwMEUnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbWlzdGFrZToge1xyXG4gICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICBlbjogJ0Jvc3NlcyBUb28gQ2xvc2UnLFxyXG4gICAgICAgICAgZGU6ICdCb3NzZXMgenUgTmFoZScsXHJcbiAgICAgICAgICBmcjogJ0Jvc3MgdHJvcCBwcm9jaGVzJyxcclxuICAgICAgICAgIGphOiAn44Oc44K56L+R44GZ44GO44KLJyxcclxuICAgICAgICAgIGNuOiAnQk9TU+mdoOWkqui/keS6hicsXHJcbiAgICAgICAgICBrbzogJ+yrhOuTpOydtCDrhIjrrLQg6rCA6rmM7JuAJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERlYXRoIFNocmllaycsXHJcbiAgICAgIGRhbWFnZVJlZ2V4OiAnNDdDQicsXHJcbiAgICAgIGNvbmRpdGlvbjogKGUpID0+IGUuZGFtYWdlID4gMCxcclxuICAgICAgbWlzdGFrZTogKGUpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBlLnRhcmdldE5hbWUsIHRleHQ6IGUuYWJpbGl0eU5hbWUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBCZXlvbmQgRGVhdGggR2FpbicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPSBkYXRhLmhhc0JleW9uZERlYXRoIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBCZXlvbmQgRGVhdGggTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPSBkYXRhLmhhc0JleW9uZERlYXRoIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQmV5b25kIERlYXRoJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aClcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEb29tIEdhaW4nLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNkU5JyB9KSxcclxuICAgICAgcnVuOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0Rvb20gPSBkYXRhLmhhc0Rvb20gfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRG9vbSBMb3NlJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzZFOScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID0gZGF0YS5oYXNEb29tIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEb29tJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzZFOScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNEb29tKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gSGFkZXMgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEeWluZ0dhc3AsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hhZGVzIEJhZCBGYWl0aCAxJzogJzQxNEInLFxyXG4gICAgJ0hhZGVzIEJhZCBGYWl0aCAyJzogJzQxNEMnLFxyXG4gICAgJ0hhZGVzIERhcmsgRXJ1cHRpb24nOiAnNDE1MicsXHJcbiAgICAnSGFkZXMgU2hhZG93IFNwcmVhZCAxJzogJzQxNTYnLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTcHJlYWQgMic6ICc0MTU3JyxcclxuICAgICdIYWRlcyBCcm9rZW4gRmFpdGgnOiAnNDE0RScsXHJcbiAgICAnSGFkZXMgSGVsbGJvcm4gWWF3cCc6ICc0MTZGJyxcclxuICAgICdIYWRlcyBQdXJnYXRpb24nOiAnNDE3MicsXHJcbiAgICAnSGFkZXMgU2hhZG93IFN0cmVhbSc6ICc0MTVDJyxcclxuICAgICdIYWRlcyBBZXJvJzogJzQ1OTUnLFxyXG4gICAgJ0hhZGVzIEVjaG8gMSc6ICc0MTYzJyxcclxuICAgICdIYWRlcyBFY2hvIDInOiAnNDE2NCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdIYWRlcyBOZXRoZXIgQmxhc3QnOiAnNDE2MycsXHJcbiAgICAnSGFkZXMgUmF2ZW5vdXMgQXNzYXVsdCc6ICc0MTU4JyxcclxuICAgICdIYWRlcyBBbmNpZW50IERhcmtuZXNzJzogJzQ1OTMnLFxyXG4gICAgJ0hhZGVzIER1YWwgU3RyaWtlJzogJzQxNjInLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gSW5ub2NlbmNlIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNyb3duT2ZUaGVJbW1hY3VsYXRlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSW5ub0V4IER1ZWwgRGVzY2VudCc6ICczRUQyJyxcclxuICAgICdJbm5vRXggUmVwcm9iYXRpb24gMSc6ICczRUUwJyxcclxuICAgICdJbm5vRXggUmVwcm9iYXRpb24gMic6ICczRUNDJyxcclxuICAgICdJbm5vRXggU3dvcmQgb2YgQ29uZGVtbmF0aW9uIDEnOiAnM0VERScsXHJcbiAgICAnSW5ub0V4IFN3b3JkIG9mIENvbmRlbW5hdGlvbiAyJzogJzNFREYnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCAxJzogJzNFRDMnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCAyJzogJzNFRDQnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCAzJzogJzNFRDUnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA0JzogJzNFRDYnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA1JzogJzNFRkInLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA2JzogJzNFRkMnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA3JzogJzNFRkQnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA4JzogJzNFRkUnLFxyXG4gICAgJ0lubm9FeCBIb2x5IFRyaW5pdHknOiAnM0VEQicsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgMSc6ICczRUQ3JyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSAyJzogJzNFRDgnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDMnOiAnM0VEOScsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNCc6ICczRURBJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA1JzogJzNFRkYnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDYnOiAnM0YwMCcsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNyc6ICczRjAxJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA4JzogJzNGMDInLFxyXG4gICAgJ0lubm9FeCBHb2QgUmF5IDEnOiAnM0VFNicsXHJcbiAgICAnSW5ub0V4IEdvZCBSYXkgMic6ICczRUU3JyxcclxuICAgICdJbm5vRXggR29kIFJheSAzJzogJzNFRTgnLFxyXG4gICAgJ0lubm9FeCBFeHBsb3Npb24nOiAnM0VGMCcsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBJbm5vY2VuY2UgTm9ybWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDcm93bk9mVGhlSW1tYWN1bGF0ZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSW5ubyBEYXlicmVhayc6ICczRTlEJyxcclxuICAgICdJbm5vIEhvbHkgVHJpbml0eSc6ICczRUIzJyxcclxuXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiAxJzogJzNFQjYnLFxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gMic6ICczRUI4JyxcclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDMnOiAnM0VDQicsXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiA0JzogJzNFQjcnLFxyXG5cclxuICAgICdJbm5vIFNvdWwgYW5kIEJvZHkgMSc6ICczRUIxJyxcclxuICAgICdJbm5vIFNvdWwgYW5kIEJvZHkgMic6ICczRUIyJyxcclxuICAgICdJbm5vIFNvdWwgYW5kIEJvZHkgMyc6ICczRUY5JyxcclxuICAgICdJbm5vIFNvdWwgYW5kIEJvZHkgNCc6ICczRUZBJyxcclxuXHJcbiAgICAnSW5ubyBHb2QgUmF5IDEnOiAnM0VCRCcsXHJcbiAgICAnSW5ubyBHb2QgUmF5IDInOiAnM0VCRScsXHJcbiAgICAnSW5ubyBHb2QgUmF5IDMnOiAnM0VCRicsXHJcbiAgICAnSW5ubyBHb2QgUmF5IDQnOiAnM0VDMCcsXHJcbiAgfSxcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIEl0J3MgaGFyZCB0byBjYXB0dXJlIHRoZSByZWZsZWN0aW9uIGFiaWxpdGllcyBmcm9tIExldmlhdGhhbidzIEhlYWQgYW5kIFRhaWwgaWYgeW91IHVzZVxyXG4vLyByYW5nZWQgcGh5c2ljYWwgYXR0YWNrcyAvIG1hZ2ljIGF0dGFja3MgcmVzcGVjdGl2ZWx5LCBhcyB0aGUgYWJpbGl0eSBuYW1lcyBhcmUgdGhlXHJcbi8vIGFiaWxpdHkgeW91IHVzZWQgYW5kIGRvbid0IGFwcGVhciB0byBzaG93IHVwIGluIHRoZSBsb2cgYXMgbm9ybWFsIFwiYWJpbGl0eVwiIGxpbmVzLlxyXG4vLyBUaGF0IHNhaWQsIGRvdHMgc3RpbGwgdGljayBpbmRlcGVuZGVudGx5IG9uIGJvdGggc28gaXQncyBsaWtlbHkgdGhhdCBwZW9wbGUgd2lsbCBhdGFja1xyXG4vLyB0aGVtIGFueXdheS5cclxuXHJcbi8vIFRPRE86IEZpZ3VyZSBvdXQgd2h5IERyZWFkIFRpZGUgLyBXYXRlcnNwb3V0IGFwcGVhciBsaWtlIHNoYXJlcyAoaS5lLiAweDE2IGlkKS5cclxuLy8gRHJlYWQgVGlkZSA9IDVDQ0EvNUNDQi81Q0NDLCBXYXRlcnNwb3V0ID0gNUNEMVxyXG5cclxuLy8gTGV2aWF0aGFuIFVucmVhbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlV2hvcmxlYXRlclVucmVhbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTGV2aVVuIEdyYW5kIEZhbGwnOiAnNUNERicsIC8vIHZlcnkgbGFyZ2UgY2lyY3VsYXIgYW9lIGJlZm9yZSBzcGlubnkgZGl2ZXMsIGFwcGxpZXMgaGVhdnlcclxuICAgICdMZXZpVW4gSHlkcm9zaG90JzogJzVDRDUnLCAvLyBXYXZlc3BpbmUgU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBEcm9wc3kgZWZmZWN0XHJcbiAgICAnTGV2aVVuIERyZWFkc3Rvcm0nOiAnNUNENicsIC8vIFdhdmV0b290aCBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIEh5c3RlcmlhIGVmZmVjdFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0xldmlVbiBCb2R5IFNsYW0nOiAnNUNEMicsIC8vIGxldmkgc2xhbSB0aGF0IHRpbHRzIHRoZSBib2F0XHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgMSc6ICc1Q0RCJywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDInOiAnNUNFMycsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpVW4gU3Bpbm5pbmcgRGl2ZSAzJzogJzVDRTgnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgNCc6ICc1Q0U5JywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnTGV2aVVuIERyb3BzeSc6ICcxMTAnLCAvLyBzdGFuZGluZyBpbiB0aGUgaHlkcm8gc2hvdCBmcm9tIHRoZSBXYXZlc3BpbmUgU2FoYWdpblxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnTGV2aVVuIEh5c3RlcmlhJzogJzEyOCcsIC8vIHN0YW5kaW5nIGluIHRoZSBkcmVhZHN0b3JtIGZyb20gdGhlIFdhdmV0b290aCBTYWhhZ2luXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0xldmlVbiBCb2R5IFNsYW0gS25vY2tlZCBPZmYnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1Q0QyJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogdGFraW5nIHR3byBkaWZmZXJlbnQgSGlnaC1Qb3dlcmVkIEhvbWluZyBMYXNlcnMgKDRBRDgpXHJcbi8vIFRPRE86IGNvdWxkIGJsYW1lIHRoZSB0ZXRoZXJlZCBwbGF5ZXIgZm9yIFdoaXRlIEFnb255IC8gV2hpdGUgRnVyeSBmYWlsdXJlcz9cclxuXHJcbi8vIFJ1YnkgV2VhcG9uIEV4dHJlbWVcclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNpbmRlckRyaWZ0RXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUnVieUV4IFJ1YnkgQml0IE1hZ2l0ZWsgUmF5JzogJzRBRDInLCAvLyBsaW5lIGFvZXMgZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgMSc6ICc0QUQzJywgLy8gaW5pdGlhbCBleHBsb3Npb24gZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgMic6ICc0QjJGJywgLy8gZm9sbG93dXAgaGVsaWNvY2xhdyBleHBsb3Npb25zXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDMnOiAnNEQwNCcsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgNCc6ICc0RDA1JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSA1JzogJzRBQ0QnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDYnOiAnNEFDRScsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggVW5kZXJtaW5lJzogJzRBRDAnLCAvLyBncm91bmQgYW9lcyB1bmRlciB0aGUgcmF2ZW5zY2xhdyBwYXRjaGVzXHJcbiAgICAnUnVieUV4IFJ1YnkgUmF5JzogJzRCMDInLCAvLyBmcm9udGFsIGxhc2VyXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxJzogJzRBRDknLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDInOiAnNEFEQScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMyc6ICc0QUREJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA0JzogJzRBREUnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDUnOiAnNEFERicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNic6ICc0QUUwJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA3JzogJzRBRTEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDgnOiAnNEFFMicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgOSc6ICc0QUUzJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMCc6ICc0QUU0JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMSc6ICc0QUU1JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMic6ICc0QUU2JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxMyc6ICc0QUU3JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNCc6ICc0QUU4JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNSc6ICc0QUU5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNic6ICc0QUVBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxNyc6ICc0RTZCJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxOCc6ICc0RTZDJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAxOSc6ICc0RTZEJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMCc6ICc0RTZFJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMSc6ICc0RTZGJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyMic6ICc0RTcwJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDEnOiAnNEIwNScsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gMic6ICc0QjA2JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biAzJzogJzRCMDcnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDQnOiAnNEIwOCcsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gNSc6ICc0RE9EJywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBNZXRlb3IgQnVyc3QnOiAnNEFGMicsIC8vIG1ldGVvciBleHBsb2RpbmdcclxuICAgICdSdWJ5RXggQnJhZGFtYW50ZSc6ICc0RTM4JywgLy8gaGVhZG1hcmtlcnMgd2l0aCBsaW5lIGFvZXNcclxuICAgICdSdWJ5RXggQ29tZXQgSGVhdnkgSW1wYWN0JzogJzRBRjYnLCAvLyBsZXR0aW5nIGEgdGFuayBjb21ldCBsYW5kXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnUnVieUV4IFJ1YnkgU3BoZXJlIEJ1cnN0JzogJzRBQ0InLCAvLyBleHBsb2RpbmcgdGhlIHJlZCBtaW5lXHJcbiAgICAnUnVieUV4IEx1bmFyIER5bmFtbyc6ICc0RUIwJywgLy8gXCJnZXQgaW5cIiBmcm9tIFJhdmVuJ3MgSW1hZ2VcclxuICAgICdSdWJ5RXggSXJvbiBDaGFyaW90JzogJzRFQjEnLCAvLyBcImdldCBvdXRcIiBmcm9tIFJhdmVuJ3MgSW1hZ2VcclxuICAgICdSdWJ5RXggSGVhcnQgSW4gVGhlIE1hY2hpbmUnOiAnNEFGQScsIC8vIFdoaXRlIEFnb255L0Z1cnkgc2t1bGwgaGl0dGluZyBwbGF5ZXJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdSdWJ5RXggSG9taW5nIExhc2Vycyc6ICc0QUQ2JywgLy8gc3ByZWFkIG1hcmtlcnMgZHVyaW5nIGN1dCBhbmQgcnVuXHJcbiAgICAnUnVieUV4IE1ldGVvciBTdHJlYW0nOiAnNEU2OCcsIC8vIHNwcmVhZCBtYXJrZXJzIGR1cmluZyBQMlxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnUnVieUV4IEh5c3RlcmlhJzogJzEyOCcsIC8vIE5lZ2F0aXZlIEF1cmEgbG9va2F3YXkgZmFpbHVyZVxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdSdWJ5RXggU2NyZWVjaCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRBRUUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9lLCBfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgaW50byB3YWxsJyxcclxuICAgICAgICAgICAgZGU6ICdSw7xja3N0b8OfIGluIGRpZSBXYW5kJyxcclxuICAgICAgICAgICAgamE6ICflo4Hjgbjjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOiHs+WimScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBSdWJ5IE5vcm1hbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2luZGVyRHJpZnQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1J1YnkgUmF2ZW5zY2xhdyc6ICc0QTkzJywgLy8gY2VudGVyZWQgY2lyY2xlIGFvZSBmb3IgcmF2ZW5zY2xhd1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMSc6ICc0QTlBJywgLy8gaW5pdGlhbCBleHBsb3Npb24gZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDInOiAnNEIyRScsIC8vIGZvbGxvd3VwIGhlbGljb2NsYXcgZXhwbG9zaW9uc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMyc6ICc0QTk0JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNCc6ICc0QTk1JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNSc6ICc0RDAyJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNic6ICc0RDAzJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgUnVieSBSYXknOiAnNEFDNicsIC8vIGZyb250YWwgbGFzZXJcclxuICAgICdSdWJ5IFVuZGVybWluZSc6ICc0QTk3JywgLy8gZ3JvdW5kIGFvZXMgdW5kZXIgdGhlIHJhdmVuc2NsYXcgcGF0Y2hlc1xyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDEnOiAnNEU2OScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDInOiAnNEU2QScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDMnOiAnNEFBMScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDQnOiAnNEFBMicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDUnOiAnNEFBMycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDYnOiAnNEFBNCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDcnOiAnNEFBNScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDgnOiAnNEFBNicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDknOiAnNEFBNycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDEwJzogJzRDMjEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAxMSc6ICc0QzJBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBDb21ldCBCdXJzdCc6ICc0QUI0JywgLy8gbWV0ZW9yIGV4cGxvZGluZ1xyXG4gICAgJ1J1YnkgQnJhZGFtYW50ZSc6ICc0QUJDJywgLy8gaGVhZG1hcmtlcnMgd2l0aCBsaW5lIGFvZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1J1YnkgSG9taW5nIExhc2VyJzogJzRBQzUnLCAvLyBzcHJlYWQgbWFya2VycyBpbiBQMVxyXG4gICAgJ1J1YnkgTWV0ZW9yIFN0cmVhbSc6ICc0RTY3JywgLy8gc3ByZWFkIG1hcmtlcnMgaW4gUDJcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gU2hpdmEgVW5yZWFsXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVBa2hBZmFoQW1waGl0aGVhdHJlVW5yZWFsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIExhcmdlIHdoaXRlIGNpcmNsZXMuXHJcbiAgICAnU2hpdmFFeCBJY2ljbGUgSW1wYWN0JzogJzUzN0InLFxyXG4gICAgLy8gXCJnZXQgaW5cIiBhb2VcclxuICAgICdTaGl2YUV4IFdoaXRlb3V0JzogJzUzNzYnLFxyXG4gICAgLy8gQXZvaWRhYmxlIHRhbmsgc3R1bi5cclxuICAgICdTaGl2YUV4IEdsYWNpZXIgQmFzaCc6ICc1Mzc1JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIDI3MCBkZWdyZWUgYXR0YWNrLlxyXG4gICAgJ1NoaXZhRXggR2xhc3MgRGFuY2UnOiAnNTM3OCcsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEhhaWxzdG9ybSBzcHJlYWQgbWFya2VyLlxyXG4gICAgJ1NoaXZhRXggSGFpbHN0b3JtJzogJzUzNkYnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBMYXNlci4gIFRPRE86IG1heWJlIGJsYW1lIHRoZSBwZXJzb24gaXQncyBvbj8/XHJcbiAgICAnU2hpdmFFeCBBdmFsYW5jaGUnOiAnNTM3OScsXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgLy8gUGFydHkgc2hhcmVkIHRhbmsgYnVzdGVyLlxyXG4gICAgJ1NoaXZhRXggSWNlYnJhbmQnOiAnNTM3MycsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhRXggRGVlcCBGcmVlemUnLFxyXG4gICAgICAvLyBTaGl2YSBhbHNvIHVzZXMgYWJpbGl0eSA1MzdBIG9uIHlvdSwgYnV0IGl0IGhhcyBhbiB1bmtub3duIG5hbWUuXHJcbiAgICAgIC8vIFNvLCB1c2UgdGhlIGVmZmVjdCBpbnN0ZWFkIGZvciBmcmVlIHRyYW5zbGF0aW9uLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUU3JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVGhlIGludGVybWlzc2lvbiBhbHNvIGdldHMgdGhpcyBlZmZlY3QsIGJ1dCBmb3IgYSBzaG9ydGVyIGR1cmF0aW9uLlxyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pID4gMjA7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRGFuY2luZ1BsYWd1ZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5pYSBXb29kXFwncyBFbWJyYWNlJzogJzNENTAnLFxyXG4gICAgLy8gJ1RpdGFuaWEgRnJvc3QgUnVuZSc6ICczRDRFJyxcclxuICAgICdUaXRhbmlhIEdlbnRsZSBCcmVlemUnOiAnM0Y4MycsXHJcbiAgICAnVGl0YW5pYSBMZWFmc3Rvcm0gMSc6ICczRDU1JyxcclxuICAgICdUaXRhbmlhIFB1Y2tcXCdzIFJlYnVrZSc6ICczRDU4JyxcclxuICAgICdUaXRhbmlhIExlYWZzdG9ybSAyJzogJzNFMDMnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuaWEgUGhhbnRvbSBSdW5lIDEnOiAnM0Q1RCcsXHJcbiAgICAnVGl0YW5pYSBQaGFudG9tIFJ1bmUgMic6ICczRDVFJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuaWEgRGl2aW5hdGlvbiBSdW5lJzogJzNENUInLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZURhbmNpbmdQbGFndWVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbmlhRXggV29vZFxcJ3MgRW1icmFjZSc6ICczRDJGJyxcclxuICAgIC8vICdUaXRhbmlhRXggRnJvc3QgUnVuZSc6ICczRDJCJyxcclxuICAgICdUaXRhbmlhRXggR2VudGxlIEJyZWV6ZSc6ICczRjgyJyxcclxuICAgICdUaXRhbmlhRXggTGVhZnN0b3JtIDEnOiAnM0QzOScsXHJcbiAgICAnVGl0YW5pYUV4IFB1Y2tcXCdzIFJlYnVrZSc6ICczRDQzJyxcclxuICAgICdUaXRhbmlhRXggV2FsbG9wJzogJzNEM0InLFxyXG4gICAgJ1RpdGFuaWFFeCBMZWFmc3Rvcm0gMic6ICczRDQ5JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbmlhRXggUGhhbnRvbSBSdW5lIDEnOiAnM0Q0QycsXHJcbiAgICAnVGl0YW5pYUV4IFBoYW50b20gUnVuZSAyJzogJzNENEQnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBUT0RPOiBUaGlzIGNvdWxkIG1heWJlIGJsYW1lIHRoZSBwZXJzb24gd2l0aCB0aGUgdGV0aGVyP1xyXG4gICAgJ1RpdGFuaWFFeCBUaHVuZGVyIFJ1bmUnOiAnM0QyOScsXHJcbiAgICAnVGl0YW5pYUV4IERpdmluYXRpb24gUnVuZSc6ICczRDRBJyxcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuXHJcbi8vIFRpdGFuIFVucmVhbFxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTmF2ZWxVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuVW4gV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzU4RkUnLFxyXG4gICAgJ1RpdGFuVW4gQnVyc3QnOiAnNUFERicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5VbiBMYW5kc2xpZGUnOiAnNUFEQycsXHJcbiAgICAnVGl0YW5VbiBHYW9sZXIgTGFuZHNsaWRlJzogJzU5MDInLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5VbiBSb2NrIEJ1c3Rlcic6ICc1OEY2JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuVW4gTW91bnRhaW4gQnVzdGVyJzogJzU4RjcnLFxyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1lbW9yaWFNaXNlcmFFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDEnOiAnNENEMicsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCAyJzogJzRDRDMnLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgMyc6ICc0Q0Q0JyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDQnOiAnNENENScsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCA1JzogJzRDRDYnLFxyXG4gICAgJ1ZhcmlzRXggSWduaXMgRXN0IDEnOiAnNENCNScsXHJcbiAgICAnVmFyaXNFeCBJZ25pcyBFc3QgMic6ICc0Q0M1JyxcclxuICAgICdWYXJpc0V4IFZlbnR1cyBFc3QgMSc6ICc0Q0M3JyxcclxuICAgICdWYXJpc0V4IFZlbnR1cyBFc3QgMic6ICc0Q0M4JyxcclxuICAgICdWYXJpc0V4IEFzc2F1bHQgQ2Fubm9uJzogJzRDRTUnLFxyXG4gICAgJ1ZhcmlzRXggRm9ydGl1cyBSb3RhdGluZyc6ICc0Q0U5JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIERvbid0IGhpdCB0aGUgc2hpZWxkcyFcclxuICAgICdWYXJpc0V4IFJlcGF5JzogJzRDREQnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBUaGlzIGlzIHRoZSBcInByb3RlYW5cIiBmb3J0aXVzLlxyXG4gICAgJ1ZhcmlzRXggRm9ydGl1cyBQcm90ZWFuJzogJzRDRTcnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVmFyaXNFeCBNYWdpdGVrIEJ1cnN0JzogJzRDREYnLFxyXG4gICAgJ1ZhcmlzRXggQWV0aGVyb2NoZW1pY2FsIEdyZW5hZG8nOiAnNENFRCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1ZhcmlzRXggVGVybWludXMgRXN0JyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0Q0I0JyxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IGUudGFyZ2V0TmFtZSwgdGV4dDogZS5hYmlsaXR5TmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogUmFkaWFudCBCcmF2ZXIgaXMgNEYxNi80RjE3KHgyKSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBEZXNwZXJhZG8gaXMgNEYxOC80RjE5LCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IE1ldGVvciBpcyA0RjFBLCBhbmQgc2hvdWxkbid0IGdldCBoaXQgYnkgbW9yZSB0aGFuIDE/XHJcbi8vIFRPRE86IG1pc3NpbmcgYSB0b3dlcj9cclxuXHJcbi8vIE5vdGU6IERlbGliZXJhdGVseSBub3QgaW5jbHVkaW5nIHB5cmV0aWMgZGFtYWdlIGFzIGFuIGVycm9yLlxyXG4vLyBOb3RlOiBJdCBkb2Vzbid0IGFwcGVhciB0aGF0IHRoZXJlJ3MgYW55IHdheSB0byB0ZWxsIHdobyBmYWlsZWQgdGhlIGN1dHNjZW5lLlxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVNlYXRPZlNhY3JpZmljZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnV09MIFNvbGVtbiBDb25maXRlb3InOiAnNEYyQScsIC8vIGdyb3VuZCBwdWRkbGVzXHJcbiAgICAnV09MIENvcnVzY2FudCBTYWJlciBJbic6ICc0RjEwJywgLy8gc2FiZXIgaW5cclxuICAgICdXT0wgQ29ydXNjYW50IFNhYmVyIE91dCc6ICc0RjExJywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MIEltYnVlZCBDb3J1c2FuY2UgT3V0JzogJzRGNEInLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0wgSW1idWVkIENvcnVzYW5jZSBJbic6ICc0RjRDJywgLy8gc2FiZXIgaW5cclxuICAgICdXT0wgU2hpbmluZyBXYXZlJzogJzRGMjYnLCAvLyBzd29yZCB0cmlhbmdsZVxyXG4gICAgJ1dPTCBDYXV0ZXJpemUnOiAnNEYyNScsXHJcbiAgICAnV09MIEJyaW1zdG9uZSBFYXJ0aCAxJzogJzRGMUUnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBpbml0aWFsXHJcbiAgICAnV09MIEJyaW1zdG9uZSBFYXJ0aCAyJzogJzRGMUYnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBncm93aW5nXHJcbiAgICAnV09MIEZsYXJlIEJyZWF0aCc6ICc0RjI0JyxcclxuICAgICdXT0wgRGVjaW1hdGlvbic6ICc0RjIzJyxcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1dPTCBEZWVwIEZyZWV6ZSc6ICc0RTYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0wgVHJ1ZSBXYWxraW5nIERlYWQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhFJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2UsIF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGUsIF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBuYW1lOiBlLnRhcmdldCwgcmVhc29uOiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5cclxuLy8gVE9ETzogUmFkaWFudCBCcmF2ZXIgaXMgNEVGNy80RUY4KHgyKSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBEZXNwZXJhZG8gaXMgNEVGOS80RUZBLCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IE1ldGVvciBpcyA0RUZDLCBhbmQgc2hvdWxkbid0IGdldCBoaXQgYnkgbW9yZSB0aGFuIDE/XHJcbi8vIFRPRE86IEFic29sdXRlIEhvbHkgc2hvdWxkIGJlIHNoYXJlZD9cclxuLy8gVE9ETzogaW50ZXJzZWN0aW5nIGJyaW1zdG9uZXM/XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlU2VhdE9mU2FjcmlmaWNlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnV09MRXggU29sZW1uIENvbmZpdGVvcic6ICc0RjBDJywgLy8gZ3JvdW5kIHB1ZGRsZXNcclxuICAgICdXT0xFeCBDb3J1c2NhbnQgU2FiZXIgSW4nOiAnNEVGMicsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MRXggQ29ydXNjYW50IFNhYmVyIE91dCc6ICc0RUYxJywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MRXggSW1idWVkIENvcnVzYW5jZSBPdXQnOiAnNEY0OScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTEV4IEltYnVlZCBDb3J1c2FuY2UgSW4nOiAnNEY0QScsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MRXggU2hpbmluZyBXYXZlJzogJzRGMDgnLCAvLyBzd29yZCB0cmlhbmdsZVxyXG4gICAgJ1dPTEV4IENhdXRlcml6ZSc6ICc0RjA3JyxcclxuICAgICdXT0xFeCBCcmltc3RvbmUgRWFydGgnOiAnNEYwMCcsIC8vIGNvcm5lciBncm93aW5nIGNpcmNsZXMsIGdyb3dpbmdcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1dPTEV4IEFic29sdXRlIFN0b25lIElJSSc6ICc0RUVCJywgLy8gcHJvdGVhbiB3YXZlIGltYnVlZCBtYWdpY1xyXG4gICAgJ1dPTEV4IEZsYXJlIEJyZWF0aCc6ICc0RjA2JywgLy8gdGV0aGVyIGZyb20gc3VtbW9uZWQgYmFoYW11dHNcclxuICAgICdXT0xFeCBQZXJmZWN0IERlY2ltYXRpb24nOiAnNEYwNScsIC8vIHNtbi93YXIgcGhhc2UgbWFya2VyXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdXT0xFeCBEZWVwIEZyZWV6ZSc6ICc0RTYnLCAvLyBmYWlsaW5nIEFic29sdXRlIEJsaXp6YXJkIElJSVxyXG4gICAgJ1dPTEV4IERhbWFnZSBEb3duJzogJzI3NCcsIC8vIGZhaWxpbmcgQWJzb2x1dGUgRmxhc2hcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAnV29sRXggS2F0b24gU2FuIFNoYXJlJzogJzRFRkUnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0xFeCBUcnVlIFdhbGtpbmcgRGVhZCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4RkYnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIG5hbWU6IGUudGFyZ2V0LCByZWFzb246IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTEV4IFRvd2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEYwNCcsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBtaXN0YWtlOiB7XHJcbiAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgIHJlYXNvbjoge1xyXG4gICAgICAgICAgZW46ICdNaXNzZWQgVG93ZXInLFxyXG4gICAgICAgICAgZGU6ICdUdXJtIHZlcnBhc3N0JyxcclxuICAgICAgICAgIGZyOiAnVG91ciBtYW5xdcOpZScsXHJcbiAgICAgICAgICBqYTogJ+WhlOOCkui4j+OBvuOBquOBi+OBo+OBnycsXHJcbiAgICAgICAgICBjbjogJ+ayoei4qeWhlCcsXHJcbiAgICAgICAgICBrbzogJ+yepe2MkCDsi6TsiJgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTEV4IFRydWUgSGFsbG93ZWQgR3JvdW5kJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEY0NCcgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIHJlYXNvbjogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBGb3IgQmVyc2VyayBhbmQgRGVlcCBEYXJrc2lkZVxyXG4gICAgICBpZDogJ1dPTEV4IE1pc3NlZCBJbnRlcnJ1cHQnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTE1NicsICc1MTU4J10gfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIHJlYXNvbjogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcblxyXG4vLyBUT0RPOiBGSVggbHVtaW5vdXMgYWV0aGVyb3BsYXNtIHdhcm5pbmcgbm90IHdvcmtpbmdcclxuLy8gVE9ETzogRklYIGRvbGwgZGVhdGggbm90IHdvcmtpbmdcclxuLy8gVE9ETzogZmFpbGluZyBoYW5kIG9mIHBhaW4vcGFydGluZyAoY2hlY2sgZm9yIGhpZ2ggZGFtYWdlPylcclxuLy8gVE9ETzogbWFrZSBzdXJlIGV2ZXJ5Ym9keSB0YWtlcyBleGFjdGx5IG9uZSBwcm90ZWFuIChyYXRoZXIgdGhhbiB3YXRjaGluZyBkb3VibGUgaGl0cylcclxuLy8gVE9ETzogdGh1bmRlciBub3QgaGl0dGluZyBleGFjdGx5IDI/XHJcbi8vIFRPRE86IHBlcnNvbiB3aXRoIHdhdGVyL3RodW5kZXIgZGVidWZmIGR5aW5nXHJcbi8vIFRPRE86IGJhZCBuaXNpIHBhc3NcclxuLy8gVE9ETzogZmFpbGVkIGdhdmVsIG1lY2hhbmljXHJcbi8vIFRPRE86IGRvdWJsZSByb2NrZXQgcHVuY2ggbm90IGhpdHRpbmcgZXhhY3RseSAyPyAob3IgdGFua3MpXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHNsdWRnZSBwdWRkbGVzIGJlZm9yZSBoaWRkZW4gbWluZT9cclxuLy8gVE9ETzogaGlkZGVuIG1pbmUgZmFpbHVyZT9cclxuLy8gVE9ETzogZmFpbHVyZXMgb2Ygb3JkYWluZWQgbW90aW9uIC8gc3RpbGxuZXNzXHJcbi8vIFRPRE86IGZhaWx1cmVzIG9mIHBsYWludCBvZiBzZXZlcml0eSAodGV0aGVycylcclxuLy8gVE9ETzogZmFpbHVyZXMgb2YgcGxhaW50IG9mIHNvbGlkYXJpdHkgKHNoYXJlZCBzZW50ZW5jZSlcclxuLy8gVE9ETzogb3JkYWluZWQgY2FwaXRhbCBwdW5pc2htZW50IGhpdHRpbmcgbm9uLXRhbmtzXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRXBpY09mQWxleGFuZGVyVWx0aW1hdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RFQSBTbHVpY2UnOiAnNDlCMScsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSAxJzogJzQ4MjQnLFxyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgMic6ICc0OUI1JyxcclxuICAgICdURUEgU3BpbiBDcnVzaGVyJzogJzRBNzInLFxyXG4gICAgJ1RFQSBTYWNyYW1lbnQnOiAnNDg1RicsXHJcbiAgICAnVEVBIFJhZGlhbnQgU2FjcmFtZW50JzogJzQ4ODYnLFxyXG4gICAgJ1RFQSBBbG1pZ2h0eSBKdWRnbWVudCc6ICc0ODkwJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdURUEgSGF3ayBCbGFzdGVyJzogJzQ4MzAnLFxyXG4gICAgJ1RFQSBDaGFrcmFtJzogJzQ4NTUnLFxyXG4gICAgJ1RFQSBFbnVtZXJhdGlvbic6ICc0ODUwJyxcclxuICAgICdURUEgQXBvY2FseXB0aWMgUmF5JzogJzQ4NEMnLFxyXG4gICAgJ1RFQSBQcm9wZWxsZXIgV2luZCc6ICc0ODMyJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgRG91YmxlIDEnOiAnNDlCNicsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSBEb3VibGUgMic6ICc0ODI1JyxcclxuICAgICdURUEgRmx1aWQgU3dpbmcnOiAnNDlCMCcsXHJcbiAgICAnVEVBIEZsdWlkIFN0cmlrZSc6ICc0OUI3JyxcclxuICAgICdURUEgSGlkZGVuIE1pbmUnOiAnNDg1MicsXHJcbiAgICAnVEVBIEFscGhhIFN3b3JkJzogJzQ4NkInLFxyXG4gICAgJ1RFQSBGbGFyZXRocm93ZXInOiAnNDg2QicsXHJcbiAgICAnVEVBIENoYXN0ZW5pbmcgSGVhdCc6ICc0QTgwJyxcclxuICAgICdURUEgRGl2aW5lIFNwZWFyJzogJzRBODInLFxyXG4gICAgJ1RFQSBPcmRhaW5lZCBQdW5pc2htZW50JzogJzQ4OTEnLFxyXG4gICAgLy8gT3B0aWNhbCBTcHJlYWRcclxuICAgICdURUEgSW5kaXZpZHVhbCBSZXByb2JhdGlvbic6ICc0ODhDJyxcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAvLyBPcHRpY2FsIFN0YWNrXHJcbiAgICAnVEVBIENvbGxlY3RpdmUgUmVwcm9iYXRpb24nOiAnNDg4RCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBCYWxsb29uIFBvcHBpbmcuICBJdCBzZWVtcyBsaWtlIHRoZSBwZXJzb24gd2hvIHBvcHMgaXQgaXMgdGhlXHJcbiAgICAgIC8vIGZpcnN0IHBlcnNvbiBsaXN0ZWQgZGFtYWdlLXdpc2UsIHNvIHRoZXkgYXJlIGxpa2VseSB0aGUgY3VscHJpdC5cclxuICAgICAgaWQ6ICdURUEgT3V0YnVyc3QnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzQ4MkEnLFxyXG4gICAgICBjb2xsZWN0U2Vjb25kczogMC41LFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDUsXHJcbiAgICAgIG1pc3Rha2U6IChlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogZVswXS50YXJnZXROYW1lLCB0ZXh0OiBlWzBdLmF0dGFja2VyTmFtZSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gXCJ0b28gbXVjaCBsdW1pbm91cyBhZXRoZXJvcGxhc21cIlxyXG4gICAgICAvLyBXaGVuIHRoaXMgaGFwcGVucywgdGhlIHRhcmdldCBleHBsb2RlcywgaGl0dGluZyBuZWFyYnkgcGVvcGxlXHJcbiAgICAgIC8vIGJ1dCBhbHNvIHRoZW1zZWx2ZXMuXHJcbiAgICAgIGlkOiAnVEVBIEV4aGF1c3QnLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzQ4MUYnLFxyXG4gICAgICBjb25kaXRpb246IChlKSA9PiBlLnRhcmdldE5hbWUgPT09IGUuYXR0YWNrZXJOYW1lLFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogZS50YXJnZXROYW1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2x1bWlub3VzIGFldGhlcm9wbGFzbScsXHJcbiAgICAgICAgICAgIGRlOiAnTHVtaW5pc3plbnRlcyDDhHRoZXJvcGxhc21hJyxcclxuICAgICAgICAgICAgZnI6ICfDiXRow6lyb3BsYXNtYSBsdW1pbmV1eCcsXHJcbiAgICAgICAgICAgIGphOiAn5YWJ5oCn54iG6Zu3JyxcclxuICAgICAgICAgICAgY246ICflhYnmgKfniIbpm7cnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgRHJvcHN5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzEyMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFRldGhlciBUcmFja2luZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0phZ2QgRG9sbCcsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5qYWdkVGV0aGVyID0gZGF0YS5qYWdkVGV0aGVyIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuamFnZFRldGhlclttYXRjaGVzLnNvdXJjZUlkXSA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgUmVkdWNpYmxlIENvbXBsZXhpdHknLFxyXG4gICAgICBkYW1hZ2VSZWdleDogJzQ4MjEnLFxyXG4gICAgICBtaXN0YWtlOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAvLyBUaGlzIG1heSBiZSB1bmRlZmluZWQsIHdoaWNoIGlzIGZpbmUuXHJcbiAgICAgICAgICBuYW1lOiBkYXRhLmphZ2RUZXRoZXIgPyBkYXRhLmphZ2RUZXRoZXJbZS5hdHRhY2tlcklkXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdEb2xsIERlYXRoJyxcclxuICAgICAgICAgICAgZGU6ICdQdXBwZSBUb3QnLFxyXG4gICAgICAgICAgICBmcjogJ1BvdXDDqWUgbW9ydGUnLFxyXG4gICAgICAgICAgICBqYTogJ+ODieODvOODq+OBjOatu+OCk+OBoCcsXHJcbiAgICAgICAgICAgIGNuOiAn5rWu5aOr5b635q275LqhJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIERyYWluYWdlJyxcclxuICAgICAgZGFtYWdlUmVnZXg6ICc0ODI3JyxcclxuICAgICAgY29uZGl0aW9uOiAoZSwgZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIFRPRE86IHJlbW92ZSB0aGlzIHdoZW4gbmdsZCBvdmVybGF5cGx1Z2luIGlzIHRoZSBkZWZhdWx0XHJcbiAgICAgICAgaWYgKCFkYXRhLnBhcnR5LnBhcnR5TmFtZXMubGVuZ3RoKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gZGF0YS5Jc1BsYXllcklkKGUudGFyZ2V0SWQpICYmICFkYXRhLnBhcnR5LmlzVGFuayhlLnRhcmdldE5hbWUpO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogZS50YXJnZXROYW1lLCB0ZXh0OiBlLmFiaWxpdHlOYW1lIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBUaHJvdHRsZSBHYWluJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzJCQycgfSksXHJcbiAgICAgIHJ1bjogKF9lLCBkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZSA9IGRhdGEuaGFzVGhyb3R0bGUgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUgTG9zZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBydW46IChfZSwgZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVGhyb3R0bGUgPSBkYXRhLmhhc1Rocm90dGxlIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVGhyb3R0bGVbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBUaHJvdHRsZScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZSwgX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2UsIGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzVGhyb3R0bGUpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc1Rocm90dGxlW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICByZWFzb246IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcbiIsImltcG9ydCBmaWxlMCBmcm9tICcuLzAwLW1pc2MvYnVmZnMuanMnO1xuaW1wb3J0IGZpbGUxIGZyb20gJy4vMDAtbWlzYy9nZW5lcmFsLmpzJztcbmltcG9ydCBmaWxlMiBmcm9tICcuLzAwLW1pc2MvdGVzdC5qcyc7XG5pbXBvcnQgZmlsZTMgZnJvbSAnLi8wMi1hcnIvdHJpYWwvaWZyaXQtbm0uanMnO1xuaW1wb3J0IGZpbGU0IGZyb20gJy4vMDItYXJyL3RyaWFsL3RpdGFuLW5tLmpzJztcbmltcG9ydCBmaWxlNSBmcm9tICcuLzAyLWFyci90cmlhbC9sZXZpLWV4LmpzJztcbmltcG9ydCBmaWxlNiBmcm9tICcuLzAyLWFyci90cmlhbC9zaGl2YS1obS5qcyc7XG5pbXBvcnQgZmlsZTcgZnJvbSAnLi8wMi1hcnIvdHJpYWwvc2hpdmEtZXguanMnO1xuaW1wb3J0IGZpbGU4IGZyb20gJy4vMDItYXJyL3RyaWFsL3RpdGFuLWhtLmpzJztcbmltcG9ydCBmaWxlOSBmcm9tICcuLzAyLWFyci90cmlhbC90aXRhbi1leC5qcyc7XG5pbXBvcnQgZmlsZTEwIGZyb20gJy4vMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LmpzJztcbmltcG9ydCBmaWxlMTEgZnJvbSAnLi8wMy1ody9kdW5nZW9uL2FldGhlcm9jaGVtaWNhbF9yZXNlYXJjaF9mYWNpbGl0eS5qcyc7XG5pbXBvcnQgZmlsZTEyIGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9mcmFjdGFsX2NvbnRpbnV1bS5qcyc7XG5pbXBvcnQgZmlsZTEzIGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQuanMnO1xuaW1wb3J0IGZpbGUxNCBmcm9tICcuLzAzLWh3L2R1bmdlb24vc29obV9hbF9oYXJkLmpzJztcbmltcG9ydCBmaWxlMTUgZnJvbSAnLi8wMy1ody9yYWlkL2ExMm4uanMnO1xuaW1wb3J0IGZpbGUxNiBmcm9tICcuLzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLmpzJztcbmltcG9ydCBmaWxlMTcgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL2JhcmRhbXNfbWV0dGxlLmpzJztcbmltcG9ydCBmaWxlMTggZnJvbSAnLi8wNC1zYi9kdW5nZW9uL2t1Z2FuZV9jYXN0bGUuanMnO1xuaW1wb3J0IGZpbGUxOSBmcm9tICcuLzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC5qcyc7XG5pbXBvcnQgZmlsZTIwIGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9zd2FsbG93c19jb21wYXNzLmpzJztcbmltcG9ydCBmaWxlMjEgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3RlbXBsZV9vZl90aGVfZmlzdC5qcyc7XG5pbXBvcnQgZmlsZTIyIGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi5qcyc7XG5pbXBvcnQgZmlsZTIzIGZyb20gJy4vMDQtc2IvcmFpZC9vMW4uanMnO1xuaW1wb3J0IGZpbGUyNCBmcm9tICcuLzA0LXNiL3JhaWQvbzJuLmpzJztcbmltcG9ydCBmaWxlMjUgZnJvbSAnLi8wNC1zYi9yYWlkL28zbi5qcyc7XG5pbXBvcnQgZmlsZTI2IGZyb20gJy4vMDQtc2IvcmFpZC9vNG4uanMnO1xuaW1wb3J0IGZpbGUyNyBmcm9tICcuLzA0LXNiL3JhaWQvbzRzLmpzJztcbmltcG9ydCBmaWxlMjggZnJvbSAnLi8wNC1zYi9yYWlkL283cy5qcyc7XG5pbXBvcnQgZmlsZTI5IGZyb20gJy4vMDQtc2IvcmFpZC9vMTJzLmpzJztcbmltcG9ydCBmaWxlMzAgZnJvbSAnLi8wNC1zYi90cmlhbC9ieWFra28tZXguanMnO1xuaW1wb3J0IGZpbGUzMSBmcm9tICcuLzA0LXNiL3RyaWFsL3NoaW5yeXUuanMnO1xuaW1wb3J0IGZpbGUzMiBmcm9tICcuLzA0LXNiL3RyaWFsL3N1c2Fuby1leC5qcyc7XG5pbXBvcnQgZmlsZTMzIGZyb20gJy4vMDQtc2IvdWx0aW1hdGUvdWx0aW1hX3dlYXBvbl91bHRpbWF0ZS5qcyc7XG5pbXBvcnQgZmlsZTM0IGZyb20gJy4vMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS5qcyc7XG5pbXBvcnQgZmlsZTM1IGZyb20gJy4vMDUtc2hiL2FsbGlhbmNlL3RoZV9jb3BpZWRfZmFjdG9yeS5qcyc7XG5pbXBvcnQgZmlsZTM2IGZyb20gJy4vMDUtc2hiL2FsbGlhbmNlL3RoZV9wdXBwZXRzX2J1bmtlci5qcyc7XG5pbXBvcnQgZmlsZTM3IGZyb20gJy4vMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLmpzJztcbmltcG9ydCBmaWxlMzggZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9ha2FkYWVtaWFfYW55ZGVyLmpzJztcbmltcG9ydCBmaWxlMzkgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9hbWF1cm90LmpzJztcbmltcG9ydCBmaWxlNDAgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLmpzJztcbmltcG9ydCBmaWxlNDEgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9kb2huX21oZWcuanMnO1xuaW1wb3J0IGZpbGU0MiBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2hlcm9lc19nYXVudGxldC5qcyc7XG5pbXBvcnQgZmlsZTQzIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2guanMnO1xuaW1wb3J0IGZpbGU0NCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL21hbGlrYWhzX3dlbGwuanMnO1xuaW1wb3J0IGZpbGU0NSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL21hdG95YXNfcmVsaWN0LmpzJztcbmltcG9ydCBmaWxlNDYgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLmpzJztcbmltcG9ydCBmaWxlNDcgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9wYWdsdGhhbi5qcyc7XG5pbXBvcnQgZmlsZTQ4IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vcWl0YW5hX3JhdmVsLmpzJztcbmltcG9ydCBmaWxlNDkgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLmpzJztcbmltcG9ydCBmaWxlNTAgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi90d2lubmluZy5qcyc7XG5pbXBvcnQgZmlsZTUxIGZyb20gJy4vMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlLmpzJztcbmltcG9ydCBmaWxlNTIgZnJvbSAnLi8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLmpzJztcbmltcG9ydCBmaWxlNTMgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMW4uanMnO1xuaW1wb3J0IGZpbGU1NCBmcm9tICcuLzA1LXNoYi9yYWlkL2Uxcy5qcyc7XG5pbXBvcnQgZmlsZTU1IGZyb20gJy4vMDUtc2hiL3JhaWQvZTJuLmpzJztcbmltcG9ydCBmaWxlNTYgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMnMuanMnO1xuaW1wb3J0IGZpbGU1NyBmcm9tICcuLzA1LXNoYi9yYWlkL2Uzbi5qcyc7XG5pbXBvcnQgZmlsZTU4IGZyb20gJy4vMDUtc2hiL3JhaWQvZTNzLmpzJztcbmltcG9ydCBmaWxlNTkgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNG4uanMnO1xuaW1wb3J0IGZpbGU2MCBmcm9tICcuLzA1LXNoYi9yYWlkL2U0cy5qcyc7XG5pbXBvcnQgZmlsZTYxIGZyb20gJy4vMDUtc2hiL3JhaWQvZTVuLmpzJztcbmltcG9ydCBmaWxlNjIgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNXMuanMnO1xuaW1wb3J0IGZpbGU2MyBmcm9tICcuLzA1LXNoYi9yYWlkL2U2bi5qcyc7XG5pbXBvcnQgZmlsZTY0IGZyb20gJy4vMDUtc2hiL3JhaWQvZTZzLmpzJztcbmltcG9ydCBmaWxlNjUgZnJvbSAnLi8wNS1zaGIvcmFpZC9lN24uanMnO1xuaW1wb3J0IGZpbGU2NiBmcm9tICcuLzA1LXNoYi9yYWlkL2U3cy5qcyc7XG5pbXBvcnQgZmlsZTY3IGZyb20gJy4vMDUtc2hiL3JhaWQvZThuLmpzJztcbmltcG9ydCBmaWxlNjggZnJvbSAnLi8wNS1zaGIvcmFpZC9lOHMuanMnO1xuaW1wb3J0IGZpbGU2OSBmcm9tICcuLzA1LXNoYi9yYWlkL2U5bi5qcyc7XG5pbXBvcnQgZmlsZTcwIGZyb20gJy4vMDUtc2hiL3JhaWQvZTlzLmpzJztcbmltcG9ydCBmaWxlNzEgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMTBuLmpzJztcbmltcG9ydCBmaWxlNzIgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMTBzLmpzJztcbmltcG9ydCBmaWxlNzMgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMTFuLmpzJztcbmltcG9ydCBmaWxlNzQgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMTFzLmpzJztcbmltcG9ydCBmaWxlNzUgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMTJuLmpzJztcbmltcG9ydCBmaWxlNzYgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMTJzLmpzJztcbmltcG9ydCBmaWxlNzcgZnJvbSAnLi8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24tZXguanMnO1xuaW1wb3J0IGZpbGU3OCBmcm9tICcuLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi5qcyc7XG5pbXBvcnQgZmlsZTc5IGZyb20gJy4vMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LmpzJztcbmltcG9ydCBmaWxlODAgZnJvbSAnLi8wNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24uanMnO1xuaW1wb3J0IGZpbGU4MSBmcm9tICcuLzA1LXNoYi90cmlhbC9oYWRlcy1leC5qcyc7XG5pbXBvcnQgZmlsZTgyIGZyb20gJy4vMDUtc2hiL3RyaWFsL2hhZGVzLmpzJztcbmltcG9ydCBmaWxlODMgZnJvbSAnLi8wNS1zaGIvdHJpYWwvaW5ub2NlbmNlLWV4LmpzJztcbmltcG9ydCBmaWxlODQgZnJvbSAnLi8wNS1zaGIvdHJpYWwvaW5ub2NlbmNlLmpzJztcbmltcG9ydCBmaWxlODUgZnJvbSAnLi8wNS1zaGIvdHJpYWwvbGV2aS11bi5qcyc7XG5pbXBvcnQgZmlsZTg2IGZyb20gJy4vMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLWV4LmpzJztcbmltcG9ydCBmaWxlODcgZnJvbSAnLi8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24uanMnO1xuaW1wb3J0IGZpbGU4OCBmcm9tICcuLzA1LXNoYi90cmlhbC9zaGl2YS11bi5qcyc7XG5pbXBvcnQgZmlsZTg5IGZyb20gJy4vMDUtc2hiL3RyaWFsL3RpdGFuaWEuanMnO1xuaW1wb3J0IGZpbGU5MCBmcm9tICcuLzA1LXNoYi90cmlhbC90aXRhbmlhLWV4LmpzJztcbmltcG9ydCBmaWxlOTEgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdGl0YW4tdW4uanMnO1xuaW1wb3J0IGZpbGU5MiBmcm9tICcuLzA1LXNoYi90cmlhbC92YXJpcy1leC5qcyc7XG5pbXBvcnQgZmlsZTkzIGZyb20gJy4vMDUtc2hiL3RyaWFsL3dvbC5qcyc7XG5pbXBvcnQgZmlsZTk0IGZyb20gJy4vMDUtc2hiL3RyaWFsL3dvbC1leC5qcyc7XG5pbXBvcnQgZmlsZTk1IGZyb20gJy4vMDUtc2hiL3VsdGltYXRlL3RoZV9lcGljX29mX2FsZXhhbmRlci5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IHsnMDAtbWlzYy9idWZmcy5qcyc6IGZpbGUwLCcwMC1taXNjL2dlbmVyYWwuanMnOiBmaWxlMSwnMDAtbWlzYy90ZXN0LmpzJzogZmlsZTIsJzAyLWFyci90cmlhbC9pZnJpdC1ubS5qcyc6IGZpbGUzLCcwMi1hcnIvdHJpYWwvdGl0YW4tbm0uanMnOiBmaWxlNCwnMDItYXJyL3RyaWFsL2xldmktZXguanMnOiBmaWxlNSwnMDItYXJyL3RyaWFsL3NoaXZhLWhtLmpzJzogZmlsZTYsJzAyLWFyci90cmlhbC9zaGl2YS1leC5qcyc6IGZpbGU3LCcwMi1hcnIvdHJpYWwvdGl0YW4taG0uanMnOiBmaWxlOCwnMDItYXJyL3RyaWFsL3RpdGFuLWV4LmpzJzogZmlsZTksJzAzLWh3L2FsbGlhbmNlL3dlZXBpbmdfY2l0eS5qcyc6IGZpbGUxMCwnMDMtaHcvZHVuZ2Vvbi9hZXRoZXJvY2hlbWljYWxfcmVzZWFyY2hfZmFjaWxpdHkuanMnOiBmaWxlMTEsJzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0uanMnOiBmaWxlMTIsJzAzLWh3L2R1bmdlb24vZ3ViYWxfbGlicmFyeV9oYXJkLmpzJzogZmlsZTEzLCcwMy1ody9kdW5nZW9uL3NvaG1fYWxfaGFyZC5qcyc6IGZpbGUxNCwnMDMtaHcvcmFpZC9hMTJuLmpzJzogZmlsZTE1LCcwNC1zYi9kdW5nZW9uL2FsYV9taGlnby5qcyc6IGZpbGUxNiwnMDQtc2IvZHVuZ2Vvbi9iYXJkYW1zX21ldHRsZS5qcyc6IGZpbGUxNywnMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLmpzJzogZmlsZTE4LCcwNC1zYi9kdW5nZW9uL3N0X21vY2lhbm5lX2hhcmQuanMnOiBmaWxlMTksJzA0LXNiL2R1bmdlb24vc3dhbGxvd3NfY29tcGFzcy5qcyc6IGZpbGUyMCwnMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QuanMnOiBmaWxlMjEsJzA0LXNiL2R1bmdlb24vdGhlX2J1cm4uanMnOiBmaWxlMjIsJzA0LXNiL3JhaWQvbzFuLmpzJzogZmlsZTIzLCcwNC1zYi9yYWlkL28ybi5qcyc6IGZpbGUyNCwnMDQtc2IvcmFpZC9vM24uanMnOiBmaWxlMjUsJzA0LXNiL3JhaWQvbzRuLmpzJzogZmlsZTI2LCcwNC1zYi9yYWlkL280cy5qcyc6IGZpbGUyNywnMDQtc2IvcmFpZC9vN3MuanMnOiBmaWxlMjgsJzA0LXNiL3JhaWQvbzEycy5qcyc6IGZpbGUyOSwnMDQtc2IvdHJpYWwvYnlha2tvLWV4LmpzJzogZmlsZTMwLCcwNC1zYi90cmlhbC9zaGlucnl1LmpzJzogZmlsZTMxLCcwNC1zYi90cmlhbC9zdXNhbm8tZXguanMnOiBmaWxlMzIsJzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUuanMnOiBmaWxlMzMsJzA0LXNiL3VsdGltYXRlL3VuZW5kaW5nX2NvaWxfdWx0aW1hdGUuanMnOiBmaWxlMzQsJzA1LXNoYi9hbGxpYW5jZS90aGVfY29waWVkX2ZhY3RvcnkuanMnOiBmaWxlMzUsJzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIuanMnOiBmaWxlMzYsJzA1LXNoYi9hbGxpYW5jZS90aGVfdG93ZXJfYXRfcGFyYWRpZ21zX2JyZWFjaC5qcyc6IGZpbGUzNywnMDUtc2hiL2R1bmdlb24vYWthZGFlbWlhX2FueWRlci5qcyc6IGZpbGUzOCwnMDUtc2hiL2R1bmdlb24vYW1hdXJvdC5qcyc6IGZpbGUzOSwnMDUtc2hiL2R1bmdlb24vYW5hbW5lc2lzX2FueWRlci5qcyc6IGZpbGU0MCwnMDUtc2hiL2R1bmdlb24vZG9obl9taGVnLmpzJzogZmlsZTQxLCcwNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQuanMnOiBmaWxlNDIsJzA1LXNoYi9kdW5nZW9uL2hvbG1pbnN0ZXJfc3dpdGNoLmpzJzogZmlsZTQzLCcwNS1zaGIvZHVuZ2Vvbi9tYWxpa2Foc193ZWxsLmpzJzogZmlsZTQ0LCcwNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC5qcyc6IGZpbGU0NSwnMDUtc2hiL2R1bmdlb24vbXRfZ3VsZy5qcyc6IGZpbGU0NiwnMDUtc2hiL2R1bmdlb24vcGFnbHRoYW4uanMnOiBmaWxlNDcsJzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC5qcyc6IGZpbGU0OCwnMDUtc2hiL2R1bmdlb24vdGhlX2dyYW5kX2Nvc21vcy5qcyc6IGZpbGU0OSwnMDUtc2hiL2R1bmdlb24vdHdpbm5pbmcuanMnOiBmaWxlNTAsJzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS5qcyc6IGZpbGU1MSwnMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlX3NhdmFnZS5qcyc6IGZpbGU1MiwnMDUtc2hiL3JhaWQvZTFuLmpzJzogZmlsZTUzLCcwNS1zaGIvcmFpZC9lMXMuanMnOiBmaWxlNTQsJzA1LXNoYi9yYWlkL2Uybi5qcyc6IGZpbGU1NSwnMDUtc2hiL3JhaWQvZTJzLmpzJzogZmlsZTU2LCcwNS1zaGIvcmFpZC9lM24uanMnOiBmaWxlNTcsJzA1LXNoYi9yYWlkL2Uzcy5qcyc6IGZpbGU1OCwnMDUtc2hiL3JhaWQvZTRuLmpzJzogZmlsZTU5LCcwNS1zaGIvcmFpZC9lNHMuanMnOiBmaWxlNjAsJzA1LXNoYi9yYWlkL2U1bi5qcyc6IGZpbGU2MSwnMDUtc2hiL3JhaWQvZTVzLmpzJzogZmlsZTYyLCcwNS1zaGIvcmFpZC9lNm4uanMnOiBmaWxlNjMsJzA1LXNoYi9yYWlkL2U2cy5qcyc6IGZpbGU2NCwnMDUtc2hiL3JhaWQvZTduLmpzJzogZmlsZTY1LCcwNS1zaGIvcmFpZC9lN3MuanMnOiBmaWxlNjYsJzA1LXNoYi9yYWlkL2U4bi5qcyc6IGZpbGU2NywnMDUtc2hiL3JhaWQvZThzLmpzJzogZmlsZTY4LCcwNS1zaGIvcmFpZC9lOW4uanMnOiBmaWxlNjksJzA1LXNoYi9yYWlkL2U5cy5qcyc6IGZpbGU3MCwnMDUtc2hiL3JhaWQvZTEwbi5qcyc6IGZpbGU3MSwnMDUtc2hiL3JhaWQvZTEwcy5qcyc6IGZpbGU3MiwnMDUtc2hiL3JhaWQvZTExbi5qcyc6IGZpbGU3MywnMDUtc2hiL3JhaWQvZTExcy5qcyc6IGZpbGU3NCwnMDUtc2hiL3JhaWQvZTEybi5qcyc6IGZpbGU3NSwnMDUtc2hiL3JhaWQvZTEycy5qcyc6IGZpbGU3NiwnMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLWV4LmpzJzogZmlsZTc3LCcwNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24uanMnOiBmaWxlNzgsJzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi1leC5qcyc6IGZpbGU3OSwnMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLmpzJzogZmlsZTgwLCcwNS1zaGIvdHJpYWwvaGFkZXMtZXguanMnOiBmaWxlODEsJzA1LXNoYi90cmlhbC9oYWRlcy5qcyc6IGZpbGU4MiwnMDUtc2hiL3RyaWFsL2lubm9jZW5jZS1leC5qcyc6IGZpbGU4MywnMDUtc2hiL3RyaWFsL2lubm9jZW5jZS5qcyc6IGZpbGU4NCwnMDUtc2hiL3RyaWFsL2xldmktdW4uanMnOiBmaWxlODUsJzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi1leC5qcyc6IGZpbGU4NiwnMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLmpzJzogZmlsZTg3LCcwNS1zaGIvdHJpYWwvc2hpdmEtdW4uanMnOiBmaWxlODgsJzA1LXNoYi90cmlhbC90aXRhbmlhLmpzJzogZmlsZTg5LCcwNS1zaGIvdHJpYWwvdGl0YW5pYS1leC5qcyc6IGZpbGU5MCwnMDUtc2hiL3RyaWFsL3RpdGFuLXVuLmpzJzogZmlsZTkxLCcwNS1zaGIvdHJpYWwvdmFyaXMtZXguanMnOiBmaWxlOTIsJzA1LXNoYi90cmlhbC93b2wuanMnOiBmaWxlOTMsJzA1LXNoYi90cmlhbC93b2wtZXguanMnOiBmaWxlOTQsJzA1LXNoYi91bHRpbWF0ZS90aGVfZXBpY19vZl9hbGV4YW5kZXIuanMnOiBmaWxlOTUsfTsiXSwic291cmNlUm9vdCI6IiJ9