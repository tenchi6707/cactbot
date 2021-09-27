(self["webpackChunkcactbot"] = self["webpackChunkcactbot"] || []).push([[727],{

/***/ 8791:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ oopsy_manifest)
});

// EXTERNAL MODULE: ./resources/netregexes.ts
var netregexes = __webpack_require__(622);
// EXTERNAL MODULE: ./resources/zone_id.ts
var zone_id = __webpack_require__(5588);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/00-misc/general.ts


// General mistakes; these apply everywhere.
const triggerSet = {
  zoneId: zone_id/* default.MatchAll */.Z.MatchAll,
  triggers: [{
    // Trigger id for internally generated early pull warning.
    id: 'General Early Pull'
  }, {
    id: 'General Food Buff',
    type: 'LosesEffect',
    // Well Fed
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '48'
    }),
    condition: (_data, matches) => {
      // Prevent "Eos loses the effect of Well Fed from Critlo Mcgee"
      return matches.target === matches.source;
    },
    mistake: (data, matches) => {
      var _data$lostFood;

      (_data$lostFood = data.lostFood) !== null && _data$lostFood !== void 0 ? _data$lostFood : data.lostFood = {}; // Well Fed buff happens repeatedly when it falls off (WHY),
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '48'
    }),
    run: (data, matches) => {
      if (!data.lostFood) return;
      delete data.lostFood[matches.target];
    }
  }, {
    id: 'General Rabbit Medium',
    type: 'Ability',
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
};
/* harmony default export */ const general = (triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/00-misc/test.ts


// Test mistake triggers.
const test_triggerSet = {
  zoneId: zone_id/* default.MiddleLaNoscea */.Z.MiddleLaNoscea,
  triggers: [{
    id: 'Test Bow',
    type: 'GameLog',
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
    type: 'GameLog',
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
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '35'
    }),
    condition: (data, matches) => {
      if (matches.source !== data.me) return false;
      const strikingDummyByLocale = {
        en: 'Striking Dummy',
        de: 'Trainingspuppe',
        fr: 'Mannequin d\'entraînement',
        ja: '木人',
        cn: '木人',
        ko: '나무인형'
      };
      const strikingDummyNames = Object.values(strikingDummyByLocale);
      return strikingDummyNames.includes(matches.target);
    },
    mistake: (data, matches) => {
      var _data$bootCount;

      (_data$bootCount = data.bootCount) !== null && _data$bootCount !== void 0 ? _data$bootCount : data.bootCount = 0;
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
    type: 'GainsEffect',
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
    type: 'GameLog',
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
    type: 'GameLog',
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
      var _data$pokeCount;

      data.pokeCount = ((_data$pokeCount = data.pokeCount) !== null && _data$pokeCount !== void 0 ? _data$pokeCount : 0) + 1;
    }
  }, {
    id: 'Test Poke',
    type: 'GameLog',
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
};
/* harmony default export */ const test = (test_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/ifrit-nm.ts

// Ifrit Story Mode
const ifrit_nm_triggerSet = {
  zoneId: zone_id/* default.TheBowlOfEmbers */.Z.TheBowlOfEmbers,
  damageWarn: {
    'IfritNm Radiant Plume': '2DE'
  },
  shareWarn: {
    'IfritNm Incinerate': '1C5',
    'IfritNm Eruption': '2DD'
  }
};
/* harmony default export */ const ifrit_nm = (ifrit_nm_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-nm.ts

// Titan Story Mode
const titan_nm_triggerSet = {
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '82A'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '98A'
    }),
    run: data => {
      data.seenDiamondDust = true;
    }
  }, {
    id: 'ShivaHm Deep Freeze',
    type: 'GainsEffect',
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
    type: 'GainsEffect',
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
};
/* harmony default export */ const shiva_ex = (shiva_ex_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-hm.ts

// Titan Hard
const titan_hm_triggerSet = {
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
};
/* harmony default export */ const titan_hm = (titan_hm_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-ex.ts

// Titan Extreme
const titan_ex_triggerSet = {
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
};
/* harmony default export */ const titan_ex = (titan_ex_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/alliance/weeping_city.ts


const weeping_city_triggerSet = {
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
  triggers: [{
    id: 'Weeping Forgall Gradual Zombification Gain',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '415'
    }),
    run: (data, matches) => {
      var _data$zombie;

      (_data$zombie = data.zombie) !== null && _data$zombie !== void 0 ? _data$zombie : data.zombie = {};
      data.zombie[matches.target] = true;
    }
  }, {
    id: 'Weeping Forgall Gradual Zombification Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '415'
    }),
    run: (data, matches) => {
      data.zombie = data.zombie || {};
      data.zombie[matches.target] = false;
    }
  }, {
    id: 'Weeping Forgall Mega Death',
    type: 'Ability',
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '15E'
    }),
    run: (data, matches) => {
      var _data$shield;

      (_data$shield = data.shield) !== null && _data$shield !== void 0 ? _data$shield : data.shield = {};
      data.shield[matches.target] = true;
    }
  }, {
    id: 'Weeping Headstone Shield Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '15E'
    }),
    run: (data, matches) => {
      data.shield = data.shield || {};
      data.shield[matches.target] = false;
    }
  }, {
    id: 'Weeping Flaring Epigraph',
    type: 'Ability',
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
    type: 'Ability',
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '182E'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
};
/* harmony default export */ const weeping_city = (weeping_city_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/aetherochemical_research_facility.ts


// Aetherochemical Research Facility
const aetherochemical_research_facility_triggerSet = {
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
    type: 'GainsEffect',
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
};
/* harmony default export */ const aetherochemical_research_facility = (aetherochemical_research_facility_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/fractal_continuum.ts

// Fractal Continuum
const fractal_continuum_triggerSet = {
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
};
/* harmony default export */ const fractal_continuum = (fractal_continuum_triggerSet);
// EXTERNAL MODULE: ./ui/oopsyraidsy/oopsy_common.ts
var oopsy_common = __webpack_require__(4416);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/gubal_library_hard.ts



const gubal_library_hard_triggerSet = {
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
    type: 'GainsEffect',
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '46E'
    }),
    run: (data, matches) => {
      var _data$hasImp;

      (_data$hasImp = data.hasImp) !== null && _data$hasImp !== void 0 ? _data$hasImp : data.hasImp = {};
      data.hasImp[matches.target] = true;
    }
  }, {
    id: 'GubalHm Imp Lose',
    type: 'LosesEffect',
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
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '195[AB]',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (data, matches) => {
      var _data$hasImp2;

      return (_data$hasImp2 = data.hasImp) === null || _data$hasImp2 === void 0 ? void 0 : _data$hasImp2[matches.target];
    },
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
    type: 'Ability',
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
    type: 'Ability',
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
};
/* harmony default export */ const gubal_library_hard = (gubal_library_hard_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/sohm_al_hard.ts


const sohm_al_hard_triggerSet = {
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
    type: 'GainsEffect',
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
};
/* harmony default export */ const sohm_al_hard = (sohm_al_hard_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/raid/a6n.ts

const a6n_triggerSet = {
  zoneId: zone_id/* default.AlexanderTheCuffOfTheSon */.Z.AlexanderTheCuffOfTheSon,
  damageWarn: {
    'Minefield': '170D',
    // Circle AoE, mines.
    'Mine': '170E',
    // Mine explosion.
    'Supercharge': '1713',
    // Mirage charge.
    'Height Error': '171D',
    // Incorrect panel for Height.
    'Earth Missile': '1726' // Circle AoE, fire puddles.

  },
  damageFail: {
    'Ultra Flash': '1722' // Room-wide death AoE, if not LoS'd.

  },
  shareWarn: {
    'Ice Missile': '1727' // Ice headmarker AoE circles.

  },
  shareFail: {
    'Single Buster': '1717' // Single laser Attachment. Non-tanks are *probably* dead.

  },
  soloWarn: {
    'Double Buster': '1718',
    // Twin laser Attachment.
    'Enumeration': '171E' // Enumeration circle.

  }
};
/* harmony default export */ const a6n = (a6n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/raid/a12n.ts



const a12n_triggerSet = {
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '461'
    }),
    run: (data, matches) => {
      var _data$assault;

      (_data$assault = data.assault) !== null && _data$assault !== void 0 ? _data$assault : data.assault = [];
      data.assault.push(matches.target);
    }
  }, {
    // It is a failure for a Severity marker to stack with the Solidarity group.
    id: 'A12N Assault Failure',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '1AF2',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (data, matches) => {
      var _data$assault2;

      return (_data$assault2 = data.assault) === null || _data$assault2 === void 0 ? void 0 : _data$assault2.includes(matches.target);
    },
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '461'
    }),
    delaySeconds: 20,
    suppressSeconds: 5,
    run: data => {
      delete data.assault;
    }
  }]
};
/* harmony default export */ const a12n = (a12n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/ala_mhigo.ts


const ala_mhigo_triggerSet = {
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
    type: 'GainsEffect',
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
};
/* harmony default export */ const ala_mhigo = (ala_mhigo_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/bardams_mettle.ts



// For reasons not completely understood at the time this was merged,
// but likely related to the fact that no nameplates are visible during the encounter,
// and that nothing in the encounter actually does damage,
// we can't use damageWarn or gainsEffect helpers on the Bardam fight.
// Instead, we use this helper function to look for failure flags.
// If the flag is present,a full trigger object is returned that drops in seamlessly.
const abilityWarn = args => {
  if (!args.abilityId) console.error('Missing ability ' + JSON.stringify(args));
  const trigger = {
    id: args.id,
    type: 'Ability',
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
  return trigger;
};

const bardams_mettle_triggerSet = {
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
  gainsEffectWarn: {
    'Bardam Confused': '0B' // Failed gaze attack, Yol, third boss

  },
  gainsEffectFail: {
    'Bardam Fetters': '56F' // Failing two mechanics in any one phase on Bardam, second boss.

  },
  shareWarn: {
    'Bardam Garula Rush': '1EF9',
    // Line AoE, Garula, first boss.
    'Bardam Flutterfall Targeted': '1F0C',
    // Circle AoE headmarker, Yol, third boss
    'Bardam Wingbeat': '1F0F' // Conal AoE headmarker, Yol, third boss

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
};
/* harmony default export */ const bardams_mettle = (bardams_mettle_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/drowned_city_of_skalla.ts

const drowned_city_of_skalla_triggerSet = {
  zoneId: zone_id/* default.TheDrownedCityOfSkalla */.Z.TheDrownedCityOfSkalla,
  damageWarn: {
    'Hydrocannon': '2697',
    // Line AoE, Salt Swallow trash, before boss 1
    'Stagnant Spray': '2699',
    // Conal AoE, Skalla Nanka trash, before boss 1
    'Bubble Burst': '261B',
    // Bubble explosion, Hydrosphere, boss 1
    'Plain Pound': '269A',
    // Large circle AoE, Dhara Sentinel trash, before boss 2
    'Boulder Toss': '269B',
    // Small circle AoE, Stone Phoebad trash, before boss 2
    'Landslip': '269C',
    // Conal AoE, Stone Phoebad trash, before boss 2
    'Mystic Light': '2657',
    // Conal AoE, The Old One, boss 2
    'Mystic Flame': '2659',
    // Large circle AoE, The Old One, boss 2. 2658 is the cast-time ability.
    'Dark II': '110E',
    // Thin cone AoE, Lightless Homunculus trash, after boss 2
    'Implosive Curse': '269E',
    // Conal AoE, Zangbeto trash, after boss 2
    'Undying FIre': '269F',
    // Circle AoE, Zangbeto trash, after boss 2
    'Fire II': '26A0',
    // Circle AoE, Accursed Idol trash, after boss 2
    'Rusting Claw': '2661',
    // Frontal cleave, Hrodric Poisontongue, boss 3
    'Words Of Woe': '2662',
    // Eye lasers, Hrodric Poisontongue, boss 3
    'Tail Drive': '2663',
    // Rear cleave, Hrodric Poisontongue, boss 3
    'Ring Of Chaos': '2667' // Ring headmarker, Hrodric Poisontongue, boss 3

  },
  damageFail: {
    'Self-Detonate': '265C' // Roomwide explosion, Subservient, boss 2

  },
  gainsEffectWarn: {
    'Dropsy': '11B',
    // Standing in Bloody Puddles, or being knocked outside the arena, boss 1
    'Confused': '0B' // Failing the gaze attack, boss 3

  },
  shareWarn: {
    'Bloody Puddle': '2655',
    // Large watery spread circles, Kelpie, boss 1
    'Cross Of Chaos': '2668',
    // Cross headmarker, Hrodric Poisontongue, boss 3
    'Circle Of Chaos': '2669' // Spread circle headmarker, Hrodric Poisontongue, boss 3

  }
};
/* harmony default export */ const drowned_city_of_skalla = (drowned_city_of_skalla_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/kugane_castle.ts


const kugane_castle_triggerSet = {
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
    type: 'Ability',
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
};
/* harmony default export */ const kugane_castle = (kugane_castle_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/sirensong_sea.ts

const sirensong_sea_triggerSet = {
  zoneId: zone_id/* default.TheSirensongSea */.Z.TheSirensongSea,
  damageWarn: {
    'Sirensong Ancient Ymir Head Snatch': '2353',
    // frontal conal
    'Sirensong Reflection of Karlabos Tail Screw': '12B7',
    // targeted circle
    'Sirensong Lugat Amorphous Applause': '1F56',
    // frontal 180 cleave
    'Sirensong Lugat Concussive Oscillation': '1F5B',
    // 5 or 7 circles
    'Sirensong The Jane Guy Ball of Malice': '1F6A',
    // ambient cannon circle
    'Sirensong Dark': '19DF',
    // Skinless Skipper / Fleshless Captive targeted circle
    'Sirensong The Governor Shadowstrike': '1F5D',
    // standing in shadows
    'Sirensong Undead Warden March of the Dead': '2351',
    // frontal conal
    'Sirensong Fleshless Captive Flood': '218B',
    // centered circle after seductive scream
    'Sirensong Lorelei Void Water III': '1F68' // large targeted circle

  }
};
/* harmony default export */ const sirensong_sea = (sirensong_sea_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/st_mocianne_hard.ts

const st_mocianne_hard_triggerSet = {
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
  shareWarn: {
    'St Mocianne Hard Taproot': '2E4C',
    // Large orange spread circles, Nullchu, boss 1
    'St Mocianne Hard Earth Shaker': '3131' // Earth Shaker, Lakhamu, boss 2

  },
  soloFail: {
    'St Mocianne Hard Fault Warren': '2E4A' // Stack marker, Nullchu, boss 1

  }
};
/* harmony default export */ const st_mocianne_hard = (st_mocianne_hard_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/swallows_compass.ts


const swallows_compass_triggerSet = {
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
  gainsEffectWarn: {
    'Swallows Compass Hysteria': '128',
    // Gaze attack failure, Otengu, boss 1
    'Swallows Compass Bleeding': '112F' // Stepping outside the arena, boss 3

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
  triggers: [{
    // Standing in the lake, Diadarabotchi, boss 2
    id: 'Swallows Compass Six Fulms Under',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '237'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: matches.effect
      };
    }
  }, {
    // Stack marker, boss 3
    id: 'Swallows Compass Five Fingered Punishment',
    type: 'Ability',
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
};
/* harmony default export */ const swallows_compass = (swallows_compass_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/temple_of_the_fist.ts

const temple_of_the_fist_triggerSet = {
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
};
/* harmony default export */ const temple_of_the_fist = (temple_of_the_fist_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/the_burn.ts

const the_burn_triggerSet = {
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
  gainsEffectWarn: {
    'The Burn Leaden': '43',
    // Puddle effect, boss 2. (Also inflicts 11F, Sludge.)
    'The Burn Puddle Frostbite': '11D' // Ice puddle effect, boss 3. (NOT the conal-inflicted one, 10C.)

  },
  shareWarn: {
    'The Burn Hailfire': '3194',
    // Head marker line AoE, Hedetet, boss 1
    'The Burn Shardstrike': '3195',
    // Orange spread head markers, Hedetet, boss 1
    'The Burn Chilling Aspiration': '314D',
    // Head marker cleave, Mist Dragon, boss 3
    'The Burn Frost Breath': '314C' // Tank cleave, Mist Dragon, boss 3

  }
};
/* harmony default export */ const the_burn = (the_burn_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o1n.ts

// O1N - Deltascape 1.0 Normal
const o1n_triggerSet = {
  zoneId: zone_id/* default.DeltascapeV10 */.Z.DeltascapeV10,
  damageWarn: {
    'O1N Burn': '23D5',
    // Fireball explosion circle AoEs
    'O1N Clamp': '23E2' // Frontal rectangle knockback AoE, Alte Roite

  },
  shareWarn: {
    'O1N Levinbolt': '23DA' // small spread circles

  }
};
/* harmony default export */ const o1n = (o1n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o1s.ts

// O1S - Deltascape 1.0 Savage
const o1s_triggerSet = {
  zoneId: zone_id/* default.DeltascapeV10Savage */.Z.DeltascapeV10Savage,
  damageWarn: {
    'O1S Turbulence': '2584',
    // standing under the boss before downburst
    'O1S Ball Of Fire Burn': '1ECB' // fireball explosion

  },
  damageFail: {
    'O1S Clamp': '1EDE' // large frontal line aoe

  },
  shareWarn: {
    'O1S Levinbolt': '1ED2' // lightning spread

  }
};
/* harmony default export */ const o1s = (o1s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o2n.ts



// O2N - Deltascape 2.0 Normal
const o2n_triggerSet = {
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
    type: 'GainsEffect',
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
    type: 'Ability',
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
};
/* harmony default export */ const o2n = (o2n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o2s.ts



// O2S - Deltascape 2.0 Savage
const o2s_triggerSet = {
  zoneId: zone_id/* default.DeltascapeV20Savage */.Z.DeltascapeV20Savage,
  damageWarn: {
    'O2S Weighted Wing': '23EF',
    // Unstable Gravity explosions on players (after Long Drop)
    'O2S Gravitational Explosion 1': '2367',
    // failing Four Fold Sacrifice 4 person stack
    'O2S Gravitational Explosion 2': '2368',
    // failing Four Fold Sacrifice 4 person stack
    'O2S Main Quake': '2359' // untelegraphed explosions from epicenter tentacles

  },
  gainsEffectFail: {
    'O2S Stone Curse': '589' // failing Death's Gaze or taking too many tankbuster stacks

  },
  triggers: [{
    // ground blue arena circles; (probably?) only do damage if not floating
    // TODO: usually this just doesn't hit anybody at all, due to patterns.
    // Floating over one is untested.
    id: 'O2S Petrosphere Explosion',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '245D',
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
    // floating yellow arena circles; only do damage if floating
    id: 'O2S Potent Petrosphere Explosion',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '2362',
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
    // Must be floating to survive; hits everyone but only does damage if not floating.
    id: 'O2S Earthquake',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '247A',
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
};
/* harmony default export */ const o2s = (o2s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o3n.ts


// O3N - Deltascape 3.0 Normal
const o3n_triggerSet = {
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
    'O3N Holy Blur': '2463' // Spread circles.

  },
  triggers: [{
    id: 'O3N Phase Tracker',
    type: 'StartsUsing',
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
      var _data$phaseNumber;

      return data.phaseNumber = ((_data$phaseNumber = data.phaseNumber) !== null && _data$phaseNumber !== void 0 ? _data$phaseNumber : 0) + 1;
    }
  }, {
    // There's a lot to track, and in order to make it all clean, it's safest just to
    // initialize it all up front instead of trying to guard against undefined comparisons.
    id: 'O3N Initializing',
    type: 'Ability',
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '2466'
    }),
    condition: (data, matches) => {
      var _data$gameCount;

      // We DO want to be hit by Toad/Ribbit if the next cast of The Game
      // is 4x toad panels.
      const gameCount = (_data$gameCount = data.gameCount) !== null && _data$gameCount !== void 0 ? _data$gameCount : 0;
      return !(data.phaseNumber === 3 && gameCount % 2 === 0) && matches.targetId !== 'E0000000';
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
    type: 'Ability',
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
      var _data$gameCount2;

      return data.gameCount = ((_data$gameCount2 = data.gameCount) !== null && _data$gameCount2 !== void 0 ? _data$gameCount2 : 0) + 1;
    }
  }]
};
/* harmony default export */ const o3n = (o3n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o3s.ts



// TODO: handle Ribbit (22F7), Oink (22F9, if damage), Squelch (22F8, if damage)
//       which is an error except during the second game
// O3S - Deltascape 3.0 Savage
const o3s_triggerSet = {
  zoneId: zone_id/* default.DeltascapeV30Savage */.Z.DeltascapeV30Savage,
  damageWarn: {
    'O3S Spellblade Fire III': '22EC',
    // donut
    'O3S Spellblade Thunder III': '22EE',
    // line
    'O3S Spellblade Blizzard III': '22ED',
    // circle
    'O3S Uplift': '230D',
    // not standing on blue square
    'O3S Soul Reaper Gusting Gouge': '22FF',
    // reaper line aoe during cave phase
    'O3S Soul Reaper Cross Reaper': '22FD',
    // middle reaper circle
    'O3S Soul Reaper Stench of Death': '22FE',
    // outside reapers (during final phase)
    'O3S Apanda Magic Hammer': '2315',
    // books phase magic hammer circle
    'O3S Briar Thorn': '2309' // not breaking tethers fast enough

  },
  shareWarn: {
    'O3S Holy Edge': '22F0',
    // Spellblade Holy spread
    'O3S Sword Dance': '2307',
    // protean wave
    'O3S Great Dragon Frost Breath': '2312',
    // tank cleave from Great Dragon
    'O3S Iron Giant Grand Sword': '2316' // tank cleave from Iron Giant

  },
  shareFail: {
    'O3S Folio': '230F' // books books books

  },
  soloWarn: {
    'O3S Holy Blur': '22F1' // Spellblade Holy stack

  },
  triggers: [{
    // Everybody gets hits by this, but it's only a failure if it does damage.
    id: 'O3S The Game',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '2301',
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
};
/* harmony default export */ const o3s = (o3s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o4n.ts



// O4N - Deltascape 4.0 Normal
const o4n_triggerSet = {
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
    // Kills target if not cleansed
    id: 'O4N Doom',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '38E'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '24B8',
      ...oopsy_common/* playerDamageFields */.np
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
          en: 'Pushed off!',
          de: 'Runter geschubst!',
          fr: 'A été poussé(e) !',
          ja: '落ちた',
          cn: '击退坠落'
        }
      };
    }
  }, {
    // Room-wide AoE, freezes non-moving targets
    id: 'O4N Empowered Blizzard',
    type: 'GainsEffect',
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
};
/* harmony default export */ const o4n = (o4n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o4s.ts


 // TODO: taking the wrong color white/black antilight

// O4S - Deltascape 4.0 Savage
const o4s_triggerSet = {
  zoneId: zone_id/* default.DeltascapeV40Savage */.Z.DeltascapeV40Savage,
  damageWarn: {
    'O4S1 Vine Clearout': '240C',
    // circle of vines
    'O4S1 Zombie Breath': '240B',
    // tree exdeath conal
    'O4S1 Vacuum Wave': '23FE',
    // circle centered on exdeath
    'O4S2 Neo Vacuum Wave': '241D',
    // "out of melee"
    'O4S2 Death Bomb': '2431',
    // failed acceleration bomb
    'O4S2 Emptiness 1': '2421',
    // exaflares initial
    'O4S2 Emptiness 2': '2422' // exaflares moving

  },
  damageFail: {
    'O4S1 Black Hole Black Spark': '2407',
    // black hole catching you
    'O4S2 Edge Of Death': '2415',
    // standing between the two color lasers
    'O4S2 Inner Antilight': '244C',
    // inner laser
    'O4S2 Outer Antilight': '2410' // outer laser

  },
  shareWarn: {
    'O4S1 Fire III': '23F6' // spread explosion

  },
  shareFail: {
    'O4S1 Thunder III': '23FA' // tankbuster

  },
  triggers: [{
    id: 'O4S2 Decisive Battle',
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '2408',
      capture: false
    }),
    run: data => {
      data.isDecisiveBattleElement = true;
    }
  }, {
    id: 'O4S1 Vacuum Wave',
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '23FE',
      capture: false
    }),
    run: data => {
      data.isDecisiveBattleElement = false;
    }
  }, {
    id: 'O4S2 Almagest',
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '2417',
      capture: false
    }),
    run: data => {
      data.isNeoExdeath = true;
    }
  }, {
    id: 'O4S2 Blizzard III',
    type: 'Ability',
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
        text: matches.ability
      };
    }
  }, {
    id: 'O4S2 Thunder III',
    type: 'Ability',
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
        text: matches.ability
      };
    }
  }, {
    id: 'O4S2 Petrified',
    type: 'GainsEffect',
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
    type: 'Ability',
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '566'
    }),
    run: (data, matches) => {
      var _data$hasBeyondDeath;

      (_data$hasBeyondDeath = data.hasBeyondDeath) !== null && _data$hasBeyondDeath !== void 0 ? _data$hasBeyondDeath : data.hasBeyondDeath = {};
      data.hasBeyondDeath[matches.target] = true;
    }
  }, {
    id: 'O4S2 Beyond Death Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '566'
    }),
    run: (data, matches) => {
      var _data$hasBeyondDeath2;

      (_data$hasBeyondDeath2 = data.hasBeyondDeath) !== null && _data$hasBeyondDeath2 !== void 0 ? _data$hasBeyondDeath2 : data.hasBeyondDeath = {};
      data.hasBeyondDeath[matches.target] = false;
    }
  }, {
    id: 'O4S2 Beyond Death',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '566'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (data, matches) => {
      if (!data.hasBeyondDeath) return;
      if (!data.hasBeyondDeath[matches.target]) return;
      return {
        name: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'O4S2 Double Attack Collect',
    type: 'Ability',
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
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '241C',
      ...oopsy_common/* playerDamageFields */.np
    }),
    mistake: data => {
      var _arr$0$ability, _arr$;

      const arr = data.doubleAttackMatches;
      if (!arr) return;
      if (arr.length <= 2) return; // Hard to know who should be in this and who shouldn't, but
      // it should never hit 3 people.

      return {
        type: 'fail',
        text: `${(_arr$0$ability = (_arr$ = arr[0]) === null || _arr$ === void 0 ? void 0 : _arr$.ability) !== null && _arr$0$ability !== void 0 ? _arr$0$ability : ''} x ${arr.length}`
      };
    },
    run: data => delete data.doubleAttackMatches
  }]
};
/* harmony default export */ const o4s = (o4s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o5n.ts


 // TODO: Diabolic Wind (28B9) always seems to be 0x16 not 0x15.

// O5N - Sigmascape 1.0 Normal
const o5n_triggerSet = {
  zoneId: zone_id/* default.SigmascapeV10 */.Z.SigmascapeV10,
  damageWarn: {
    'O5N Wroth Ghost Encumber': '28AE',
    // squares that ghosts appear in
    'O5N Saintly Beam': '28AA' // chasing circles that destroy ghosts

  },
  triggers: [{
    id: 'O5N Throttle Gain',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '3AA'
    }),
    run: (data, matches) => {
      var _data$hasThrottle;

      ((_data$hasThrottle = data.hasThrottle) !== null && _data$hasThrottle !== void 0 ? _data$hasThrottle : data.hasThrottle = {})[matches.target] = true;
      console.log(JSON.stringify(data.hasThrottle));
    }
  }, {
    id: 'O5N Throttle Death',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '3AA'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 1,
    deathReason: (data, matches) => {
      var _data$hasThrottle2;

      if ((_data$hasThrottle2 = data.hasThrottle) !== null && _data$hasThrottle2 !== void 0 && _data$hasThrottle2[matches.target]) return {
        name: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'O5N Throttle Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '3AA'
    }),
    run: (data, matches) => {
      var _data$hasThrottle3;

      ((_data$hasThrottle3 = data.hasThrottle) !== null && _data$hasThrottle3 !== void 0 ? _data$hasThrottle3 : data.hasThrottle = {})[matches.target] = false;
      console.log(JSON.stringify(data.hasThrottle));
    }
  }, {
    // Getting hit by a ghost without throttle (the mandatory post-chimney one).
    id: 'O5N Possess',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '28AC',
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (data, matches) => {
      var _data$hasThrottle4;

      return !((_data$hasThrottle4 = data.hasThrottle) !== null && _data$hasThrottle4 !== void 0 && _data$hasThrottle4[matches.target]);
    },
    mistake: (_data, matches) => {
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.ability
      };
    }
  }]
};
/* harmony default export */ const o5n = (o5n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o6n.ts


// O6N - Sigmascape 2.0 Normal
const o6n_triggerSet = {
  zoneId: zone_id/* default.SigmascapeV20 */.Z.SigmascapeV20,
  damageWarn: {
    'O6N Earthquake': '2811',
    // failing to be in a plane
    'O6N Demonic Stone': '2847',
    // chasing circles
    'O6N Demonic Wave': '2831',
    // failing to be behind rock
    'O6N Demonic Spout 1': '2835',
    // pair of targeted circles (#1)
    'O6N Demonic Spout 2': '2837',
    // pair of targeted circles (#2)
    'O6N Featherlance': '2AE8',
    // blown away Easterly circles
    'O6N Intense Pain': '2AE7' // failing to spread for Demonic Pain tether

  },
  triggers: [{
    id: 'O6N Fire Resistance Gain',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '5ED'
    }),
    run: (data, matches) => {
      var _data$hasFireResist;

      return ((_data$hasFireResist = data.hasFireResist) !== null && _data$hasFireResist !== void 0 ? _data$hasFireResist : data.hasFireResist = {})[matches.target] = true;
    }
  }, {
    id: 'O6N Fire Resistance Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '5ED'
    }),
    run: (data, matches) => {
      var _data$hasFireResist2;

      return ((_data$hasFireResist2 = data.hasFireResist) !== null && _data$hasFireResist2 !== void 0 ? _data$hasFireResist2 : data.hasFireResist = {})[matches.target] = false;
    }
  }, {
    // Flash Fire without Fire Resistance.
    id: 'O6N Flash Fire',
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '280B'
    }),
    condition: (data, matches) => {
      var _data$hasFireResist3;

      return !((_data$hasFireResist3 = data.hasFireResist) !== null && _data$hasFireResist3 !== void 0 && _data$hasFireResist3[matches.target]);
    },
    mistake: (_data, matches) => {
      return {
        type: 'warn',
        blame: matches.target,
        text: matches.ability
      };
    }
  }]
};
/* harmony default export */ const o6n = (o6n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o7n.ts

// O7N - Sigmascape 3.0 Normal
const o7n_triggerSet = {
  zoneId: zone_id/* default.SigmascapeV30 */.Z.SigmascapeV30,
  damageWarn: {
    'O7N Magitek Ray': '276B',
    // untelegraphed frontal line
    'O7N Ink': '275D',
    // Initial Ultros targeted circles
    'O7N Tentacle': '275F',
    // Tentacle simulation targeted circles
    'O7N Wallop': '2760',
    // Ultros tentacles attacking
    'O7N Chain Cannon': '2770',
    // baited airship add cannon
    'O7N Missile Explosion': '2765',
    // Hitting a missile
    'O7N Bibliotaph Deep Darkness': '29BF',
    // giant donut
    'O7N Dadaluma Aura Cannon': '2767',
    // large line aoe
    'O7N Guardian Diffractive Laser': '2761',
    // initial Air Force centered circle on Guardian
    'O7N Air Force Diffractive Laser': '273F',
    // Air Force add large conal
    'O7N Interdimensional Explosion': '2763' // Failed bomb (either wrong side or ignored)

  },
  damageFail: {
    'O7N Super Chakra Burst': '2769' // Missed Dadaluma tower (hits everybody)

  },
  gainsEffectFail: {
    'O7N Shocked': '5DA' // touching arena edge

  }
};
/* harmony default export */ const o7n = (o7n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o7s.ts


// TODO: missing many abilities here
// O7S - Sigmascape 3.0 Savage
const o7s_triggerSet = {
  zoneId: zone_id/* default.SigmascapeV30Savage */.Z.SigmascapeV30Savage,
  damageWarn: {
    'O7S Searing Wind': '2777'
  },
  damageFail: {
    'O7S Missile': '2782',
    'O7S Chain Cannon': '278F'
  },
  triggers: [{
    id: 'O7S Stoneskin',
    type: 'Ability',
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
};
/* harmony default export */ const o7s = (o7s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o8n.ts



// O8N - Sigmascape 4.0 Normal
const o8n_triggerSet = {
  zoneId: zone_id/* default.SigmascapeV40 */.Z.SigmascapeV40,
  damageWarn: {
    'O8N Blizzard Blitz 1': '2918',
    'O8N Blizzard Blitz 2': '2914',
    'O8N Thrumming Thunder 1': '291D',
    'O8N Thrumming Thunder 2': '291C',
    'O8N Thrumming Thunder 3': '291B',
    'O8N Wave Cannon': '2928',
    // telegraphed line aoes
    'O8N Revolting Ruin': '2923',
    // large 180 cleave after Timely Teleport
    'O8N Intemperate Will': '292A',
    // east 180 cleave
    'O8N Gravitational Wave': '292B' // west 180 cleave

  },
  shareWarn: {
    'O8N Flagrant Fire Spread': '291F' // true spread markers

  },
  soloWarn: {
    'O8N Flagrant Fire Stack': '2920' // fake spread marker

  },
  triggers: [{
    // Look away; does damage if failed.
    id: 'O8N Indolent Will',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '292C',
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
    // Look towards; does damage if failed.
    id: 'O8N Ave Maria',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '292B',
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
    id: 'O8N Shockwave',
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '2927'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
    id: 'O8N Aero Assault',
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '2924'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
};
/* harmony default export */ const o8n = (o8n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o9n.ts

// O9N - Alphascape 1.0 Normal
const o9n_triggerSet = {
  zoneId: zone_id/* default.AlphascapeV10 */.Z.AlphascapeV10,
  damageWarn: {
    'O9N Damning Edict': '3150',
    // huge 180 frontal cleave
    'O9N Stray Spray': '316C',
    // Dynamic Fluid debuff donut explosion
    'O9N Stray Flames': '316B',
    // Entropy debuff circle explosion
    'O9N Knockdown Big Bang': '3160',
    // big circle where Knockdown marker dropped
    'O9N Fire Big Bang': '315F',
    // ground circles during fire phase
    'O9N Shockwave': '3153',
    // Longitudinal/Latiudinal Implosion
    'O9N Chaosphere Fiendish Orbs Orbshadow 1': '3162',
    // line aoes from Earth phase orbs
    'O9N Chaosphere Fiendish Orbs Orbshadow 2': '3163' // line aoes from Earth phase orbs

  }
};
/* harmony default export */ const o9n = (o9n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o10n.ts

// TODO: Akh Rhai (3624) is not unusual to take ~1 hit from, so don't list.
// O10N - Alphascape 2.0 Normal
const o10n_triggerSet = {
  zoneId: zone_id/* default.AlphascapeV20 */.Z.AlphascapeV20,
  damageWarn: {
    'O10N Azure Wings': '31CD',
    // Out
    'O10N Stygian Maw': '31CF',
    // In
    'O10N Horrid Roar': '31D3',
    // targeted circles
    'O10N Bloodied Maw': '31D0',
    // Corners
    'O10N Cauterize': '3241',
    // divebomb attack
    'O10N Scarlet Thread': '362B',
    // orb waffle lines
    'O10N Exaflare 1': '362D',
    'O10N Exaflare 2': '362F'
  },
  shareWarn: {
    'O10N Earth Shaker': '31D1',
    // as it says on the tin
    'O10N Frost Breath': '33EE',
    // Ancient Dragon frontal conal
    'O10N Thunderstorm': '31D2' // purple spread marker

  }
};
/* harmony default export */ const o10n = (o10n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o11n.ts

// O11N - Alphascape 3.0 Normal
const o11n_triggerSet = {
  zoneId: zone_id/* default.AlphascapeV30 */.Z.AlphascapeV30,
  damageWarn: {
    'O11N Starboard Wave Cannon 1': '3281',
    // initial right cleave
    'O11N Starboard Wave Cannon 2': '3282',
    // follow-up right cleave
    'O11N Larboard Wave Cannon 1': '3283',
    // initial left cleave
    'O11N Larboard Wave Cannon 2': '3284',
    // follow-up left cleave
    'O11N Flame Thrower': '327D',
    // pinwheel conals
    'O11N Critical Storage Violation': '3279',
    // missing midphase towers
    'O11N Level Checker Reset': '35AA',
    // "get out" circle
    'O11N Level Checker Reformat': '35A9',
    // "get in" donut
    'O11N Rocket Punch Rush': '3606' // giant hand 1/3 arena line aoes

  },
  gainsEffectWarn: {
    'O11N Burns': 'FA' // standing in ballistic missile fire puddle

  },
  gainsEffectFail: {
    'O11N Memory Loss': '65A' // failing to cleanse Looper in a tower

  },
  shareWarn: {
    'O11N Ballistic Impact': '327F' // spread markers

  },
  shareFail: {
    'O11N Blaster': '3280' // tank tether

  },
  soloFail: {
    'O11N Electric Slide': '3285' // stack marker

  }
};
/* harmony default export */ const o11n = (o11n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o12n.ts


// O12N - Alphascape 4.0 Normal
const o12n_triggerSet = {
  zoneId: zone_id/* default.AlphascapeV40 */.Z.AlphascapeV40,
  damageWarn: {
    'O12N Floodlight': '3309',
    // targeted circular aoes after Program Alpha
    'O12N Efficient Bladework': '32FF',
    // telegraphed centered circle
    'O12N Efficient Bladework Untelegraphed': '32F3',
    // centered circle after transformation
    'O12N Optimized Blizzard III': '3303',
    // cross aoe
    'O12N Superliminal Steel 1': '3306',
    // sides of the room
    'O12N Superliminal Steel 2': '3307',
    // sides of the room
    'O12N Beyond Strength': '3300',
    // donut
    'O12N Optical Laser': '3320',
    // line aoe from eye
    'O12N Optimized Sagittarius Arrow': '3323' // line aoe from Omega-M

  },
  shareWarn: {
    'O12N Solar Ray': '330F' // circular tankbuster

  },
  soloWarn: {
    'O12N Spotlight': '330A' // stack marker

  },
  triggers: [{
    id: 'O12N Discharger Knocked Off',
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '32F6'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
};
/* harmony default export */ const o12n = (o12n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o12s.ts



// TODO: could add Patch warnings for double/unbroken tethers
// TODO: Hello World could have any warnings (sorry)
const o12s_triggerSet = {
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '3327'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '472'
    }),
    run: (data, matches) => {
      var _data$vuln;

      (_data$vuln = data.vuln) !== null && _data$vuln !== void 0 ? _data$vuln : data.vuln = {};
      data.vuln[matches.target] = true;
    }
  }, {
    id: 'O12S1 Magic Vulnerability Up Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '472'
    }),
    run: (data, matches) => {
      data.vuln = data.vuln || {};
      data.vuln[matches.target] = false;
    }
  }, {
    id: 'O12S1 Magic Vulnerability Damage',
    type: 'Ability',
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
    type: 'Ability',
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
};
/* harmony default export */ const byakko_ex = (byakko_ex_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/shinryu.ts



// Shinryu Normal
const shinryu_triggerSet = {
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
    type: 'GainsEffect',
    // Thin Ice
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '38F'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '1F8B',
      ...oopsy_common/* playerDamageFields */.np
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '1F90',
      ...oopsy_common/* playerDamageFields */.np
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
          en: 'Pushed off!',
          de: 'Runter geschubst!',
          fr: 'A été pousser !',
          ja: '落ちた',
          cn: '击退坠落'
        }
      };
    }
  }]
};
/* harmony default export */ const shinryu = (shinryu_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/susano-ex.ts

// Susano Extreme
const susano_ex_triggerSet = {
  zoneId: zone_id/* default.ThePoolOfTributeExtreme */.Z.ThePoolOfTributeExtreme,
  damageWarn: {
    'SusEx Churning': '203F'
  },
  damageFail: {
    'SusEx Rasen Kaikyo': '202E'
  }
};
/* harmony default export */ const susano_ex = (susano_ex_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/suzaku.ts



// Suzaku Normal
const suzaku_triggerSet = {
  zoneId: zone_id/* default.HellsKier */.Z.HellsKier,
  damageWarn: {
    'Suzaku Normal Ashes To Ashes': '321F',
    // Scarlet Lady add, raidwide explosion if not killed in time
    'Suzaku Normal Fleeting Summer': '3223',
    // Cone AoE (randomly targeted)
    'Suzaku Normal Wing And A Prayer': '3225',
    // Circle AoEs from unkilled plumes
    'Suzaku Normal Phantom Half': '3233',
    // Giant half-arena AoE follow-up after tank buster
    'Suzaku Normal Well Of Flame': '3236',
    // Large rectangle AoE (randomly targeted)
    'Suzaku Normal Hotspot': '3238',
    // Platform fire when the runes are activated
    'Suzaku Normal Swoop': '323B',
    // Star cross line AoEs
    'Suzaku Normal Burn': '323D' // Tower mechanic failure on Incandescent Interlude (party failure, not personal)

  },
  shareWarn: {
    'Suzaku Normal Rekindle': '3235' // Purple spread circles

  },
  triggers: [{
    id: 'Suzaku Normal Ruthless Refrain',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '3230',
      ...oopsy_common/* playerDamageFields */.np
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
          en: 'Pushed off!',
          de: 'Runter geschubst!',
          fr: 'A été poussé(e) !',
          ja: '落ちた',
          cn: '击退坠落'
        }
      };
    }
  }]
};
/* harmony default export */ const suzaku = (suzaku_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/ultimate/ultima_weapon_ultimate.ts



// Ultima Weapon Ultimate
const ultima_weapon_ultimate_triggerSet = {
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
    type: 'GainsEffect',
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
    type: 'Ability',
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
    'UCU Wings Of Salvation': '26CA'
  },
  triggers: [{
    id: 'UCU Twister Death',
    type: 'Ability',
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
    type: 'Ability',
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
    type: 'Ability',
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
    type: 'GainsEffect',
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
    type: 'GainsEffect',
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: 'D2'
    }),
    run: (data, matches) => {
      var _data$hasDoom;

      (_data$hasDoom = data.hasDoom) !== null && _data$hasDoom !== void 0 ? _data$hasDoom : data.hasDoom = {};
      data.hasDoom[matches.target] = true;
    }
  }, {
    id: 'UCU Doom Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: 'D2'
    }),
    run: (data, matches) => {
      var _data$hasDoom2;

      (_data$hasDoom2 = data.hasDoom) !== null && _data$hasDoom2 !== void 0 ? _data$hasDoom2 : data.hasDoom = {};
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: 'D2'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 1,
    deathReason: (data, matches) => {
      if (!data.hasDoom || !data.hasDoom[matches.target]) return;
      let text;
      const duration = parseFloat(matches.duration);
      if (duration < 9) text = matches.effect + ' #1';else if (duration < 14) text = matches.effect + ' #2';else text = matches.effect + ' #3';
      return {
        name: matches.target,
        text: text
      };
    }
  }]
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
  gainsEffectWarn: {
    'Puppet Burns': '10B' // standing in many various fire aoes

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

  }
};
/* harmony default export */ const the_puppets_bunker = (the_puppets_bunker_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/alliance/the_tower_at_paradigms_breach.ts


// TODO: missing Shock Black 2?
// TODO: White/Black Dissonance damage is maybe when flags end in 03?
const the_tower_at_paradigms_breach_triggerSet = {
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
    type: 'Ability',
    // 5EB1 = Knave Lunge
    // 5BF2 = Her Infloresence Shockwave
    netRegex: netregexes/* default.ability */.Z.ability({
      id: ['5EB1', '5BF2']
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
    'Anyder Winding Current': '3E1F' // 3E20 is being hit by the growing orbs, maybe?

  }
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
    'Amaurot Misfortune': '3CE2'
  },
  damageFail: {
    'Amaurot Apokalypsis': '3CD7'
  }
};
/* harmony default export */ const amaurot = (amaurot_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/anamnesis_anyder.ts

const anamnesis_anyder_triggerSet = {
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
    type: 'GainsEffect',
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
    type: 'GainsEffect',
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
    type: 'GainsEffect',
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
};
/* harmony default export */ const dohn_mheg = (dohn_mheg_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/heroes_gauntlet.ts



// TODO: Berserker 2nd/3rd wild anguish should be shared with just a rock
const heroes_gauntlet_triggerSet = {
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
  gainsEffectWarn: {
    'THG Bleeding': '828' // Standing in the Necromancer puddle or outside the Berserker arena

  },
  gainsEffectFail: {
    'THG Truly Berserk': '906' // Standing in the crater too long

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
  soloWarn: {
    // This should always be shared.  On all times but the 2nd and 3rd, it's a party share.
    // TODO: on the 2nd and 3rd time this should only be shared with a rock.
    // TODO: alternatively warn on taking one of these with a 472 Magic Vulnerability Up effect
    'THG Wild Anguish': '5209'
  },
  triggers: [{
    id: 'THG Wild Rampage',
    type: 'Ability',
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
    'Malikah Earthshake': '3E39'
  }
};
/* harmony default export */ const malikahs_well = (malikahs_well_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/matoyas_relict.ts

// TODO: could include 5484 Mudman Rocky Roll as a shareWarn, but it's low damage and common.
const matoyas_relict_triggerSet = {
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
    'Gulg Vena Amoris': '3D27'
  },
  damageFail: {
    'Gulg Lumen Infinitum': '41B2',
    'Gulg Right Palm': '37F8',
    'Gulg Left Palm': '37FA'
  }
};
/* harmony default export */ const mt_gulg = (mt_gulg_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/paglthan.ts

// TODO: What to do about Kahn Rai 5B50?
// It seems impossible for the marked person to avoid entirely.
const paglthan_triggerSet = {
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
};
/* harmony default export */ const paglthan = (paglthan_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/qitana_ravel.ts

const qitana_ravel_triggerSet = {
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
    'Cosmos Fire\'s Domain Tether': '475F'
  },
  shareWarn: {
    'Cosmos Dark Well': '476D',
    'Cosmos Far Wind Spread': '4724',
    'Cosmos Black Flame': '475D',
    'Cosmos Fire\'s Domain': '4760'
  }
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
    'Twinning High Gravity': '3DFA'
  },
  damageFail: {
    'Twinning 128 Tonze Swipe': '3DBA'
  }
};
/* harmony default export */ const twinning = (twinning_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/eureka/delubrum_reginae.ts



// TODO: Dead Iron 5AB0 (earthshakers, but only if you take two?)
const delubrum_reginae_triggerSet = {
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
  gainsEffectWarn: {
    'Delubrum Seeker Merciful Moon': '262' // "Petrification" from Aetherial Orb lookaway

  },
  shareFail: {
    'Delubrum Dahu Heat Breath': '5766',
    // tank cleave
    'Delubrum Avowed Wrath Of Bozja': '5975' // tank cleave

  },
  triggers: [{
    // At least during The Queen, these ability ids can be ordered differently,
    // and the first explosion "hits" everyone, although with "1B" flags.
    id: 'Delubrum Lots Cast',
    type: 'Ability',
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
  gainsEffectWarn: {
    'DelubrumSav Seeker Merciful Moon': '262' // "Petrification" from Aetherial Orb lookaway

  },
  shareWarn: {
    'DelubrumSav Seeker Phantom Baleful Onslaught': '5AD6',
    // solo tank cleave
    'DelubrumSav Lord Foe Splitter': '57D7' // tank cleave

  },
  triggers: [{
    // These ability ids can be ordered differently and "hit" people when levitating.
    id: 'DelubrumSav Guard Lots Cast',
    type: 'Ability',
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
    type: 'Ability',
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
    type: 'Ability',
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
};
/* harmony default export */ const delubrum_reginae_savage = (delubrum_reginae_savage_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e1n.ts

const e1n_triggerSet = {
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
    'E2N Doomvoid Guillotine': '3E3B'
  },
  triggers: [{
    id: 'E2N Nyx',
    type: 'Ability',
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
          de: 'Nyx berührt',
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
    'E3S Doomvoid Guillotine': '3E4F'
  },
  shareWarn: {
    'E2S Doomvoid Cleaver': '3E64'
  },
  triggers: [{
    id: 'E2S Shadoweye',
    type: 'GainsEffect',
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
    type: 'Ability',
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
          de: 'Nyx berührt',
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
};
/* harmony default export */ const e2s = (e2s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e3n.ts

const e3n_triggerSet = {
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
    'E3S Swirling Tsunami': '3FF4'
  },
  damageFail: {
    'E3S Temporary Current 1': '3FEA',
    'E3S Temporary Current 2': '3FEB',
    'E3S Temporary Current 3': '3FEC',
    'E3S Temporary Current 4': '3FED',
    'E3S Spinning Dive': '3FFD'
  }
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
    'E4N Fault Line': '4101'
  }
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
    type: 'StartsUsing',
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
    type: 'Ability',
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
          de: 'Wurde überfahren',
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
};
/* harmony default export */ const e4s = (e4s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e5n.ts



const e5n_triggerSet = {
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
    type: 'GainsEffect',
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8B4'
    }),
    run: (data, matches) => {
      var _data$hasOrb;

      (_data$hasOrb = data.hasOrb) !== null && _data$hasOrb !== void 0 ? _data$hasOrb : data.hasOrb = {};
      data.hasOrb[matches.target] = true;
    }
  }, {
    id: 'E5N Orb Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8B4'
    }),
    run: (data, matches) => {
      var _data$hasOrb2;

      (_data$hasOrb2 = data.hasOrb) !== null && _data$hasOrb2 !== void 0 ? _data$hasOrb2 : data.hasOrb = {};
      data.hasOrb[matches.target] = false;
    }
  }, {
    id: 'E5N Divine Judgement Volts',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4B9A',
      ...oopsy_common/* playerDamageFields */.np
    }),
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
          cn: `${matches.ability} (没吃球)`
        }
      };
    }
  }, {
    id: 'E5N Stormcloud Target Tracking',
    type: 'HeadMarker',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({
      id: '006E'
    }),
    run: (data, matches) => {
      var _data$cloudMarkers;

      (_data$cloudMarkers = data.cloudMarkers) !== null && _data$cloudMarkers !== void 0 ? _data$cloudMarkers : data.cloudMarkers = [];
      data.cloudMarkers.push(matches.target);
    }
  }, {
    // This ability is seen only if players stacked the clouds instead of spreading them.
    id: 'E5N The Parting Clouds',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4B9D',
      ...oopsy_common/* playerDamageFields */.np
    }),
    suppressSeconds: 30,
    mistake: (data, matches) => {
      for (const name of (_data$cloudMarkers2 = data.cloudMarkers) !== null && _data$cloudMarkers2 !== void 0 ? _data$cloudMarkers2 : []) {
        var _data$cloudMarkers2;

        return {
          type: 'fail',
          blame: name,
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
    type: 'HeadMarker',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({
      id: '006E'
    }),
    delaySeconds: 30,
    // Stormclouds resolve well before this.
    run: data => {
      delete data.cloudMarkers;
    }
  }]
};
/* harmony default export */ const e5n = (e5n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e5s.ts




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

const e5s_triggerSet = {
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8B4'
    }),
    run: (data, matches) => {
      var _data$hasOrb;

      (_data$hasOrb = data.hasOrb) !== null && _data$hasOrb !== void 0 ? _data$hasOrb : data.hasOrb = {};
      data.hasOrb[matches.target] = true;
    }
  }, {
    id: 'E5S Orb Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8B4'
    }),
    run: (data, matches) => {
      var _data$hasOrb2;

      (_data$hasOrb2 = data.hasOrb) !== null && _data$hasOrb2 !== void 0 ? _data$hasOrb2 : data.hasOrb = {};
      data.hasOrb[matches.target] = false;
    }
  }, {
    id: 'E5S Divine Judgement Volts',
    type: 'Ability',
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
    type: 'Ability',
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
    type: 'Ability',
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
    type: 'Ability',
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
    type: 'HeadMarker',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({
      id: '00D2'
    }),
    run: (data, matches) => {
      var _data$hated;

      (_data$hated = data.hated) !== null && _data$hated !== void 0 ? _data$hated : data.hated = {};
      data.hated[matches.target] = true;
    }
  }, {
    id: 'E5S Stormcloud Target Tracking',
    type: 'HeadMarker',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({
      id: '006E'
    }),
    run: (data, matches) => {
      var _data$cloudMarkers;

      (_data$cloudMarkers = data.cloudMarkers) !== null && _data$cloudMarkers !== void 0 ? _data$cloudMarkers : data.cloudMarkers = [];
      data.cloudMarkers.push(matches.target);
    }
  }, {
    // This ability is seen only if players stacked the clouds instead of spreading them.
    id: 'E5S The Parting Clouds',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4BBA',
      ...oopsy_common/* playerDamageFields */.np
    }),
    suppressSeconds: 30,
    mistake: (data, matches) => {
      for (const name of (_data$cloudMarkers2 = data.cloudMarkers) !== null && _data$cloudMarkers2 !== void 0 ? _data$cloudMarkers2 : []) {
        var _data$cloudMarkers2;

        return {
          type: 'fail',
          blame: name,
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
    type: 'HeadMarker',
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
};
/* harmony default export */ const e5s = (e5s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e6n.ts

const e6n_triggerSet = {
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
};
/* harmony default export */ const e6s = (e6s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e7n.ts




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

const e7n_triggerSet = {
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8BE'
    }),
    run: (data, matches) => {
      var _data$hasAstral;

      (_data$hasAstral = data.hasAstral) !== null && _data$hasAstral !== void 0 ? _data$hasAstral : data.hasAstral = {};
      data.hasAstral[matches.target] = true;
    }
  }, {
    id: 'E7N Astral Effect Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8BE'
    }),
    run: (data, matches) => {
      var _data$hasAstral2;

      (_data$hasAstral2 = data.hasAstral) !== null && _data$hasAstral2 !== void 0 ? _data$hasAstral2 : data.hasAstral = {};
      data.hasAstral[matches.target] = false;
    }
  }, {
    id: 'E7N Umbral Effect Gain',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8BF'
    }),
    run: (data, matches) => {
      var _data$hasUmbral;

      (_data$hasUmbral = data.hasUmbral) !== null && _data$hasUmbral !== void 0 ? _data$hasUmbral : data.hasUmbral = {};
      data.hasUmbral[matches.target] = true;
    }
  }, {
    id: 'E7N Umbral Effect Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8BF'
    }),
    run: (data, matches) => {
      var _data$hasUmbral2;

      (_data$hasUmbral2 = data.hasUmbral) !== null && _data$hasUmbral2 !== void 0 ? _data$hasUmbral2 : data.hasUmbral = {};
      data.hasUmbral[matches.target] = false;
    }
  }, {
    id: 'E7N Light\'s Course',
    type: 'Ability',
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
    type: 'Ability',
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
};
/* harmony default export */ const e7n = (e7n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e7s.ts


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

const e7s_triggerSet = {
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '4C6E'
    }),
    mistake: (_data, matches) => {
      // TODO: is this blame correct? does this have a target?
      return {
        type: 'fail',
        blame: matches.target,
        text: matches.ability
      };
    }
  }, {
    id: 'E7S Astral Effect Gain',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8BE'
    }),
    run: (data, matches) => {
      data.hasAstral = data.hasAstral || {};
      data.hasAstral[matches.target] = true;
    }
  }, {
    id: 'E7S Astral Effect Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8BE'
    }),
    run: (data, matches) => {
      data.hasAstral = data.hasAstral || {};
      data.hasAstral[matches.target] = false;
    }
  }, {
    id: 'E7S Umbral Effect Gain',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8BF'
    }),
    run: (data, matches) => {
      data.hasUmbral = data.hasUmbral || {};
      data.hasUmbral[matches.target] = true;
    }
  }, {
    id: 'E7S Umbral Effect Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '8BF'
    }),
    run: (data, matches) => {
      data.hasUmbral = data.hasUmbral || {};
      data.hasUmbral[matches.target] = false;
    }
  }, {
    id: 'E7S Light\'s Course',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: ['4C62', '4C63', '4C64', '4C5B', '4C5F'],
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (data, matches) => {
      return !data.hasUmbral || !data.hasUmbral[matches.target];
    },
    mistake: (data, matches) => {
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
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: ['4C65', '4C66', '4C67', '4C5A', '4C60'],
      ...oopsy_common/* playerDamageFields */.np
    }),
    condition: (data, matches) => {
      return !data.hasAstral || !data.hasAstral[matches.target];
    },
    mistake: (data, matches) => {
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
    type: 'Ability',
    // 4C76 is the knockback damage, 4C58 is the damage for standing on the puck.
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4C76',
      ...oopsy_common/* playerDamageFields */.np
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
          en: 'Knocked off',
          de: 'Runtergefallen',
          fr: 'A été assommé(e)',
          ja: 'ノックバック',
          cn: '击退坠落'
        }
      };
    }
  }]
};
/* harmony default export */ const e7s = (e7s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e8n.ts



const e8n_triggerSet = {
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
    type: 'GainsEffect',
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
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      id: '4DD8',
      ...oopsy_common/* playerDamageFields */.np
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
    type: 'GainsEffect',
    // Thin Ice
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '38F'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
    type: 'GainsEffect',
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
    type: 'Ability',
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
};
/* harmony default export */ const e8s = (e8s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e9n.ts

const e9n_triggerSet = {
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
  gainsEffectWarn: {
    'E9S Stygian Tendrils': '952' // standing in the brambles

  },
  shareWarn: {
    'E9S Hyper-Focused Particle Beam': '55FD' // Art Of Darkness protean

  },
  shareFail: {
    'E9S Condensed Wide-Angle Particle Beam': '5610' // wide-angle "tank laser"

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
    type: 'Ability',
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
    type: 'Ability',
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
};
/* harmony default export */ const e9s = (e9s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e10n.ts

const e10n_triggerSet = {
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
    type: 'GainsEffect',
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
    type: 'GainsEffect',
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
    type: 'Ability',
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
};
/* harmony default export */ const e10s = (e10s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e11n.ts


const e11n_triggerSet = {
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
    type: 'Ability',
    // 562D = Burnt Strike fire followup during most of the fight
    // 5644 = same thing, but from Fatebreaker's Image
    netRegex: netregexes/* default.ability */.Z.ability({
      id: ['562D', '5644']
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
};
/* harmony default export */ const e11n = (e11n_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e11s.ts


// 565A/568D Sinsmoke Bound Of Faith share
// 565E/5699 Bowshock hits target of 565D (twice) and two others
const e11s_triggerSet = {
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
    type: 'Ability',
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
        text: {
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
};
/* harmony default export */ const e11s = (e11s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e12n.ts

const e12n_triggerSet = {
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
};
/* harmony default export */ const e12n = (e12n_triggerSet);
// EXTERNAL MODULE: ./resources/not_reached.ts
var not_reached = __webpack_require__(3062);
// EXTERNAL MODULE: ./resources/outputs.ts
var outputs = __webpack_require__(1081);
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
  if (typeof data.decOffset === 'undefined') data.decOffset = parseInt(matches.id, 16) - firstHeadmarker; // The leading zeroes are stripped when converting back to string, so we re-add them here.
  // Fortunately, we don't have to worry about whether or not this is robust,
  // since we know all the IDs that will be present in the encounter.

  return (parseInt(matches.id, 16) - data.decOffset).toString(16).toUpperCase().padStart(4, '0');
};

const e12s_triggerSet = {
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
  gainsEffectFail: {
    'E12S Oracle Doom': '9D4' // Relativity punishment for multiple mistakes

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
  soloWarn: {
    'E12S Promise Force Of The Land': '58A4'
  },
  triggers: [{
    // Big circle ground aoes during Shiva junction.
    // This can be shielded through as long as that person doesn't stack.
    id: 'E12S Icicle Impact',
    type: 'Ability',
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
    type: 'HeadMarker',
    netRegex: netregexes/* default.headMarker */.Z.headMarker({}),
    run: (data, matches) => {
      const id = getHeadmarkerId(data, matches);
      const firstLaserMarker = '0091';
      const lastLaserMarker = '0098';

      if (id >= firstLaserMarker && id <= lastLaserMarker) {
        var _data$laserNameToNum;

        // ids are sequential: #1 square, #2 square, #3 square, #4 square, #1 triangle etc
        const decOffset = parseInt(id, 16) - parseInt(firstLaserMarker, 16); // decOffset is 0-7, so map 0-3 to 1-4 and 4-7 to 1-4.

        (_data$laserNameToNum = data.laserNameToNum) !== null && _data$laserNameToNum !== void 0 ? _data$laserNameToNum : data.laserNameToNum = {};
        data.laserNameToNum[matches.target] = decOffset % 4 + 1;
      }
    }
  }, {
    // These sculptures are added at the start of the fight, so we need to check where they
    // use the "Classical Sculpture" ability and end up on the arena for real.
    id: 'E12S Promise Chiseled Sculpture Classical Sculpture',
    type: 'Ability',
    netRegex: netregexes/* default.abilityFull */.Z.abilityFull({
      source: 'Chiseled Sculpture',
      id: '58B2'
    }),
    run: (data, matches) => {
      var _data$sculptureYPosit;

      // This will run per person that gets hit by the same sculpture, but that's fine.
      // Record the y position of each sculpture so we can use it for better text later.
      (_data$sculptureYPosit = data.sculptureYPositions) !== null && _data$sculptureYPosit !== void 0 ? _data$sculptureYPosit : data.sculptureYPositions = {};
      data.sculptureYPositions[matches.sourceId.toUpperCase()] = parseFloat(matches.y);
    }
  }, {
    // The source of the tether is the player, the target is the sculpture.
    id: 'E12S Promise Chiseled Sculpture Tether',
    type: 'Tether',
    netRegex: netregexes/* default.tether */.Z.tether({
      target: 'Chiseled Sculpture',
      id: '0011'
    }),
    run: (data, matches) => {
      var _data$sculptureTether;

      (_data$sculptureTether = data.sculptureTetherNameToId) !== null && _data$sculptureTether !== void 0 ? _data$sculptureTether : data.sculptureTetherNameToId = {};
      data.sculptureTetherNameToId[matches.source] = matches.targetId.toUpperCase();
    }
  }, {
    id: 'E12S Promise Blade Of Flame Counter',
    type: 'Ability',
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
    type: 'Ability',
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
      const withNum = names.filter(name => {
        var _data$laserNameToNum2;

        return ((_data$laserNameToNum2 = data.laserNameToNum) === null || _data$laserNameToNum2 === void 0 ? void 0 : _data$laserNameToNum2[name]) === number;
      });
      const owners = withNum.filter(name => {
        var _data$sculptureTether2;

        return ((_data$sculptureTether2 = data.sculptureTetherNameToId) === null || _data$sculptureTether2 === void 0 ? void 0 : _data$sculptureTether2[name]) === sourceId;
      }); // if some logic error, just abort.

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
        const otherY = data.sculptureYPositions[otherId !== null && otherId !== void 0 ? otherId : ''];
        if (sourceY === undefined || otherY === undefined || otherId === undefined) throw new not_reached/* UnreachableCode */.$();
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
    type: 'Tether',
    netRegex: netregexes/* default.tether */.Z.tether({
      source: 'Ice Pillar',
      id: ['0001', '0039']
    }),
    run: (data, matches) => {
      var _data$pillarIdToOwner;

      (_data$pillarIdToOwner = data.pillarIdToOwner) !== null && _data$pillarIdToOwner !== void 0 ? _data$pillarIdToOwner : data.pillarIdToOwner = {};
      data.pillarIdToOwner[matches.sourceId] = matches.target;
    }
  }, {
    id: 'E12S Promise Ice Pillar Mistake',
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      source: 'Ice Pillar',
      id: '589B'
    }),
    condition: (data, matches) => {
      if (!data.pillarIdToOwner) return false;
      return matches.target !== data.pillarIdToOwner[matches.sourceId];
    },
    mistake: (data, matches) => {
      var _data$pillarIdToOwner2;

      const pillarOwner = data.ShortName((_data$pillarIdToOwner2 = data.pillarIdToOwner) === null || _data$pillarIdToOwner2 === void 0 ? void 0 : _data$pillarIdToOwner2[matches.sourceId]);
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
    type: 'GainsEffect',
    // The Beastly Sculpture gives a 3 second debuff, the Regal Sculpture gives a 14s one.
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '832'
    }),
    run: (data, matches) => {
      var _data$fire;

      (_data$fire = data.fire) !== null && _data$fire !== void 0 ? _data$fire : data.fire = {};
      data.fire[matches.target] = true;
    }
  }, {
    id: 'E12S Promise Lose Fire Resistance Down II',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '832'
    }),
    run: (data, matches) => {
      var _data$fire2;

      (_data$fire2 = data.fire) !== null && _data$fire2 !== void 0 ? _data$fire2 : data.fire = {};
      data.fire[matches.target] = false;
    }
  }, {
    id: 'E12S Promise Small Lion Tether',
    type: 'Tether',
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
      var _data$smallLionIdToOw, _data$smallLionOwners;

      (_data$smallLionIdToOw = data.smallLionIdToOwner) !== null && _data$smallLionIdToOw !== void 0 ? _data$smallLionIdToOw : data.smallLionIdToOwner = {};
      data.smallLionIdToOwner[matches.sourceId.toUpperCase()] = matches.target;
      (_data$smallLionOwners = data.smallLionOwners) !== null && _data$smallLionOwners !== void 0 ? _data$smallLionOwners : data.smallLionOwners = [];
      data.smallLionOwners.push(matches.target);
    }
  }, {
    id: 'E12S Promise Small Lion Lionsblaze',
    type: 'Ability',
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
      var _data$smallLionIdToOw2;

      // Folks baiting the big lion second can take the first small lion hit,
      // so it's not sufficient to check only the owner.
      if (!data.smallLionOwners) return;
      const owner = (_data$smallLionIdToOw2 = data.smallLionIdToOwner) === null || _data$smallLionIdToOw2 === void 0 ? void 0 : _data$smallLionIdToOw2[matches.sourceId.toUpperCase()];
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
    type: 'AddedCombatant',
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
    type: 'Ability',
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
      var _shared$lang, _fireDebuff$lang;

      const singleTarget = matches.type === '21';
      const hasFireDebuff = data.fire && data.fire[matches.target]; // Success if only one person takes it and they have no fire debuff.

      if (singleTarget && !hasFireDebuff) return;
      const northBigLion = {
        en: 'north big lion',
        de: 'Nordem, großer Löwe',
        ja: '大ライオン(北)',
        cn: '北方大狮子',
        ko: '북쪽 큰 사자'
      };
      const southBigLion = {
        en: 'south big lion',
        de: 'Süden, großer Löwe',
        ja: '大ライオン(南)',
        cn: '南方大狮子',
        ko: '남쪽 큰 사자'
      };
      const shared = {
        en: 'shared',
        de: 'geteilt',
        ja: '重ねた',
        cn: '重叠',
        ko: '같이 맞음'
      };
      const fireDebuff = {
        en: 'had fire',
        de: 'hatte Feuer',
        ja: '炎付き',
        cn: '火Debuff',
        ko: '화염 디버프 받음'
      };
      const labels = [];
      const lang = data.options.ParserLanguage;

      if (data.northBigLion) {
        var _northBigLion$lang, _southBigLion$lang;

        if (data.northBigLion === matches.sourceId) labels.push((_northBigLion$lang = northBigLion[lang]) !== null && _northBigLion$lang !== void 0 ? _northBigLion$lang : northBigLion['en']);else labels.push((_southBigLion$lang = southBigLion[lang]) !== null && _southBigLion$lang !== void 0 ? _southBigLion$lang : southBigLion['en']);
      }

      if (!singleTarget) labels.push((_shared$lang = shared[lang]) !== null && _shared$lang !== void 0 ? _shared$lang : shared['en']);
      if (hasFireDebuff) labels.push((_fireDebuff$lang = fireDebuff[lang]) !== null && _fireDebuff$lang !== void 0 ? _fireDebuff$lang : fireDebuff['en']);
      return {
        type: 'fail',
        name: matches.target,
        text: `${matches.ability} (${labels.join(', ')})`
      };
    }
  }, {
    id: 'E12S Knocked Off',
    type: 'Ability',
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
        text: {
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
    type: 'Ability',
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
};
/* harmony default export */ const e12s = (e12s_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/diamond_weapon-ex.ts


// TODO: warning for taking Diamond Flash (5FA1) stack on your own?
// Diamond Weapon Extreme
const diamond_weapon_ex_triggerSet = {
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '5FD0'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
};
/* harmony default export */ const diamond_weapon_ex = (diamond_weapon_ex_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/diamond_weapon.ts


// Diamond Weapon Normal
const diamond_weapon_triggerSet = {
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '5FE5'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
};
/* harmony default export */ const diamond_weapon = (diamond_weapon_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/emerald_weapon-ex.ts

const emerald_weapon_ex_triggerSet = {
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
};
/* harmony default export */ const emerald_weapon_ex = (emerald_weapon_ex_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/emerald_weapon.ts


const emerald_weapon_triggerSet = {
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '553E'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: ['5563', '5564']
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
          en: 'Pushed into wall',
          de: 'Rückstoß in die Wand',
          ja: '壁へノックバック',
          cn: '击退至墙',
          ko: '넉백'
        }
      };
    }
  }]
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
    type: 'Tether',
    netRegex: netregexes/* default.tether */.Z.tether({
      source: 'Shadow of the Ancients',
      id: '0011'
    }),
    run: (data, matches) => {
      var _data$hasDark;

      (_data$hasDark = data.hasDark) !== null && _data$hasDark !== void 0 ? _data$hasDark : data.hasDark = [];
      data.hasDark.push(matches.target);
    }
  }, {
    id: 'HadesEx Dark II',
    type: 'Ability',
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
    type: 'Tether',
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
    type: 'Ability',
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '566'
    }),
    run: (data, matches) => {
      var _data$hasBeyondDeath;

      (_data$hasBeyondDeath = data.hasBeyondDeath) !== null && _data$hasBeyondDeath !== void 0 ? _data$hasBeyondDeath : data.hasBeyondDeath = {};
      data.hasBeyondDeath[matches.target] = true;
    }
  }, {
    id: 'HadesEx Beyond Death Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '566'
    }),
    run: (data, matches) => {
      var _data$hasBeyondDeath2;

      (_data$hasBeyondDeath2 = data.hasBeyondDeath) !== null && _data$hasBeyondDeath2 !== void 0 ? _data$hasBeyondDeath2 : data.hasBeyondDeath = {};
      data.hasBeyondDeath[matches.target] = false;
    }
  }, {
    id: 'HadesEx Beyond Death',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '566'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (data, matches) => {
      if (!data.hasBeyondDeath) return;
      if (!data.hasBeyondDeath[matches.target]) return;
      return {
        name: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'HadesEx Doom Gain',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '6E9'
    }),
    run: (data, matches) => {
      var _data$hasDoom;

      (_data$hasDoom = data.hasDoom) !== null && _data$hasDoom !== void 0 ? _data$hasDoom : data.hasDoom = {};
      data.hasDoom[matches.target] = true;
    }
  }, {
    id: 'HadesEx Doom Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '6E9'
    }),
    run: (data, matches) => {
      var _data$hasDoom2;

      (_data$hasDoom2 = data.hasDoom) !== null && _data$hasDoom2 !== void 0 ? _data$hasDoom2 : data.hasDoom = {};
      data.hasDoom[matches.target] = false;
    }
  }, {
    id: 'HadesEx Doom',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '6E9'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (data, matches) => {
      if (!data.hasDoom) return;
      if (!data.hasDoom[matches.target]) return;
      return {
        name: matches.target,
        text: matches.effect
      };
    }
  }]
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
    'Hades Echo 2': '4164'
  },
  shareFail: {
    'Hades Nether Blast': '4163',
    'Hades Ravenous Assault': '4158',
    'Hades Ancient Darkness': '4593',
    'Hades Dual Strike': '4162'
  }
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
    'InnoEx Explosion': '3EF0'
  }
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
    'Inno God Ray 4': '3EC0'
  }
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '5CD2'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
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
  gainsEffectFail: {
    'RubyEx Hysteria': '128' // Negative Aura lookaway failure

  },
  shareWarn: {
    'RubyEx Homing Lasers': '4AD6',
    // spread markers during cut and run
    'RubyEx Meteor Stream': '4E68' // spread markers during P2

  },
  triggers: [{
    id: 'RubyEx Screech',
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '4AEE'
    }),
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: {
          en: 'Knocked into wall',
          de: 'Rückstoß in die Wand',
          ja: '壁へノックバック',
          cn: '击退至墙',
          ko: '넉백'
        }
      };
    }
  }]
};
/* harmony default export */ const ruby_weapon_ex = (ruby_weapon_ex_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/ruby_weapon.ts

// Ruby Normal
const ruby_weapon_triggerSet = {
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
    type: 'GainsEffect',
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
    'Titania Leafstorm 2': '3E03'
  },
  damageFail: {
    'Titania Phantom Rune 1': '3D5D',
    'Titania Phantom Rune 2': '3D5E'
  },
  shareFail: {
    'Titania Divination Rune': '3D5B'
  }
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
};
/* harmony default export */ const titania_ex = (titania_ex_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/titan-un.ts

// Titan Unreal
const titan_un_triggerSet = {
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
    type: 'Ability',
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '38E'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: matches.effect
      };
    }
  }]
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
  gainsEffectWarn: {
    'WOLEx Deep Freeze': '4E6',
    // failing Absolute Blizzard III
    'WOLEx Damage Down': '274' // failing Absolute Flash

  },
  shareWarn: {
    'WOLEx Absolute Stone III': '4EEB',
    // protean wave imbued magic
    'WOLEx Flare Breath': '4F06',
    // tether from summoned bahamuts
    'WOLEx Perfect Decimation': '4F05' // smn/war phase marker

  },
  soloWarn: {
    'WolEx Katon San Share': '4EFE'
  },
  triggers: [{
    id: 'WOLEx True Walking Dead',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '8FF'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (_data, matches) => {
      return {
        type: 'fail',
        name: matches.target,
        text: matches.effect
      };
    }
  }, {
    id: 'WOLEx Tower',
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '4F04',
      capture: false
    }),
    mistake: {
      type: 'fail',
      text: {
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
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: '4F44'
    }),
    mistake: (_data, matches) => {
      return {
        type: 'fail',
        text: matches.ability
      };
    }
  }, {
    // For Berserk and Deep Darkside
    id: 'WOLEx Missed Interrupt',
    type: 'Ability',
    netRegex: netregexes/* default.ability */.Z.ability({
      id: ['5156', '5158']
    }),
    mistake: (_data, matches) => {
      return {
        type: 'fail',
        text: matches.ability
      };
    }
  }]
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
    type: 'Ability',
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
    type: 'GainsEffect',
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
    type: 'Tether',
    netRegex: netregexes/* default.tether */.Z.tether({
      source: 'Jagd Doll',
      id: '0011'
    }),
    run: (data, matches) => {
      var _data$jagdTether;

      (_data$jagdTether = data.jagdTether) !== null && _data$jagdTether !== void 0 ? _data$jagdTether : data.jagdTether = {};
      data.jagdTether[matches.sourceId] = matches.target;
    }
  }, {
    id: 'TEA Reducible Complexity',
    type: 'Ability',
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
    type: 'Ability',
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
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '2BC'
    }),
    run: (data, matches) => {
      var _data$hasThrottle;

      (_data$hasThrottle = data.hasThrottle) !== null && _data$hasThrottle !== void 0 ? _data$hasThrottle : data.hasThrottle = {};
      data.hasThrottle[matches.target] = true;
    }
  }, {
    id: 'TEA Throttle Lose',
    type: 'LosesEffect',
    netRegex: netregexes/* default.losesEffect */.Z.losesEffect({
      effectId: '2BC'
    }),
    run: (data, matches) => {
      var _data$hasThrottle2;

      (_data$hasThrottle2 = data.hasThrottle) !== null && _data$hasThrottle2 !== void 0 ? _data$hasThrottle2 : data.hasThrottle = {};
      data.hasThrottle[matches.target] = false;
    }
  }, {
    id: 'TEA Throttle',
    type: 'GainsEffect',
    netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({
      effectId: '2BC'
    }),
    delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
    deathReason: (data, matches) => {
      if (!data.hasThrottle) return;
      if (!data.hasThrottle[matches.target]) return;
      return {
        name: matches.target,
        text: matches.effect
      };
    }
  }, {
    // Balloon Popping.  It seems like the person who pops it is the
    // first person listed damage-wise, so they are likely the culprit.
    id: 'TEA Outburst',
    type: 'Ability',
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
};
/* harmony default export */ const the_epic_of_alexander = (the_epic_of_alexander_triggerSet);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/oopsy_manifest.txt















































































































/* harmony default export */ const oopsy_manifest = ({'00-misc/general.ts': general,'00-misc/test.ts': test,'02-arr/trial/ifrit-nm.ts': ifrit_nm,'02-arr/trial/titan-nm.ts': titan_nm,'02-arr/trial/levi-ex.ts': levi_ex,'02-arr/trial/shiva-hm.ts': shiva_hm,'02-arr/trial/shiva-ex.ts': shiva_ex,'02-arr/trial/titan-hm.ts': titan_hm,'02-arr/trial/titan-ex.ts': titan_ex,'03-hw/alliance/weeping_city.ts': weeping_city,'03-hw/dungeon/aetherochemical_research_facility.ts': aetherochemical_research_facility,'03-hw/dungeon/fractal_continuum.ts': fractal_continuum,'03-hw/dungeon/gubal_library_hard.ts': gubal_library_hard,'03-hw/dungeon/sohm_al_hard.ts': sohm_al_hard,'03-hw/raid/a6n.ts': a6n,'03-hw/raid/a12n.ts': a12n,'04-sb/dungeon/ala_mhigo.ts': ala_mhigo,'04-sb/dungeon/bardams_mettle.ts': bardams_mettle,'04-sb/dungeon/drowned_city_of_skalla.ts': drowned_city_of_skalla,'04-sb/dungeon/kugane_castle.ts': kugane_castle,'04-sb/dungeon/sirensong_sea.ts': sirensong_sea,'04-sb/dungeon/st_mocianne_hard.ts': st_mocianne_hard,'04-sb/dungeon/swallows_compass.ts': swallows_compass,'04-sb/dungeon/temple_of_the_fist.ts': temple_of_the_fist,'04-sb/dungeon/the_burn.ts': the_burn,'04-sb/raid/o1n.ts': o1n,'04-sb/raid/o1s.ts': o1s,'04-sb/raid/o2n.ts': o2n,'04-sb/raid/o2s.ts': o2s,'04-sb/raid/o3n.ts': o3n,'04-sb/raid/o3s.ts': o3s,'04-sb/raid/o4n.ts': o4n,'04-sb/raid/o4s.ts': o4s,'04-sb/raid/o5n.ts': o5n,'04-sb/raid/o6n.ts': o6n,'04-sb/raid/o7n.ts': o7n,'04-sb/raid/o7s.ts': o7s,'04-sb/raid/o8n.ts': o8n,'04-sb/raid/o9n.ts': o9n,'04-sb/raid/o10n.ts': o10n,'04-sb/raid/o11n.ts': o11n,'04-sb/raid/o12n.ts': o12n,'04-sb/raid/o12s.ts': o12s,'04-sb/trial/byakko-ex.ts': byakko_ex,'04-sb/trial/shinryu.ts': shinryu,'04-sb/trial/susano-ex.ts': susano_ex,'04-sb/trial/suzaku.ts': suzaku,'04-sb/ultimate/ultima_weapon_ultimate.ts': ultima_weapon_ultimate,'04-sb/ultimate/unending_coil_ultimate.ts': unending_coil_ultimate,'05-shb/alliance/the_copied_factory.ts': the_copied_factory,'05-shb/alliance/the_puppets_bunker.ts': the_puppets_bunker,'05-shb/alliance/the_tower_at_paradigms_breach.ts': the_tower_at_paradigms_breach,'05-shb/dungeon/akadaemia_anyder.ts': akadaemia_anyder,'05-shb/dungeon/amaurot.ts': amaurot,'05-shb/dungeon/anamnesis_anyder.ts': anamnesis_anyder,'05-shb/dungeon/dohn_mheg.ts': dohn_mheg,'05-shb/dungeon/heroes_gauntlet.ts': heroes_gauntlet,'05-shb/dungeon/holminster_switch.ts': holminster_switch,'05-shb/dungeon/malikahs_well.ts': malikahs_well,'05-shb/dungeon/matoyas_relict.ts': matoyas_relict,'05-shb/dungeon/mt_gulg.ts': mt_gulg,'05-shb/dungeon/paglthan.ts': paglthan,'05-shb/dungeon/qitana_ravel.ts': qitana_ravel,'05-shb/dungeon/the_grand_cosmos.ts': the_grand_cosmos,'05-shb/dungeon/twinning.ts': twinning,'05-shb/eureka/delubrum_reginae.ts': delubrum_reginae,'05-shb/eureka/delubrum_reginae_savage.ts': delubrum_reginae_savage,'05-shb/raid/e1n.ts': e1n,'05-shb/raid/e1s.ts': e1s,'05-shb/raid/e2n.ts': e2n,'05-shb/raid/e2s.ts': e2s,'05-shb/raid/e3n.ts': e3n,'05-shb/raid/e3s.ts': e3s,'05-shb/raid/e4n.ts': e4n,'05-shb/raid/e4s.ts': e4s,'05-shb/raid/e5n.ts': e5n,'05-shb/raid/e5s.ts': e5s,'05-shb/raid/e6n.ts': e6n,'05-shb/raid/e6s.ts': e6s,'05-shb/raid/e7n.ts': e7n,'05-shb/raid/e7s.ts': e7s,'05-shb/raid/e8n.ts': e8n,'05-shb/raid/e8s.ts': e8s,'05-shb/raid/e9n.ts': e9n,'05-shb/raid/e9s.ts': e9s,'05-shb/raid/e10n.ts': e10n,'05-shb/raid/e10s.ts': e10s,'05-shb/raid/e11n.ts': e11n,'05-shb/raid/e11s.ts': e11s,'05-shb/raid/e12n.ts': e12n,'05-shb/raid/e12s.ts': e12s,'05-shb/trial/diamond_weapon-ex.ts': diamond_weapon_ex,'05-shb/trial/diamond_weapon.ts': diamond_weapon,'05-shb/trial/emerald_weapon-ex.ts': emerald_weapon_ex,'05-shb/trial/emerald_weapon.ts': emerald_weapon,'05-shb/trial/hades-ex.ts': hades_ex,'05-shb/trial/hades.ts': hades,'05-shb/trial/innocence-ex.ts': innocence_ex,'05-shb/trial/innocence.ts': innocence,'05-shb/trial/levi-un.ts': levi_un,'05-shb/trial/ruby_weapon-ex.ts': ruby_weapon_ex,'05-shb/trial/ruby_weapon.ts': ruby_weapon,'05-shb/trial/shiva-un.ts': shiva_un,'05-shb/trial/titania.ts': titania,'05-shb/trial/titania-ex.ts': titania_ex,'05-shb/trial/titan-un.ts': titan_un,'05-shb/trial/varis-ex.ts': varis_ex,'05-shb/trial/wol.ts': wol,'05-shb/trial/wol-ex.ts': wol_ex,'05-shb/ultimate/the_epic_of_alexander.ts': the_epic_of_alexander,});

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL2dlbmVyYWwudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDAtbWlzYy90ZXN0LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC9pZnJpdC1ubS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4tbm0udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL2xldmktZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3NoaXZhLWhtLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC9zaGl2YS1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4taG0udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3RpdGFuLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2FsbGlhbmNlL3dlZXBpbmdfY2l0eS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMy1ody9kdW5nZW9uL2FldGhlcm9jaGVtaWNhbF9yZXNlYXJjaF9mYWNpbGl0eS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMy1ody9kdW5nZW9uL2ZyYWN0YWxfY29udGludXVtLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vZ3ViYWxfbGlicmFyeV9oYXJkLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vc29obV9hbF9oYXJkLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L3JhaWQvYTZuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L3JhaWQvYTEybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL2FsYV9taGlnby50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL2JhcmRhbXNfbWV0dGxlLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vZHJvd25lZF9jaXR5X29mX3NrYWxsYS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL2t1Z2FuZV9jYXN0bGUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi9zaXJlbnNvbmdfc2VhLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28ybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28ycy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28zbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28zcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL281bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL282bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL283bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL283cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL284bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL285bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xMG4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvcmFpZC9vMTFuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3JhaWQvbzEybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xMnMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvYnlha2tvLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3NoaW5yeXUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvc3VzYW5vLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3N1emFrdS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi91bHRpbWF0ZS91bHRpbWFfd2VhcG9uX3VsdGltYXRlLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3VsdGltYXRlL3VuZW5kaW5nX2NvaWxfdWx0aW1hdGUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2FsbGlhbmNlL3RoZV9jb3BpZWRfZmFjdG9yeS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvYWxsaWFuY2UvdGhlX3B1cHBldHNfYnVua2VyLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9hbGxpYW5jZS90aGVfdG93ZXJfYXRfcGFyYWRpZ21zX2JyZWFjaC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9ha2FkYWVtaWFfYW55ZGVyLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2FtYXVyb3QudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vYW5hbW5lc2lzX2FueWRlci50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9kb2huX21oZWcudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vaGVyb2VzX2dhdW50bGV0LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2hvbG1pbnN0ZXJfc3dpdGNoLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL21hbGlrYWhzX3dlbGwudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vbWF0b3lhc19yZWxpY3QudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vbXRfZ3VsZy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9wYWdsdGhhbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9xaXRhbmFfcmF2ZWwudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vdGhlX2dyYW5kX2Nvc21vcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi90d2lubmluZy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlX3NhdmFnZS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTFzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMnMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTNuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uzcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNG4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTRzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U1bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTZuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U2cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lN24udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTdzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U4bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lOHMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTluLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U5cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTBuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMHMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTExbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTFzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMm4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEycy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24tZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2hhZGVzLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9oYWRlcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvaW5ub2NlbmNlLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2xldmktdW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvc2hpdmEtdW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3RpdGFuaWEudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3RpdGFuaWEtZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3RpdGFuLXVuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC92YXJpcy1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvd29sLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC93b2wtZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3VsdGltYXRlL3RoZV9lcGljX29mX2FsZXhhbmRlci50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS9vb3BzeV9tYW5pZmVzdC50eHQiXSwibmFtZXMiOlsidHJpZ2dlclNldCIsInpvbmVJZCIsIlpvbmVJZCIsInRyaWdnZXJzIiwiaWQiLCJ0eXBlIiwibmV0UmVnZXgiLCJOZXRSZWdleGVzIiwiZWZmZWN0SWQiLCJjb25kaXRpb24iLCJfZGF0YSIsIm1hdGNoZXMiLCJ0YXJnZXQiLCJzb3VyY2UiLCJtaXN0YWtlIiwiZGF0YSIsImxvc3RGb29kIiwiaW5Db21iYXQiLCJibGFtZSIsInRleHQiLCJlbiIsImRlIiwiZnIiLCJqYSIsImNuIiwia28iLCJydW4iLCJJc1BsYXllcklkIiwic291cmNlSWQiLCJsaW5lIiwibmV0UmVnZXhGciIsIm5ldFJlZ2V4SmEiLCJuZXRSZWdleENuIiwibmV0UmVnZXhLbyIsIm1lIiwic3RyaWtpbmdEdW1teUJ5TG9jYWxlIiwic3RyaWtpbmdEdW1teU5hbWVzIiwiT2JqZWN0IiwidmFsdWVzIiwiaW5jbHVkZXMiLCJib290Q291bnQiLCJhYmlsaXR5IiwiRGFtYWdlRnJvbU1hdGNoZXMiLCJlZmZlY3QiLCJzdXBwcmVzc1NlY29uZHMiLCJwb2tlQ291bnQiLCJkZWxheVNlY29uZHMiLCJkYW1hZ2VXYXJuIiwic2hhcmVXYXJuIiwiZGFtYWdlRmFpbCIsImdhaW5zRWZmZWN0V2FybiIsImdhaW5zRWZmZWN0RmFpbCIsImRlYXRoUmVhc29uIiwibmFtZSIsInNoYXJlRmFpbCIsInNlZW5EaWFtb25kRHVzdCIsInNvbG9XYXJuIiwicGFyc2VGbG9hdCIsImR1cmF0aW9uIiwiem9tYmllIiwic2hpZWxkIiwiaGFzSW1wIiwicGxheWVyRGFtYWdlRmllbGRzIiwiYXNzYXVsdCIsInB1c2giLCJhYmlsaXR5V2FybiIsImFyZ3MiLCJhYmlsaXR5SWQiLCJjb25zb2xlIiwiZXJyb3IiLCJKU09OIiwic3RyaW5naWZ5IiwidHJpZ2dlciIsImZsYWdzIiwic3Vic3RyIiwic29sb0ZhaWwiLCJjYXB0dXJlIiwibmV0UmVnZXhEZSIsInBoYXNlTnVtYmVyIiwiaW5pdGlhbGl6ZWQiLCJnYW1lQ291bnQiLCJ0YXJnZXRJZCIsImlzRGVjaXNpdmVCYXR0bGVFbGVtZW50IiwiaXNOZW9FeGRlYXRoIiwiaGFzQmV5b25kRGVhdGgiLCJkb3VibGVBdHRhY2tNYXRjaGVzIiwiYXJyIiwibGVuZ3RoIiwiaGFzVGhyb3R0bGUiLCJsb2ciLCJoYXNGaXJlUmVzaXN0IiwidnVsbiIsImtGbGFnSW5zdGFudERlYXRoIiwiaGFzRG9vbSIsInNsaWNlIiwiZmF1bHRMaW5lVGFyZ2V0IiwiaGFzT3JiIiwiY2xvdWRNYXJrZXJzIiwibm9PcmIiLCJzdHIiLCJoYXRlZCIsIndyb25nQnVmZiIsIm5vQnVmZiIsImhhc0FzdHJhbCIsImhhc1VtYnJhbCIsImZpcnN0SGVhZG1hcmtlciIsInBhcnNlSW50IiwiZ2V0SGVhZG1hcmtlcklkIiwiZGVjT2Zmc2V0IiwidG9TdHJpbmciLCJ0b1VwcGVyQ2FzZSIsInBhZFN0YXJ0IiwiZmlyc3RMYXNlck1hcmtlciIsImxhc3RMYXNlck1hcmtlciIsImxhc2VyTmFtZVRvTnVtIiwic2N1bHB0dXJlWVBvc2l0aW9ucyIsInkiLCJzY3VscHR1cmVUZXRoZXJOYW1lVG9JZCIsImJsYWRlT2ZGbGFtZUNvdW50IiwibnVtYmVyIiwibmFtZXMiLCJrZXlzIiwid2l0aE51bSIsImZpbHRlciIsIm93bmVycyIsIm1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMiLCJpc1N0YXR1ZVBvc2l0aW9uS25vd24iLCJpc1N0YXR1ZU5vcnRoIiwic2N1bHB0dXJlSWRzIiwib3RoZXJJZCIsInNvdXJjZVkiLCJvdGhlclkiLCJ1bmRlZmluZWQiLCJVbnJlYWNoYWJsZUNvZGUiLCJ5RGlmZiIsIk1hdGgiLCJhYnMiLCJvd25lciIsIm93bmVyTmljayIsIlNob3J0TmFtZSIsInBpbGxhcklkVG9Pd25lciIsInBpbGxhck93bmVyIiwiZmlyZSIsInNtYWxsTGlvbklkVG9Pd25lciIsInNtYWxsTGlvbk93bmVycyIsImhhc1NtYWxsTGlvbiIsImhhc0ZpcmVEZWJ1ZmYiLCJjZW50ZXJZIiwieCIsImRpck9iaiIsIk91dHB1dHMiLCJub3J0aEJpZ0xpb24iLCJzaW5nbGVUYXJnZXQiLCJzb3V0aEJpZ0xpb24iLCJzaGFyZWQiLCJmaXJlRGVidWZmIiwibGFiZWxzIiwibGFuZyIsIm9wdGlvbnMiLCJQYXJzZXJMYW5ndWFnZSIsImpvaW4iLCJoYXNEYXJrIiwiamFnZFRldGhlciIsInBhcnR5IiwiaXNUYW5rIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFRQTtBQUNBLE1BQU1BLFVBQWlDLEdBQUc7QUFDeENDLFFBQU0sRUFBRUMsd0NBRGdDO0FBRXhDQyxVQUFRLEVBQUUsQ0FDUjtBQUNFO0FBQ0FDLE1BQUUsRUFBRTtBQUZOLEdBRFEsRUFLUjtBQUNFQSxNQUFFLEVBQUUsbUJBRE47QUFFRUMsUUFBSSxFQUFFLGFBRlI7QUFHRTtBQUNBQyxZQUFRLEVBQUVDLGlEQUFBLENBQXVCO0FBQUVDLGNBQVEsRUFBRTtBQUFaLEtBQXZCLENBSlo7QUFLRUMsYUFBUyxFQUFFLENBQUNDLEtBQUQsRUFBUUMsT0FBUixLQUFvQjtBQUM3QjtBQUNBLGFBQU9BLE9BQU8sQ0FBQ0MsTUFBUixLQUFtQkQsT0FBTyxDQUFDRSxNQUFsQztBQUNELEtBUkg7QUFTRUMsV0FBTyxFQUFFLENBQUNDLElBQUQsRUFBT0osT0FBUCxLQUFtQjtBQUFBOztBQUMxQix3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aUNBQWlDLFlBQU0sOEJBQThCLFNBQU0sNEJBQTRCLE9BQU0sbUNBQW1DLGNBQU8sZ0NBQWdDLFdBQU8sNkJBQTZCLFFBQU8sNEJBQTRCLE9BQU8sK0JBQStCLFVBQU8sNkJBQTZCLFFBQU8sNkJBQTZCLFFBQU8sd0JBQXdCLEdBQU8sMkJBQTJCLE1BQU8sNkNBQTZDLHFCQUFPLEVBQUUsRSIsImZpbGUiOiJ1aS9jb21tb24vb29wc3lyYWlkc3lfZGF0YS5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBsb3N0Rm9vZD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuLy8gR2VuZXJhbCBtaXN0YWtlczsgdGhlc2UgYXBwbHkgZXZlcnl3aGVyZS5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hdGNoQWxsLFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRyaWdnZXIgaWQgZm9yIGludGVybmFsbHkgZ2VuZXJhdGVkIGVhcmx5IHB1bGwgd2FybmluZy5cclxuICAgICAgaWQ6ICdHZW5lcmFsIEVhcmx5IFB1bGwnLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIEZvb2QgQnVmZicsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIC8vIFdlbGwgRmVkXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0OCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gUHJldmVudCBcIkVvcyBsb3NlcyB0aGUgZWZmZWN0IG9mIFdlbGwgRmVkIGZyb20gQ3JpdGxvIE1jZ2VlXCJcclxuICAgICAgICByZXR1cm4gbWF0Y2hlcy50YXJnZXQgPT09IG1hdGNoZXMuc291cmNlO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEubG9zdEZvb2QgPz89IHt9O1xyXG4gICAgICAgIC8vIFdlbGwgRmVkIGJ1ZmYgaGFwcGVucyByZXBlYXRlZGx5IHdoZW4gaXQgZmFsbHMgb2ZmIChXSFkpLFxyXG4gICAgICAgIC8vIHNvIHN1cHByZXNzIG11bHRpcGxlIG9jY3VycmVuY2VzLlxyXG4gICAgICAgIGlmICghZGF0YS5pbkNvbWJhdCB8fCBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdsb3N0IGZvb2QgYnVmZicsXHJcbiAgICAgICAgICAgIGRlOiAnTmFocnVuZ3NidWZmIHZlcmxvcmVuJyxcclxuICAgICAgICAgICAgZnI6ICdCdWZmIG5vdXJyaXR1cmUgdGVybWluw6llJyxcclxuICAgICAgICAgICAgamE6ICfpo6/lirnmnpzjgYzlpLHjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WkseWOu+mjn+eJqUJVRkYnLFxyXG4gICAgICAgICAgICBrbzogJ+ydjOyLnSDrsoTtlIQg7ZW07KCcJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR2VuZXJhbCBXZWxsIEZlZCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0OCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEubG9zdEZvb2QpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZGVsZXRlIGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIFJhYmJpdCBNZWRpdW0nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzhFMCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuSXNQbGF5ZXJJZChtYXRjaGVzLnNvdXJjZUlkKSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnNvdXJjZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdidW5ueScsXHJcbiAgICAgICAgICAgIGRlOiAnSGFzZScsXHJcbiAgICAgICAgICAgIGZyOiAnbGFwaW4nLFxyXG4gICAgICAgICAgICBqYTogJ+OBhuOBleOBjicsXHJcbiAgICAgICAgICAgIGNuOiAn5YWU5a2QJyxcclxuICAgICAgICAgICAga286ICfthqDrgbwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgYm9vdENvdW50PzogbnVtYmVyO1xyXG4gIHBva2VDb3VudD86IG51bWJlcjtcclxufVxyXG5cclxuLy8gVGVzdCBtaXN0YWtlIHRyaWdnZXJzLlxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuTWlkZGxlTGFOb3NjZWEsXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IEJvdycsXHJcbiAgICAgIHR5cGU6ICdHYW1lTG9nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IGJvdyBjb3VydGVvdXNseSB0byB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdm91cyBpbmNsaW5leiBkZXZhbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOBq+OBiui+nuWEgOOBl+OBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirmga3mlazlnLDlr7nmnKjkurrooYznpLwuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7JeQ6rKMIOqzteyGkO2VmOqyjCDsnbjsgqztlanri4jri6QuKj8nIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAncHVsbCcsXHJcbiAgICAgICAgICBibGFtZTogZGF0YS5tZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb3cnLFxyXG4gICAgICAgICAgICBkZTogJ0JvZ2VuJyxcclxuICAgICAgICAgICAgZnI6ICdTYWx1ZXInLFxyXG4gICAgICAgICAgICBqYTogJ+OBiui+nuWEgCcsXHJcbiAgICAgICAgICAgIGNuOiAn6Z6g6LqsJyxcclxuICAgICAgICAgICAga286ICfsnbjsgqwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IFdpcGUnLFxyXG4gICAgICB0eXBlOiAnR2FtZUxvZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBiaWQgZmFyZXdlbGwgdG8gdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIGZhaXRlcyB2b3MgYWRpZXV4IGF1IG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgavliKXjgozjga7mjKjmi7bjgpLjgZfjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q5ZCR5pyo5Lq65ZGK5YirLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleyXkOqyjCDsnpHrs4Qg7J247IKs66W8IO2VqeuLiOuLpC4qPycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3aXBlJyxcclxuICAgICAgICAgIGJsYW1lOiBkYXRhLm1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1BhcnR5IFdpcGUnLFxyXG4gICAgICAgICAgICBkZTogJ0dydXBwZW53aXBlJyxcclxuICAgICAgICAgICAgZnI6ICdQYXJ0eSBXaXBlJyxcclxuICAgICAgICAgICAgamE6ICfjg6/jgqTjg5cnLFxyXG4gICAgICAgICAgICBjbjogJ+WboueBrScsXHJcbiAgICAgICAgICAgIGtvOiAn7YyM7YuwIOyghOupuCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgQm9vdHNoaW5lJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMzUnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKG1hdGNoZXMuc291cmNlICE9PSBkYXRhLm1lKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHN0cmlraW5nRHVtbXlCeUxvY2FsZSA9IHtcclxuICAgICAgICAgIGVuOiAnU3RyaWtpbmcgRHVtbXknLFxyXG4gICAgICAgICAgZGU6ICdUcmFpbmluZ3NwdXBwZScsXHJcbiAgICAgICAgICBmcjogJ01hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudCcsXHJcbiAgICAgICAgICBqYTogJ+acqOS6uicsXHJcbiAgICAgICAgICBjbjogJ+acqOS6uicsXHJcbiAgICAgICAgICBrbzogJ+uCmOustOyduO2YlScsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzdHJpa2luZ0R1bW15TmFtZXMgPSBPYmplY3QudmFsdWVzKHN0cmlraW5nRHVtbXlCeUxvY2FsZSk7XHJcbiAgICAgICAgcmV0dXJuIHN0cmlraW5nRHVtbXlOYW1lcy5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5ib290Q291bnQgPz89IDA7XHJcbiAgICAgICAgZGF0YS5ib290Q291bnQrKztcclxuICAgICAgICBjb25zdCB0ZXh0ID0gYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtkYXRhLmJvb3RDb3VudH0pOiAke2RhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcyl9YDtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiB0ZXh0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgTGVhZGVuIEZpc3QnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNzQ1JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5zb3VyY2UgPT09IGRhdGEubWUsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2dvb2QnLCBibGFtZTogZGF0YS5tZSwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBPb3BzJyxcclxuICAgICAgdHlwZTogJ0dhbWVMb2cnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJy4qb29wcy4qJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxMCxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmxpbmUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBQb2tlIENvbGxlY3QnLFxyXG4gICAgICB0eXBlOiAnR2FtZUxvZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBwb2tlIHRoZSBzdHJpa2luZyBkdW1teS4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnVm91cyB0b3VjaGV6IGzDqWfDqHJlbWVudCBsZSBtYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQgZHUgZG9pZ3QuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q44Gv5pyo5Lq644KS44Gk44Gk44GE44GfLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKueUqOaJi+aMh+aIs+WQkeacqOS6ui4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirrgpjrrLTsnbjtmJXsnYQg7L+h7L+hIOywjOumheuLiOuLpC4qPycgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnBva2VDb3VudCA9IChkYXRhLnBva2VDb3VudCA/PyAwKSArIDE7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgUG9rZScsXHJcbiAgICAgIHR5cGU6ICdHYW1lTG9nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IHBva2UgdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIHRvdWNoZXogbMOpZ8OocmVtZW50IGxlIG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudCBkdSBkb2lndC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgpLjgaTjgaTjgYTjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q55So5omL5oyH5oiz5ZCR5pyo5Lq6Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleydhCDsv6Hsv6Eg7LCM66aF64uI64ukLio/JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIDEgcG9rZSBhdCBhIHRpbWUgaXMgZmluZSwgYnV0IG1vcmUgdGhhbiBvbmUgaW4gNSBzZWNvbmRzIGlzIChPQlZJT1VTTFkpIGEgbWlzdGFrZS5cclxuICAgICAgICBpZiAoIWRhdGEucG9rZUNvdW50IHx8IGRhdGEucG9rZUNvdW50IDw9IDEpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBkYXRhLm1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYFRvbyBtYW55IHBva2VzICgke2RhdGEucG9rZUNvdW50fSlgLFxyXG4gICAgICAgICAgICBkZTogYFp1IHZpZWxlIFBpZWtzZXIgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGZyOiBgVHJvcCBkZSB0b3VjaGVzICgke2RhdGEucG9rZUNvdW50fSlgLFxyXG4gICAgICAgICAgICBqYTogYOOBhOOBo+OBseOBhOOBpOOBpOOBhOOBnyAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAgY246IGDmiLPlpKrlpJrkuIvllaYgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGtvOiBg64SI66y0IOunjuydtCDssIzrpoQgKCR7ZGF0YS5wb2tlQ291bnR967KIKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IGRlbGV0ZSBkYXRhLnBva2VDb3VudCxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIElmcml0IFN0b3J5IE1vZGVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUJvd2xPZkVtYmVycyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSWZyaXRObSBSYWRpYW50IFBsdW1lJzogJzJERScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdJZnJpdE5tIEluY2luZXJhdGUnOiAnMUM1JyxcclxuICAgICdJZnJpdE5tIEVydXB0aW9uJzogJzJERCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRpdGFuIFN0b3J5IE1vZGVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbk5tIFdlaWdodCBPZiBUaGUgTGFuZCc6ICczQ0QnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuTm0gTGFuZHNsaWRlJzogJzI4QScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhbk5tIFJvY2sgQnVzdGVyJzogJzI4MScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSXQncyBoYXJkIHRvIGNhcHR1cmUgdGhlIHJlZmxlY3Rpb24gYWJpbGl0aWVzIGZyb20gTGV2aWF0aGFuJ3MgSGVhZCBhbmQgVGFpbCBpZiB5b3UgdXNlXHJcbi8vIHJhbmdlZCBwaHlzaWNhbCBhdHRhY2tzIC8gbWFnaWMgYXR0YWNrcyByZXNwZWN0aXZlbHksIGFzIHRoZSBhYmlsaXR5IG5hbWVzIGFyZSB0aGVcclxuLy8gYWJpbGl0eSB5b3UgdXNlZCBhbmQgZG9uJ3QgYXBwZWFyIHRvIHNob3cgdXAgaW4gdGhlIGxvZyBhcyBub3JtYWwgXCJhYmlsaXR5XCIgbGluZXMuXHJcbi8vIFRoYXQgc2FpZCwgZG90cyBzdGlsbCB0aWNrIGluZGVwZW5kZW50bHkgb24gYm90aCBzbyBpdCdzIGxpa2VseSB0aGF0IHBlb3BsZSB3aWxsIGF0YWNrXHJcbi8vIHRoZW0gYW55d2F5LlxyXG5cclxuLy8gVE9ETzogRmlndXJlIG91dCB3aHkgRHJlYWQgVGlkZSAvIFdhdGVyc3BvdXQgYXBwZWFyIGxpa2Ugc2hhcmVzIChpLmUuIDB4MTYgaWQpLlxyXG4vLyBEcmVhZCBUaWRlID0gODIzLzgyNC84MjUsIFdhdGVyc3BvdXQgPSA4MjlcclxuXHJcbi8vIExldmlhdGhhbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXaG9ybGVhdGVyRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTGV2aUV4IEdyYW5kIEZhbGwnOiAnODJGJywgLy8gdmVyeSBsYXJnZSBjaXJjdWxhciBhb2UgYmVmb3JlIHNwaW5ueSBkaXZlcywgYXBwbGllcyBoZWF2eVxyXG4gICAgJ0xldmlFeCBIeWRybyBTaG90JzogJzc0OCcsIC8vIFdhdmVzcGluZSBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIERyb3BzeSBlZmZlY3RcclxuICAgICdMZXZpRXggRHJlYWRzdG9ybSc6ICc3NDknLCAvLyBXYXZldG9vdGggU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBIeXN0ZXJpYSBlZmZlY3RcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdMZXZpRXggQm9keSBTbGFtJzogJzgyQScsIC8vIGxldmkgc2xhbSB0aGF0IHRpbHRzIHRoZSBib2F0XHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMSc6ICc4OEEnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMic6ICc4OEInLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMyc6ICc4MkMnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdMZXZpRXggRHJvcHN5JzogJzExMCcsIC8vIHN0YW5kaW5nIGluIHRoZSBoeWRybyBzaG90IGZyb20gdGhlIFdhdmVzcGluZSBTYWhhZ2luXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdMZXZpRXggSHlzdGVyaWEnOiAnMTI4JywgLy8gc3RhbmRpbmcgaW4gdGhlIGRyZWFkc3Rvcm0gZnJvbSB0aGUgV2F2ZXRvb3RoIFNhaGFnaW5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTGV2aUV4IEJvZHkgU2xhbSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnODJBJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgc2VlbkRpYW1vbmREdXN0PzogYm9vbGVhbjtcclxufVxyXG5cclxuLy8gU2hpdmEgSGFyZFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZUhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUhtIEljaWNsZSBJbXBhY3QnOiAnOTkzJyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFIbSBHbGFjaWVyIEJhc2gnOiAnOUExJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gS25vY2tiYWNrIHRhbmsgY2xlYXZlLlxyXG4gICAgJ1NoaXZhSG0gSGVhdmVubHkgU3RyaWtlJzogJzlBMCcsXHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUhtIEhhaWxzdG9ybSc6ICc5OTgnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBUYW5rYnVzdGVyLiAgVGhpcyBpcyBTaGl2YSBIYXJkIG1vZGUsIG5vdCBTaGl2YSBFeHRyZW1lLiAgUGxlYXNlIVxyXG4gICAgJ1NoaXZhSG0gSWNlYnJhbmQnOiAnOTk2JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFIbSBEaWFtb25kIER1c3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzk4QScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnNlZW5EaWFtb25kRHVzdCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhSG0gRGVlcCBGcmVlemUnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBTaGl2YSBhbHNvIHVzZXMgYWJpbGl0eSA5QTMgb24geW91LCBidXQgaXQgaGFzIHRoZSB1bnRyYW5zbGF0ZWQgbmFtZVxyXG4gICAgICAvLyDpgI/mmI7vvJrjgrfjg7TjgqHvvJrlh43ntZDjg6zjgq/jg4jvvJrjg47jg4Pjgq/jg5Djg4Pjgq/nlKguIFNvLCB1c2UgdGhlIGVmZmVjdCBpbnN0ZWFkIGZvciBmcmVlIHRyYW5zbGF0aW9uLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUU3JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBzbyBvbmx5IGEgbWlzdGFrZSBhZnRlciB0aGF0LlxyXG4gICAgICAgIC8vIFVubGlrZSBleHRyZW1lLCB0aGlzIGhhcyB0aGUgc2FtZSAyMCBzZWNvbmQgZHVyYXRpb24gYXMgdGhlIGludGVybWlzc2lvbi5cclxuICAgICAgICByZXR1cm4gZGF0YS5zZWVuRGlhbW9uZER1c3Q7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTaGl2YSBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVBa2hBZmFoQW1waGl0aGVhdHJlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBMYXJnZSB3aGl0ZSBjaXJjbGVzLlxyXG4gICAgJ1NoaXZhRXggSWNpY2xlIEltcGFjdCc6ICdCRUInLFxyXG4gICAgLy8gXCJnZXQgaW5cIiBhb2VcclxuICAgICdTaGl2YUV4IFdoaXRlb3V0JzogJ0JFQycsXHJcbiAgICAvLyBBdm9pZGFibGUgdGFuayBzdHVuLlxyXG4gICAgJ1NoaXZhRXggR2xhY2llciBCYXNoJzogJ0JFOScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyAyNzAgZGVncmVlIGF0dGFjay5cclxuICAgICdTaGl2YUV4IEdsYXNzIERhbmNlJzogJ0JERicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEhhaWxzdG9ybSBzcHJlYWQgbWFya2VyLlxyXG4gICAgJ1NoaXZhRXggSGFpbHN0b3JtJzogJ0JFMicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgIC8vIExhc2VyLiAgVE9ETzogbWF5YmUgYmxhbWUgdGhlIHBlcnNvbiBpdCdzIG9uPz9cclxuICAgICdTaGl2YUV4IEF2YWxhbmNoZSc6ICdCRTAnLFxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFBhcnR5IHNoYXJlZCB0YW5rYnVzdGVyXHJcbiAgICAnU2hpdmFFeCBJY2VicmFuZCc6ICdCRTEnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGl2YUV4IERlZXAgRnJlZXplJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gU2hpdmEgYWxzbyB1c2VzIGFiaWxpdHkgQzhBIG9uIHlvdSwgYnV0IGl0IGhhcyB0aGUgdW50cmFuc2xhdGVkIG5hbWVcclxuICAgICAgLy8g6YCP5piO77ya44K344O044Kh77ya5YeN57WQ44Os44Kv44OI77ya44OO44OD44Kv44OQ44OD44Kv55SoL+ODkuODreOCpOODg+OCry4gU28sIHVzZSB0aGUgZWZmZWN0IGluc3RlYWQgZm9yIGZyZWUgdHJhbnNsYXRpb24uXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxRTcnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBidXQgZm9yIGEgc2hvcnRlciBkdXJhdGlvbi5cclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSA+IDIwO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRpdGFuIEhhcmRcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsSGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5IbSBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNTUzJyxcclxuICAgICdUaXRhbkhtIEJ1cnN0JzogJzQxQycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5IbSBMYW5kc2xpZGUnOiAnNTU0JyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuSG0gUm9jayBCdXN0ZXInOiAnNTUwJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuSG0gTW91bnRhaW4gQnVzdGVyJzogJzI4MycsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRpdGFuIEV4dHJlbWVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5FeCBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNUJFJyxcclxuICAgICdUaXRhbkV4IEJ1cnN0JzogJzVCRicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5FeCBMYW5kc2xpZGUnOiAnNUJCJyxcclxuICAgICdUaXRhbkV4IEdhb2xlciBMYW5kc2xpZGUnOiAnNUMzJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuRXggUm9jayBCdXN0ZXInOiAnNUI3JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuRXggTW91bnRhaW4gQnVzdGVyJzogJzVCOCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIHpvbWJpZT86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBzaGllbGQ/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXZWVwaW5nQ2l0eU9mTWhhY2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgQ3JpdGljYWwgQml0ZSc6ICcxODQ4JywgLy8gU2Fyc3VjaHVzIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSZWFsbSBTaGFrZXInOiAnMTgzRScsIC8vIEZpcnN0IERhdWdodGVyIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIFNpbGtzY3JlZW4nOiAnMTgzQycsIC8vIEZpcnN0IERhdWdodGVyIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBTaWxrZW4gU3ByYXknOiAnMTgyNCcsIC8vIEFyYWNobmUgRXZlIHJlYXIgY29uYWwgYW9lXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAxJzogJzE4MzcnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAxXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAyJzogJzE4MzYnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAyXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAzJzogJzE4MzUnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAzXHJcbiAgICAnV2VlcGluZyBTcGlkZXIgVGhyZWFkJzogJzE4MzknLCAvLyBBcmFjaG5lIEV2ZSBzcGlkZXIgbGluZSBhb2VcclxuICAgICdXZWVwaW5nIEZpcmUgSUknOiAnMTg0RScsIC8vIEJsYWNrIE1hZ2UgQ29ycHNlIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIE5lY3JvcHVyZ2UnOiAnMTdENycsIC8vIEZvcmdhbGwgU2hyaXZlbGVkIFRhbG9uIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSb3R0ZW4gQnJlYXRoJzogJzE3RDAnLCAvLyBGb3JnYWxsIERhaGFrIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBNb3cnOiAnMTdEMicsIC8vIEZvcmdhbGwgSGFhZ2VudGkgdW5tYXJrZWQgY2xlYXZlXHJcbiAgICAnV2VlcGluZyBEYXJrIEVydXB0aW9uJzogJzE3QzMnLCAvLyBGb3JnYWxsIHB1ZGRsZSBtYXJrZXJcclxuICAgIC8vIDE4MDYgaXMgYWxzbyBGbGFyZSBTdGFyLCBidXQgaWYgeW91IGdldCBieSAxODA1IHlvdSBhbHNvIGdldCBoaXQgYnkgMTgwNj9cclxuICAgICdXZWVwaW5nIEZsYXJlIFN0YXInOiAnMTgwNScsIC8vIE96bWEgY3ViZSBwaGFzZSBkb251dFxyXG4gICAgJ1dlZXBpbmcgRXhlY3JhdGlvbic6ICcxODI5JywgLy8gT3ptYSB0cmlhbmdsZSBsYXNlclxyXG4gICAgJ1dlZXBpbmcgSGFpcmN1dCAxJzogJzE4MEInLCAvLyBDYWxvZmlzdGVyaSAxODAgY2xlYXZlIDFcclxuICAgICdXZWVwaW5nIEhhaXJjdXQgMic6ICcxODBGJywgLy8gQ2Fsb2Zpc3RlcmkgMTgwIGNsZWF2ZSAyXHJcbiAgICAnV2VlcGluZyBFbnRhbmdsZW1lbnQnOiAnMTgxRCcsIC8vIENhbG9maXN0ZXJpIGxhbmRtaW5lIHB1ZGRsZSBwcm9jXHJcbiAgICAnV2VlcGluZyBFdmlsIEN1cmwnOiAnMTgxNicsIC8vIENhbG9maXN0ZXJpIGF4ZVxyXG4gICAgJ1dlZXBpbmcgRXZpbCBUcmVzcyc6ICcxODE3JywgLy8gQ2Fsb2Zpc3RlcmkgYnVsYlxyXG4gICAgJ1dlZXBpbmcgRGVwdGggQ2hhcmdlJzogJzE4MjAnLCAvLyBDYWxvZmlzdGVyaSBjaGFyZ2UgdG8gZWRnZVxyXG4gICAgJ1dlZXBpbmcgRmVpbnQgUGFydGljbGUgQmVhbSc6ICcxOTI4JywgLy8gQ2Fsb2Zpc3Rlcmkgc2t5IGxhc2VyXHJcbiAgICAnV2VlcGluZyBFdmlsIFN3aXRjaCc6ICcxODE1JywgLy8gQ2Fsb2Zpc3RlcmkgbGFzZXJzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdXZWVwaW5nIEh5c3RlcmlhJzogJzEyOCcsIC8vIEFyYWNobmUgRXZlIEZyb25kIEFmZmVhcmRcclxuICAgICdXZWVwaW5nIFpvbWJpZmljYXRpb24nOiAnMTczJywgLy8gRm9yZ2FsbCB0b28gbWFueSB6b21iaWUgcHVkZGxlc1xyXG4gICAgJ1dlZXBpbmcgVG9hZCc6ICcxQjcnLCAvLyBGb3JnYWxsIEJyYW5kIG9mIHRoZSBGYWxsZW4gZmFpbHVyZVxyXG4gICAgJ1dlZXBpbmcgRG9vbSc6ICczOEUnLCAvLyBGb3JnYWxsIEhhYWdlbnRpIE1vcnRhbCBSYXlcclxuICAgICdXZWVwaW5nIEFzc2ltaWxhdGlvbic6ICc0MkMnLCAvLyBPem1hc2hhZGUgQXNzaW1pbGF0aW9uIGxvb2stYXdheVxyXG4gICAgJ1dlZXBpbmcgU3R1bic6ICc5NScsIC8vIENhbG9maXN0ZXJpIFBlbmV0cmF0aW9uIGxvb2stYXdheVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnV2VlcGluZyBBcmFjaG5lIFdlYic6ICcxODVFJywgLy8gQXJhY2huZSBFdmUgaGVhZG1hcmtlciB3ZWIgYW9lXHJcbiAgICAnV2VlcGluZyBFYXJ0aCBBZXRoZXInOiAnMTg0MScsIC8vIEFyYWNobmUgRXZlIG9yYnNcclxuICAgICdXZWVwaW5nIEVwaWdyYXBoJzogJzE4NTInLCAvLyBIZWFkc3RvbmUgdW50ZWxlZ3JhcGhlZCBsYXNlciBsaW5lIHRhbmsgYXR0YWNrXHJcbiAgICAvLyBUaGlzIGlzIHRvbyBub2lzeS4gIEJldHRlciB0byBwb3AgdGhlIGJhbGxvb25zIHRoYW4gd29ycnkgYWJvdXQgZnJpZW5kcy5cclxuICAgIC8vICdXZWVwaW5nIEV4cGxvc2lvbic6ICcxODA3JywgLy8gT3ptYXNwaGVyZSBDdWJlIG9yYiBleHBsb3Npb25cclxuICAgICdXZWVwaW5nIFNwbGl0IEVuZCAxJzogJzE4MEMnLCAvLyBDYWxvZmlzdGVyaSB0YW5rIGNsZWF2ZSAxXHJcbiAgICAnV2VlcGluZyBTcGxpdCBFbmQgMic6ICcxODEwJywgLy8gQ2Fsb2Zpc3RlcmkgdGFuayBjbGVhdmUgMlxyXG4gICAgJ1dlZXBpbmcgQmxvb2RpZWQgTmFpbCc6ICcxODFGJywgLy8gQ2Fsb2Zpc3RlcmkgYXhlL2J1bGIgYXBwZWFyaW5nXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBHcmFkdWFsIFpvbWJpZmljYXRpb24gR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0MTUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuem9tYmllW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBHcmFkdWFsIFpvbWJpZmljYXRpb24gTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0MTUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPSBkYXRhLnpvbWJpZSB8fCB7fTtcclxuICAgICAgICBkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIE1lZ2EgRGVhdGgnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzE3Q0EnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLnpvbWJpZSAmJiAhZGF0YS56b21iaWVbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgSGVhZHN0b25lIFNoaWVsZCBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzE1RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNoaWVsZCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBIZWFkc3RvbmUgU2hpZWxkIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnMTVFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc2hpZWxkID0gZGF0YS5zaGllbGQgfHwge307XHJcbiAgICAgICAgZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRmxhcmluZyBFcGlncmFwaCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMTg1NicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuc2hpZWxkICYmICFkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBuYW1lIGlzIGhlbHBmdWxseSBjYWxsZWQgXCJBdHRhY2tcIiBzbyBuYW1lIGl0IHNvbWV0aGluZyBlbHNlLlxyXG4gICAgICBpZDogJ1dlZXBpbmcgT3ptYSBUYW5rIExhc2VyJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgdHlwZTogJzIyJywgaWQ6ICcxODMxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdUYW5rIExhc2VyJyxcclxuICAgICAgICAgICAgZGU6ICdUYW5rIExhc2VyJyxcclxuICAgICAgICAgICAgZnI6ICdUYW5rIExhc2VyJyxcclxuICAgICAgICAgICAgamE6ICfjgr/jg7Pjgq/jg6zjgrbjg7wnLFxyXG4gICAgICAgICAgICBjbjogJ+WdpuWFi+a/gOWFiScsXHJcbiAgICAgICAgICAgIGtvOiAn7YOx7LukIOugiOydtOyggCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgT3ptYSBIb2x5JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxODJFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdTbGlkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ2lzdCBydW50ZXJnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDvvIEnLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwseuQqCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBBZXRoZXJvY2hlbWljYWwgUmVzZWFyY2ggRmFjaWxpdHlcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFldGhlcm9jaGVtaWNhbFJlc2VhcmNoRmFjaWxpdHksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FSRiBHcmFuZCBTd29yZCc6ICcyMTYnLCAvLyBDb25hbCBBb0UsIFNjcmFtYmxlZCBJcm9uIEdpYW50IHRyYXNoXHJcbiAgICAnQVJGIENlcm1ldCBEcmlsbCc6ICcyMEUnLCAvLyBMaW5lIEFvRSwgNnRoIExlZ2lvbiBNYWdpdGVrIFZhbmd1YXJkIHRyYXNoXHJcbiAgICAnQVJGIE1hZ2l0ZWsgU2x1Zyc6ICcxMERCJywgLy8gTGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICcxMEUyJywgLy8gTGFyZ2UgdGFyZ2V0ZWQgY2lyY2xlIEFvRSwgTWFnaXRlayBUdXJyZXQgSUksIGJvc3MgMVxyXG4gICAgJ0FSRiBNYWdpdGVrIFNwcmVhZCc6ICcxMERDJywgLy8gMjcwLWRlZ3JlZSByb29td2lkZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBFZXJpZSBTb3VuZHdhdmUnOiAnMTE3MCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEN1bHR1cmVkIEVtcHVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBUYWlsIFNsYXAnOiAnMTI1RicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgRGFuY2VyIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIENhbGNpZnlpbmcgTWlzdCc6ICcxMjNBJywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBOYWdhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFB1bmN0dXJlJzogJzExNzEnLCAvLyBTaG9ydCBsaW5lIEFvRSwgQ3VsdHVyZWQgRW1wdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFNpZGVzd2lwZSc6ICcxMUE3JywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBSZXB0b2lkIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIEd1c3QnOiAnMzk1JywgLy8gVGFyZ2V0ZWQgc21hbGwgY2lyY2xlIEFvRSwgQ3VsdHVyZWQgTWlycm9ya25pZ2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIE1hcnJvdyBEcmFpbic6ICdEMEUnLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIENoaW1lcmEgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgUmlkZGxlIE9mIFRoZSBTcGhpbngnOiAnMTBFNCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIGJvc3MgMlxyXG4gICAgJ0FSRiBLYSc6ICcxMDZFJywgLy8gQ29uYWwgQW9FLCBib3NzIDJcclxuICAgICdBUkYgUm90b3N3aXBlJzogJzExQ0MnLCAvLyBDb25hbCBBb0UsIEZhY2lsaXR5IERyZWFkbm91Z2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEF1dG8tY2Fubm9ucyc6ICcxMkQ5JywgLy8gTGluZSBBb0UsIE1vbml0b3JpbmcgRHJvbmUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBUkYgRGVhdGhcXCdzIERvb3InOiAnNEVDJywgLy8gTGluZSBBb0UsIEN1bHR1cmVkIFNoYWJ0aSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBTcGVsbHN3b3JkJzogJzRFQicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgU2hhYnRpIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEVuZCBPZiBEYXlzJzogJzEwRkQnLCAvLyBMaW5lIEFvRSwgYm9zcyAzXHJcbiAgICAnQVJGIEJsaXp6YXJkIEJ1cnN0JzogJzEwRkUnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgSWdleW9yaG0sIGJvc3MgM1xyXG4gICAgJ0FSRiBGaXJlIEJ1cnN0JzogJzEwRkYnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgTGFoYWJyZWEsIGJvc3MgM1xyXG4gICAgJ0FSRiBTZWEgT2YgUGl0Y2gnOiAnMTJERScsIC8vIFRhcmdldGVkIHBlcnNpc3RlbnQgY2lyY2xlIEFvRXMsIGJvc3MgM1xyXG4gICAgJ0FSRiBEYXJrIEJsaXp6YXJkIElJJzogJzEwRjMnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIElnZXlvcmhtLCBib3NzIDNcclxuICAgICdBUkYgRGFyayBGaXJlIElJJzogJzEwRjgnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIExhaGFicmVhLCBib3NzIDNcclxuICAgICdBUkYgQW5jaWVudCBFcnVwdGlvbic6ICcxMTA0JywgLy8gU2VsZi10YXJnZXRlZCBjaXJjbGUgQW9FLCBib3NzIDRcclxuICAgICdBUkYgRW50cm9waWMgRmxhbWUnOiAnMTEwOCcsIC8vIExpbmUgQW9FcywgIGJvc3MgNFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQVJGIENodGhvbmljIEh1c2gnOiAnMTBFNycsIC8vIEluc3RhbnQgdGFuayBjbGVhdmUsIGJvc3MgMlxyXG4gICAgJ0FSRiBIZWlnaHQgT2YgQ2hhb3MnOiAnMTEwMScsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDRcclxuICAgICdBUkYgQW5jaWVudCBDaXJjbGUnOiAnMTEwMicsIC8vIFRhcmdldGVkIGRvbnV0IEFvRXMsIGJvc3MgNFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdBUkYgUGV0cmlmYWN0aW9uJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzAxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBGcmFjdGFsIENvbnRpbnV1bVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRnJhY3RhbENvbnRpbnV1bSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBEb3VibGUgU2V2ZXInOiAnRjdEJywgLy8gQ29uYWxzLCBib3NzIDFcclxuICAgICdGcmFjdGFsIEFldGhlcmljIENvbXByZXNzaW9uJzogJ0Y4MCcsIC8vIEdyb3VuZCBBb0UgY2lyY2xlcywgYm9zcyAxXHJcbiAgICAnRnJhY3RhbCAxMS1Ub256ZSBTd2lwZSc6ICdGODEnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0ZyYWN0YWwgMTAtVG9uemUgU2xhc2gnOiAnRjgzJywgLy8gRnJvbnRhbCBsaW5lLCBib3NzIDJcclxuICAgICdGcmFjdGFsIDExMS1Ub256ZSBTd2luZyc6ICdGODcnLCAvLyBHZXQtb3V0IEFvRSwgYm9zcyAyXHJcbiAgICAnRnJhY3RhbCBCcm9rZW4gR2xhc3MnOiAnRjhFJywgLy8gR2xvd2luZyBwYW5lbHMsIGJvc3MgM1xyXG4gICAgJ0ZyYWN0YWwgTWluZXMnOiAnRjkwJyxcclxuICAgICdGcmFjdGFsIFNlZWQgb2YgdGhlIFJpdmVycyc6ICdGOTEnLCAvLyBHcm91bmQgQW9FIGNpcmNsZXMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBTYW5jdGlmaWNhdGlvbic6ICdGODknLCAvLyBJbnN0YW50IGNvbmFsIGJ1c3RlciwgYm9zcyAzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc0ltcD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUdyZWF0R3ViYWxMaWJyYXJ5SGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBUZXJyb3IgRXllJzogJzkzMCcsIC8vIENpcmNsZSBBb0UsIFNwaW5lIEJyZWFrZXIgdHJhc2hcclxuICAgICdHdWJhbEhtIEJhdHRlcic6ICcxOThBJywgLy8gQ2lyY2xlIEFvRSwgdHJhc2ggYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gQ29uZGVtbmF0aW9uJzogJzM5MCcsIC8vIENvbmFsIEFvRSwgQmlibGlvdm9yZSB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMSc6ICcxOTQzJywgLy8gRmFsbGluZyBib29rIHNoYWRvdywgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBEaXNjb250aW51ZSAyJzogJzE5NDAnLCAvLyBSdXNoIEFvRSBmcm9tIGVuZHMsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMyc6ICcxOTQyJywgLy8gUnVzaCBBb0UgYWNyb3NzLCBib3NzIDFcclxuICAgICdHdWJhbEhtIEZyaWdodGZ1bCBSb2FyJzogJzE5M0InLCAvLyBHZXQtT3V0IEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBJc3N1ZSAxJzogJzE5M0QnLCAvLyBJbml0aWFsIGVuZCBib29rIHdhcm5pbmcgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIElzc3VlIDInOiAnMTkzRicsIC8vIEluaXRpYWwgZW5kIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gSXNzdWUgMyc6ICcxOTQxJywgLy8gSW5pdGlhbCBzaWRlIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGVzb2xhdGlvbic6ICcxOThDJywgLy8gTGluZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEb3VibGUgU21hc2gnOiAnMjZBJywgLy8gQ29uYWwgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGFya25lc3MnOiAnM0EwJywgLy8gQ29uYWwgQW9FLCBJbmtzdGFpbiB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRmlyZXdhdGVyJzogJzNCQScsIC8vIENpcmNsZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBFbGJvdyBEcm9wJzogJ0NCQScsIC8vIENvbmFsIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIERhcmsnOiAnMTlERicsIC8vIExhcmdlIGNpcmNsZSBBb0UsIElua3N0YWluIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBTZWFscyc6ICcxOTRBJywgLy8gU3VuL01vb25zZWFsIGZhaWx1cmUsIGJvc3MgMlxyXG4gICAgJ0d1YmFsSG0gV2F0ZXIgSUlJJzogJzFDNjcnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBQb3JvZ28gUGVnaXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBSYWdpbmcgQXhlJzogJzE3MDMnLCAvLyBTbWFsbCBjb25hbCBBb0UsIE1lY2hhbm9zZXJ2aXRvciB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gTWFnaWMgSGFtbWVyJzogJzE5OTAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBBcGFuZGEgbWluaS1ib3NzXHJcbiAgICAnR3ViYWxIbSBQcm9wZXJ0aWVzIE9mIEdyYXZpdHknOiAnMTk1MCcsIC8vIENpcmNsZSBBb0UgZnJvbSBncmF2aXR5IHB1ZGRsZXMsIGJvc3MgM1xyXG4gICAgJ0d1YmFsSG0gUHJvcGVydGllcyBPZiBMZXZpdGF0aW9uJzogJzE5NEYnLCAvLyBDaXJjbGUgQW9FIGZyb20gbGV2aXRhdGlvbiBwdWRkbGVzLCBib3NzIDNcclxuICAgICdHdWJhbEhtIENvbWV0JzogJzE5NjknLCAvLyBTbWFsbCBjaXJjbGUgQW9FLCBpbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0d1YmFsSG0gRWNsaXB0aWMgTWV0ZW9yJzogJzE5NUMnLCAvLyBMb1MgbWVjaGFuaWMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBTZWFyaW5nIFdpbmQnOiAnMTk0NCcsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDJcclxuICAgICdHdWJhbEhtIFRodW5kZXInOiAnMTlbQUJdJywgLy8gU3ByZWFkIG1hcmtlciwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBGaXJlIGdhdGUgaW4gaGFsbHdheSB0byBib3NzIDIsIG1hZ25ldCBmYWlsdXJlIG9uIGJvc3MgMlxyXG4gICAgICBpZDogJ0d1YmFsSG0gQnVybnMnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTBCJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIFRodW5kZXIgMyBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzSW1wID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0ltcFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHdWJhbEhtIEltcCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0ltcCA9IGRhdGEuaGFzSW1wIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzSW1wW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGFyZ2V0cyB3aXRoIEltcCB3aGVuIFRodW5kZXIgSUlJIHJlc29sdmVzIHJlY2VpdmUgYSB2dWxuZXJhYmlsaXR5IHN0YWNrIGFuZCBicmllZiBzdHVuXHJcbiAgICAgIGlkOiAnR3ViYWxIbSBJbXAgVGh1bmRlcicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NVtBQl0nLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuaGFzSW1wPy5bbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1Nob2NrZWQgSW1wJyxcclxuICAgICAgICAgICAgZGU6ICdTY2hvY2tpZXJ0ZXIgSW1wJyxcclxuICAgICAgICAgICAgamE6ICfjgqvjg4Pjg5HjgpLop6PpmaTjgZfjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+ays+erpeeKtuaAgeWQg+S6huaatOmbtycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gUXVha2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcxOTU2JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBBbHdheXMgaGl0cyB0YXJnZXQsIGJ1dCBpZiBjb3JyZWN0bHkgcmVzb2x2ZWQgd2lsbCBkZWFsIDAgZGFtYWdlXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gVG9ybmFkbycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NVs3OF0nLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIEFsd2F5cyBoaXRzIHRhcmdldCwgYnV0IGlmIGNvcnJlY3RseSByZXNvbHZlZCB3aWxsIGRlYWwgMCBkYW1hZ2VcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNvaG1BbEhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NvaG1BbEhtIERlYWRseSBWYXBvcic6ICcxREM5JywgLy8gRW52aXJvbm1lbnRhbCBjaXJjbGUgQW9Fc1xyXG4gICAgJ1NvaG1BbEhtIERlZXByb290JzogJzFDREEnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBCbG9vbWluZyBDaGljaHUgdHJhc2hcclxuICAgICdTb2htQWxIbSBPZGlvdXMgQWlyJzogJzFDREInLCAvLyBDb25hbCBBb0UsIEJsb29taW5nIENoaWNodSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEdsb3Jpb3VzIEJsYXplJzogJzFDMzMnLCAvLyBDaXJjbGUgQW9FLCBTbWFsbCBTcG9yZSBTYWMsIGJvc3MgMVxyXG4gICAgJ1NvaG1BbEhtIEZvdWwgV2F0ZXJzJzogJzExOEEnLCAvLyBDb25hbCBBb0UsIE1vdW50YWludG9wIE9wa2VuIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUGxhaW4gUG91bmQnOiAnMTE4NycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIE1vdW50YWludG9wIEhyb3BrZW4gdHJhc2hcclxuICAgICdTb2htQWxIbSBQYWxzeW55eGlzJzogJzExNjEnLCAvLyBDb25hbCBBb0UsIE92ZXJncm93biBEaWZmbHVnaWEgdHJhc2hcclxuICAgICdTb2htQWxIbSBTdXJmYWNlIEJyZWFjaCc6ICcxRTgwJywgLy8gQ2lyY2xlIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEZyZXNod2F0ZXIgQ2Fubm9uJzogJzExOUYnLCAvLyBMaW5lIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFRhaWwgU21hc2gnOiAnMUMzNScsIC8vIFVudGVsZWdyYXBoZWQgcmVhciBjb25hbCBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gVGFpbCBTd2luZyc6ICcxQzM2JywgLy8gVW50ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFJpcHBlciBDbGF3JzogJzFDMzcnLCAvLyBVbnRlbGVncmFwaGVkIGZyb250YWwgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFdpbmQgU2xhc2gnOiAnMUMzOCcsIC8vIENpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gV2lsZCBDaGFyZ2UnOiAnMUMzOScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEhvdCBDaGFyZ2UnOiAnMUMzQScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEZpcmViYWxsJzogJzFDM0InLCAvLyBVbnRlbGVncmFwaGVkIHRhcmdldGVkIGNpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gTGF2YSBGbG93JzogJzFDM0MnLCAvLyBVbnRlbGVncmFwaGVkIGNvbmFsIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBXaWxkIEhvcm4nOiAnMTUwNycsIC8vIENvbmFsIEFvRSwgQWJhbGF0aGlhbiBDbGF5IEdvbGVtIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTGF2YSBCcmVhdGgnOiAnMUM0RCcsIC8vIENvbmFsIEFvRSwgTGF2YSBDcmFiIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUmluZyBvZiBGaXJlJzogJzFDNEMnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBWb2xjYW5vIEFuYWxhIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMSc6ICcxQzQzJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMic6ICcxQzQ0JywgLy8gMjcwLWRlZ3JlZSByZWFyIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMyc6ICcxQzQyJywgLy8gUmluZyBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIFJlYWxtIFNoYWtlcic6ICcxQzQxJywgLy8gQ2lyY2xlIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXYXJucyBpZiBwbGF5ZXJzIHN0ZXAgaW50byB0aGUgbGF2YSBwdWRkbGVzLiBUaGVyZSBpcyB1bmZvcnR1bmF0ZWx5IG5vIGRpcmVjdCBkYW1hZ2UgZXZlbnQuXHJcbiAgICAgIGlkOiAnU29obUFsSG0gQnVybnMnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTFDJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxPb3BzeURhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFsZXhhbmRlclRoZUN1ZmZPZlRoZVNvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTWluZWZpZWxkJzogJzE3MEQnLCAvLyBDaXJjbGUgQW9FLCBtaW5lcy5cclxuICAgICdNaW5lJzogJzE3MEUnLCAvLyBNaW5lIGV4cGxvc2lvbi5cclxuICAgICdTdXBlcmNoYXJnZSc6ICcxNzEzJywgLy8gTWlyYWdlIGNoYXJnZS5cclxuICAgICdIZWlnaHQgRXJyb3InOiAnMTcxRCcsIC8vIEluY29ycmVjdCBwYW5lbCBmb3IgSGVpZ2h0LlxyXG4gICAgJ0VhcnRoIE1pc3NpbGUnOiAnMTcyNicsIC8vIENpcmNsZSBBb0UsIGZpcmUgcHVkZGxlcy5cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdVbHRyYSBGbGFzaCc6ICcxNzIyJywgLy8gUm9vbS13aWRlIGRlYXRoIEFvRSwgaWYgbm90IExvUydkLlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnSWNlIE1pc3NpbGUnOiAnMTcyNycsIC8vIEljZSBoZWFkbWFya2VyIEFvRSBjaXJjbGVzLlxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnU2luZ2xlIEJ1c3Rlcic6ICcxNzE3JywgLy8gU2luZ2xlIGxhc2VyIEF0dGFjaG1lbnQuIE5vbi10YW5rcyBhcmUgKnByb2JhYmx5KiBkZWFkLlxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgICdEb3VibGUgQnVzdGVyJzogJzE3MTgnLCAvLyBUd2luIGxhc2VyIEF0dGFjaG1lbnQuXHJcbiAgICAnRW51bWVyYXRpb24nOiAnMTcxRScsIC8vIEVudW1lcmF0aW9uIGNpcmNsZS5cclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgYXNzYXVsdD86IHN0cmluZ1tdO1xyXG59XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQWxleGFuZGVyVGhlU291bE9mVGhlQ3JlYXRvcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQTEyTiBTYWNyYW1lbnQnOiAnMUFFNicsIC8vIENyb3NzIExhc2Vyc1xyXG4gICAgJ0ExMk4gR3Jhdml0YXRpb25hbCBBbm9tYWx5JzogJzFBRUInLCAvLyBHcmF2aXR5IFB1ZGRsZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0ExMk4gRGl2aW5lIFNwZWFyJzogJzFBRTMnLCAvLyBJbnN0YW50IGNvbmFsIHRhbmsgY2xlYXZlXHJcbiAgICAnQTEyTiBCbGF6aW5nIFNjb3VyZ2UnOiAnMUFFOScsIC8vIE9yYW5nZSBoZWFkIG1hcmtlciBzcGxhc2ggZGFtYWdlXHJcbiAgICAnQTEyTiBQbGFpbnQgT2YgU2V2ZXJpdHknOiAnMUFGMScsIC8vIEFnZ3JhdmF0ZWQgQXNzYXVsdCBzcGxhc2ggZGFtYWdlXHJcbiAgICAnQTEyTiBDb21tdW5pb24nOiAnMUFGQycsIC8vIFRldGhlciBQdWRkbGVzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0ExMk4gQXNzYXVsdCBDb2xsZWN0JyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2MScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmFzc2F1bHQgPz89IFtdO1xyXG4gICAgICAgIGRhdGEuYXNzYXVsdC5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEl0IGlzIGEgZmFpbHVyZSBmb3IgYSBTZXZlcml0eSBtYXJrZXIgdG8gc3RhY2sgd2l0aCB0aGUgU29saWRhcml0eSBncm91cC5cclxuICAgICAgaWQ6ICdBMTJOIEFzc2F1bHQgRmFpbHVyZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzFBRjInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuYXNzYXVsdD8uaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0RpZG5cXCd0IFNwcmVhZCEnLFxyXG4gICAgICAgICAgICBkZTogJ05pY2h0IHZlcnRlaWx0IScsXHJcbiAgICAgICAgICAgIGZyOiAnTmUgc1xcJ2VzdCBwYXMgZGlzcGVyc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+aVo+mWi+OBl+OBquOBi+OBo+OBnyEnLFxyXG4gICAgICAgICAgICBjbjogJ+ayoeacieaVo+W8gCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdBMTJOIEFzc2F1bHQgQ2xlYW51cCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NjEnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDIwLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDUsXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkZWxldGUgZGF0YS5hc3NhdWx0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQWxhTWhpZ28sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FsYSBNaGlnbyBNYWdpdGVrIFJheSc6ICcyNENFJywgLy8gTGluZSBBb0UsIExlZ2lvbiBQcmVkYXRvciB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBMb2NrIE9uJzogJzIwNDcnLCAvLyBIb21pbmcgY2lyY2xlcywgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIFRhaWwgTGFzZXIgMSc6ICcyMDQ5JywgLy8gRnJvbnRhbCBsaW5lIEFvRSwgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIFRhaWwgTGFzZXIgMic6ICcyMDRCJywgLy8gUmVhciBsaW5lIEFvRSwgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIFRhaWwgTGFzZXIgMyc6ICcyMDRDJywgLy8gUmVhciBsaW5lIEFvRSwgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIFNob3VsZGVyIENhbm5vbic6ICcyNEQwJywgLy8gQ2lyY2xlIEFvRSwgTGVnaW9uIEF2ZW5nZXIgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gQ2Fubm9uZmlyZSc6ICcyM0VEJywgLy8gRW52aXJvbm1lbnRhbCBjaXJjbGUgQW9FLCBwYXRoIHRvIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICcyMDVBJywgLy8gQ2lyY2xlIEFvRSwgYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIEludGVncmF0ZWQgQWV0aGVyb21vZHVsYXRvcic6ICcyMDVCJywgLy8gUmluZyBBb0UsIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBDaXJjbGUgT2YgRGVhdGgnOiAnMjRENCcsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBIZXhhZHJvbmUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gRXhoYXVzdCc6ICcyNEQzJywgLy8gTGluZSBBb0UsIExlZ2lvbiBDb2xvc3N1cyB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBHcmFuZCBTd29yZCc6ICcyNEQyJywgLy8gQ29uYWwgQW9FLCBMZWdpb24gQ29sb3NzdXMgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTdG9ybSAxJzogJzIwNjYnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgcHJlLWludGVybWlzc2lvbiwgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3Rvcm0gMic6ICcyNTg3JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIGludGVybWlzc2lvbiwgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIFZlaW4gU3BsaXR0ZXIgMSc6ICcyNEI2JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIHByaW1hcnkgZW50aXR5LCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gVmVpbiBTcGxpdHRlciAyJzogJzIwNkMnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgaGVscGVyIGVudGl0eSwgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIExpZ2h0bGVzcyBTcGFyayc6ICcyMDZCJywgLy8gQ29uYWwgQW9FLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0FsYSBNaGlnbyBEZW1pbWFnaWNrcyc6ICcyMDVFJyxcclxuICAgICdBbGEgTWhpZ28gVW5tb3ZpbmcgVHJvaWthJzogJzIwNjAnLFxyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN3b3JkIDEnOiAnMjA2OScsXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dvcmQgMic6ICcyNTg5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEl0J3MgcG9zc2libGUgcGxheWVycyBtaWdodCBqdXN0IHdhbmRlciBpbnRvIHRoZSBiYWQgb24gdGhlIG91dHNpZGUsXHJcbiAgICAgIC8vIGJ1dCBub3JtYWxseSBwZW9wbGUgZ2V0IHB1c2hlZCBpbnRvIGl0LlxyXG4gICAgICBpZDogJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN3ZWxsJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gRGFtYWdlIERvd25cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzJCOCcgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlciwgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIEZvciByZWFzb25zIG5vdCBjb21wbGV0ZWx5IHVuZGVyc3Rvb2QgYXQgdGhlIHRpbWUgdGhpcyB3YXMgbWVyZ2VkLFxyXG4vLyBidXQgbGlrZWx5IHJlbGF0ZWQgdG8gdGhlIGZhY3QgdGhhdCBubyBuYW1lcGxhdGVzIGFyZSB2aXNpYmxlIGR1cmluZyB0aGUgZW5jb3VudGVyLFxyXG4vLyBhbmQgdGhhdCBub3RoaW5nIGluIHRoZSBlbmNvdW50ZXIgYWN0dWFsbHkgZG9lcyBkYW1hZ2UsXHJcbi8vIHdlIGNhbid0IHVzZSBkYW1hZ2VXYXJuIG9yIGdhaW5zRWZmZWN0IGhlbHBlcnMgb24gdGhlIEJhcmRhbSBmaWdodC5cclxuLy8gSW5zdGVhZCwgd2UgdXNlIHRoaXMgaGVscGVyIGZ1bmN0aW9uIHRvIGxvb2sgZm9yIGZhaWx1cmUgZmxhZ3MuXHJcbi8vIElmIHRoZSBmbGFnIGlzIHByZXNlbnQsYSBmdWxsIHRyaWdnZXIgb2JqZWN0IGlzIHJldHVybmVkIHRoYXQgZHJvcHMgaW4gc2VhbWxlc3NseS5cclxuY29uc3QgYWJpbGl0eVdhcm4gPSAoYXJnczogeyBhYmlsaXR5SWQ6IHN0cmluZzsgaWQ6IHN0cmluZyB9KTogT29wc3lUcmlnZ2VyPERhdGE+ID0+IHtcclxuICBpZiAoIWFyZ3MuYWJpbGl0eUlkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBhYmlsaXR5ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgY29uc3QgdHJpZ2dlcjogT29wc3lUcmlnZ2VyPERhdGE+ID0ge1xyXG4gICAgaWQ6IGFyZ3MuaWQsXHJcbiAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBhcmdzLmFiaWxpdHlJZCB9KSxcclxuICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLmZsYWdzLnN1YnN0cigtMikgPT09ICcwRScsXHJcbiAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgfSxcclxuICB9O1xyXG4gIHJldHVybiB0cmlnZ2VyO1xyXG59O1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkJhcmRhbXNNZXR0bGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0JhcmRhbSBEaXJ0eSBDbGF3JzogJzIxQTgnLCAvLyBGcm9udGFsIGNsZWF2ZSwgR3VsbyBHdWxvIHRyYXNoXHJcbiAgICAnQmFyZGFtIEVwaWdyYXBoJzogJzIzQUYnLCAvLyBMaW5lIEFvRSwgV2FsbCBvZiBCYXJkYW0gdHJhc2hcclxuICAgICdCYXJkYW0gVGhlIER1c2sgU3Rhcic6ICcyMTg3JywgLy8gQ2lyY2xlIEFvRSwgZW52aXJvbm1lbnQgYmVmb3JlIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gVGhlIERhd24gU3Rhcic6ICcyMTg2JywgLy8gQ2lyY2xlIEFvRSwgZW52aXJvbm1lbnQgYmVmb3JlIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gQ3J1bWJsaW5nIENydXN0JzogJzFGMTMnLCAvLyBDaXJjbGUgQW9FcywgR2FydWxhLCBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIFJhbSBSdXNoJzogJzFFRkMnLCAvLyBMaW5lIEFvRXMsIFN0ZXBwZSBZYW1hYSwgZmlyc3QgYm9zcy5cclxuICAgICdCYXJkYW0gTHVsbGFieSc6ICcyNEIyJywgLy8gQ2lyY2xlIEFvRXMsIFN0ZXBwZSBTaGVlcCwgZmlyc3QgYm9zcy5cclxuICAgICdCYXJkYW0gSGVhdmUnOiAnMUVGNycsIC8vIEZyb250YWwgY2xlYXZlLCBHYXJ1bGEsIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gV2lkZSBCbGFzdGVyJzogJzI0QjMnLCAvLyBFbm9ybW91cyBmcm9udGFsIGNsZWF2ZSwgU3RlcHBlIENvZXVybCwgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBEb3VibGUgU21hc2gnOiAnMjZBJywgLy8gQ2lyY2xlIEFvRSwgTWV0dGxpbmcgRGhhcmEgdHJhc2hcclxuICAgICdCYXJkYW0gVHJhbnNvbmljIEJsYXN0JzogJzEyNjInLCAvLyBDaXJjbGUgQW9FLCBTdGVwcGUgRWFnbGUgdHJhc2hcclxuICAgICdCYXJkYW0gV2lsZCBIb3JuJzogJzIyMDgnLCAvLyBGcm9udGFsIGNsZWF2ZSwgS2h1biBHdXJ2ZWwgdHJhc2hcclxuICAgICdCYXJkYW0gSGVhdnkgU3RyaWtlIDEnOiAnMjU3OCcsIC8vIDEgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMic6ICcyNTc5JywgLy8gMiBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAzJzogJzI1N0EnLCAvLyAzIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gVHJlbWJsb3IgMSc6ICcyNTdCJywgLy8gMSBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIFRyZW1ibG9yIDInOiAnMjU3QycsIC8vIDIgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUaHJvd2luZyBTcGVhcic6ICcyNTdGJywgLy8gQ2hlY2tlcmJvYXJkIEFvRSwgVGhyb3dpbmcgU3BlYXIsIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIEJhcmRhbVxcJ3MgUmluZyc6ICcyNTgxJywgLy8gRG9udXQgQW9FIGhlYWRtYXJrZXJzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIENvbWV0JzogJzI1N0QnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBDb21ldCBJbXBhY3QnOiAnMjU4MCcsIC8vIENpcmNsZSBBb0VzLCBTdGFyIFNoYXJkLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBJcm9uIFNwaGVyZSBBdHRhY2snOiAnMTZCNicsIC8vIENvbnRhY3QgZGFtYWdlLCBJcm9uIFNwaGVyZSB0cmFzaCwgYmVmb3JlIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gVG9ybmFkbyc6ICcyNDdFJywgLy8gQ2lyY2xlIEFvRSwgS2h1biBTaGF2YXJhIHRyYXNoXHJcbiAgICAnQmFyZGFtIFBpbmlvbic6ICcxRjExJywgLy8gTGluZSBBb0UsIFlvbCBGZWF0aGVyLCB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIEZlYXRoZXIgU3F1YWxsJzogJzFGMEUnLCAvLyBEYXNoIGF0dGFjaywgWW9sLCB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIEZsdXR0ZXJmYWxsIFVudGFyZ2V0ZWQnOiAnMUYxMicsIC8vIFJvdGF0aW5nIGNpcmNsZSBBb0VzLCBZb2wsIHRoaXJkIGJvc3NcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0JhcmRhbSBDb25mdXNlZCc6ICcwQicsIC8vIEZhaWxlZCBnYXplIGF0dGFjaywgWW9sLCB0aGlyZCBib3NzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdCYXJkYW0gRmV0dGVycyc6ICc1NkYnLCAvLyBGYWlsaW5nIHR3byBtZWNoYW5pY3MgaW4gYW55IG9uZSBwaGFzZSBvbiBCYXJkYW0sIHNlY29uZCBib3NzLlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQmFyZGFtIEdhcnVsYSBSdXNoJzogJzFFRjknLCAvLyBMaW5lIEFvRSwgR2FydWxhLCBmaXJzdCBib3NzLlxyXG4gICAgJ0JhcmRhbSBGbHV0dGVyZmFsbCBUYXJnZXRlZCc6ICcxRjBDJywgLy8gQ2lyY2xlIEFvRSBoZWFkbWFya2VyLCBZb2wsIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gV2luZ2JlYXQnOiAnMUYwRicsIC8vIENvbmFsIEFvRSBoZWFkbWFya2VyLCBZb2wsIHRoaXJkIGJvc3NcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICAvLyAxIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gSGVhdnkgU3RyaWtlIDEnLCBhYmlsaXR5SWQ6ICcyNTc4JyB9KSxcclxuICAgIC8vIDIgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMicsIGFiaWxpdHlJZDogJzI1NzknIH0pLFxyXG4gICAgLy8gMyBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAzJywgYWJpbGl0eUlkOiAnMjU3QScgfSksXHJcbiAgICAvLyAxIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gVHJlbWJsb3IgMScsIGFiaWxpdHlJZDogJzI1N0InIH0pLFxyXG4gICAgLy8gMiBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIFRyZW1ibG9yIDInLCBhYmlsaXR5SWQ6ICcyNTdDJyB9KSxcclxuICAgIC8vIENoZWNrZXJib2FyZCBBb0UsIFRocm93aW5nIFNwZWFyLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBUaHJvd2luZyBTcGVhcicsIGFiaWxpdHlJZDogJzI1N0YnIH0pLFxyXG4gICAgLy8gR2F6ZSBhdHRhY2ssIFdhcnJpb3Igb2YgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBFbXB0eSBHYXplJywgYWJpbGl0eUlkOiAnMUYwNCcgfSksXHJcbiAgICAvLyBEb251dCBBb0UgaGVhZG1hcmtlcnMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW1cXCdzIFJpbmcnLCBhYmlsaXR5SWQ6ICcyNTgxJyB9KSxcclxuICAgIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIENvbWV0JywgYWJpbGl0eUlkOiAnMjU3RCcgfSksXHJcbiAgICAvLyBDaXJjbGUgQW9FcywgU3RhciBTaGFyZCwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gQ29tZXQgSW1wYWN0JywgYWJpbGl0eUlkOiAnMjU4MCcgfSksXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEcm93bmVkQ2l0eU9mU2thbGxhLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdIeWRyb2Nhbm5vbic6ICcyNjk3JywgLy8gTGluZSBBb0UsIFNhbHQgU3dhbGxvdyB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0YWduYW50IFNwcmF5JzogJzI2OTknLCAvLyBDb25hbCBBb0UsIFNrYWxsYSBOYW5rYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG5cclxuICAgICdCdWJibGUgQnVyc3QnOiAnMjYxQicsIC8vIEJ1YmJsZSBleHBsb3Npb24sIEh5ZHJvc3BoZXJlLCBib3NzIDFcclxuXHJcbiAgICAnUGxhaW4gUG91bmQnOiAnMjY5QScsIC8vIExhcmdlIGNpcmNsZSBBb0UsIERoYXJhIFNlbnRpbmVsIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQm91bGRlciBUb3NzJzogJzI2OUInLCAvLyBTbWFsbCBjaXJjbGUgQW9FLCBTdG9uZSBQaG9lYmFkIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnTGFuZHNsaXAnOiAnMjY5QycsIC8vIENvbmFsIEFvRSwgU3RvbmUgUGhvZWJhZCB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG5cclxuICAgICdNeXN0aWMgTGlnaHQnOiAnMjY1NycsIC8vIENvbmFsIEFvRSwgVGhlIE9sZCBPbmUsIGJvc3MgMlxyXG4gICAgJ015c3RpYyBGbGFtZSc6ICcyNjU5JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgVGhlIE9sZCBPbmUsIGJvc3MgMi4gMjY1OCBpcyB0aGUgY2FzdC10aW1lIGFiaWxpdHkuXHJcblxyXG4gICAgJ0RhcmsgSUknOiAnMTEwRScsIC8vIFRoaW4gY29uZSBBb0UsIExpZ2h0bGVzcyBIb211bmN1bHVzIHRyYXNoLCBhZnRlciBib3NzIDJcclxuICAgICdJbXBsb3NpdmUgQ3Vyc2UnOiAnMjY5RScsIC8vIENvbmFsIEFvRSwgWmFuZ2JldG8gdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ1VuZHlpbmcgRklyZSc6ICcyNjlGJywgLy8gQ2lyY2xlIEFvRSwgWmFuZ2JldG8gdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ0ZpcmUgSUknOiAnMjZBMCcsIC8vIENpcmNsZSBBb0UsIEFjY3Vyc2VkIElkb2wgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG5cclxuICAgICdSdXN0aW5nIENsYXcnOiAnMjY2MScsIC8vIEZyb250YWwgY2xlYXZlLCBIcm9kcmljIFBvaXNvbnRvbmd1ZSwgYm9zcyAzXHJcbiAgICAnV29yZHMgT2YgV29lJzogJzI2NjInLCAvLyBFeWUgbGFzZXJzLCBIcm9kcmljIFBvaXNvbnRvbmd1ZSwgYm9zcyAzXHJcbiAgICAnVGFpbCBEcml2ZSc6ICcyNjYzJywgLy8gUmVhciBjbGVhdmUsIEhyb2RyaWMgUG9pc29udG9uZ3VlLCBib3NzIDNcclxuICAgICdSaW5nIE9mIENoYW9zJzogJzI2NjcnLCAvLyBSaW5nIGhlYWRtYXJrZXIsIEhyb2RyaWMgUG9pc29udG9uZ3VlLCBib3NzIDNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdTZWxmLURldG9uYXRlJzogJzI2NUMnLCAvLyBSb29td2lkZSBleHBsb3Npb24sIFN1YnNlcnZpZW50LCBib3NzIDJcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0Ryb3BzeSc6ICcxMUInLCAvLyBTdGFuZGluZyBpbiBCbG9vZHkgUHVkZGxlcywgb3IgYmVpbmcga25vY2tlZCBvdXRzaWRlIHRoZSBhcmVuYSwgYm9zcyAxXHJcbiAgICAnQ29uZnVzZWQnOiAnMEInLCAvLyBGYWlsaW5nIHRoZSBnYXplIGF0dGFjaywgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdCbG9vZHkgUHVkZGxlJzogJzI2NTUnLCAvLyBMYXJnZSB3YXRlcnkgc3ByZWFkIGNpcmNsZXMsIEtlbHBpZSwgYm9zcyAxXHJcbiAgICAnQ3Jvc3MgT2YgQ2hhb3MnOiAnMjY2OCcsIC8vIENyb3NzIGhlYWRtYXJrZXIsIEhyb2RyaWMgUG9pc29udG9uZ3VlLCBib3NzIDNcclxuICAgICdDaXJjbGUgT2YgQ2hhb3MnOiAnMjY2OScsIC8vIFNwcmVhZCBjaXJjbGUgaGVhZG1hcmtlciwgSHJvZHJpYyBQb2lzb250b25ndWUsIGJvc3MgM1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5LdWdhbmVDYXN0bGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgVGVua2EgR29ra2VuJzogJzIzMjknLCAvLyBGcm9udGFsIGNvbmUgQW9FLCAgSm9pIEJsYWRlIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnS3VnYW5lIENhc3RsZSBLZW5raSBSZWxlYXNlIFRyYXNoJzogJzIzMzAnLCAvLyBDaGFyaW90IEFvRSwgSm9pIEtpeW9mdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQ2xlYXJvdXQnOiAnMUU5MicsIC8vIEZyb250YWwgY29uZSBBb0UsIFp1aWtvLU1hcnUsIGJvc3MgMVxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSGFyYS1LaXJpIDEnOiAnMUU5NicsIC8vIEdpYW50IGNpcmNsZSBBb0UsIEhhcmFraXJpIEtvc2hvLCBib3NzIDFcclxuICAgICdLdWdhbmUgQ2FzdGxlIEhhcmEtS2lyaSAyJzogJzI0RjknLCAvLyBHaWFudCBjaXJjbGUgQW9FLCBIYXJha2lyaSBLb3NobywgYm9zcyAxXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAxJzogJzIzMkQnLCAvLyBMaW5lIEFvRSwgS2FyYWt1cmkgT25taXRzdSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgMTAwMCBCYXJicyc6ICcyMTk4JywgLy8gTGluZSBBb0UsIEpvaSBLb2phIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAyJzogJzFFOTgnLCAvLyBMaW5lIEFvRSwgRG9qdW4gTWFydSwgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBUYXRhbWktR2Flc2hpJzogJzFFOUQnLCAvLyBGbG9vciB0aWxlIGxpbmUgYXR0YWNrLCBFbGtpdGUgT25taXRzdSwgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBKdWppIFNodXJpa2VuIDMnOiAnMUVBMCcsIC8vIExpbmUgQW9FLCBFbGl0ZSBPbm1pdHN1LCBib3NzIDJcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBBdXRvIENyb3NzYm93JzogJzIzMzMnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBLYXJha3VyaSBIYW55YSB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBIYXJha2lyaSAzJzogJzIzQzknLCAvLyBHaWFudCBDaXJjbGUgQW9FLCBIYXJha2lyaSAgSGFueWEgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIElhaS1HaXJpJzogJzFFQTInLCAvLyBDaGFyaW90IEFvRSwgWW9qaW1ibywgYm9zcyAzXHJcbiAgICAnS3VnYW5lIENhc3RsZSBGcmFnaWxpdHknOiAnMUVBQScsIC8vIENoYXJpb3QgQW9FLCBJbm9zaGlrYWNobywgYm9zcyAzXHJcbiAgICAnS3VnYW5lIENhc3RsZSBEcmFnb25maXJlJzogJzFFQUInLCAvLyBMaW5lIEFvRSwgRHJhZ29uIEhlYWQsIGJvc3MgM1xyXG4gIH0sXHJcblxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSXNzZW4nOiAnMUU5NycsIC8vIEluc3RhbnQgZnJvbnRhbCBjbGVhdmUsIERvanVuIE1hcnUsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQ2xvY2t3b3JrIFJhaXRvbic6ICcxRTlCJywgLy8gTGFyZ2UgbGlnaHRuaW5nIHNwcmVhZCBjaXJjbGVzLCBEb2p1biBNYXJ1LCBib3NzIDJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YWNrIG1hcmtlciwgWnVpa28gTWFydSwgYm9zcyAxXHJcbiAgICAgIGlkOiAnS3VnYW5lIENhc3RsZSBIZWxtIENyYWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxRTk0JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMudHlwZSA9PT0gJzIxJywgLy8gVGFraW5nIHRoZSBzdGFjayBzb2xvIGlzICpwcm9iYWJseSogYSBtaXN0YWtlLlxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxvbmUpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsbGVpbilgLFxyXG4gICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoc2V1bChlKSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5LiA5Lq6KWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjljZXlkIMpYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKO2YvOyekCDrp57snYwpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVTaXJlbnNvbmdTZWEsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NpcmVuc29uZyBBbmNpZW50IFltaXIgSGVhZCBTbmF0Y2gnOiAnMjM1MycsIC8vIGZyb250YWwgY29uYWxcclxuICAgICdTaXJlbnNvbmcgUmVmbGVjdGlvbiBvZiBLYXJsYWJvcyBUYWlsIFNjcmV3JzogJzEyQjcnLCAvLyB0YXJnZXRlZCBjaXJjbGVcclxuICAgICdTaXJlbnNvbmcgTHVnYXQgQW1vcnBob3VzIEFwcGxhdXNlJzogJzFGNTYnLCAvLyBmcm9udGFsIDE4MCBjbGVhdmVcclxuICAgICdTaXJlbnNvbmcgTHVnYXQgQ29uY3Vzc2l2ZSBPc2NpbGxhdGlvbic6ICcxRjVCJywgLy8gNSBvciA3IGNpcmNsZXNcclxuICAgICdTaXJlbnNvbmcgVGhlIEphbmUgR3V5IEJhbGwgb2YgTWFsaWNlJzogJzFGNkEnLCAvLyBhbWJpZW50IGNhbm5vbiBjaXJjbGVcclxuICAgICdTaXJlbnNvbmcgRGFyayc6ICcxOURGJywgLy8gU2tpbmxlc3MgU2tpcHBlciAvIEZsZXNobGVzcyBDYXB0aXZlIHRhcmdldGVkIGNpcmNsZVxyXG4gICAgJ1NpcmVuc29uZyBUaGUgR292ZXJub3IgU2hhZG93c3RyaWtlJzogJzFGNUQnLCAvLyBzdGFuZGluZyBpbiBzaGFkb3dzXHJcbiAgICAnU2lyZW5zb25nIFVuZGVhZCBXYXJkZW4gTWFyY2ggb2YgdGhlIERlYWQnOiAnMjM1MScsIC8vIGZyb250YWwgY29uYWxcclxuICAgICdTaXJlbnNvbmcgRmxlc2hsZXNzIENhcHRpdmUgRmxvb2QnOiAnMjE4QicsIC8vIGNlbnRlcmVkIGNpcmNsZSBhZnRlciBzZWR1Y3RpdmUgc2NyZWFtXHJcbiAgICAnU2lyZW5zb25nIExvcmVsZWkgVm9pZCBXYXRlciBJSUknOiAnMUY2OCcsIC8vIGxhcmdlIHRhcmdldGVkIGNpcmNsZVxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuU2FpbnRNb2NpYW5uZXNBcmJvcmV0dW1IYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE11ZHN0cmVhbSc6ICczMEQ5JywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgSW1tYWN1bGF0ZSBBcGEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFNpbGtlbiBTcHJheSc6ICczMzg1JywgLy8gUmVhciBjb25lIEFvRSwgV2l0aGVyZWQgQmVsbGFkb25uYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgTXVkZHkgUHVkZGxlcyc6ICczMERBJywgLy8gU21hbGwgdGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIERvcnBva2t1ciB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgT2Rpb3VzIEFpcic6ICcyRTQ5JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTTHVkZ2UgQm9tYic6ICcyRTRFJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgT2Rpb3VzIEF0bW9zcGhlcmUnOiAnMkU1MScsIC8vIENoYW5uZWxlZCAzLzQgYXJlbmEgY2xlYXZlLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIENyZWVwaW5nIEl2eSc6ICczMUE1JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgV2l0aGVyZWQgS3VsYWsgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFJvY2tzbGlkZSc6ICczMTM0JywgLy8gTGluZSBBb0UsIFNpbHQgR29sZW0sIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGhxdWFrZSBJbm5lcic6ICczMTJFJywgLy8gQ2hhcmlvdCBBb0UsIExha2hhbXUsIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGhxdWFrZSBPdXRlcic6ICczMTJGJywgLy8gRHluYW1vIEFvRSwgTGFraGFtdSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBFbWJhbG1pbmcgRWFydGgnOiAnMzFBNicsIC8vIExhcmdlIENoYXJpb3QgQW9FLCBNdWRkeSBNYXRhLCBhZnRlciBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFF1aWNrbWlyZSc6ICczMTM2JywgLy8gU2V3YWdlIHN1cmdlIGF2b2lkZWQgb24gcGxhdGZvcm1zLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUXVhZ21pcmUgUGxhdGZvcm1zJzogJzMxMzknLCAvLyBRdWFnbWlyZSBleHBsb3Npb24gb24gcGxhdGZvcm1zLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRmVjdWxlbnQgRmxvb2QnOiAnMzEzQycsIC8vIFRhcmdldGVkIHRoaW4gY29uZSBBb0UsIFRva2thcGNoaSwgYm9zcyAzXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBDb3JydXB0dXJlJzogJzMzQTAnLCAvLyBNdWQgU2xpbWUgZXhwbG9zaW9uLCBib3NzIDMuIChObyBleHBsb3Npb24gaWYgZG9uZSBjb3JyZWN0bHkuKVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTZWR1Y2VkJzogJzNERicsIC8vIEdhemUgZmFpbHVyZSwgV2l0aGVyZWQgQmVsbGFkb25uYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUG9sbGVuJzogJzEzJywgLy8gU2x1ZGdlIHB1ZGRsZXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgVHJhbnNmaWd1cmF0aW9uJzogJzY0OCcsIC8vIFJvbHktUG9seSBBb0UgY2lyY2xlIGZhaWx1cmUsIEJMb29taW5nIEJpbG9rbyB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgSHlzdGVyaWEnOiAnMTI4JywgLy8gR2F6ZSBmYWlsdXJlLCBMYWtoYW11LCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFN0YWIgV291bmQnOiAnNDVEJywgLy8gQXJlbmEgb3V0ZXIgd2FsbCBlZmZlY3QsIGJvc3MgMlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBUYXByb290JzogJzJFNEMnLCAvLyBMYXJnZSBvcmFuZ2Ugc3ByZWFkIGNpcmNsZXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGggU2hha2VyJzogJzMxMzEnLCAvLyBFYXJ0aCBTaGFrZXIsIExha2hhbXUsIGJvc3MgMlxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEZhdWx0IFdhcnJlbic6ICcyRTRBJywgLy8gU3RhY2sgbWFya2VyLCBOdWxsY2h1LCBib3NzIDFcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlU3dhbGxvd3NDb21wYXNzLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEl2eSBGZXR0ZXJzJzogJzJDMDQnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRSwgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgV2lsZHN3aW5kIDEnOiAnMkMwNScsIC8vIFRvcm5hZG8gZ3JvdW5kIEFvRSwgcGxhY2VkIGJ5IFNhaSBUYWlzdWkgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBZYW1hLUthZ3VyYSc6ICcyQjk2JywgLy8gRnJvbnRhbCBsaW5lIEFvRSwgT3Rlbmd1LCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEZsYW1lcyBPZiBIYXRlJzogJzJCOTgnLCAvLyBGaXJlIG9yYiBleHBsb3Npb25zLCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIENvbmZsYWdyYXRlJzogJzJCOTknLCAvLyBDb2xsaXNpb24gd2l0aCBmaXJlIG9yYiwgYm9zcyAxXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVXB3ZWxsJzogJzJDMDYnLCAvLyBUYXJnZXRlZCBjaXJjbGUgZ3JvdW5kIEFvRSwgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQmFkIEJyZWF0aCc6ICcyQzA3JywgLy8gRnJvbnRhbCBjbGVhdmUsIEppbm1lbmp1IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgR3JlYXRlciBQYWxtIDEnOiAnMkI5RCcsIC8vIEhhbGYgYXJlbmEgcmlnaHQgY2xlYXZlLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEdyZWF0ZXIgUGFsbSAyJzogJzJCOUUnLCAvLyBIYWxmIGFyZW5hIGxlZnQgY2xlYXZlLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFRyaWJ1dGFyeSc6ICcyQkEwJywgLy8gVGFyZ2V0ZWQgdGhpbiBjb25hbCBncm91bmQgQW9FcywgRGFpZGFyYWJvdGNoaSwgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgV2lsZHN3aW5kIDInOiAnMkMwNicsIC8vIENpcmNsZSBncm91bmQgQW9FLCBlbnZpcm9ubWVudCwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMyc6ICcyQzA3JywgLy8gQ2lyY2xlIGdyb3VuZCBBb0UsIHBsYWNlZCBieSBTYWkgVGFpc3VpIHRyYXNoLCBhZnRlciBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEZpbG9wbHVtZXMnOiAnMkM3NicsIC8vIEZyb250YWwgcmVjdGFuZ2xlIEFvRSwgRHJhZ29uIEJpIEZhbmcgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyAxJzogJzJCQTgnLCAvLyBDaGFyaW90IEFvRSwgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDInOiAnMkJBOScsIC8vIER5bmFtbyBBb0UsIFFpdGlhbiBEYXNoZW5nLCBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyAzJzogJzJCQUUnLCAvLyBDaGFyaW90IEFvRSwgU2hhZG93IE9mIFRoZSBTYWdlLCBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyA0JzogJzJCQUYnLCAvLyBEeW5hbW8gQW9FLCBTaGFkb3cgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRXF1YWwgT2YgSGVhdmVuJzogJzJCQjQnLCAvLyBTbWFsbCBjaXJjbGUgZ3JvdW5kIEFvRXMsIFFpdGlhbiBEYXNoZW5nLCBib3NzIDNcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgSHlzdGVyaWEnOiAnMTI4JywgLy8gR2F6ZSBhdHRhY2sgZmFpbHVyZSwgT3Rlbmd1LCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJsZWVkaW5nJzogJzExMkYnLCAvLyBTdGVwcGluZyBvdXRzaWRlIHRoZSBhcmVuYSwgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdTd2FsbG93cyBDb21wYXNzIE1pcmFnZSc6ICcyQkEyJywgLy8gUHJleS1jaGFzaW5nIHB1ZGRsZXMsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgTW91bnRhaW4gRmFsbHMnOiAnMkJBNScsIC8vIENpcmNsZSBzcHJlYWQgbWFya2VycywgRGFpZGFyYWJvdGNoaSwgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBUaGUgTG9uZyBFbmQnOiAnMkJBNycsIC8vIExhc2VyIHRldGhlciwgUWl0aWFuIERhc2hlbmcgIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVGhlIExvbmcgRW5kIDInOiAnMkJBRCcsIC8vIExhc2VyIFRldGhlciwgU2hhZG93cyBPZiBUaGUgU2FnZSwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBTdGFuZGluZyBpbiB0aGUgbGFrZSwgRGlhZGFyYWJvdGNoaSwgYm9zcyAyXHJcbiAgICAgIGlkOiAnU3dhbGxvd3MgQ29tcGFzcyBTaXggRnVsbXMgVW5kZXInLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMjM3JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBTdGFjayBtYXJrZXIsIGJvc3MgM1xyXG4gICAgICBpZDogJ1N3YWxsb3dzIENvbXBhc3MgRml2ZSBGaW5nZXJlZCBQdW5pc2htZW50JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnMkJBQicsICcyQkIwJ10sIHNvdXJjZTogWydRaXRpYW4gRGFzaGVuZycsICdTaGFkb3cgT2YgVGhlIFNhZ2UnXSB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMudHlwZSA9PT0gJzIxJywgLy8gVGFraW5nIHRoZSBzdGFjayBzb2xvIGlzICpwcm9iYWJseSogYSBtaXN0YWtlLlxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxvbmUpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsbGVpbilgLFxyXG4gICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoc2V1bChlKSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5LiA5Lq6KWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjljZXlkIMpYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKO2YvOyekCDrp57snYwpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVUZW1wbGVPZlRoZUZpc3QsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RlbXBsZSBGaXJlIEJyZWFrJzogJzIxRUQnLCAvLyBDb25hbCBBb0UsIEJsb29kZ2xpZGVyIE1vbmsgdHJhc2hcclxuICAgICdUZW1wbGUgUmFkaWFsIEJsYXN0ZXInOiAnMUZEMycsIC8vIENpcmNsZSBBb0UsIGJvc3MgMVxyXG4gICAgJ1RlbXBsZSBXaWRlIEJsYXN0ZXInOiAnMUZENCcsIC8vIENvbmFsIEFvRSwgYm9zcyAxXHJcbiAgICAnVGVtcGxlIENyaXBwbGluZyBCbG93JzogJzIwMTYnLCAvLyBMaW5lIEFvRXMsIGVudmlyb25tZW50YWwsIGJlZm9yZSBib3NzIDJcclxuICAgICdUZW1wbGUgQnJva2VuIEVhcnRoJzogJzIzNkUnLCAvLyBDaXJjbGUgQW9FLCBTaW5naGEgdHJhc2hcclxuICAgICdUZW1wbGUgU2hlYXInOiAnMUZERCcsIC8vIER1YWwgY29uYWwgQW9FLCBib3NzIDJcclxuICAgICdUZW1wbGUgQ291bnRlciBQYXJyeSc6ICcxRkUwJywgLy8gUmV0YWxpYXRpb24gZm9yIGluY29ycmVjdCBkaXJlY3Rpb24gYWZ0ZXIgS2lsbGVyIEluc3RpbmN0LCBib3NzIDJcclxuICAgICdUZW1wbGUgVGFwYXMnOiAnJywgLy8gVHJhY2tpbmcgY2lyY3VsYXIgZ3JvdW5kIEFvRXMsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBIZWxsc2VhbCc6ICcyMDBGJywgLy8gUmVkL0JsdWUgc3ltYm9sIGZhaWx1cmUsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBQdXJlIFdpbGwnOiAnMjAxNycsIC8vIENpcmNsZSBBb0UsIFNwaXJpdCBGbGFtZSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBNZWdhYmxhc3Rlcic6ICcxNjMnLCAvLyBDb25hbCBBb0UsIENvZXVybCBQcmFuYSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBXaW5kYnVybic6ICcxRkU4JywgLy8gQ2lyY2xlIEFvRSwgVHdpc3RlciB3aW5kLCBib3NzIDNcclxuICAgICdUZW1wbGUgSHVycmljYW5lIEtpY2snOiAnMUZFNScsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBTaWxlbnQgUm9hcic6ICcxRkVCJywgLy8gRnJvbnRhbCBsaW5lIEFvRSwgYm9zcyAzXHJcbiAgICAnVGVtcGxlIE1pZ2h0eSBCbG93JzogJzFGRUEnLCAvLyBDb250YWN0IHdpdGggY29ldXJsIGhlYWQsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGVtcGxlIEhlYXQgTGlnaHRuaW5nJzogJzFGRDcnLCAvLyBQdXJwbGUgc3ByZWFkIGNpcmNsZXMsIGJvc3MgMVxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQnVybixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gRmFsbGluZyBSb2NrJzogJzMxQTMnLCAvLyBFbnZpcm9ubWVudGFsIGxpbmUgQW9FXHJcbiAgICAnVGhlIEJ1cm4gQWV0aGVyaWFsIEJsYXN0JzogJzMyOEInLCAvLyBMaW5lIEFvRSwgS3VrdWxrYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBNb2xlLWEtd2hhY2snOiAnMzI4RCcsIC8vIENpcmNsZSBBb0UsIERlc2VydCBEZXNtYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBIZWFkIEJ1dHQnOiAnMzI4RScsIC8vIFNtYWxsIGNvbmFsIEFvRSwgRGVzZXJ0IERlc21hbiB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFNoYXJkZmFsbCc6ICczMTkxJywgLy8gUm9vbXdpZGUgQW9FLCBMb1MgZm9yIHNhZmV0eSwgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gRGlzc29uYW5jZSc6ICczMTkyJywgLy8gRG9udXQgQW9FLCBIZWRldGV0LCBib3NzIDFcclxuICAgICdUaGUgQnVybiBDcnlzdGFsbGluZSBGcmFjdHVyZSc6ICczMTk3JywgLy8gQ2lyY2xlIEFvRSwgRGltIENyeXN0YWwsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFJlc29uYW50IEZyZXF1ZW5jeSc6ICczMTk4JywgLy8gQ2lyY2xlIEFvRSwgRGltIENyeXN0YWwsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFJvdG9zd2lwZSc6ICczMjkxJywgLy8gRnJvbnRhbCBjb25lIEFvRSwgQ2hhcnJlZCBEcmVhZG5hdWdodCB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFdyZWNraW5nIEJhbGwnOiAnMzI5MicsIC8vIENpcmNsZSBBb0UsIENoYXJyZWQgRHJlYWRuYXVnaHQgdHJhc2hcclxuICAgICdUaGUgQnVybiBTaGF0dGVyJzogJzMyOTQnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBDaGFycmVkIERvYmx5biB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIEF1dG8tQ2Fubm9ucyc6ICczMjk1JywgLy8gTGluZSBBb0UsIENoYXJyZWQgRHJvbmUgdHJhc2hcclxuICAgICdUaGUgQnVybiBTZWxmLURldG9uYXRlJzogJzMyOTYnLCAvLyBDaXJjbGUgQW9FLCBDaGFycmVkIERyb25lIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gRnVsbCBUaHJvdHRsZSc6ICcyRDc1JywgLy8gTGluZSBBb0UsIERlZmVjdGl2ZSBEcm9uZSwgYm9zcyAyXHJcbiAgICAnVGhlIEJ1cm4gVGhyb3R0bGUnOiAnMkQ3NicsIC8vIExpbmUgQW9FLCBNaW5pbmcgRHJvbmUgYWRkcywgYm9zcyAyXHJcbiAgICAnVGhlIEJ1cm4gQWRpdCBEcml2ZXInOiAnMkQ3OCcsIC8vIExpbmUgQW9FLCBSb2NrIEJpdGVyIGFkZHMsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIFRyZW1ibG9yJzogJzMyOTcnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBWZWlsZWQgR2lnYXdvcm0gdHJhc2hcclxuICAgICdUaGUgQnVybiBEZXNlcnQgU3BpY2UnOiAnMzI5OCcsIC8vIFRoZSBmcm9udGFsIGNsZWF2ZXMgbXVzdCBmbG93XHJcbiAgICAnVGhlIEJ1cm4gVG94aWMgU3ByYXknOiAnMzI5QScsIC8vIEZyb250YWwgY29uZSBBb0UsIEdpZ2F3b3JtIFN0YWxrZXIgdHJhc2hcclxuICAgICdUaGUgQnVybiBWZW5vbSBTcHJheSc6ICczMjlCJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgR2lnYXdvcm0gU3RhbGtlciB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFdoaXRlIERlYXRoJzogJzMxNDMnLCAvLyBSZWFjdGl2ZSBkdXJpbmcgaW52dWxuZXJhYmlsaXR5LCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRm9nIFBsdW1lIDEnOiAnMzE0NScsIC8vIFN0YXIgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRm9nIFBsdW1lIDInOiAnMzE0NicsIC8vIExpbmUgQW9FcyBhZnRlciBzdGFycywgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIENhdXRlcml6ZSc6ICczMTQ4JywgLy8gTGluZS9Td29vcCBBb0UsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaGUgQnVybiBDb2xkIEZvZyc6ICczMTQyJywgLy8gR3Jvd2luZyBjaXJjbGUgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdUaGUgQnVybiBMZWFkZW4nOiAnNDMnLCAvLyBQdWRkbGUgZWZmZWN0LCBib3NzIDIuIChBbHNvIGluZmxpY3RzIDExRiwgU2x1ZGdlLilcclxuICAgICdUaGUgQnVybiBQdWRkbGUgRnJvc3RiaXRlJzogJzExRCcsIC8vIEljZSBwdWRkbGUgZWZmZWN0LCBib3NzIDMuIChOT1QgdGhlIGNvbmFsLWluZmxpY3RlZCBvbmUsIDEwQy4pXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaGUgQnVybiBIYWlsZmlyZSc6ICczMTk0JywgLy8gSGVhZCBtYXJrZXIgbGluZSBBb0UsIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFNoYXJkc3RyaWtlJzogJzMxOTUnLCAvLyBPcmFuZ2Ugc3ByZWFkIGhlYWQgbWFya2VycywgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gQ2hpbGxpbmcgQXNwaXJhdGlvbic6ICczMTREJywgLy8gSGVhZCBtYXJrZXIgY2xlYXZlLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRnJvc3QgQnJlYXRoJzogJzMxNEMnLCAvLyBUYW5rIGNsZWF2ZSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBPMU4gLSBEZWx0YXNjYXBlIDEuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWMTAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08xTiBCdXJuJzogJzIzRDUnLCAvLyBGaXJlYmFsbCBleHBsb3Npb24gY2lyY2xlIEFvRXNcclxuICAgICdPMU4gQ2xhbXAnOiAnMjNFMicsIC8vIEZyb250YWwgcmVjdGFuZ2xlIGtub2NrYmFjayBBb0UsIEFsdGUgUm9pdGVcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08xTiBMZXZpbmJvbHQnOiAnMjNEQScsIC8vIHNtYWxsIHNwcmVhZCBjaXJjbGVzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIE8xUyAtIERlbHRhc2NhcGUgMS4wIFNhdmFnZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYxMFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzFTIFR1cmJ1bGVuY2UnOiAnMjU4NCcsIC8vIHN0YW5kaW5nIHVuZGVyIHRoZSBib3NzIGJlZm9yZSBkb3duYnVyc3RcclxuICAgICdPMVMgQmFsbCBPZiBGaXJlIEJ1cm4nOiAnMUVDQicsIC8vIGZpcmViYWxsIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ08xUyBDbGFtcCc6ICcxRURFJywgLy8gbGFyZ2UgZnJvbnRhbCBsaW5lIGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzFTIExldmluYm9sdCc6ICcxRUQyJywgLy8gbGlnaHRuaW5nIHNwcmVhZFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIE8yTiAtIERlbHRhc2NhcGUgMi4wIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYyMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzJOIE1haW4gUXVha2UnOiAnMjRBNScsIC8vIE5vbi10ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBGbGVzaHkgTWVtYmVyXHJcbiAgICAnTzJOIEVyb3Npb24nOiAnMjU5MCcsIC8vIFNtYWxsIGNpcmNsZSBBb0VzLCBGbGVzaHkgTWVtYmVyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMk4gUGFyYW5vcm1hbCBXYXZlJzogJzI1MEUnLCAvLyBJbnN0YW50IHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXZSBjb3VsZCB0cnkgdG8gc2VwYXJhdGUgb3V0IHRoZSBtaXN0YWtlIHRoYXQgbGVkIHRvIHRoZSBwbGF5ZXIgYmVpbmcgcGV0cmlmaWVkLlxyXG4gICAgICAvLyBIb3dldmVyLCBpdCdzIE5vcm1hbCBtb2RlLCB3aHkgb3ZlcnRoaW5rIGl0P1xyXG4gICAgICBpZDogJ08yTiBQZXRyaWZpY2F0aW9uJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIC8vIFRoZSB1c2VyIG1pZ2h0IGdldCBoaXQgYnkgYW5vdGhlciBwZXRyaWZ5aW5nIGFiaWxpdHkgYmVmb3JlIHRoZSBlZmZlY3QgZW5kcy5cclxuICAgICAgLy8gVGhlcmUncyBubyBwb2ludCBpbiBub3RpZnlpbmcgZm9yIHRoYXQuXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMTAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMk4gRWFydGhxdWFrZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI1MTUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIFRoaXMgZGVhbHMgZGFtYWdlIG9ubHkgdG8gbm9uLWZsb2F0aW5nIHRhcmdldHMuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIE8yUyAtIERlbHRhc2NhcGUgMi4wIFNhdmFnZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYyMFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzJTIFdlaWdodGVkIFdpbmcnOiAnMjNFRicsIC8vIFVuc3RhYmxlIEdyYXZpdHkgZXhwbG9zaW9ucyBvbiBwbGF5ZXJzIChhZnRlciBMb25nIERyb3ApXHJcbiAgICAnTzJTIEdyYXZpdGF0aW9uYWwgRXhwbG9zaW9uIDEnOiAnMjM2NycsIC8vIGZhaWxpbmcgRm91ciBGb2xkIFNhY3JpZmljZSA0IHBlcnNvbiBzdGFja1xyXG4gICAgJ08yUyBHcmF2aXRhdGlvbmFsIEV4cGxvc2lvbiAyJzogJzIzNjgnLCAvLyBmYWlsaW5nIEZvdXIgRm9sZCBTYWNyaWZpY2UgNCBwZXJzb24gc3RhY2tcclxuICAgICdPMlMgTWFpbiBRdWFrZSc6ICcyMzU5JywgLy8gdW50ZWxlZ3JhcGhlZCBleHBsb3Npb25zIGZyb20gZXBpY2VudGVyIHRlbnRhY2xlc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnTzJTIFN0b25lIEN1cnNlJzogJzU4OScsIC8vIGZhaWxpbmcgRGVhdGgncyBHYXplIG9yIHRha2luZyB0b28gbWFueSB0YW5rYnVzdGVyIHN0YWNrc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gZ3JvdW5kIGJsdWUgYXJlbmEgY2lyY2xlczsgKHByb2JhYmx5Pykgb25seSBkbyBkYW1hZ2UgaWYgbm90IGZsb2F0aW5nXHJcbiAgICAgIC8vIFRPRE86IHVzdWFsbHkgdGhpcyBqdXN0IGRvZXNuJ3QgaGl0IGFueWJvZHkgYXQgYWxsLCBkdWUgdG8gcGF0dGVybnMuXHJcbiAgICAgIC8vIEZsb2F0aW5nIG92ZXIgb25lIGlzIHVudGVzdGVkLlxyXG4gICAgICBpZDogJ08yUyBQZXRyb3NwaGVyZSBFeHBsb3Npb24nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDVEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gZmxvYXRpbmcgeWVsbG93IGFyZW5hIGNpcmNsZXM7IG9ubHkgZG8gZGFtYWdlIGlmIGZsb2F0aW5nXHJcbiAgICAgIGlkOiAnTzJTIFBvdGVudCBQZXRyb3NwaGVyZSBFeHBsb3Npb24nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyMzYyJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gTXVzdCBiZSBmbG9hdGluZyB0byBzdXJ2aXZlOyBoaXRzIGV2ZXJ5b25lIGJ1dCBvbmx5IGRvZXMgZGFtYWdlIGlmIG5vdCBmbG9hdGluZy5cclxuICAgICAgaWQ6ICdPMlMgRWFydGhxdWFrZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI0N0EnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBpbml0aWFsaXplZD86IGJvb2xlYW47XHJcbiAgcGhhc2VOdW1iZXI/OiBudW1iZXI7XHJcbiAgZ2FtZUNvdW50PzogbnVtYmVyO1xyXG59XHJcblxyXG4vLyBPM04gLSBEZWx0YXNjYXBlIDMuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWMzAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08zTiBTcGVsbGJsYWRlIEZpcmUgSUlJJzogJzI0NjAnLCAvLyBEb251dCBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gU3BlbGxibGFkZSBCbGl6emFyZCBJSUknOiAnMjQ2MScsIC8vIENpcmNsZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gU3BlbGxibGFkZSBUaHVuZGVyIElJSSc6ICcyNDYyJywgLy8gTGluZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gQ3Jvc3MgUmVhcGVyJzogJzI0NkInLCAvLyBDaXJjbGUgQW9FLCBTb3VsIFJlYXBlclxyXG4gICAgJ08zTiBHdXN0aW5nIEdvdWdlJzogJzI0NkMnLCAvLyBHcmVlbiBsaW5lIEFvRSwgU291bCBSZWFwZXJcclxuICAgICdPM04gU3dvcmQgRGFuY2UnOiAnMjQ3MCcsIC8vIFRhcmdldGVkIHRoaW4gY29uZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gVXBsaWZ0JzogJzI0NzMnLCAvLyBHcm91bmQgc3BlYXJzLCBRdWVlbidzIFdhbHR6IGVmZmVjdCwgSGFsaWNhcm5hc3N1c1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ08zTiBVbHRpbXVtJzogJzI0NzcnLCAvLyBJbnN0YW50IGtpbGwuIFVzZWQgaWYgdGhlIHBsYXllciBkb2VzIG5vdCBleGl0IHRoZSBzYW5kIG1hemUgZmFzdCBlbm91Z2guXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPM04gSG9seSBCbHVyJzogJzI0NjMnLCAvLyBTcHJlYWQgY2lyY2xlcy5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzNOIFBoYXNlIFRyYWNrZXInLFxyXG4gICAgICB0eXBlOiAnU3RhcnRzVXNpbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGlrYXJuYXNzb3MnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGljYXJuYXNzZScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICflk4jliKnljaHnurPoi4/mlq8nLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ+2VoOumrOy5tOultOuCmOyGjOyKpCcsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiBkYXRhLnBoYXNlTnVtYmVyID0gKGRhdGEucGhhc2VOdW1iZXIgPz8gMCkgKyAxLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlcmUncyBhIGxvdCB0byB0cmFjaywgYW5kIGluIG9yZGVyIHRvIG1ha2UgaXQgYWxsIGNsZWFuLCBpdCdzIHNhZmVzdCBqdXN0IHRvXHJcbiAgICAgIC8vIGluaXRpYWxpemUgaXQgYWxsIHVwIGZyb250IGluc3RlYWQgb2YgdHJ5aW5nIHRvIGd1YXJkIGFnYWluc3QgdW5kZWZpbmVkIGNvbXBhcmlzb25zLlxyXG4gICAgICBpZDogJ08zTiBJbml0aWFsaXppbmcnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICdIYWxpa2FybmFzc29zJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAnSGFsaWNhcm5hc3NlJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn5ZOI5Yip5Y2h57qz6IuP5pavJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn7ZWg66as7Lm066W064KY7IaM7IqkJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+ICFkYXRhLmluaXRpYWxpemVkLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5nYW1lQ291bnQgPSAwO1xyXG4gICAgICAgIC8vIEluZGV4aW5nIHBoYXNlcyBhdCAxIHNvIGFzIHRvIG1ha2UgcGhhc2VzIG1hdGNoIHdoYXQgaHVtYW5zIGV4cGVjdC5cclxuICAgICAgICAvLyAxOiBXZSBzdGFydCBoZXJlLlxyXG4gICAgICAgIC8vIDI6IENhdmUgcGhhc2Ugd2l0aCBVcGxpZnRzLlxyXG4gICAgICAgIC8vIDM6IFBvc3QtaW50ZXJtaXNzaW9uLCB3aXRoIGdvb2QgYW5kIGJhZCBmcm9ncy5cclxuICAgICAgICBkYXRhLnBoYXNlTnVtYmVyID0gMTtcclxuICAgICAgICBkYXRhLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzNOIFJpYmJpdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQ2NicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBXZSBETyB3YW50IHRvIGJlIGhpdCBieSBUb2FkL1JpYmJpdCBpZiB0aGUgbmV4dCBjYXN0IG9mIFRoZSBHYW1lXHJcbiAgICAgICAgLy8gaXMgNHggdG9hZCBwYW5lbHMuXHJcbiAgICAgICAgY29uc3QgZ2FtZUNvdW50ID0gZGF0YS5nYW1lQ291bnQgPz8gMDtcclxuICAgICAgICByZXR1cm4gIShkYXRhLnBoYXNlTnVtYmVyID09PSAzICYmIGdhbWVDb3VudCAlIDIgPT09IDApICYmIG1hdGNoZXMudGFyZ2V0SWQgIT09ICdFMDAwMDAwMCc7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXJlJ3MgYSBsb3Qgd2UgY291bGQgZG8gdG8gdHJhY2sgZXhhY3RseSBob3cgdGhlIHBsYXllciBmYWlsZWQgVGhlIEdhbWUuXHJcbiAgICAgIC8vIFdoeSBvdmVydGhpbmsgTm9ybWFsIG1vZGUsIGhvd2V2ZXI/XHJcbiAgICAgIGlkOiAnTzNOIFRoZSBHYW1lJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyBHdWVzcyB3aGF0IHlvdSBqdXN0IGxvc3Q/XHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0NkQnIH0pLFxyXG4gICAgICAvLyBJZiB0aGUgcGxheWVyIHRha2VzIG5vIGRhbWFnZSwgdGhleSBkaWQgdGhlIG1lY2hhbmljIGNvcnJlY3RseS5cclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGF0YS5nYW1lQ291bnQgPSAoZGF0YS5nYW1lQ291bnQgPz8gMCkgKyAxLFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBoYW5kbGUgUmliYml0ICgyMkY3KSwgT2luayAoMjJGOSwgaWYgZGFtYWdlKSwgU3F1ZWxjaCAoMjJGOCwgaWYgZGFtYWdlKVxyXG4vLyAgICAgICB3aGljaCBpcyBhbiBlcnJvciBleGNlcHQgZHVyaW5nIHRoZSBzZWNvbmQgZ2FtZVxyXG5cclxuLy8gTzNTIC0gRGVsdGFzY2FwZSAzLjAgU2F2YWdlXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjMwU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPM1MgU3BlbGxibGFkZSBGaXJlIElJSSc6ICcyMkVDJywgLy8gZG9udXRcclxuICAgICdPM1MgU3BlbGxibGFkZSBUaHVuZGVyIElJSSc6ICcyMkVFJywgLy8gbGluZVxyXG4gICAgJ08zUyBTcGVsbGJsYWRlIEJsaXp6YXJkIElJSSc6ICcyMkVEJywgLy8gY2lyY2xlXHJcbiAgICAnTzNTIFVwbGlmdCc6ICcyMzBEJywgLy8gbm90IHN0YW5kaW5nIG9uIGJsdWUgc3F1YXJlXHJcbiAgICAnTzNTIFNvdWwgUmVhcGVyIEd1c3RpbmcgR291Z2UnOiAnMjJGRicsIC8vIHJlYXBlciBsaW5lIGFvZSBkdXJpbmcgY2F2ZSBwaGFzZVxyXG4gICAgJ08zUyBTb3VsIFJlYXBlciBDcm9zcyBSZWFwZXInOiAnMjJGRCcsIC8vIG1pZGRsZSByZWFwZXIgY2lyY2xlXHJcbiAgICAnTzNTIFNvdWwgUmVhcGVyIFN0ZW5jaCBvZiBEZWF0aCc6ICcyMkZFJywgLy8gb3V0c2lkZSByZWFwZXJzIChkdXJpbmcgZmluYWwgcGhhc2UpXHJcbiAgICAnTzNTIEFwYW5kYSBNYWdpYyBIYW1tZXInOiAnMjMxNScsIC8vIGJvb2tzIHBoYXNlIG1hZ2ljIGhhbW1lciBjaXJjbGVcclxuICAgICdPM1MgQnJpYXIgVGhvcm4nOiAnMjMwOScsIC8vIG5vdCBicmVha2luZyB0ZXRoZXJzIGZhc3QgZW5vdWdoXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPM1MgSG9seSBFZGdlJzogJzIyRjAnLCAvLyBTcGVsbGJsYWRlIEhvbHkgc3ByZWFkXHJcbiAgICAnTzNTIFN3b3JkIERhbmNlJzogJzIzMDcnLCAvLyBwcm90ZWFuIHdhdmVcclxuICAgICdPM1MgR3JlYXQgRHJhZ29uIEZyb3N0IEJyZWF0aCc6ICcyMzEyJywgLy8gdGFuayBjbGVhdmUgZnJvbSBHcmVhdCBEcmFnb25cclxuICAgICdPM1MgSXJvbiBHaWFudCBHcmFuZCBTd29yZCc6ICcyMzE2JywgLy8gdGFuayBjbGVhdmUgZnJvbSBJcm9uIEdpYW50XHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdPM1MgRm9saW8nOiAnMjMwRicsIC8vIGJvb2tzIGJvb2tzIGJvb2tzXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ08zUyBIb2x5IEJsdXInOiAnMjJGMScsIC8vIFNwZWxsYmxhZGUgSG9seSBzdGFja1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gRXZlcnlib2R5IGdldHMgaGl0cyBieSB0aGlzLCBidXQgaXQncyBvbmx5IGEgZmFpbHVyZSBpZiBpdCBkb2VzIGRhbWFnZS5cclxuICAgICAgaWQ6ICdPM1MgVGhlIEdhbWUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyMzAxJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBPNE4gLSBEZWx0YXNjYXBlIDQuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWNDAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ080TiBCbGl6emFyZCBJSUknOiAnMjRCQycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBFeGRlYXRoXHJcbiAgICAnTzROIEVtcG93ZXJlZCBUaHVuZGVyIElJSSc6ICcyNEMxJywgLy8gVW50ZWxlZ3JhcGhlZCBsYXJnZSBjaXJjbGUgQW9FLCBFeGRlYXRoXHJcbiAgICAnTzROIFpvbWJpZSBCcmVhdGgnOiAnMjRDQicsIC8vIENvbmFsLCB0cmVlIGhlYWQgYWZ0ZXIgRGVjaXNpdmUgQmF0dGxlXHJcbiAgICAnTzROIENsZWFyb3V0JzogJzI0Q0MnLCAvLyBPdmVybGFwcGluZyBjb25lIEFvRXMsIERlYXRobHkgVmluZSAodGVudGFjbGVzIGFsb25nc2lkZSB0cmVlIGhlYWQpXHJcbiAgICAnTzROIEJsYWNrIFNwYXJrJzogJzI0QzknLCAvLyBFeHBsb2RpbmcgQmxhY2sgSG9sZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBFbXBvd2VyZWQgRmlyZSBJSUkgaW5mbGljdHMgdGhlIFB5cmV0aWMgZGVidWZmLCB3aGljaCBkZWFscyBkYW1hZ2UgaWYgdGhlIHBsYXllclxyXG4gICAgLy8gbW92ZXMgb3IgYWN0cyBiZWZvcmUgdGhlIGRlYnVmZiBmYWxscy4gVW5mb3J0dW5hdGVseSBpdCBkb2Vzbid0IGxvb2sgbGlrZSB0aGVyZSdzXHJcbiAgICAvLyBjdXJyZW50bHkgYSBsb2cgbGluZSBmb3IgdGhpcywgc28gdGhlIG9ubHkgd2F5IHRvIGNoZWNrIGZvciB0aGlzIGlzIHRvIGNvbGxlY3RcclxuICAgIC8vIHRoZSBkZWJ1ZmZzIGFuZCB0aGVuIHdhcm4gaWYgYSBwbGF5ZXIgdGFrZXMgYW4gYWN0aW9uIGR1cmluZyB0aGF0IHRpbWUuIE5vdCB3b3J0aCBpdFxyXG4gICAgLy8gZm9yIE5vcm1hbC5cclxuICAgICdPNE4gU3RhbmRhcmQgRmlyZSc6ICcyNEJBJyxcclxuICAgICdPNE4gQnVzdGVyIFRodW5kZXInOiAnMjRCRScsIC8vIEEgY2xlYXZpbmcgdGFuayBidXN0ZXJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEtpbGxzIHRhcmdldCBpZiBub3QgY2xlYW5zZWRcclxuICAgICAgaWQ6ICdPNE4gRG9vbScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0NsZWFuc2VycyBtaXNzZWQgRG9vbSEnLFxyXG4gICAgICAgICAgICBkZTogJ0Rvb20tUmVpbmlndW5nIHZlcmdlc3NlbiEnLFxyXG4gICAgICAgICAgICBmcjogJ05cXCdhIHBhcyDDqXTDqSBkaXNzaXDDqShlKSBkdSBHbGFzICEnLFxyXG4gICAgICAgICAgICBqYTogJ+atu+OBruWuo+WRiicsXHJcbiAgICAgICAgICAgIGNuOiAn5rKh6Kej5q275a6jJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFNob3J0IGtub2NrYmFjayBmcm9tIEV4ZGVhdGhcclxuICAgICAgaWQ6ICdPNE4gVmFjdXVtIFdhdmUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNEI4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1B1c2hlZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VzY2h1YnN0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBwb3Vzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+iQveOBoeOBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFJvb20td2lkZSBBb0UsIGZyZWV6ZXMgbm9uLW1vdmluZyB0YXJnZXRzXHJcbiAgICAgIGlkOiAnTzROIEVtcG93ZXJlZCBCbGl6emFyZCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0RTYnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBOZXRNYXRjaGVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvbmV0X21hdGNoZXMnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiB0YWtpbmcgdGhlIHdyb25nIGNvbG9yIHdoaXRlL2JsYWNrIGFudGlsaWdodFxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBpc0RlY2lzaXZlQmF0dGxlRWxlbWVudD86IGJvb2xlYW47XHJcbiAgaXNOZW9FeGRlYXRoPzogYm9vbGVhbjtcclxuICBoYXNCZXlvbmREZWF0aD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBkb3VibGVBdHRhY2tNYXRjaGVzPzogTmV0TWF0Y2hlc1snQWJpbGl0eSddW107XHJcbn1cclxuXHJcbi8vIE80UyAtIERlbHRhc2NhcGUgNC4wIFNhdmFnZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVY0MFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzRTMSBWaW5lIENsZWFyb3V0JzogJzI0MEMnLCAvLyBjaXJjbGUgb2YgdmluZXNcclxuICAgICdPNFMxIFpvbWJpZSBCcmVhdGgnOiAnMjQwQicsIC8vIHRyZWUgZXhkZWF0aCBjb25hbFxyXG4gICAgJ080UzEgVmFjdXVtIFdhdmUnOiAnMjNGRScsIC8vIGNpcmNsZSBjZW50ZXJlZCBvbiBleGRlYXRoXHJcbiAgICAnTzRTMiBOZW8gVmFjdXVtIFdhdmUnOiAnMjQxRCcsIC8vIFwib3V0IG9mIG1lbGVlXCJcclxuICAgICdPNFMyIERlYXRoIEJvbWInOiAnMjQzMScsIC8vIGZhaWxlZCBhY2NlbGVyYXRpb24gYm9tYlxyXG4gICAgJ080UzIgRW1wdGluZXNzIDEnOiAnMjQyMScsIC8vIGV4YWZsYXJlcyBpbml0aWFsXHJcbiAgICAnTzRTMiBFbXB0aW5lc3MgMic6ICcyNDIyJywgLy8gZXhhZmxhcmVzIG1vdmluZ1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ080UzEgQmxhY2sgSG9sZSBCbGFjayBTcGFyayc6ICcyNDA3JywgLy8gYmxhY2sgaG9sZSBjYXRjaGluZyB5b3VcclxuICAgICdPNFMyIEVkZ2UgT2YgRGVhdGgnOiAnMjQxNScsIC8vIHN0YW5kaW5nIGJldHdlZW4gdGhlIHR3byBjb2xvciBsYXNlcnNcclxuICAgICdPNFMyIElubmVyIEFudGlsaWdodCc6ICcyNDRDJywgLy8gaW5uZXIgbGFzZXJcclxuICAgICdPNFMyIE91dGVyIEFudGlsaWdodCc6ICcyNDEwJywgLy8gb3V0ZXIgbGFzZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ080UzEgRmlyZSBJSUknOiAnMjNGNicsIC8vIHNwcmVhZCBleHBsb3Npb25cclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ080UzEgVGh1bmRlciBJSUknOiAnMjNGQScsIC8vIHRhbmtidXN0ZXJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBEZWNpc2l2ZSBCYXR0bGUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0MDgnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMxIFZhY3V1bSBXYXZlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyM0ZFJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50ID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQWxtYWdlc3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0MTcnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuaXNOZW9FeGRlYXRoID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCbGl6emFyZCBJSUknLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyM0Y4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBJZ25vcmUgdW5hdm9pZGFibGUgcmFpZCBhb2UgQmxpenphcmQgSUlJLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhKSA9PiAhZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIFRodW5kZXIgSUlJJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjNGRCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gT25seSBjb25zaWRlciB0aGlzIGR1cmluZyByYW5kb20gbWVjaGFuaWMgYWZ0ZXIgZGVjaXNpdmUgYmF0dGxlLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhKSA9PiBkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgUGV0cmlmaWVkJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gT24gTmVvLCBiZWluZyBwZXRyaWZpZWQgaXMgYmVjYXVzZSB5b3UgbG9va2VkIGF0IFNocmllaywgc28geW91ciBmYXVsdC5cclxuICAgICAgICBpZiAoZGF0YS5pc05lb0V4ZGVhdGgpXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgICAvLyBPbiBub3JtYWwgRXhEZWF0aCwgdGhpcyBpcyBkdWUgdG8gV2hpdGUgSG9sZS5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEZvcmtlZCBMaWdodG5pbmcnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDJFJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQmV5b25kIERlYXRoIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGggTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGgnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aClcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgRG91YmxlIEF0dGFjayBDb2xsZWN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjQxQycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcyA9IGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcyB8fCBbXTtcclxuICAgICAgICBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXMucHVzaChtYXRjaGVzKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBEb3VibGUgQXR0YWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjQxQycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEpID0+IHtcclxuICAgICAgICBjb25zdCBhcnIgPSBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXM7XHJcbiAgICAgICAgaWYgKCFhcnIpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKGFyci5sZW5ndGggPD0gMilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAvLyBIYXJkIHRvIGtub3cgd2hvIHNob3VsZCBiZSBpbiB0aGlzIGFuZCB3aG8gc2hvdWxkbid0LCBidXRcclxuICAgICAgICAvLyBpdCBzaG91bGQgbmV2ZXIgaGl0IDMgcGVvcGxlLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgdGV4dDogYCR7YXJyWzBdPy5hYmlsaXR5ID8/ICcnfSB4ICR7YXJyLmxlbmd0aH1gIH07XHJcbiAgICAgIH0sXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IGRlbGV0ZSBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXMsXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuLy8gVE9ETzogRGlhYm9saWMgV2luZCAoMjhCOSkgYWx3YXlzIHNlZW1zIHRvIGJlIDB4MTYgbm90IDB4MTUuXHJcblxyXG5pbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaGFzVGhyb3R0bGU/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbi8vIE81TiAtIFNpZ21hc2NhcGUgMS4wIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuU2lnbWFzY2FwZVYxMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzVOIFdyb3RoIEdob3N0IEVuY3VtYmVyJzogJzI4QUUnLCAvLyBzcXVhcmVzIHRoYXQgZ2hvc3RzIGFwcGVhciBpblxyXG4gICAgJ081TiBTYWludGx5IEJlYW0nOiAnMjhBQScsIC8vIGNoYXNpbmcgY2lyY2xlcyB0aGF0IGRlc3Ryb3kgZ2hvc3RzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ081TiBUaHJvdHRsZSBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzNBQScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAoZGF0YS5oYXNUaHJvdHRsZSA/Pz0ge30pW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZGF0YS5oYXNUaHJvdHRsZSkpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNU4gVGhyb3R0bGUgRGVhdGgnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnM0FBJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAxLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNUaHJvdHRsZT8uW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB7IG5hbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNU4gVGhyb3R0bGUgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICczQUEnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgKGRhdGEuaGFzVGhyb3R0bGUgPz89IHt9KVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShkYXRhLmhhc1Rocm90dGxlKSk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBHZXR0aW5nIGhpdCBieSBhIGdob3N0IHdpdGhvdXQgdGhyb3R0bGUgKHRoZSBtYW5kYXRvcnkgcG9zdC1jaGltbmV5IG9uZSkuXHJcbiAgICAgIGlkOiAnTzVOIFBvc3Nlc3MnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyOEFDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiAhZGF0YS5oYXNUaHJvdHRsZT8uW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNGaXJlUmVzaXN0PzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG4vLyBPNk4gLSBTaWdtYXNjYXBlIDIuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNpZ21hc2NhcGVWMjAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ082TiBFYXJ0aHF1YWtlJzogJzI4MTEnLCAvLyBmYWlsaW5nIHRvIGJlIGluIGEgcGxhbmVcclxuICAgICdPNk4gRGVtb25pYyBTdG9uZSc6ICcyODQ3JywgLy8gY2hhc2luZyBjaXJjbGVzXHJcbiAgICAnTzZOIERlbW9uaWMgV2F2ZSc6ICcyODMxJywgLy8gZmFpbGluZyB0byBiZSBiZWhpbmQgcm9ja1xyXG4gICAgJ082TiBEZW1vbmljIFNwb3V0IDEnOiAnMjgzNScsIC8vIHBhaXIgb2YgdGFyZ2V0ZWQgY2lyY2xlcyAoIzEpXHJcbiAgICAnTzZOIERlbW9uaWMgU3BvdXQgMic6ICcyODM3JywgLy8gcGFpciBvZiB0YXJnZXRlZCBjaXJjbGVzICgjMilcclxuICAgICdPNk4gRmVhdGhlcmxhbmNlJzogJzJBRTgnLCAvLyBibG93biBhd2F5IEVhc3Rlcmx5IGNpcmNsZXNcclxuICAgICdPNk4gSW50ZW5zZSBQYWluJzogJzJBRTcnLCAvLyBmYWlsaW5nIHRvIHNwcmVhZCBmb3IgRGVtb25pYyBQYWluIHRldGhlclxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNk4gRmlyZSBSZXNpc3RhbmNlIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNUVEJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4gKGRhdGEuaGFzRmlyZVJlc2lzdCA/Pz0ge30pW21hdGNoZXMudGFyZ2V0XSA9IHRydWUsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ082TiBGaXJlIFJlc2lzdGFuY2UgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc1RUQnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiAoZGF0YS5oYXNGaXJlUmVzaXN0ID8/PSB7fSlbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2UsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBGbGFzaCBGaXJlIHdpdGhvdXQgRmlyZSBSZXNpc3RhbmNlLlxyXG4gICAgICBpZDogJ082TiBGbGFzaCBGaXJlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyODBCJyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEuaGFzRmlyZVJlc2lzdD8uW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHRoZSB3cm9uZyBzaWRlIG9mIEludGVyZGltZW5zaW9uYWwgQm9tYiBjYXVzZXNcclxuLy8gICAgICAgSW50ZXJkaW1lbnNpb25hbCBFeHBsb3Npb24gKDI3NjMpIGFuZCBhbHNvIGdpdmVzIHlvdSBhIHJlZFxyXG4vLyAgICAgICBYIGhlYWRtYXJrZXIgbGlrZSBCYXJkYW0ncyBNZXR0bGUgYm9zcyAyLiAgSG93ZXZlciwgdGhpc1xyXG4vLyAgICAgICBpc24ndCBhbiBhY3R1YWwgaGVhZG1hcmtlciBsaW5lLiAgU28sIHRoZXJlIGlzIG5vIHdheSB0b1xyXG4vLyAgICAgICBkaWZmZXJlbnRpYXRlIFwic29tZWJvZHkgZmFpbGVkIHRoaXNcIiB2cyBcIm5vYm9keSBnb3QgaXRcIi5cclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBPN04gLSBTaWdtYXNjYXBlIDMuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNpZ21hc2NhcGVWMzAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ083TiBNYWdpdGVrIFJheSc6ICcyNzZCJywgLy8gdW50ZWxlZ3JhcGhlZCBmcm9udGFsIGxpbmVcclxuICAgICdPN04gSW5rJzogJzI3NUQnLCAvLyBJbml0aWFsIFVsdHJvcyB0YXJnZXRlZCBjaXJjbGVzXHJcbiAgICAnTzdOIFRlbnRhY2xlJzogJzI3NUYnLCAvLyBUZW50YWNsZSBzaW11bGF0aW9uIHRhcmdldGVkIGNpcmNsZXNcclxuICAgICdPN04gV2FsbG9wJzogJzI3NjAnLCAvLyBVbHRyb3MgdGVudGFjbGVzIGF0dGFja2luZ1xyXG4gICAgJ083TiBDaGFpbiBDYW5ub24nOiAnMjc3MCcsIC8vIGJhaXRlZCBhaXJzaGlwIGFkZCBjYW5ub25cclxuICAgICdPN04gTWlzc2lsZSBFeHBsb3Npb24nOiAnMjc2NScsIC8vIEhpdHRpbmcgYSBtaXNzaWxlXHJcbiAgICAnTzdOIEJpYmxpb3RhcGggRGVlcCBEYXJrbmVzcyc6ICcyOUJGJywgLy8gZ2lhbnQgZG9udXRcclxuICAgICdPN04gRGFkYWx1bWEgQXVyYSBDYW5ub24nOiAnMjc2NycsIC8vIGxhcmdlIGxpbmUgYW9lXHJcbiAgICAnTzdOIEd1YXJkaWFuIERpZmZyYWN0aXZlIExhc2VyJzogJzI3NjEnLCAvLyBpbml0aWFsIEFpciBGb3JjZSBjZW50ZXJlZCBjaXJjbGUgb24gR3VhcmRpYW5cclxuICAgICdPN04gQWlyIEZvcmNlIERpZmZyYWN0aXZlIExhc2VyJzogJzI3M0YnLCAvLyBBaXIgRm9yY2UgYWRkIGxhcmdlIGNvbmFsXHJcbiAgICAnTzdOIEludGVyZGltZW5zaW9uYWwgRXhwbG9zaW9uJzogJzI3NjMnLCAvLyBGYWlsZWQgYm9tYiAoZWl0aGVyIHdyb25nIHNpZGUgb3IgaWdub3JlZClcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPN04gU3VwZXIgQ2hha3JhIEJ1cnN0JzogJzI3NjknLCAvLyBNaXNzZWQgRGFkYWx1bWEgdG93ZXIgKGhpdHMgZXZlcnlib2R5KVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnTzdOIFNob2NrZWQnOiAnNURBJywgLy8gdG91Y2hpbmcgYXJlbmEgZWRnZVxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IG1pc3NpbmcgbWFueSBhYmlsaXRpZXMgaGVyZVxyXG5cclxuLy8gTzdTIC0gU2lnbWFzY2FwZSAzLjAgU2F2YWdlXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5TaWdtYXNjYXBlVjMwU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPN1MgU2VhcmluZyBXaW5kJzogJzI3NzcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ083UyBNaXNzaWxlJzogJzI3ODInLFxyXG4gICAgJ083UyBDaGFpbiBDYW5ub24nOiAnMjc4RicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ083UyBTdG9uZXNraW4nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzJBQjUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnNvdXJjZSwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIE84TiAtIFNpZ21hc2NhcGUgNC4wIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuU2lnbWFzY2FwZVY0MCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzhOIEJsaXp6YXJkIEJsaXR6IDEnOiAnMjkxOCcsXHJcbiAgICAnTzhOIEJsaXp6YXJkIEJsaXR6IDInOiAnMjkxNCcsXHJcbiAgICAnTzhOIFRocnVtbWluZyBUaHVuZGVyIDEnOiAnMjkxRCcsXHJcbiAgICAnTzhOIFRocnVtbWluZyBUaHVuZGVyIDInOiAnMjkxQycsXHJcbiAgICAnTzhOIFRocnVtbWluZyBUaHVuZGVyIDMnOiAnMjkxQicsXHJcbiAgICAnTzhOIFdhdmUgQ2Fubm9uJzogJzI5MjgnLCAvLyB0ZWxlZ3JhcGhlZCBsaW5lIGFvZXNcclxuICAgICdPOE4gUmV2b2x0aW5nIFJ1aW4nOiAnMjkyMycsIC8vIGxhcmdlIDE4MCBjbGVhdmUgYWZ0ZXIgVGltZWx5IFRlbGVwb3J0XHJcbiAgICAnTzhOIEludGVtcGVyYXRlIFdpbGwnOiAnMjkyQScsIC8vIGVhc3QgMTgwIGNsZWF2ZVxyXG4gICAgJ084TiBHcmF2aXRhdGlvbmFsIFdhdmUnOiAnMjkyQicsIC8vIHdlc3QgMTgwIGNsZWF2ZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzhOIEZsYWdyYW50IEZpcmUgU3ByZWFkJzogJzI5MUYnLCAvLyB0cnVlIHNwcmVhZCBtYXJrZXJzXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ084TiBGbGFncmFudCBGaXJlIFN0YWNrJzogJzI5MjAnLCAvLyBmYWtlIHNwcmVhZCBtYXJrZXJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIExvb2sgYXdheTsgZG9lcyBkYW1hZ2UgaWYgZmFpbGVkLlxyXG4gICAgICBpZDogJ084TiBJbmRvbGVudCBXaWxsJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjkyQycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIExvb2sgdG93YXJkczsgZG9lcyBkYW1hZ2UgaWYgZmFpbGVkLlxyXG4gICAgICBpZDogJ084TiBBdmUgTWFyaWEnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyOTJCJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPOE4gU2hvY2t3YXZlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyOTI3JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPOE4gQWVybyBBc3NhdWx0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyOTI0JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gTzlOIC0gQWxwaGFzY2FwZSAxLjAgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbHBoYXNjYXBlVjEwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPOU4gRGFtbmluZyBFZGljdCc6ICczMTUwJywgLy8gaHVnZSAxODAgZnJvbnRhbCBjbGVhdmVcclxuICAgICdPOU4gU3RyYXkgU3ByYXknOiAnMzE2QycsIC8vIER5bmFtaWMgRmx1aWQgZGVidWZmIGRvbnV0IGV4cGxvc2lvblxyXG4gICAgJ085TiBTdHJheSBGbGFtZXMnOiAnMzE2QicsIC8vIEVudHJvcHkgZGVidWZmIGNpcmNsZSBleHBsb3Npb25cclxuICAgICdPOU4gS25vY2tkb3duIEJpZyBCYW5nJzogJzMxNjAnLCAvLyBiaWcgY2lyY2xlIHdoZXJlIEtub2NrZG93biBtYXJrZXIgZHJvcHBlZFxyXG4gICAgJ085TiBGaXJlIEJpZyBCYW5nJzogJzMxNUYnLCAvLyBncm91bmQgY2lyY2xlcyBkdXJpbmcgZmlyZSBwaGFzZVxyXG4gICAgJ085TiBTaG9ja3dhdmUnOiAnMzE1MycsIC8vIExvbmdpdHVkaW5hbC9MYXRpdWRpbmFsIEltcGxvc2lvblxyXG4gICAgJ085TiBDaGFvc3BoZXJlIEZpZW5kaXNoIE9yYnMgT3Jic2hhZG93IDEnOiAnMzE2MicsIC8vIGxpbmUgYW9lcyBmcm9tIEVhcnRoIHBoYXNlIG9yYnNcclxuICAgICdPOU4gQ2hhb3NwaGVyZSBGaWVuZGlzaCBPcmJzIE9yYnNoYWRvdyAyJzogJzMxNjMnLCAvLyBsaW5lIGFvZXMgZnJvbSBFYXJ0aCBwaGFzZSBvcmJzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IEFraCBSaGFpICgzNjI0KSBpcyBub3QgdW51c3VhbCB0byB0YWtlIH4xIGhpdCBmcm9tLCBzbyBkb24ndCBsaXN0LlxyXG5cclxuLy8gTzEwTiAtIEFscGhhc2NhcGUgMi4wIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQWxwaGFzY2FwZVYyMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzEwTiBBenVyZSBXaW5ncyc6ICczMUNEJywgLy8gT3V0XHJcbiAgICAnTzEwTiBTdHlnaWFuIE1hdyc6ICczMUNGJywgLy8gSW5cclxuICAgICdPMTBOIEhvcnJpZCBSb2FyJzogJzMxRDMnLCAvLyB0YXJnZXRlZCBjaXJjbGVzXHJcbiAgICAnTzEwTiBCbG9vZGllZCBNYXcnOiAnMzFEMCcsIC8vIENvcm5lcnNcclxuICAgICdPMTBOIENhdXRlcml6ZSc6ICczMjQxJywgLy8gZGl2ZWJvbWIgYXR0YWNrXHJcbiAgICAnTzEwTiBTY2FybGV0IFRocmVhZCc6ICczNjJCJywgLy8gb3JiIHdhZmZsZSBsaW5lc1xyXG4gICAgJ08xME4gRXhhZmxhcmUgMSc6ICczNjJEJyxcclxuICAgICdPMTBOIEV4YWZsYXJlIDInOiAnMzYyRicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMTBOIEVhcnRoIFNoYWtlcic6ICczMUQxJywgLy8gYXMgaXQgc2F5cyBvbiB0aGUgdGluXHJcbiAgICAnTzEwTiBGcm9zdCBCcmVhdGgnOiAnMzNFRScsIC8vIEFuY2llbnQgRHJhZ29uIGZyb250YWwgY29uYWxcclxuICAgICdPMTBOIFRodW5kZXJzdG9ybSc6ICczMUQyJywgLy8gcHVycGxlIHNwcmVhZCBtYXJrZXJcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gTzExTiAtIEFscGhhc2NhcGUgMy4wIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQWxwaGFzY2FwZVYzMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzExTiBTdGFyYm9hcmQgV2F2ZSBDYW5ub24gMSc6ICczMjgxJywgLy8gaW5pdGlhbCByaWdodCBjbGVhdmVcclxuICAgICdPMTFOIFN0YXJib2FyZCBXYXZlIENhbm5vbiAyJzogJzMyODInLCAvLyBmb2xsb3ctdXAgcmlnaHQgY2xlYXZlXHJcbiAgICAnTzExTiBMYXJib2FyZCBXYXZlIENhbm5vbiAxJzogJzMyODMnLCAvLyBpbml0aWFsIGxlZnQgY2xlYXZlXHJcbiAgICAnTzExTiBMYXJib2FyZCBXYXZlIENhbm5vbiAyJzogJzMyODQnLCAvLyBmb2xsb3ctdXAgbGVmdCBjbGVhdmVcclxuICAgICdPMTFOIEZsYW1lIFRocm93ZXInOiAnMzI3RCcsIC8vIHBpbndoZWVsIGNvbmFsc1xyXG4gICAgJ08xMU4gQ3JpdGljYWwgU3RvcmFnZSBWaW9sYXRpb24nOiAnMzI3OScsIC8vIG1pc3NpbmcgbWlkcGhhc2UgdG93ZXJzXHJcbiAgICAnTzExTiBMZXZlbCBDaGVja2VyIFJlc2V0JzogJzM1QUEnLCAvLyBcImdldCBvdXRcIiBjaXJjbGVcclxuICAgICdPMTFOIExldmVsIENoZWNrZXIgUmVmb3JtYXQnOiAnMzVBOScsIC8vIFwiZ2V0IGluXCIgZG9udXRcclxuICAgICdPMTFOIFJvY2tldCBQdW5jaCBSdXNoJzogJzM2MDYnLCAvLyBnaWFudCBoYW5kIDEvMyBhcmVuYSBsaW5lIGFvZXNcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ08xMU4gQnVybnMnOiAnRkEnLCAvLyBzdGFuZGluZyBpbiBiYWxsaXN0aWMgbWlzc2lsZSBmaXJlIHB1ZGRsZVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnTzExTiBNZW1vcnkgTG9zcyc6ICc2NUEnLCAvLyBmYWlsaW5nIHRvIGNsZWFuc2UgTG9vcGVyIGluIGEgdG93ZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08xMU4gQmFsbGlzdGljIEltcGFjdCc6ICczMjdGJywgLy8gc3ByZWFkIG1hcmtlcnNcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ08xMU4gQmxhc3Rlcic6ICczMjgwJywgLy8gdGFuayB0ZXRoZXJcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnTzExTiBFbGVjdHJpYyBTbGlkZSc6ICczMjg1JywgLy8gc3RhY2sgbWFya2VyXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gTzEyTiAtIEFscGhhc2NhcGUgNC4wIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQWxwaGFzY2FwZVY0MCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzEyTiBGbG9vZGxpZ2h0JzogJzMzMDknLCAvLyB0YXJnZXRlZCBjaXJjdWxhciBhb2VzIGFmdGVyIFByb2dyYW0gQWxwaGFcclxuICAgICdPMTJOIEVmZmljaWVudCBCbGFkZXdvcmsnOiAnMzJGRicsIC8vIHRlbGVncmFwaGVkIGNlbnRlcmVkIGNpcmNsZVxyXG4gICAgJ08xMk4gRWZmaWNpZW50IEJsYWRld29yayBVbnRlbGVncmFwaGVkJzogJzMyRjMnLCAvLyBjZW50ZXJlZCBjaXJjbGUgYWZ0ZXIgdHJhbnNmb3JtYXRpb25cclxuICAgICdPMTJOIE9wdGltaXplZCBCbGl6emFyZCBJSUknOiAnMzMwMycsIC8vIGNyb3NzIGFvZVxyXG4gICAgJ08xMk4gU3VwZXJsaW1pbmFsIFN0ZWVsIDEnOiAnMzMwNicsIC8vIHNpZGVzIG9mIHRoZSByb29tXHJcbiAgICAnTzEyTiBTdXBlcmxpbWluYWwgU3RlZWwgMic6ICczMzA3JywgLy8gc2lkZXMgb2YgdGhlIHJvb21cclxuICAgICdPMTJOIEJleW9uZCBTdHJlbmd0aCc6ICczMzAwJywgLy8gZG9udXRcclxuICAgICdPMTJOIE9wdGljYWwgTGFzZXInOiAnMzMyMCcsIC8vIGxpbmUgYW9lIGZyb20gZXllXHJcbiAgICAnTzEyTiBPcHRpbWl6ZWQgU2FnaXR0YXJpdXMgQXJyb3cnOiAnMzMyMycsIC8vIGxpbmUgYW9lIGZyb20gT21lZ2EtTVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzEyTiBTb2xhciBSYXknOiAnMzMwRicsIC8vIGNpcmN1bGFyIHRhbmtidXN0ZXJcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAnTzEyTiBTcG90bGlnaHQnOiAnMzMwQScsIC8vIHN0YWNrIG1hcmtlclxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMTJOIERpc2NoYXJnZXIgS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzMyRjYnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICB2dWxuPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG4vLyBUT0RPOiBjb3VsZCBhZGQgUGF0Y2ggd2FybmluZ3MgZm9yIGRvdWJsZS91bmJyb2tlbiB0ZXRoZXJzXHJcbi8vIFRPRE86IEhlbGxvIFdvcmxkIGNvdWxkIGhhdmUgYW55IHdhcm5pbmdzIChzb3JyeSlcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbHBoYXNjYXBlVjQwU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMTJTMSBTdXBlcmxpbWluYWwgTW90aW9uIDEnOiAnMzMzNCcsIC8vIDMwMCsgZGVncmVlIGNsZWF2ZSB3aXRoIGJhY2sgc2FmZSBhcmVhXHJcbiAgICAnTzEyUzEgRWZmaWNpZW50IEJsYWRld29yayAxJzogJzMzMjknLCAvLyBPbWVnYS1NIFwiZ2V0IG91dFwiIGNlbnRlcmVkIGFvZSBhZnRlciBzcGxpdFxyXG4gICAgJ08xMlMxIEVmZmljaWVudCBCbGFkZXdvcmsgMic6ICczMzJBJywgLy8gT21lZ2EtTSBcImdldCBvdXRcIiBjZW50ZXJlZCBhb2UgZHVyaW5nIGJsYWRlc1xyXG4gICAgJ08xMlMxIEJleW9uZCBTdHJlbmd0aCc6ICczMzI4JywgLy8gT21lZ2EtTSBcImdldCBpblwiIGNlbnRlcmVkIGFvZSBkdXJpbmcgc2hpZWxkXHJcbiAgICAnTzEyUzEgU3VwZXJsaW1pbmFsIFN0ZWVsIDEnOiAnMzMzMCcsIC8vIE9tZWdhLUYgXCJnZXQgZnJvbnQvYmFja1wiIGJsYWRlcyBwaGFzZVxyXG4gICAgJ08xMlMxIFN1cGVybGltaW5hbCBTdGVlbCAyJzogJzMzMzEnLCAvLyBPbWVnYS1GIFwiZ2V0IGZyb250L2JhY2tcIiBibGFkZXMgcGhhc2VcclxuICAgICdPMTJTMSBPcHRpbWl6ZWQgQmxpenphcmQgSUlJJzogJzMzMzInLCAvLyBPbWVnYS1GIGdpYW50IGNyb3NzXHJcbiAgICAnTzEyUzIgRGlmZnVzZSBXYXZlIENhbm5vbic6ICczMzY5JywgLy8gYmFjay9zaWRlcyBsYXNlcnNcclxuICAgICdPMTJTMiBSaWdodCBBcm0gVW5pdCBIeXBlciBQdWxzZSAxJzogJzMzNUEnLCAvLyBSb3RhdGluZyBBcmNoaXZlIFBlcmlwaGVyYWwgbGFzZXJzXHJcbiAgICAnTzEyUzIgUmlnaHQgQXJtIFVuaXQgSHlwZXIgUHVsc2UgMic6ICczMzVCJywgLy8gUm90YXRpbmcgQXJjaGl2ZSBQZXJpcGhlcmFsIGxhc2Vyc1xyXG4gICAgJ08xMlMyIFJpZ2h0IEFybSBVbml0IENvbG9zc2FsIEJsb3cnOiAnMzM1RicsIC8vIEV4cGxvZGluZyBBcmNoaXZlIEFsbCBoYW5kc1xyXG4gICAgJ08xMlMyIExlZnQgQXJtIFVuaXQgQ29sb3NzYWwgQmxvdyc6ICczMzYwJywgLy8gRXhwbG9kaW5nIEFyY2hpdmUgQWxsIGhhbmRzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTzEyUzEgT3B0aWNhbCBMYXNlcic6ICczMzQ3JywgLy8gbWlkZGxlIGxhc2VyIGZyb20gZXllXHJcbiAgICAnTzEyUzEgQWR2YW5jZWQgT3B0aWNhbCBMYXNlcic6ICczMzRBJywgLy8gZ2lhbnQgY2lyY2xlIGNlbnRlcmVkIG9uIGV5ZVxyXG4gICAgJ08xMlMyIFJlYXIgUG93ZXIgVW5pdCBSZWFyIExhc2VycyAxJzogJzMzNjEnLCAvLyBBcmNoaXZlIEFsbCBpbml0aWFsIGxhc2VyXHJcbiAgICAnTzEyUzIgUmVhciBQb3dlciBVbml0IFJlYXIgTGFzZXJzIDInOiAnMzM2MicsIC8vIEFyY2hpdmUgQWxsIHJvdGF0aW5nIGxhc2VyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMTJTMSBPcHRpbWl6ZWQgRmlyZSBJSUknOiAnMzMzNycsIC8vIGZpcmUgc3ByZWFkXHJcbiAgICAnTzEyUzIgSHlwZXIgUHVsc2UgVGV0aGVyJzogJzMzNUMnLCAvLyBJbmRleCBBbmQgQXJjaGl2ZSBQZXJpcGhlcmFsIHRldGhlcnNcclxuICAgICdPMTJTMiBXYXZlIENhbm5vbic6ICczMzZCJywgLy8gSW5kZXggQW5kIEFyY2hpdmUgUGVyaXBoZXJhbCBiYWl0ZWQgbGFzZXJzXHJcbiAgICAnTzEyUzIgT3B0aW1pemVkIEZpcmUgSUlJJzogJzMzNzknLCAvLyBBcmNoaXZlIEFsbCBzcHJlYWRcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ08xMlMxIE9wdGltaXplZCBTYWdpdHRhcml1cyBBcnJvdyc6ICczMzREJywgLy8gT21lZ2EtTSBiYXJkIGxpbWl0IGJyZWFrXHJcbiAgICAnTzEyUzIgT3ZlcnNhbXBsZWQgV2F2ZSBDYW5ub24nOiAnMzM2NicsIC8vIE1vbml0b3IgdGFuayBidXN0ZXJzXHJcbiAgICAnTzEyUzIgU2F2YWdlIFdhdmUgQ2Fubm9uJzogJzMzNkQnLCAvLyBUYW5rIGJ1c3RlciB3aXRoIHRoZSB2dWxuIGZpcnN0XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIERpc2NoYXJnZXIgS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzMzMjcnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NzInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS52dWxuID8/PSB7fTtcclxuICAgICAgICBkYXRhLnZ1bG5bbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgTWFnaWMgVnVsbmVyYWJpbGl0eSBVcCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzQ3MicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnZ1bG4gPSBkYXRhLnZ1bG4gfHwge307XHJcbiAgICAgICAgZGF0YS52dWxuW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMTJTMSBNYWdpYyBWdWxuZXJhYmlsaXR5IERhbWFnZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gMzMyRSA9IFBpbGUgUGl0Y2ggc3RhY2tcclxuICAgICAgLy8gMzMzRSA9IEVsZWN0cmljIFNsaWRlIChPbWVnYS1NIHNxdWFyZSAxLTQgZGFzaGVzKVxyXG4gICAgICAvLyAzMzNGID0gRWxlY3RyaWMgU2xpZGUgKE9tZWdhLUYgdHJpYW5nbGUgMS00IGRhc2hlcylcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyczMzJFJywgJzMzM0UnLCAnMzMzRiddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEudnVsbiAmJiBkYXRhLnZ1bG5bbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAod2l0aCB2dWxuKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChtaXQgVmVyd3VuZGJhcmtlaXQpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOiiq+ODgOODoeODvOOCuOS4iuaYhylgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5bim5piT5LykKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIEJ5YWtrbyBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVKYWRlU3RvYUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gUG9wcGluZyBVbnJlbGVudGluZyBBbmd1aXNoIGJ1YmJsZXNcclxuICAgICdCeWFFeCBBcmF0YW1hJzogJzI3RjYnLFxyXG4gICAgLy8gU3RlcHBpbmcgaW4gZ3Jvd2luZyBvcmJcclxuICAgICdCeWFFeCBWYWN1dW0gQ2xhdyc6ICcyN0U5JyxcclxuICAgIC8vIExpZ2h0bmluZyBQdWRkbGVzXHJcbiAgICAnQnlhRXggSHVuZGVyZm9sZCBIYXZvYyAxJzogJzI3RTUnLFxyXG4gICAgJ0J5YUV4IEh1bmRlcmZvbGQgSGF2b2MgMic6ICcyN0U2JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdCeWFFeCBTd2VlcCBUaGUgTGVnJzogJzI3REInLFxyXG4gICAgJ0J5YUV4IEZpcmUgYW5kIExpZ2h0bmluZyc6ICcyN0RFJyxcclxuICAgICdCeWFFeCBEaXN0YW50IENsYXAnOiAnMjdERCcsXHJcbiAgICAvLyBNaWRwaGFzZSBsaW5lIGF0dGFja1xyXG4gICAgJ0J5YUV4IEltcGVyaWFsIEd1YXJkJzogJzI3RjEnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gUGluayBidWJibGUgY29sbGlzaW9uXHJcbiAgICAgIGlkOiAnQnlhRXggT21pbm91cyBXaW5kJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjdFQycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdidWJibGUgY29sbGlzaW9uJyxcclxuICAgICAgICAgICAgZGU6ICdCbGFzZW4gc2luZCB6dXNhbW1lbmdlc3Rvw59lbicsXHJcbiAgICAgICAgICAgIGZyOiAnY29sbGlzaW9uIGRlIGJ1bGxlcycsXHJcbiAgICAgICAgICAgIGphOiAn6KGd56qBJyxcclxuICAgICAgICAgICAgY246ICfnm7jmkp4nLFxyXG4gICAgICAgICAgICBrbzogJ+yepe2MkCDqsrnss5DshJwg7YSw7KeQJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gU2hpbnJ5dSBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVJveWFsTWVuYWdlcmllLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTaGlucnl1IEFraCBSaGFpJzogJzFGQTYnLCAvLyBTa3kgbGFzZXJzIGFsb25nc2lkZSBBa2ggTW9ybi5cclxuICAgICdTaGlucnl1IEJsYXppbmcgVHJhaWwnOiAnMjIxQScsIC8vIFJlY3RhbmdsZSBBb0VzLCBpbnRlcm1pc3Npb24gYWRkcy5cclxuICAgICdTaGlucnl1IENvbGxhcHNlJzogJzIyMTgnLCAvLyBDaXJjbGUgQW9FcywgaW50ZXJtaXNzaW9uIGFkZHNcclxuICAgICdTaGlucnl1IERyYWdvbmZpc3QnOiAnMjRGMCcsIC8vIEdpYW50IHB1bmNoeSBjaXJjbGUgaW4gdGhlIGNlbnRlci5cclxuICAgICdTaGlucnl1IEVhcnRoIEJyZWF0aCc6ICcxRjlEJywgLy8gQ29uYWwgYXR0YWNrcyB0aGF0IGFyZW4ndCBhY3R1YWxseSBFYXJ0aCBTaGFrZXJzLlxyXG4gICAgJ1NoaW5yeXUgR3lyZSBDaGFyZ2UnOiAnMUZBOCcsIC8vIEdyZWVuIGRpdmUgYm9tYiBhdHRhY2suXHJcbiAgICAnU2hpbnJ5dSBTcGlrZXNpY2xlJzogJzFGQWAnLCAvLyBCbHVlLWdyZWVuIGxpbmUgYXR0YWNrcyBmcm9tIGJlaGluZC5cclxuICAgICdTaGlucnl1IFRhaWwgU2xhcCc6ICcxRjkzJywgLy8gUmVkIHNxdWFyZXMgaW5kaWNhdGluZyB0aGUgdGFpbCdzIGxhbmRpbmcgc3BvdHMuXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdTaGlucnl1IExldmluYm9sdCc6ICcxRjlDJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEljeSBmbG9vciBhdHRhY2suXHJcbiAgICAgIGlkOiAnU2hpbnJ5dSBEaWFtb25kIER1c3QnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBUaGluIEljZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMzhGJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdTbGlkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5ruR44Gj44GfJyxcclxuICAgICAgICAgICAgY246ICfmu5HokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGlucnl1IFRpZGFsIFdhdmUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcxRjhCJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1B1c2hlZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VzY2h1YnN0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBwb3Vzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+iQveOBoeOBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEtub2NrYmFjayBmcm9tIGNlbnRlci5cclxuICAgICAgaWQ6ICdTaGlucnl1IEFlcmlhbCBCbGFzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzFGOTAnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXNjaHVic3QhJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzZXIgIScsXHJcbiAgICAgICAgICAgIGphOiAn6JC944Gh44GfJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gU3VzYW5vIEV4dHJlbWVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVBvb2xPZlRyaWJ1dGVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTdXNFeCBDaHVybmluZyc6ICcyMDNGJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdTdXNFeCBSYXNlbiBLYWlreW8nOiAnMjAyRScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gU3V6YWt1IE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuSGVsbHNLaWVyLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTdXpha3UgTm9ybWFsIEFzaGVzIFRvIEFzaGVzJzogJzMyMUYnLCAvLyBTY2FybGV0IExhZHkgYWRkLCByYWlkd2lkZSBleHBsb3Npb24gaWYgbm90IGtpbGxlZCBpbiB0aW1lXHJcbiAgICAnU3V6YWt1IE5vcm1hbCBGbGVldGluZyBTdW1tZXInOiAnMzIyMycsIC8vIENvbmUgQW9FIChyYW5kb21seSB0YXJnZXRlZClcclxuICAgICdTdXpha3UgTm9ybWFsIFdpbmcgQW5kIEEgUHJheWVyJzogJzMyMjUnLCAvLyBDaXJjbGUgQW9FcyBmcm9tIHVua2lsbGVkIHBsdW1lc1xyXG4gICAgJ1N1emFrdSBOb3JtYWwgUGhhbnRvbSBIYWxmJzogJzMyMzMnLCAvLyBHaWFudCBoYWxmLWFyZW5hIEFvRSBmb2xsb3ctdXAgYWZ0ZXIgdGFuayBidXN0ZXJcclxuICAgICdTdXpha3UgTm9ybWFsIFdlbGwgT2YgRmxhbWUnOiAnMzIzNicsIC8vIExhcmdlIHJlY3RhbmdsZSBBb0UgKHJhbmRvbWx5IHRhcmdldGVkKVxyXG4gICAgJ1N1emFrdSBOb3JtYWwgSG90c3BvdCc6ICczMjM4JywgLy8gUGxhdGZvcm0gZmlyZSB3aGVuIHRoZSBydW5lcyBhcmUgYWN0aXZhdGVkXHJcbiAgICAnU3V6YWt1IE5vcm1hbCBTd29vcCc6ICczMjNCJywgLy8gU3RhciBjcm9zcyBsaW5lIEFvRXNcclxuICAgICdTdXpha3UgTm9ybWFsIEJ1cm4nOiAnMzIzRCcsIC8vIFRvd2VyIG1lY2hhbmljIGZhaWx1cmUgb24gSW5jYW5kZXNjZW50IEludGVybHVkZSAocGFydHkgZmFpbHVyZSwgbm90IHBlcnNvbmFsKVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnU3V6YWt1IE5vcm1hbCBSZWtpbmRsZSc6ICczMjM1JywgLy8gUHVycGxlIHNwcmVhZCBjaXJjbGVzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1N1emFrdSBOb3JtYWwgUnV0aGxlc3MgUmVmcmFpbicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzMyMzAnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXNjaHVic3QhJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn6JC944Gh44GfJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBVbHRpbWEgV2VhcG9uIFVsdGltYXRlXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXZWFwb25zUmVmcmFpblVsdGltYXRlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdVV1UgU2VhcmluZyBXaW5kJzogJzJCNUMnLFxyXG4gICAgJ1VXVSBFcnVwdGlvbic6ICcyQjVBJyxcclxuICAgICdVV1UgV2VpZ2h0JzogJzJCNjUnLFxyXG4gICAgJ1VXVSBMYW5kc2xpZGUxJzogJzJCNzAnLFxyXG4gICAgJ1VXVSBMYW5kc2xpZGUyJzogJzJCNzEnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1VXVSBHcmVhdCBXaGlybHdpbmQnOiAnMkI0MScsXHJcbiAgICAnVVdVIFNsaXBzdHJlYW0nOiAnMkI1MycsXHJcbiAgICAnVVdVIFdpY2tlZCBXaGVlbCc6ICcyQjRFJyxcclxuICAgICdVV1UgV2lja2VkIFRvcm5hZG8nOiAnMkI0RicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1VXVSBXaW5kYnVybicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdFQicgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMixcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBGZWF0aGVybGFuY2UgZXhwbG9zaW9uLiAgSXQgc2VlbXMgbGlrZSB0aGUgcGVyc29uIHdobyBwb3BzIGl0IGlzIHRoZVxyXG4gICAgICAvLyBmaXJzdCBwZXJzb24gbGlzdGVkIGRhbWFnZS13aXNlLCBzbyB0aGV5IGFyZSBsaWtlbHkgdGhlIGN1bHByaXQuXHJcbiAgICAgIGlkOiAnVVdVIEZlYXRoZXJsYW5jZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzJCNDMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogNSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuc291cmNlIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBrRmxhZ0luc3RhbnREZWF0aCwgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaGFzRG9vbT86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuLy8gVUNVIC0gVGhlIFVuZW5kaW5nIENvaWwgT2YgQmFoYW11dCAoVWx0aW1hdGUpXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVVbmVuZGluZ0NvaWxPZkJhaGFtdXRVbHRpbWF0ZSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVUNVIEx1bmFyIER5bmFtbyc6ICcyNkJDJyxcclxuICAgICdVQ1UgSXJvbiBDaGFyaW90JzogJzI2QkInLFxyXG4gICAgJ1VDVSBFeGFmbGFyZSc6ICcyNkVGJyxcclxuICAgICdVQ1UgV2luZ3MgT2YgU2FsdmF0aW9uJzogJzI2Q0EnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgVHdpc3RlciBEZWF0aCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gSW5zdGFudCBkZWF0aCBoYXMgYSBzcGVjaWFsIGZsYWcgdmFsdWUsIGRpZmZlcmVudGlhdGluZ1xyXG4gICAgICAvLyBmcm9tIHRoZSBleHBsb3Npb24gZGFtYWdlIHlvdSB0YWtlIHdoZW4gc29tZWJvZHkgZWxzZVxyXG4gICAgICAvLyBwb3BzIG9uZS5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI2QUInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMsIGZsYWdzOiBrRmxhZ0luc3RhbnREZWF0aCB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdUd2lzdGVyIFBvcCcsXHJcbiAgICAgICAgICAgIGRlOiAnV2lyYmVsc3R1cm0gYmVyw7xocnQnLFxyXG4gICAgICAgICAgICBmcjogJ0FwcGFyaXRpb24gZGVzIHRvcm5hZGVzJyxcclxuICAgICAgICAgICAgamE6ICfjg4TjgqTjgrnjgr/jg7wnLFxyXG4gICAgICAgICAgICBjbjogJ+aXi+mjjicsXHJcbiAgICAgICAgICAgIGtvOiAn7ZqM7Jik66asIOuwn+ydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBUaGVybWlvbmljIEJ1cnN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjZCOScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdQaXp6YSBTbGljZScsXHJcbiAgICAgICAgICAgIGRlOiAnUGl6emFzdMO8Y2snLFxyXG4gICAgICAgICAgICBmcjogJ1BhcnRzIGRlIHBpenphJyxcclxuICAgICAgICAgICAgamE6ICfjgrXjg7zjg5/jgqrjg4vjg4Pjgq/jg5Djg7zjgrnjg4gnLFxyXG4gICAgICAgICAgICBjbjogJ+WkqeW0qeWcsOijgicsXHJcbiAgICAgICAgICAgIGtvOiAn7J6l7YyQ7JeQIOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBDaGFpbiBMaWdodG5pbmcnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNkM4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBJdCdzIGhhcmQgdG8gYXNzaWduIGJsYW1lIGZvciBsaWdodG5pbmcuICBUaGUgZGVidWZmc1xyXG4gICAgICAgIC8vIGdvIG91dCBhbmQgdGhlbiBleHBsb2RlIGluIG9yZGVyLCBidXQgdGhlIGF0dGFja2VyIGlzXHJcbiAgICAgICAgLy8gdGhlIGRyYWdvbiBhbmQgbm90IHRoZSBwbGF5ZXIuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2hpdCBieSBsaWdodG5pbmcnLFxyXG4gICAgICAgICAgICBkZTogJ3ZvbSBCbGl0eiBnZXRyb2ZmZW4nLFxyXG4gICAgICAgICAgICBmcjogJ2ZyYXBww6koZSkgcGFyIGxhIGZvdWRyZScsXHJcbiAgICAgICAgICAgIGphOiAn44OB44Kn44Kk44Oz44Op44Kk44OI44OL44Oz44KwJyxcclxuICAgICAgICAgICAgY246ICfpm7flhYnpk74nLFxyXG4gICAgICAgICAgICBrbzogJ+uyiOqwnCDrp57snYwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgQnVybnMnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnRkEnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIFNsdWRnZScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxMUYnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIERvb20gR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdEMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0Rvb20gPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgRG9vbSBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJ0QyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlcmUgaXMgbm8gY2FsbG91dCBmb3IgXCJ5b3UgZm9yZ290IHRvIGNsZWFyIGRvb21cIi4gIFRoZSBsb2dzIGxvb2tcclxuICAgICAgLy8gc29tZXRoaW5nIGxpa2UgdGhpczpcclxuICAgICAgLy8gICBbMjA6MDI6MzAuNTY0XSAxQTpPa29ub21pIFlha2kgZ2FpbnMgdGhlIGVmZmVjdCBvZiBEb29tIGZyb20gIGZvciA2LjAwIFNlY29uZHMuXHJcbiAgICAgIC8vICAgWzIwOjAyOjM2LjQ0M10gMUU6T2tvbm9taSBZYWtpIGxvc2VzIHRoZSBlZmZlY3Qgb2YgUHJvdGVjdCBmcm9tIFRha28gWWFraS5cclxuICAgICAgLy8gICBbMjA6MDI6MzYuNDQzXSAxRTpPa29ub21pIFlha2kgbG9zZXMgdGhlIGVmZmVjdCBvZiBEb29tIGZyb20gLlxyXG4gICAgICAvLyAgIFsyMDowMjozOC41MjVdIDE5Ok9rb25vbWkgWWFraSB3YXMgZGVmZWF0ZWQgYnkgRmlyZWhvcm4uXHJcbiAgICAgIC8vIEluIG90aGVyIHdvcmRzLCBkb29tIGVmZmVjdCBpcyByZW1vdmVkICsvLSBuZXR3b3JrIGxhdGVuY3ksIGJ1dCBjYW4ndFxyXG4gICAgICAvLyB0ZWxsIHVudGlsIGxhdGVyIHRoYXQgaXQgd2FzIGEgZGVhdGguICBBcmd1YWJseSwgdGhpcyBjb3VsZCBoYXZlIGJlZW4gYVxyXG4gICAgICAvLyBjbG9zZS1idXQtc3VjY2Vzc2Z1bCBjbGVhcmluZyBvZiBkb29tIGFzIHdlbGwuICBJdCBsb29rcyB0aGUgc2FtZS5cclxuICAgICAgLy8gU3RyYXRlZ3k6IGlmIHlvdSBoYXZlbid0IGNsZWFyZWQgZG9vbSB3aXRoIDEgc2Vjb25kIHRvIGdvIHRoZW4geW91IHByb2JhYmx5XHJcbiAgICAgIC8vIGRpZWQgdG8gZG9vbS4gIFlvdSBjYW4gZ2V0IG5vbi1mYXRhbGx5IGljZWJhbGxlZCBvciBhdXRvJ2QgaW4gYmV0d2VlbixcclxuICAgICAgLy8gYnV0IHdoYXQgY2FuIHlvdSBkby5cclxuICAgICAgaWQ6ICdVQ1UgRG9vbSBEZWF0aCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdEMicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMSxcclxuICAgICAgZGVhdGhSZWFzb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0Rvb20gfHwgIWRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgbGV0IHRleHQ7XHJcbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pO1xyXG4gICAgICAgIGlmIChkdXJhdGlvbiA8IDkpXHJcbiAgICAgICAgICB0ZXh0ID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMxJztcclxuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA8IDE0KVxyXG4gICAgICAgICAgdGV4dCA9IG1hdGNoZXMuZWZmZWN0ICsgJyAjMic7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgdGV4dCA9IG1hdGNoZXMuZWZmZWN0ICsgJyAjMyc7XHJcbiAgICAgICAgcmV0dXJuIHsgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHRleHQgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRoZSBDb3BpZWQgRmFjdG9yeVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ29waWVkRmFjdG9yeSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgQm9tYic6ICc0OEI0JyxcclxuICAgIC8vIE1ha2Ugc3VyZSBlbmVtaWVzIGFyZSBpZ25vcmVkIG9uIHRoZXNlXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgQm9tYmFyZG1lbnQnOiAnNDhCOCcsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgQXNzYXVsdCc6ICc0OEI2JyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEhpZ2gtUG93ZXJlZCBMYXNlcic6ICc0OEM1JyxcclxuICAgICdDb3BpZWQgU2VyaWFsIFNpZGVzdHJpa2luZyBTcGluIFNwaW4gMSc6ICc0OENCJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIFNpZGVzdHJpa2luZyBTcGluIDInOiAnNDhDQycsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBDZW50cmlmdWdhbCBTcGluJzogJzQ4QzknLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgQWlyLVRvLVN1cmZhY2UgRW5lcmd5JzogJzQ4QkEnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgSGlnaC1DYWxpYmVyIExhc2VyJzogJzQ4RkEnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgMSc6ICc0OEJDJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDInOiAnNDhCRCcsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyAzJzogJzQ4QkUnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgNCc6ICc0OEMwJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDUnOiAnNDhDMScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyA2JzogJzQ4QzInLFxyXG5cclxuICAgICdDb3BpZWQgVHJhc2ggRW5lcmd5IEJvbWInOiAnNDkxRCcsXHJcbiAgICAnQ29waWVkIFRyYXNoIEZyb250YWwgU29tZXJzYXVsdCc6ICc0OTFCJyxcclxuICAgICdDb3BpZWQgVHJhc2ggSGlnaC1GcmVxdWVuY3kgTGFzZXInOiAnNDkxRScsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgU2hvY2tpbmcgRGlzY2hhcmdlJzogJzQ4MEInLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgMSc6ICc0OUM1JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDInOiAnNDlDNicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCAzJzogJzQ5QzcnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgNCc6ICc0ODBGJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDUnOiAnNDgxMCcsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCA2JzogJzQ4MTEnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIFJpbmcgTGFzZXIgMSc6ICc0ODAyJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFJpbmcgTGFzZXIgMic6ICc0ODAzJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFJpbmcgTGFzZXIgMyc6ICc0ODA0JyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBUb3dlcmZhbGwnOiAnNDgxMycsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgRmlyZS1SZWlzdGFuY2UgVGVzdCAxJzogJzQ4MTYnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgRmlyZS1SZWlzdGFuY2UgVGVzdCAyJzogJzQ4MTcnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgRmlyZS1SZWlzdGFuY2UgVGVzdCAzJzogJzQ4MTgnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIE9pbCBXZWxsJzogJzQ4MUInLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgRWxlY3Ryb21hZ25ldGljIFB1bHNlJzogJzQ4MTknLFxyXG4gICAgLy8gVE9ETzogd2hhdCdzIHRoZSBlbGVjdHJpZmllZCBmbG9vciB3aXRoIGNvbnZleW9yIGJlbHRzP1xyXG5cclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyAxJzogJzQ5MzcnLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDInOiAnNDkzOCcsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgMyc6ICc0OTM5JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyA0JzogJzQ5M0EnLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDUnOiAnNDkzNycsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggTGFzZXIgVHVycmV0JzogJzQ4RTYnLFxyXG5cclxuICAgICdDb3BpZWQgRmxpZ2h0IFVuaXQgQXJlYSBCb21iaW5nJzogJzQ5NDMnLFxyXG4gICAgJ0NvcGllZCBGbGlnaHQgVW5pdCBMaWdodGZhc3QgQmxhZGUnOiAnNDk0MCcsXHJcblxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBTbWFzaCAxJzogJzQ3MjknLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBTbWFzaCAyJzogJzQ3MjgnLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBTbWFzaCAzJzogJzQ3MkYnLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBTbWFzaCA0JzogJzQ3MzEnLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBTbWFzaCA1JzogJzQ3MkInLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBTbWFzaCA2JzogJzQ3MkQnLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTWFyeCBTbWFzaCA3JzogJzQ3MzInLFxyXG5cclxuICAgICdDb3BpZWQgRW5nZWxzIEluY2VuZGlhcnkgQm9tYmluZyc6ICc0NzM5JyxcclxuICAgICdDb3BpZWQgRW5nZWxzIEd1aWRlZCBNaXNzaWxlJzogJzQ3MzYnLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgU3VyZmFjZSBNaXNzaWxlJzogJzQ3MzQnLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgTGFzZXIgU2lnaHQnOiAnNDczQicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBGcmFjayc6ICc0NzREJyxcclxuXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IENydXNoJzogJzQ4RkMnLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgQ3J1c2hpbmcgV2hlZWwnOiAnNDc0QicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFRocnVzdCc6ICc0OEZDJyxcclxuXHJcbiAgICAnQ29waWVkIDlTIExhc2VyIFN1cHByZXNzaW9uJzogJzQ4RTAnLCAvLyBDYW5ub25zXHJcbiAgICAnQ29waWVkIDlTIEJhbGxpc3RpYyBJbXBhY3QgMSc6ICc0OTc0JyxcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCAyJzogJzQ4REMnLFxyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDMnOiAnNDhFNCcsXHJcbiAgICAnQ29waWVkIDlTIEJhbGxpc3RpYyBJbXBhY3QgNCc6ICc0OEUwJyxcclxuXHJcbiAgICAnQ29waWVkIDlTIE1hcnggSW1wYWN0JzogJzQ4RDQnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgVGFuayBEZXN0cnVjdGlvbiAxJzogJzQ4RTgnLFxyXG4gICAgJ0NvcGllZCA5UyBUYW5rIERlc3RydWN0aW9uIDInOiAnNDhFOScsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBTZXJpYWwgU3BpbiAxJzogJzQ4QTUnLFxyXG4gICAgJ0NvcGllZCA5UyBTZXJpYWwgU3BpbiAyJzogJzQ4QTcnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ydC1SYW5nZSBNaXNzaWxlJzogJzQ4MTUnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiA1MDkzIHRha2luZyBIaWdoLVBvd2VyZWQgTGFzZXIgd2l0aCBhIHZ1bG4gKGJlY2F1c2Ugb2YgdGFraW5nIHR3bylcclxuLy8gVE9ETzogNEZCNSB0YWtpbmcgSGlnaC1Qb3dlcmVkIExhc2VyIHdpdGggYSB2dWxuIChiZWNhdXNlIG9mIHRha2luZyB0d28pXHJcbi8vIFRPRE86IDUwRDMgQWVyaWFsIFN1cHBvcnQ6IEJvbWJhcmRtZW50IGdvaW5nIG9mZiBmcm9tIGFkZFxyXG4vLyBUT0RPOiA1MjExIE1hbmV1dmVyOiBWb2x0IEFycmF5IG5vdCBnZXR0aW5nIGludGVycnVwdGVkXHJcbi8vIFRPRE86IDRGRjQvNEZGNSBPbmUgb2YgdGhlc2UgaXMgZmFpbGluZyBjaGVtaWNhbCBjb25mbGFncmF0aW9uXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHdyb25nIHRlbGVwb3J0ZXI/PyBtYXliZSA1MzYzP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVB1cHBldHNCdW5rZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1B1cHBldCBBZWdpcyBCZWFtIENhbm5vbnMgMSc6ICc1MDc0JywgLy8gcm90YXRpbmcgc2VwYXJhdGluZyB3aGl0ZSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEFlZ2lzIEJlYW0gQ2Fubm9ucyAyJzogJzUwNzUnLCAvLyByb3RhdGluZyBzZXBhcmF0aW5nIHdoaXRlIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQWVnaXMgQmVhbSBDYW5ub25zIDMnOiAnNTA3NicsIC8vIHJvdGF0aW5nIHNlcGFyYXRpbmcgd2hpdGUgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBBZWdpcyBDb2xsaWRlciBDYW5ub25zJzogJzUwN0UnLCAvLyByb3RhdGluZyByZWQgZ3JvdW5kIGFvZSBwaW53aGVlbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDEnOiAnNTA5MScsIC8vIGNoYXNpbmcgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDInOiAnNTA5MicsIC8vIGNoYXNpbmcgbGFzZXIgY2hhc2luZ1xyXG4gICAgJ1B1cHBldCBBZWdpcyBGbGlnaHQgUGF0aCc6ICc1MDhDJywgLy8gYmx1ZSBsaW5lIGFvZSBmcm9tIGZseWluZyB1bnRhcmdldGFibGUgYWRkc1xyXG4gICAgJ1B1cHBldCBBZWdpcyBSZWZyYWN0aW9uIENhbm5vbnMgMSc6ICc1MDgxJywgLy8gcmVmcmFjdGlvbiBjYW5ub25zIGJldHdlZW4gd2luZ3NcclxuICAgICdQdXBwZXQgQWVnaXMgTGlmZVxcJ3MgTGFzdCBTb25nJzogJzUzQjMnLCAvLyByaW5nIGFvZSB3aXRoIGdhcFxyXG4gICAgJ1B1cHBldCBMaWdodCBMb25nLUJhcnJlbGVkIExhc2VyJzogJzUyMTInLCAvLyBsaW5lIGFvZSBmcm9tIGFkZFxyXG4gICAgJ1B1cHBldCBMaWdodCBTdXJmYWNlIE1pc3NpbGUgSW1wYWN0JzogJzUyMEYnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgSW5jZW5kaWFyeSBCb21iaW5nJzogJzRGQjknLCAvLyBmaXJlIHB1ZGRsZSBpbml0aWFsXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNoYXJwIFR1cm4nOiAnNTA2RCcsIC8vIHNoYXJwIHR1cm4gZGFzaFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMSc6ICc0RkIxJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMic6ICc0RkIyJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMyc6ICc0RkIzJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTbGlkaW5nIFN3aXBlIDEnOiAnNTA2RicsIC8vIHJpZ2h0LWhhbmRlZCBzbGlkaW5nIHN3aXBlXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNsaWRpbmcgU3dpcGUgMic6ICc1MDcwJywgLy8gbGVmdC1oYW5kZWQgc2xpZGluZyBzd2lwZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBHdWlkZWQgTWlzc2lsZSc6ICc0RkI4JywgLy8gZ3JvdW5kIGFvZSBkdXJpbmcgQXJlYSBCb21iYXJkbWVudFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAxJzogJzRGQzAnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAyJzogJzRGQzEnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYmFyZG1lbnQnOiAnNEZGQycsIC8vIGNvbG9yZWQgbWFnaWMgaGFtbWVyLXkgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBSZXZvbHZpbmcgTGFzZXInOiAnNTAwMCcsIC8vIGdldCB1bmRlciBsYXNlclxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYic6ICc0RkZBJywgLy8gZ2V0dGluZyBoaXQgYnkgYmFsbCBkdXJpbmcgQWN0aXZlIFN1cHByZXNzaXZlIFVuaXRcclxuICAgICdQdXBwZXQgSGVhdnkgUjAxMCBMYXNlcic6ICc0RkYwJywgLy8gbGFzZXIgcG9kXHJcbiAgICAnUHVwcGV0IEhlYXZ5IFIwMzAgSGFtbWVyJzogJzRGRjEnLCAvLyBjaXJjbGUgYW9lIHBvZFxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEhpZ2gtUG93ZXJlZCBMYXNlcic6ICc1MEIxJywgLy8gbG9uZyBhb2UgaW4gdGhlIGhhbGx3YXkgc2VjdGlvblxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEVuZXJneSBCb21iJzogJzUwQjInLCAvLyBydW5uaW5nIGludG8gYSBmbG9hdGluZyBvcmJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaGFuaWNhbCBEaXNzZWN0aW9uJzogJzUxQjMnLCAvLyBzcGlubmluZyB2ZXJ0aWNhbCBsYXNlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBNZWNoYW5pY2FsIERlY2FwaXRhdGlvbic6ICc1MUI0JywgLy8gZ2V0IHVuZGVyIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVW50YXJnZXRlZCc6ICc1MUI3JywgLy8gdW50YXJnZXRlZCBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDEnOiAnNTFBQScsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDInOiAnNTFDQicsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAxJzogJzU0MUYnLCAvLyAyUCBwcmltZSBibGFkZSBnZXQgb3V0XHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAyJzogJzUxOTgnLCAvLyAyUC9wdXBwZXQgdGVsZXBvcnRpbmcvcmVwcm9kdWNlIHByaW1lIGJsYWRlIGdldCBvdXRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDEnOiAnNTQyMCcsIC8vIDJQIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDInOiAnNTE5OScsIC8vIDJQIHRlbGVwb3J0aW5nIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgSW4gMSc6ICc1NDIxJywgLy8gMlAgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEluIDInOiAnNTE5QScsIC8vIDJQL3B1cHBldCB0ZWxlcG9ydGluZy9yZXByb2R1Y2UgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgR3JvdW5kJzogJzUxQUUnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBjaXJjbGVcclxuICAgIC8vIFRoaXMgaXMuLi4gdG9vIG5vaXN5LlxyXG4gICAgLy8gJ1B1cHBldCBDb21wb3VuZCAyUCBGb3VyIFBhcnRzIFJlc29sdmUgMSc6ICc1MUEwJywgLy8gZm91ciBwYXJ0cyByZXNvbHZlIGp1bXBcclxuICAgIC8vICdQdXBwZXQgQ29tcG91bmQgMlAgRm91ciBQYXJ0cyBSZXNvbHZlIDInOiAnNTE5RicsIC8vIGZvdXIgcGFydHMgcmVzb2x2ZSBjbGVhdmVcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdQdXBwZXQgSGVhdnkgVXBwZXIgTGFzZXIgMSc6ICc1MDg3JywgLy8gdXBwZXIgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBVcHBlciBMYXNlciAyJzogJzRGRjcnLCAvLyB1cHBlciBsYXNlciBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDEnOiAnNTA4NicsIC8vIGxvd2VyIGxhc2VyIGZpcnN0IHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciAyJzogJzRGRjYnLCAvLyBsb3dlciBsYXNlciBmaXJzdCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgMyc6ICc1MDg4JywgLy8gbG93ZXIgbGFzZXIgc2Vjb25kIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA0JzogJzRGRjgnLCAvLyBsb3dlciBsYXNlciBzZWNvbmQgc2VjdGlvbiBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDUnOiAnNTA4OScsIC8vIGxvd2VyIGxhc2VyIHRoaXJkIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA2JzogJzRGRjknLCAvLyBsb3dlciBsYXNlciB0aGlyZCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgQ29tcG91bmQgSW5jb25ncnVvdXMgU3Bpbic6ICc1MUIyJywgLy8gZmluZCB0aGUgc2FmZSBzcG90IGRvdWJsZSBkYXNoXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdQdXBwZXQgQnVybnMnOiAnMTBCJywgLy8gc3RhbmRpbmcgaW4gbWFueSB2YXJpb3VzIGZpcmUgYW9lc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBUaGlzIGlzIHByZXR0eSBsYXJnZSBhbmQgZ2V0dGluZyBoaXQgYnkgaW5pdGlhbCB3aXRob3V0IGJ1cm5zIHNlZW1zIGZpbmUuXHJcbiAgICAvLyAnUHVwcGV0IExpZ2h0IEhvbWluZyBNaXNzaWxlIEltcGFjdCc6ICc1MjEwJywgLy8gdGFyZ2V0ZWQgZmlyZSBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgSGVhdnkgVW5jb252ZW50aW9uYWwgVm9sdGFnZSc6ICc1MDA0JyxcclxuICAgIC8vIFByZXR0eSBub2lzeS5cclxuICAgICdQdXBwZXQgTWFuZXV2ZXIgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzUwMDInLCAvLyB0YW5rIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVGFyZ2V0ZWQnOiAnNTFCNicsIC8vIHRhcmdldGVkIHNwcmVhZCBtYXJrZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBUYW5rJzogJzUxQUUnLCAvLyB0YXJnZXRlZCBzcHJlYWQgcG9kIGxhc2VyIG9uIG5vbi10YW5rXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdQdXBwZXQgQWVnaXMgQW50aS1QZXJzb25uZWwgTGFzZXInOiAnNTA5MCcsIC8vIHRhbmsgYnVzdGVyIG1hcmtlclxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBQcmVjaXNpb24tR3VpZGVkIE1pc3NpbGUnOiAnNEZDNScsXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgVGFuayc6ICc1MUFEJywgLy8gdGFyZ2V0ZWQgcG9kIGxhc2VyIG9uIHRhbmtcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBtaXNzaW5nIFNob2NrIEJsYWNrIDI/XHJcbi8vIFRPRE86IFdoaXRlL0JsYWNrIERpc3NvbmFuY2UgZGFtYWdlIGlzIG1heWJlIHdoZW4gZmxhZ3MgZW5kIGluIDAzP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVRvd2VyQXRQYXJhZGlnbXNCcmVhY2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBDZW50ZXIgMSc6ICc1RUE3JywgLy8gQ2VudGVyIGFvZSBmcm9tIEtuYXZlIGFuZCBjbG9uZXNcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgQ2VudGVyIDInOiAnNjBDOCcsIC8vIENlbnRlciBhb2UgZnJvbSBLbmF2ZSBkdXJpbmcgbHVuZ2VcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSAxJzogJzVFQTUnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBhbmQgY2xvbmVzXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgMic6ICc1RUE2JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgYW5kIGNsb25lc1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDMnOiAnNjBDNicsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGR1cmluZyBsdW5nZVxyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDQnOiAnNjBDNycsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGR1cmluZyBsdW5nZVxyXG4gICAgJ1Rvd2VyIEtuYXZlIEJ1cnN0JzogJzVFRDQnLCAvLyBTcGhlcm9pZCBLbmF2aXNoIEJ1bGxldHMgY29sbGlzaW9uXHJcbiAgICAnVG93ZXIgS25hdmUgTWFnaWMgQmFycmFnZSc6ICc1RUFDJywgLy8gU3BoZXJvaWQgbGluZSBhb2VzXHJcbiAgICAnVG93ZXIgSGFuc2VsIFJlcGF5JzogJzVDNzAnLCAvLyBTaGllbGQgZGFtYWdlXHJcbiAgICAnVG93ZXIgSGFuc2VsIEV4cGxvc2lvbic6ICc1QzY3JywgLy8gQmVpbmcgaGl0IGJ5IE1hZ2ljIEJ1bGxldCBkdXJpbmcgUGFzc2luZyBMYW5jZVxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBJbXBhY3QnOiAnNUM1QycsIC8vIEJlaW5nIGhpdCBieSBNYWdpY2FsIENvbmZsdWVuY2UgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgMSc6ICc1QzZDJywgLy8gRHVhbCBjbGVhdmVzIHdpdGhvdXQgdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCAyJzogJzVDNkQnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aG91dCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDMnOiAnNUM2RScsIC8vIER1YWwgY2xlYXZlcyB3aXRoIHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgNCc6ICc1QzZGJywgLy8gRHVhbCBjbGVhdmVzIHdpdGggdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIFBhc3NpbmcgTGFuY2UnOiAnNUM2NicsIC8vIFRoZSBQYXNzaW5nIExhbmNlIGNoYXJnZSBpdHNlbGZcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAxJzogJzU1QjMnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAyJzogJzVDNUQnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAzJzogJzVDNUUnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgSHVuZ3J5IExhbmNlIDEnOiAnNUM3MScsIC8vIDJ4bGFyZ2UgY29uYWwgY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgSHVuZ3J5IExhbmNlIDInOiAnNUM3MicsIC8vIDJ4bGFyZ2UgY29uYWwgY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBGbGlnaHQgVW5pdCBMaWdodGZhc3QgQmxhZGUnOiAnNUJGRScsIC8vIGxhcmdlIHJvb20gY2xlYXZlXHJcbiAgICAnVG93ZXIgRmxpZ2h0IFVuaXQgU3RhbmRhcmQgTGFzZXInOiAnNUJGRicsIC8vIHRyYWNraW5nIGxhc2VyXHJcbiAgICAnVG93ZXIgMlAgV2hpcmxpbmcgQXNzYXVsdCc6ICc1QkZCJywgLy8gbGluZSBhb2UgZnJvbSAyUCBjbG9uZXNcclxuICAgICdUb3dlciAyUCBCYWxhbmNlZCBFZGdlJzogJzVCRkEnLCAvLyBjaXJjdWxhciBhb2Ugb24gMlAgY2xvbmVzXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAxJzogJzYwMDYnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAyJzogJzYwMDcnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAzJzogJzYwMDgnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA0JzogJzYwMDknLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA1JzogJzYzMTAnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA2JzogJzYzMTEnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA3JzogJzYzMTInLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA4JzogJzYzMTMnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgU2hvY2sgV2hpdGUgMSc6ICc2MDBGJywgLy8gd2hpdGUgc2hvY2t3YXZlIGNpcmNsZSBub3QgZHJvcHBlZCBvbiBibGFja1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFNob2NrIFdoaXRlIDInOiAnNjAxMCcsIC8vIHdoaXRlIHNob2Nrd2F2ZSBjaXJjbGUgbm90IGRyb3BwZWQgb24gYmxhY2tcclxuICAgICdUb3dlciBSZWQgR2lybCBTaG9jayBCbGFjayAxJzogJzYwMTEnLCAvLyBibGFjayBzaG9ja3dhdmUgY2lyY2xlIG5vdCBkcm9wcGVkIG9uIHdoaXRlXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgV2hpdGUgMSc6ICc2MDFGJywgLy8gYmVpbmcgaGl0IGJ5IGEgd2hpdGUgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBXaGl0ZSAyJzogJzYwMjEnLCAvLyBiZWluZyBoaXQgYnkgYSB3aGl0ZSBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IEJsYWNrIDEnOiAnNjAyMCcsIC8vIGJlaW5nIGhpdCBieSBhIGJsYWNrIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgQmxhY2sgMic6ICc2MDIyJywgLy8gYmVpbmcgaGl0IGJ5IGEgYmxhY2sgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBXaXBlIFdoaXRlJzogJzYwMEMnLCAvLyBub3QgbGluZSBvZiBzaWdodGluZyB0aGUgd2hpdGUgbWV0ZW9yXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgV2lwZSBCbGFjayc6ICc2MDBEJywgLy8gbm90IGxpbmUgb2Ygc2lnaHRpbmcgdGhlIGJsYWNrIG1ldGVvclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIERpZmZ1c2UgRW5lcmd5JzogJzYwNTYnLCAvLyByb3RhdGluZyBjbG9uZSBidWJibGUgY2xlYXZlc1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFB5bG9uIEJpZyBFeHBsb3Npb24nOiAnNjAyNycsIC8vIG5vdCBraWxsaW5nIGEgcHlsb24gZHVyaW5nIGhhY2tpbmcgcGhhc2VcclxuICAgICdUb3dlciBSZWQgR2lybCBQeWxvbiBFeHBsb3Npb24nOiAnNjAyNicsIC8vIHB5bG9uIGR1cmluZyBDaGlsZCdzIHBsYXlcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIE1pZGRsZSc6ICc1QzAyJywgLy8gbWlkZGxlIGxhc2VyXHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyBTaWRlcyc6ICc1QzA1JywgLy8gc2lkZXMgbGFzZXJcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIDMnOiAnNjA3OCcsIC8vIGdvZXMgd2l0aCA1QzAxXHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyA0JzogJzYwNzknLCAvLyBnb2VzIHdpdGggNUMwNFxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIEVuZXJneSBCb21iJzogJzVDMDUnLCAvLyBwaW5rIGJ1YmJsZVxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTWFkZSBNYWdpYyBSaWdodCc6ICc1QkQ3JywgLy8gcm90YXRpbmcgd2hlZWwgZ29pbmcgcmlnaHRcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIE1hZGUgTWFnaWMgTGVmdCc6ICc1QkQ2JywgLy8gcm90YXRpbmcgd2hlZWwgZ29pbmcgbGVmdFxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTGlnaHRlciBOb3RlJzogJzVCREEnLCAvLyBsaWdodGVyIG5vdGUgbW92aW5nIGFvZXNcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIE1hZ2ljYWwgSW50ZXJmZXJlbmNlJzogJzVCRDUnLCAvLyBsYXNlcnMgZHVyaW5nIFJoeXRobSBSaW5nc1xyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgU2NhdHRlcmVkIE1hZ2ljJzogJzVCREYnLCAvLyBjaXJjbGUgYW9lcyBmcm9tIFNlZWQgT2YgTWFnaWNcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBVbmV2ZW4gRm90dGluZyc6ICc1QkUyJywgLy8gYnVpbGRpbmcgZnJvbSBSZWNyZWF0ZSBTdHJ1Y3R1cmVcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBDcmFzaCc6ICc1QkU1JywgLy8gdHJhaW5zIGZyb20gTWl4ZWQgU2lnbmFsc1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIEhlYXZ5IEFybXMgMSc6ICc1QkVEJywgLy8gaGVhdnkgYXJtcyBmcm9udC9iYWNrIGF0dGFja1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIEhlYXZ5IEFybXMgMic6ICc1QkVGJywgLy8gaGVhdnkgYXJtcyBzaWRlcyBhdHRhY2tcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBFbmVyZ3kgU2NhdHRlcmVkIE1hZ2ljJzogJzVCRTgnLCAvLyBvcmJzIGZyb20gUmVkIEdpcmwgYnkgdHJhaW5cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBQbGFjZSBPZiBQb3dlcic6ICc1QzBEJywgLy8gaW5zdGFkZWF0aCBtaWRkbGUgY2lyY2xlIGJlZm9yZSBibGFjay93aGl0ZSByaW5nc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVG93ZXIgS25hdmUgTWFnaWMgQXJ0aWxsZXJ5IEFscGhhJzogJzVFQUInLCAvLyBTcHJlYWRcclxuICAgICdUb3dlciBIYW5zZWwgU2VlZCBPZiBNYWdpYyBBbHBoYSc6ICc1QzYxJywgLy8gU3ByZWFkXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUb3dlciBLbmF2ZSBNYWdpYyBBcnRpbGxlcnkgQmV0YSc6ICc1RUIzJywgLy8gVGFua2J1c3RlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIE1hbmlwdWxhdGUgRW5lcmd5JzogJzYwMUEnLCAvLyBUYW5rYnVzdGVyXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBEYXJrZXIgTm90ZSc6ICc1QkRDJywgLy8gVGFua2J1c3RlclxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUb3dlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gNUVCMSA9IEtuYXZlIEx1bmdlXHJcbiAgICAgIC8vIDVCRjIgPSBIZXIgSW5mbG9yZXNlbmNlIFNob2Nrd2F2ZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNUVCMScsICc1QkYyJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Ba2FkYWVtaWFBbnlkZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FueWRlciBBY3JpZCBTdHJlYW0nOiAnNDMwNCcsXHJcbiAgICAnQW55ZGVyIFdhdGVyc3BvdXQnOiAnNDMwNicsXHJcbiAgICAnQW55ZGVyIFJhZ2luZyBXYXRlcnMnOiAnNDMwMicsXHJcbiAgICAnQW55ZGVyIFZpb2xlbnQgQnJlYWNoJzogJzQzMDUnLFxyXG4gICAgJ0FueWRlciBUaWRhbCBHdWlsbG90aW5lIDEnOiAnM0UwOCcsXHJcbiAgICAnQW55ZGVyIFRpZGFsIEd1aWxsb3RpbmUgMic6ICczRTBBJyxcclxuICAgICdBbnlkZXIgUGVsYWdpYyBDbGVhdmVyIDEnOiAnM0UwOScsXHJcbiAgICAnQW55ZGVyIFBlbGFnaWMgQ2xlYXZlciAyJzogJzNFMEInLFxyXG4gICAgJ0FueWRlciBBcXVhdGljIExhbmNlJzogJzNFMDUnLFxyXG4gICAgJ0FueWRlciBTeXJ1cCBTcG91dCc6ICc0MzA4JyxcclxuICAgICdBbnlkZXIgTmVlZGxlIFN0b3JtJzogJzQzMDknLFxyXG4gICAgJ0FueWRlciBFeHRlbnNpYmxlIFRlbmRyaWxzIDEnOiAnM0UxMCcsXHJcbiAgICAnQW55ZGVyIEV4dGVuc2libGUgVGVuZHJpbHMgMic6ICczRTExJyxcclxuICAgICdBbnlkZXIgUHV0cmlkIEJyZWF0aCc6ICczRTEyJyxcclxuICAgICdBbnlkZXIgRGV0b25hdG9yJzogJzQzMEYnLFxyXG4gICAgJ0FueWRlciBEb21pbmlvbiBTbGFzaCc6ICc0MzBEJyxcclxuICAgICdBbnlkZXIgUXVhc2FyJzogJzQzMEInLFxyXG4gICAgJ0FueWRlciBEYXJrIEFycml2aXNtZSc6ICc0MzBFJyxcclxuICAgICdBbnlkZXIgVGh1bmRlcnN0b3JtJzogJzNFMUMnLFxyXG4gICAgJ0FueWRlciBXaW5kaW5nIEN1cnJlbnQnOiAnM0UxRicsXHJcbiAgICAvLyAzRTIwIGlzIGJlaW5nIGhpdCBieSB0aGUgZ3Jvd2luZyBvcmJzLCBtYXliZT9cclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFtYXVyb3QsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FtYXVyb3QgQnVybmluZyBTa3knOiAnMzU0QScsXHJcbiAgICAnQW1hdXJvdCBXaGFjayc6ICczNTNDJyxcclxuICAgICdBbWF1cm90IEFldGhlcnNwaWtlJzogJzM1M0InLFxyXG4gICAgJ0FtYXVyb3QgVmVuZW1vdXMgQnJlYXRoJzogJzNDQ0UnLFxyXG4gICAgJ0FtYXVyb3QgQ29zbWljIFNocmFwbmVsJzogJzREMjYnLFxyXG4gICAgJ0FtYXVyb3QgRWFydGhxdWFrZSc6ICczQ0NEJyxcclxuICAgICdBbWF1cm90IE1ldGVvciBSYWluJzogJzNDQzYnLFxyXG4gICAgJ0FtYXVyb3QgRmluYWwgU2t5JzogJzNDQ0InLFxyXG4gICAgJ0FtYXVyb3QgTWFsZXZvbGVuY2UnOiAnMzU0MScsXHJcbiAgICAnQW1hdXJvdCBUdXJuYWJvdXQnOiAnMzU0MicsXHJcbiAgICAnQW1hdXJvdCBTaWNrbHkgSW5mZXJubyc6ICczREUzJyxcclxuICAgICdBbWF1cm90IERpc3F1aWV0aW5nIEdsZWFtJzogJzM1NDYnLFxyXG4gICAgJ0FtYXVyb3QgQmxhY2sgRGVhdGgnOiAnMzU0MycsXHJcbiAgICAnQW1hdXJvdCBGb3JjZSBvZiBMb2F0aGluZyc6ICczNTQ0JyxcclxuICAgICdBbWF1cm90IERhbW5pbmcgUmF5IDEnOiAnM0UwMCcsXHJcbiAgICAnQW1hdXJvdCBEYW1uaW5nIFJheSAyJzogJzNFMDEnLFxyXG4gICAgJ0FtYXVyb3QgRGVhZGx5IFRlbnRhY2xlcyc6ICczNTQ3JyxcclxuICAgICdBbWF1cm90IE1pc2ZvcnR1bmUnOiAnM0NFMicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnQW1hdXJvdCBBcG9rYWx5cHNpcyc6ICczQ0Q3JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFuYW1uZXNpc0FueWRlcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBQaHVhYm8gU3BpbmUgTGFzaCc6ICc0RDFBJywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggQW5lbW9uZSBGYWxsaW5nIFJvY2snOiAnNEUzNycsIC8vIGdyb3VuZCBjaXJjbGUgYW9lIGZyb20gVHJlbmNoIEFuZW1vbmUgc2hvd2luZyB1cFxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggRGFnb25pdGUgU2V3ZXIgV2F0ZXInOiAnNEQxQycsIC8vIGZyb250YWwgY29uYWwgZnJvbSBUcmVuY2ggQW5lbW9uZSAoPyEpXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBZb3ZyYSBSb2NrIEhhcmQnOiAnNEQyMScsIC8vIHRhcmdldGVkIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFlvdnJhIFRvcnJlbnRpYWwgVG9ybWVudCc6ICc0RDIxJywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIEx1bWlub3VzIFJheSc6ICc0RTI3JywgLy8gVW5rbm93biBsaW5lIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFNpbnN0ZXIgQnViYmxlIEV4cGxvc2lvbic6ICc0QjZFJywgLy8gVW5rbm93biBleHBsb3Npb25zIGR1cmluZyBTY3J1dGlueVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFJlZmxlY3Rpb24nOiAnNEI2RicsIC8vIFVua25vd24gY29uYWwgYXR0YWNrIGR1cmluZyBTY3J1dGlueVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIENsZWFyb3V0IDEnOiAnNEI3NCcsIC8vIFVua25vd24gZnJvbnRhbCBjb25lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gQ2xlYXJvdXQgMic6ICc0QjZCJywgLy8gVW5rbm93biBmcm9udGFsIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBTZXRiYWNrIDEnOiAnNEI3NScsIC8vIFVua25vd24gcmVhciBjb25lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gU2V0YmFjayAyJzogJzVCNkMnLCAvLyBVbmtub3duIHJlYXIgY29uZVxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgQ2xpb25pZCBBY3JpZCBTdHJlYW0nOiAnNEQyNCcsIC8vIHRhcmdldGVkIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgQW55ZGVyIERpdmluZXIgRHJlYWRzdG9ybSc6ICc0RDI4JywgLy8gZ3JvdW5kIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyAyMDAwLU1pbmEgU3dpbmcnOiAnNEI1NScsIC8vIEt5a2xvcHMgZ2V0IG91dCBtZWNoYW5pY1xyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIFRlcnJpYmxlIEhhbW1lcic6ICc0QjVEJywgLy8gS3lrbG9wcyBIYW1tZXIvQmxhZGUgYWx0ZXJuYXRpbmcgc3F1YXJlc1xyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIFRlcnJpYmxlIEJsYWRlJzogJzRCNUUnLCAvLyBLeWtsb3BzIEhhbW1lci9CbGFkZSBhbHRlcm5hdGluZyBzcXVhcmVzXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgUmFnaW5nIEdsb3dlcic6ICc0QjU2JywgLy8gS3lrbG9wcyBsaW5lIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIEV5ZSBPZiBUaGUgQ3ljbG9uZSc6ICc0QjU3JywgLy8gS3lrbG9wcyBkb251dFxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgSGFycG9vbmVyIEh5ZHJvYmFsbCc6ICc0RDI2JywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBSdWtzaHMgU3dpZnQgU2hpZnQnOiAnNEI4MycsIC8vIFJ1a3NocyBEZWVtIHRlbGVwb3J0IE4vU1xyXG4gICAgJ0FuYW1uZXNpcyBSdWtzaHMgRGVwdGggR3JpcCBXYXZlYnJlYWtlcic6ICczM0Q0JywgLy8gUnVrc2hzIERlZW0gaGFuZCBhdHRhY2tzXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBSaXNpbmcgVGlkZSc6ICc0QjhCJywgLy8gUnVrc2hzIERlZW0gY3Jvc3MgYW9lXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBDb21tYW5kIEN1cnJlbnQnOiAnNEI4MicsIC8vIFJ1a3NocyBEZWVtIHByb3RlYW4taXNoIGdyb3VuZCBhb2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFh6b21pdCBNYW50bGUgRHJpbGwnOiAnNEQxOScsIC8vIGNoYXJnZSBhdHRhY2tcclxuICAgICdBbmFtbmVzaXMgSW8gT3VzaWEgQmFycmVsaW5nIFNtYXNoJzogJzRFMjQnLCAvLyBjaGFyZ2UgYXR0YWNrXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgV2FuZGVyZXJcXCdzIFB5cmUnOiAnNEI1RicsIC8vIEt5a2xvcHMgc3ByZWFkIGF0dGFja1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IE1pc3NpbmcgR3Jvd2luZyB0ZXRoZXJzIG9uIGJvc3MgMi5cclxuLy8gKE1heWJlIGdhdGhlciBwYXJ0eSBtZW1iZXIgbmFtZXMgb24gdGhlIHByZXZpb3VzIFRJSUlJTUJFRUVFRUVSIGNhc3QgZm9yIGNvbXBhcmlzb24/KVxyXG4vLyBUT0RPOiBGYWlsaW5nIHRvIGludGVycnVwdCBEb2huZmF1c3QgRnVhdGggb24gV2F0ZXJpbmcgV2hlZWwgY2FzdHM/XHJcbi8vICgxNTouLi4uLi4uLjpEb2huZmFzdCBGdWF0aDozREFBOldhdGVyaW5nIFdoZWVsOi4uLi4uLi4uOihcXHl7TmFtZX0pOilcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Eb2huTWhlZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRG9obiBNaGVnIEdleXNlcic6ICcyMjYwJywgLy8gV2F0ZXIgZXJ1cHRpb25zLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgSHlkcm9mYWxsJzogJzIyQkQnLCAvLyBHcm91bmQgQW9FIG1hcmtlciwgYm9zcyAxXHJcbiAgICAnRG9obiBNaGVnIExhdWdoaW5nIExlYXAnOiAnMjI5NCcsIC8vIEdyb3VuZCBBb0UgbWFya2VyLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgU3dpbmdlJzogJzIyQ0EnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0RvaG4gTWhlZyBDYW5vcHknOiAnM0RCMCcsIC8vIEZyb250YWwgY29uZSwgRG9obmZhdXN0IFJvd2FucyB0aHJvdWdob3V0IGluc3RhbmNlXHJcbiAgICAnRG9obiBNaGVnIFBpbmVjb25lIEJvbWInOiAnM0RCMScsIC8vIENpcmN1bGFyIGdyb3VuZCBBb0UgbWFya2VyLCBEb2huZmF1c3QgUm93YW5zIHRocm91Z2hvdXQgaW5zdGFuY2VcclxuICAgICdEb2huIE1oZWcgQmlsZSBCb21iYXJkbWVudCc6ICczNEVFJywgLy8gR3JvdW5kIEFvRSBtYXJrZXIsIGJvc3MgM1xyXG4gICAgJ0RvaG4gTWhlZyBDb3Jyb3NpdmUgQmlsZSc6ICczNEVDJywgLy8gRnJvbnRhbCBjb25lLCBib3NzIDNcclxuICAgICdEb2huIE1oZWcgRmxhaWxpbmcgVGVudGFjbGVzJzogJzM2ODEnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEb2huIE1oZWcgSW1wIENob2lyJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2RScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdEb2huIE1oZWcgVG9hZCBDaG9pcicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxQjcnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIEZvb2xcXCdzIFR1bWJsZScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxODMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogQmVyc2Vya2VyIDJuZC8zcmQgd2lsZCBhbmd1aXNoIHNob3VsZCBiZSBzaGFyZWQgd2l0aCBqdXN0IGEgcm9ja1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUhlcm9lc0dhdW50bGV0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUSEcgQmxhZGVcXCdzIEJlbmlzb24nOiAnNTIyOCcsIC8vIHBsZCBjb25hbFxyXG4gICAgJ1RIRyBBYnNvbHV0ZSBIb2x5JzogJzUyNEInLCAvLyB3aG0gdmVyeSBsYXJnZSBhb2VcclxuICAgICdUSEcgSGlzc2F0c3U6IEdva2EnOiAnNTIzRCcsIC8vIHNhbSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBXaG9sZSBTZWxmJzogJzUyMkQnLCAvLyBtbmsgd2lkZSBsaW5lIGFvZVxyXG4gICAgJ1RIRyBSYW5kZ3JpdGgnOiAnNTIzMicsIC8vIGRyZyB2ZXJ5IGJpZyBsaW5lIGFvZVxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMSc6ICc1MDYxJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBWYWN1dW0gQmxhZGUgMic6ICc1MDYyJywgLy8gU3BlY3RyYWwgVGhpZWYgY2lyY3VsYXIgZ3JvdW5kIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBDb3dhcmRcXCdzIEN1bm5pbmcnOiAnNEZENycsIC8vIFNwZWN0cmFsIFRoaWVmIENoaWNrZW4gS25pZmUgbGFzZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMSc6ICc0RkQxJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUGFwZXJjdXR0ZXIgMic6ICc0RkQyJywgLy8gU3BlY3RyYWwgVGhpZWYgbGluZSBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgUmluZyBvZiBEZWF0aCc6ICc1MjM2JywgLy8gZHJnIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1RIRyBMdW5hciBFY2xpcHNlJzogJzUyMjcnLCAvLyBwbGQgY2lyY3VsYXIgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIEdyYXZpdHknOiAnNTI0OCcsIC8vIGluayBtYWdlIGNpcmN1bGFyXHJcbiAgICAnVEhHIFJhaW4gb2YgTGlnaHQnOiAnNTI0MicsIC8vIGJhcmQgbGFyZ2UgY2lyY3VsZSBhb2VcclxuICAgICdUSEcgRG9vbWluZyBGb3JjZSc6ICc1MjM5JywgLy8gZHJnIGxpbmUgYW9lXHJcbiAgICAnVEhHIEFic29sdXRlIERhcmsgSUknOiAnNEY2MScsIC8vIE5lY3JvbWFuY2VyIDEyMCBkZWdyZWUgY29uYWxcclxuICAgICdUSEcgQnVyc3QnOiAnNTNCNycsIC8vIE5lY3JvbWFuY2VyIG5lY3JvYnVyc3Qgc21hbGwgem9tYmllIGV4cGxvc2lvblxyXG4gICAgJ1RIRyBQYWluIE1pcmUnOiAnNEZBNCcsIC8vIE5lY3JvbWFuY2VyIHZlcnkgbGFyZ2UgZ3JlZW4gYmxlZWQgcHVkZGxlXHJcbiAgICAnVEhHIERhcmsgRGVsdWdlJzogJzRGNUQnLCAvLyBOZWNyb21hbmNlciBncm91bmQgYW9lXHJcbiAgICAnVEhHIFRla2thIEdvamluJzogJzUyM0UnLCAvLyBzYW0gOTAgZGVncmVlIGNvbmFsXHJcbiAgICAnVEhHIFJhZ2luZyBTbGljZSAxJzogJzUyMEEnLCAvLyBCZXJzZXJrZXIgbGluZSBjbGVhdmVcclxuICAgICdUSEcgUmFnaW5nIFNsaWNlIDInOiAnNTIwQicsIC8vIEJlcnNlcmtlciBsaW5lIGNsZWF2ZVxyXG4gICAgJ1RIRyBXaWxkIFJhZ2UnOiAnNTIwMycsIC8vIEJlcnNlcmtlciBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdUSEcgQmxlZWRpbmcnOiAnODI4JywgLy8gU3RhbmRpbmcgaW4gdGhlIE5lY3JvbWFuY2VyIHB1ZGRsZSBvciBvdXRzaWRlIHRoZSBCZXJzZXJrZXIgYXJlbmFcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ1RIRyBUcnVseSBCZXJzZXJrJzogJzkwNicsIC8vIFN0YW5kaW5nIGluIHRoZSBjcmF0ZXIgdG9vIGxvbmdcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RIRyBBYnNvbHV0ZSBUaHVuZGVyIElWJzogJzUyNDUnLCAvLyBoZWFkbWFya2VyIGFvZSBmcm9tIGJsbVxyXG4gICAgJ1RIRyBNb29uZGl2ZXInOiAnNTIzMycsIC8vIGhlYWRtYXJrZXIgYW9lIGZyb20gZHJnXHJcbiAgICAnVEhHIFNwZWN0cmFsIEd1c3QnOiAnNTNDRicsIC8vIFNwZWN0cmFsIFRoaWVmIGhlYWRtYXJrZXIgYW9lXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUSEcgRmFsbGluZyBSb2NrJzogJzUyMDUnLCAvLyBCZXJzZXJrZXIgaGVhZG1hcmtlciBhb2UgdGhhdCBjcmVhdGVzIHJ1YmJsZVxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFRoaXMgc2hvdWxkIGFsd2F5cyBiZSBzaGFyZWQuICBPbiBhbGwgdGltZXMgYnV0IHRoZSAybmQgYW5kIDNyZCwgaXQncyBhIHBhcnR5IHNoYXJlLlxyXG4gICAgLy8gVE9ETzogb24gdGhlIDJuZCBhbmQgM3JkIHRpbWUgdGhpcyBzaG91bGQgb25seSBiZSBzaGFyZWQgd2l0aCBhIHJvY2suXHJcbiAgICAvLyBUT0RPOiBhbHRlcm5hdGl2ZWx5IHdhcm4gb24gdGFraW5nIG9uZSBvZiB0aGVzZSB3aXRoIGEgNDcyIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXAgZWZmZWN0XHJcbiAgICAnVEhHIFdpbGQgQW5ndWlzaCc6ICc1MjA5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEhHIFdpbGQgUmFtcGFnZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzUyMDcnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIFRoaXMgaXMgemVybyBkYW1hZ2UgaWYgeW91IGFyZSBpbiB0aGUgY3JhdGVyLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkhvbG1pbnN0ZXJTd2l0Y2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgVGh1bWJzY3Jldyc6ICczREM2JyxcclxuICAgICdIb2xtaW5zdGVyIFdvb2RlbiBob3JzZSc6ICczREM3JyxcclxuICAgICdIb2xtaW5zdGVyIExpZ2h0IFNob3QnOiAnM0RDOCcsXHJcbiAgICAnSG9sbWluc3RlciBIZXJldGljXFwncyBGb3JrJzogJzNEQ0UnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgSG9seSBXYXRlcic6ICczREQ0JyxcclxuICAgICdIb2xtaW5zdGVyIEZpZXJjZSBCZWF0aW5nIDEnOiAnM0RERCcsXHJcbiAgICAnSG9sbWluc3RlciBGaWVyY2UgQmVhdGluZyAyJzogJzNEREUnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgRmllcmNlIEJlYXRpbmcgMyc6ICczRERGJyxcclxuICAgICdIb2xtaW5zdGVyIENhdCBPXFwnIE5pbmUgVGFpbHMnOiAnM0RFMScsXHJcbiAgICAnSG9sbWluc3RlciBSaWdodCBLbm91dCc6ICczREU2JyxcclxuICAgICdIb2xtaW5zdGVyIExlZnQgS25vdXQnOiAnM0RFNycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnSG9sbWluc3RlciBBZXRoZXJzdXAnOiAnM0RFOScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdIb2xtaW5zdGVyIEZsYWdlbGxhdGlvbic6ICczREQ2JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgVGFwaGVwaG9iaWEnOiAnNDE4MScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYWxpa2Foc1dlbGwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ01hbGlrYWggRmFsbGluZyBSb2NrJzogJzNDRUEnLFxyXG4gICAgJ01hbGlrYWggV2VsbGJvcmUnOiAnM0NFRCcsXHJcbiAgICAnTWFsaWthaCBHZXlzZXIgRXJ1cHRpb24nOiAnM0NFRScsXHJcbiAgICAnTWFsaWthaCBTd2lmdCBTcGlsbCc6ICczQ0YwJyxcclxuICAgICdNYWxpa2FoIEJyZWFraW5nIFdoZWVsIDEnOiAnM0NGNScsXHJcbiAgICAnTWFsaWthaCBDcnlzdGFsIE5haWwnOiAnM0NGNycsXHJcbiAgICAnTWFsaWthaCBIZXJldGljXFwncyBGb3JrIDEnOiAnM0NGOScsXHJcbiAgICAnTWFsaWthaCBCcmVha2luZyBXaGVlbCAyJzogJzNDRkEnLFxyXG4gICAgJ01hbGlrYWggSGVyZXRpY1xcJ3MgRm9yayAyJzogJzNFMEUnLFxyXG4gICAgJ01hbGlrYWggRWFydGhzaGFrZSc6ICczRTM5JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogY291bGQgaW5jbHVkZSA1NDg0IE11ZG1hbiBSb2NreSBSb2xsIGFzIGEgc2hhcmVXYXJuLCBidXQgaXQncyBsb3cgZGFtYWdlIGFuZCBjb21tb24uXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuTWF0b3lhc1JlbGljdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTWF0b3lhIFJlbGljdCBXZXJld29vZCBPdmF0aW9uJzogJzU1MTgnLCAvLyBsaW5lIGFvZVxyXG4gICAgJ01hdG95YSBDYXZlIFRhcmFudHVsYSBIYXdrIEFwaXRveGluJzogJzU1MTknLCAvLyBiaWcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBTcHJpZ2dhbiBTdG9uZWJlYXJlciBSb21wJzogJzU1MUEnLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgU29ubnkgT2YgWmlnZ3kgSml0dGVyaW5nIEdsYXJlJzogJzU1MUMnLCAvLyBsb25nIG5hcnJvdyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIFF1YWdtaXJlJzogJzU0ODEnLCAvLyBNdWRtYW4gYW9lIHB1ZGRsZXNcclxuICAgICdNYXRveWEgTXVkbWFuIEJyaXR0bGUgQnJlY2NpYSAxJzogJzU0OEUnLCAvLyBleHBhbmRpbmcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gQnJpdHRsZSBCcmVjY2lhIDInOiAnNTQ4RicsIC8vIGV4cGFuZGluZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBCcml0dGxlIEJyZWNjaWEgMyc6ICc1NDkwJywgLy8gZXhwYW5kaW5nIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIE11ZCBCdWJibGUnOiAnNTQ4NycsIC8vIHN0YW5kaW5nIGluIG11ZCBwdWRkbGU/XHJcbiAgICAnTWF0b3lhIENhdmUgUHVnaWwgU2NyZXdkcml2ZXInOiAnNTUxRScsIC8vIGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBOaXhpZSBHdXJnbGUnOiAnNTk5MicsIC8vIE5peGllIHdhbGwgZmx1c2hcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIFB5cm9jbGFzdGljIFNob3QnOiAnNTdFQicsIC8vIHRoZSBsaW5lIGFvZXMgYXMgeW91IHJ1biB0byB0cmFzaFxyXG4gICAgJ01hdG95YSBSZWxpY3QgRmxhbiBGbG9vZCc6ICc1NTIzJywgLy8gYmlnIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUHlyb2R1Y3QgRWxkdGh1cnMgTWFzaCc6ICc1NTI3JywgLy8gbGluZSBhb2VcclxuICAgICdNYXR5b2EgUHlyb2R1Y3QgRWxkdGh1cnMgU3Bpbic6ICc1NTI4JywgLy8gdmVyeSBsYXJnZSBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBCYXZhcm9pcyBUaHVuZGVyIElJSSc6ICc1NTI1JywgLy8gY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgTWFyc2htYWxsb3cgQW5jaWVudCBBZXJvJzogJzU1MjQnLCAvLyB2ZXJ5IGxhcmdlIGxpbmUgZ3JvYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBQdWRkaW5nIEZpcmUgSUknOiAnNTUyMicsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIEhvdCBMYXZhJzogJzU3RTknLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1vbHRlbiBQaG9lYmFkIFZvbGNhbmljIERyb3AnOiAnNTdFOCcsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBNZWRpdW0gUmVhcic6ICc1OTFEJywgLy8ga25vY2tiYWNrIGludG8gc2FmZSBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgQmFyYmVxdWUgTGluZSc6ICc1OTE3JywgLy8gbGluZSBhb2UgZHVyaW5nIGJicVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIEJhcmJlcXVlIENpcmNsZSc6ICc1OTE4JywgLy8gY2lyY2xlIGFvZSBkdXJpbmcgYmJxXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgVG8gQSBDcmlzcCc6ICc1OTI1JywgLy8gZ2V0dGluZyB0byBjbG9zZSB0byBib3NzIGR1cmluZyBiYnFcclxuICAgICdNYXRveWEgTW90aGVyIFByb3hpZSBCdWZmZXQnOiAnNTkyNicsIC8vIEFlb2xpYW4gQ2F2ZSBTcHJpdGUgbGluZSBhb2UgKGlzIHRoaXMgYSBwdW4/KVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ01hdG95YSBOaXhpZSBTZWEgU2hhbnR5JzogJzU5OEMnLCAvLyBOb3QgdGFraW5nIHRoZSBwdWRkbGUgdXAgdG8gdGhlIHRvcD8gRmFpbGluZyBhZGQgZW5yYWdlP1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTWF0b3lhIE5peGllIENyYWNrJzogJzU5OTAnLCAvLyBOaXhpZSBDcmFzaC1TbWFzaCB0YW5rIHRldGhlcnNcclxuICAgICdNYXRveWEgTml4aWUgU3B1dHRlcic6ICc1OTkzJywgLy8gTml4aWUgc3ByZWFkIG1hcmtlclxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuTXRHdWxnLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdHdWxnIEltbW9sYXRpb24nOiAnNDFBQScsXHJcbiAgICAnR3VsZyBUYWlsIFNtYXNoJzogJzQxQUInLFxyXG4gICAgJ0d1bGcgSGVhdmVuc2xhc2gnOiAnNDFBOScsXHJcbiAgICAnR3VsZyBUeXBob29uIFdpbmcgMSc6ICczRDAwJyxcclxuICAgICdHdWxnIFR5cGhvb24gV2luZyAyJzogJzNEMDEnLFxyXG4gICAgJ0d1bGcgSHVycmljYW5lIFdpbmcnOiAnM0QwMycsXHJcbiAgICAnR3VsZyBFYXJ0aCBTaGFrZXInOiAnMzdGNScsXHJcbiAgICAnR3VsZyBTYW5jdGlmaWNhdGlvbic6ICc0MUFFJyxcclxuICAgICdHdWxnIEV4ZWdlc2lzJzogJzNEMDcnLFxyXG4gICAgJ0d1bGcgUGVyZmVjdCBDb250cml0aW9uJzogJzNEMEUnLFxyXG4gICAgJ0d1bGcgU2FuY3RpZmllZCBBZXJvJzogJzQxQUQnLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gMSc6ICczRDE2JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDInOiAnM0QxOCcsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyAzJzogJzQ2NjknLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gNCc6ICczRDE5JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDUnOiAnM0QyMScsXHJcbiAgICAnR3VsZyBDb252aWN0aW9uIE1hcmNhdG8gMSc6ICczRDFBJyxcclxuICAgICdHdWxnIENvbnZpY3Rpb24gTWFyY2F0byAyJzogJzNEMUInLFxyXG4gICAgJ0d1bGcgQ29udmljdGlvbiBNYXJjYXRvIDMnOiAnM0QyMCcsXHJcbiAgICAnR3VsZyBWZW5hIEFtb3Jpcyc6ICczRDI3JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdHdWxnIEx1bWVuIEluZmluaXR1bSc6ICc0MUIyJyxcclxuICAgICdHdWxnIFJpZ2h0IFBhbG0nOiAnMzdGOCcsXHJcbiAgICAnR3VsZyBMZWZ0IFBhbG0nOiAnMzdGQScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IFdoYXQgdG8gZG8gYWJvdXQgS2FobiBSYWkgNUI1MD9cclxuLy8gSXQgc2VlbXMgaW1wb3NzaWJsZSBmb3IgdGhlIG1hcmtlZCBwZXJzb24gdG8gYXZvaWQgZW50aXJlbHkuXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuUGFnbHRoYW4sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1BhZ2x0aGFuIFRlbG92b3VpdnJlIFBsYWd1ZSBTd2lwZSc6ICc2MEZDJywgLy8gZnJvbnRhbCBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBMZXNzZXIgVGVsb2RyYWdvbiBFbmd1bGZpbmcgRmxhbWVzJzogJzYwRjUnLCAvLyBmcm9udGFsIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgTGlnaHRuaW5nIEJvbHQnOiAnNUM0QycsIC8vIGNpcmN1bGFyIGxpZ2h0bmluZyBhb2UgKG9uIHNlbGYgb3IgcG9zdClcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIEJhbGwgT2YgTGV2aW4gU2hvY2snOiAnNUM1MicsIC8vIHB1bHNpbmcgc21hbGwgY2lyY3VsYXIgYW9lc1xyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgU3VwZXJjaGFyZ2VkIEJhbGwgT2YgTGV2aW4gU2hvY2snOiAnNUM1MycsIC8vIHB1bHNpbmcgbGFyZ2UgY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBXaWRlIEJsYXN0ZXInOiAnNjBDNScsIC8vIHJlYXIgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gVGVsb2Jyb2JpbnlhayBGYWxsIE9mIE1hbic6ICc2MTQ4JywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb3RlayBSZWFwZXIgTWFnaXRlayBDYW5ub24nOiAnNjEyMScsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gU2hlZXQgb2YgSWNlJzogJzYwRjgnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvZHJhZ29uIEZyb3N0IEJyZWF0aCc6ICc2MEY3JywgLy8gdmVyeSBsYXJnZSBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIENvcmUgU3RhYmxlIENhbm5vbic6ICc1Qzk0JywgLy8gbGFyZ2UgbGluZSBhb2VzXHJcbiAgICAnUGFnbHRoYW4gTWFnaXRlayBDb3JlIDItVG9uemUgTWFnaXRlayBNaXNzaWxlJzogJzVDOTUnLCAvLyBsYXJnZSBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvdGVrIFNreSBBcm1vciBBZXRoZXJzaG90JzogJzVDOUMnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBNYXJrIElJIFRlbG90ZWsgQ29sb3NzdXMgRXhoYXVzdCc6ICc1Qzk5JywgLy8gbGFyZ2UgbGluZSBhb2VcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIE1pc3NpbGUgRXhwbG9zaXZlIEZvcmNlJzogJzVDOTgnLCAvLyBzbG93IG1vdmluZyBob3Jpem9udGFsIG1pc3NpbGVzXHJcbiAgICAnUGFnbHRoYW4gVGlhbWF0IEZsYW1pc3BoZXJlJzogJzYxMEYnLCAvLyB2ZXJ5IGxvbmcgbGluZSBhb2VcclxuICAgICdQYWdsdGhhbiBBcm1vcmVkIFRlbG9kcmFnb24gVG9ydG9pc2UgU3RvbXAnOiAnNjE0QicsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZSBmcm9tIHR1cnRsZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gVGh1bmRlcm91cyBCcmVhdGgnOiAnNjE0OScsIC8vIGxhcmdlIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgTmFpbCBVcGJ1cnN0JzogJzYwNUInLCAvLyBzbWFsbCBhb2VzIGJlZm9yZSBCaWcgQnVyc3RcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IEx1bmFyIE5haWwgQmlnIEJ1cnN0JzogJzVCNDgnLCAvLyBsYXJnZSBjaXJjdWxhciBhb2VzIGZyb20gbmFpbHNcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IFBlcmlnZWFuIEJyZWF0aCc6ICc1QjU5JywgLy8gbGFyZ2UgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBNZWdhZmxhcmUnOiAnNUI0RScsIC8vIG1lZ2FmbGFyZSBwZXBwZXJvbmlcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSBEaXZlJzogJzVCNTInLCAvLyBtZWdhZmxhcmUgbGluZSBhb2UgYWNyb3NzIHRoZSBhcmVuYVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgRmxhcmUnOiAnNUI0QScsIC8vIGxhcmdlIHB1cnBsZSBzaHJpbmtpbmcgY2lyY2xlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBNZWdhZmxhcmUnOiAnNUI0RCcsIC8vIG1lZ2FmbGFyZSBzcHJlYWQgbWFya2Vyc1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUWl0YW5hUmF2ZWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1FpdGFuYSBTdW4gVG9zcyc6ICczQzhBJywgLy8gR3JvdW5kIEFvRSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgUm9ua2FuIExpZ2h0IDEnOiAnM0M4QycsIC8vIFN0YXR1ZSBhdHRhY2ssIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIExvemF0bFxcJ3MgRnVyeSAxJzogJzNDOEYnLCAvLyBTZW1pY2lyY2xlIGNsZWF2ZSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgTG96YXRsXFwncyBGdXJ5IDInOiAnM0M5MCcsIC8vIFNlbWljaXJjbGUgY2xlYXZlLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBGYWxsaW5nIFJvY2snOiAnM0M5NicsIC8vIFNtYWxsIGdyb3VuZCBBb0UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIEZhbGxpbmcgQm91bGRlcic6ICczQzk3JywgLy8gTGFyZ2UgZ3JvdW5kIEFvRSwgYm9zcyB0d29cclxuICAgICdRaXRhbmEgVG93ZXJmYWxsJzogJzNDOTgnLCAvLyBQaWxsYXIgY29sbGFwc2UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIFZpcGVyIFBvaXNvbiAyJzogJzNDOUUnLCAvLyBTdGF0aW9uYXJ5IHBvaXNvbiBwdWRkbGVzLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMSc6ICczQ0EyJywgLy8gRGFuZ2Vyb3VzIG1pZGRsZSBkdXJpbmcgc3ByZWFkIGNpcmNsZXMsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCAzJzogJzNDQTYnLCAvLyBEYW5nZXJvdXMgc2lkZXMgZHVyaW5nIHN0YWNrIG1hcmtlciwgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDQnOiAnM0NBNycsIC8vIERhbmdlcm91cyBzaWRlcyBkdXJpbmcgc3RhY2sgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIFJvbmthbiBMaWdodCAyJzogJzNENkQnLCAvLyBTdGF0dWUgYXR0YWNrLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBXcmF0aCBvZiB0aGUgUm9ua2EnOiAnM0UyQycsIC8vIFN0YXR1ZSBsaW5lIGF0dGFjayBmcm9tIG1pbmktYm9zc2VzIGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgICAnUWl0YW5hIFNpbnNwaXR0ZXInOiAnM0UzNicsIC8vIEdvcmlsbGEgYm91bGRlciB0b3NzIEFvRSBiZWZvcmUgdGhpcmQgYm9zc1xyXG4gICAgJ1FpdGFuYSBIb3VuZCBvdXQgb2YgSGVhdmVuJzogJzQyQjgnLCAvLyBUZXRoZXIgZXh0ZW5zaW9uIGZhaWx1cmUsIGJvc3MgdGhyZWU7IDQyQjcgaXMgY29ycmVjdCBleGVjdXRpb25cclxuICAgICdRaXRhbmEgUm9ua2FuIEFieXNzJzogJzQzRUInLCAvLyBHcm91bmQgQW9FIGZyb20gbWluaS1ib3NzZXMgYmVmb3JlIGZpcnN0IGJvc3NcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1FpdGFuYSBWaXBlciBQb2lzb24gMSc6ICczQzlEJywgLy8gQW9FIGZyb20gdGhlIDAwQUIgcG9pc29uIGhlYWQgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMic6ICczQ0EzJywgLy8gT3ZlcmxhcHBlZCBjaXJjbGVzIGZhaWx1cmUgb24gdGhlIHNwcmVhZCBjaXJjbGVzIHZlcnNpb24gb2YgdGhlIG1lY2hhbmljXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRoZSBHcmFuZCBDb3Ntb3NcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUdyYW5kQ29zbW9zLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdDb3Ntb3MgSXJvbiBKdXN0aWNlJzogJzQ5MUYnLFxyXG4gICAgJ0Nvc21vcyBTbWl0ZSBPZiBSYWdlJzogJzQ5MjEnLFxyXG5cclxuICAgICdDb3Ntb3MgVHJpYnVsYXRpb24nOiAnNDlBNCcsXHJcbiAgICAnQ29zbW9zIERhcmsgU2hvY2snOiAnNDc2RicsXHJcbiAgICAnQ29zbW9zIFN3ZWVwJzogJzQ3NzAnLFxyXG4gICAgJ0Nvc21vcyBEZWVwIENsZWFuJzogJzQ3NzEnLFxyXG5cclxuICAgICdDb3Ntb3MgU2hhZG93IEJ1cnN0JzogJzQ5MjQnLFxyXG4gICAgJ0Nvc21vcyBCbG9vZHkgQ2FyZXNzJzogJzQ5MjcnLFxyXG4gICAgJ0Nvc21vcyBOZXBlbnRoaWMgUGx1bmdlJzogJzQ5MjgnLFxyXG4gICAgJ0Nvc21vcyBCcmV3aW5nIFN0b3JtJzogJzQ5MjknLFxyXG5cclxuICAgICdDb3Ntb3MgT2RlIFRvIEZhbGxlbiBQZXRhbHMnOiAnNDk1MCcsXHJcbiAgICAnQ29zbW9zIEZhciBXaW5kIEdyb3VuZCc6ICc0MjczJyxcclxuXHJcbiAgICAnQ29zbW9zIEZpcmUgQnJlYXRoJzogJzQ5MkInLFxyXG4gICAgJ0Nvc21vcyBSb25rYW4gRnJlZXplJzogJzQ5MkUnLFxyXG4gICAgJ0Nvc21vcyBPdmVycG93ZXInOiAnNDkyRCcsXHJcblxyXG4gICAgJ0Nvc21vcyBTY29yY2hpbmcgTGVmdCc6ICc0NzYzJyxcclxuICAgICdDb3Ntb3MgU2NvcmNoaW5nIFJpZ2h0JzogJzQ3NjInLFxyXG4gICAgJ0Nvc21vcyBPdGhlcndvcmRseSBIZWF0JzogJzQ3NUMnLFxyXG4gICAgJ0Nvc21vcyBGaXJlXFwncyBJcmUnOiAnNDc2MScsXHJcbiAgICAnQ29zbW9zIFBsdW1tZXQnOiAnNDc2NycsXHJcblxyXG4gICAgJ0Nvc21vcyBGaXJlXFwncyBEb21haW4gVGV0aGVyJzogJzQ3NUYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQ29zbW9zIERhcmsgV2VsbCc6ICc0NzZEJyxcclxuICAgICdDb3Ntb3MgRmFyIFdpbmQgU3ByZWFkJzogJzQ3MjQnLFxyXG4gICAgJ0Nvc21vcyBCbGFjayBGbGFtZSc6ICc0NzVEJyxcclxuICAgICdDb3Ntb3MgRmlyZVxcJ3MgRG9tYWluJzogJzQ3NjAnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlVHdpbm5pbmcsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1R3aW5uaW5nIEF1dG8gQ2Fubm9ucyc6ICc0M0E5JyxcclxuICAgICdUd2lubmluZyBIZWF2ZSc6ICczREI5JyxcclxuICAgICdUd2lubmluZyAzMiBUb256ZSBTd2lwZSc6ICczREJCJyxcclxuICAgICdUd2lubmluZyBTaWRlc3dpcGUnOiAnM0RCRicsXHJcbiAgICAnVHdpbm5pbmcgV2luZCBTcG91dCc6ICczREJFJyxcclxuICAgICdUd2lubmluZyBTaG9jayc6ICczREYxJyxcclxuICAgICdUd2lubmluZyBMYXNlcmJsYWRlJzogJzNERUMnLFxyXG4gICAgJ1R3aW5uaW5nIFZvcnBhbCBCbGFkZSc6ICczREMyJyxcclxuICAgICdUd2lubmluZyBUaHJvd24gRmxhbWVzJzogJzNEQzMnLFxyXG4gICAgJ1R3aW5uaW5nIE1hZ2l0ZWsgUmF5JzogJzNERjMnLFxyXG4gICAgJ1R3aW5uaW5nIEhpZ2ggR3Jhdml0eSc6ICczREZBJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUd2lubmluZyAxMjggVG9uemUgU3dpcGUnOiAnM0RCQScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogRGVhZCBJcm9uIDVBQjAgKGVhcnRoc2hha2VycywgYnV0IG9ubHkgaWYgeW91IHRha2UgdHdvPylcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx1YnJ1bVJlZ2luYWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjeSBGb3VyZm9sZCc6ICc1QjM0JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIEJhbGVmdWwgU3dhdGhlJzogJzVBQjQnLCAvLyBHcm91bmQgYW9lIHRvIGVpdGhlciBzaWRlIG9mIGJvc3NcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgQmFsZWZ1bCBCbGFkZSc6ICc1QjI4JywgLy8gSGlkZSBiZWhpbmQgcGlsbGFycyBhdHRhY2tcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDEnOiAnNUFBNCcsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDInOiAnNUFBNScsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDMnOiAnNUFBNicsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAxJzogJzVBQTcnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDInOiAnNUFBOCcsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMyc6ICc1QUE5JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgU2NvcmNoaW5nIFNoYWNrbGUnOiAnNUFBRScsIC8vIENoYWluIGRhbWFnZVxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBCcmVlemUnOiAnNUFBQicsIC8vIFdhZmZsZSBjcmlzcy1jcm9zcyBmbG9vciBtYXJrZXJzXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmNpZnVsIEJsb29tcyc6ICc1QUFEJywgLy8gUHVycGxlIGdyb3dpbmcgY2lyY2xlXHJcbiAgICAnRGVsdWJydW0gRGFodSBSaWdodC1TaWRlZCBTaG9ja3dhdmUnOiAnNTc2MScsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgTGVmdC1TaWRlZCBTaG9ja3dhdmUnOiAnNTc2MicsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gRGFodSBGaXJlYnJlYXRoZSc6ICc1NzY1JywgLy8gQ29uYWwgYnJlYXRoXHJcbiAgICAnRGVsdWJydW0gRGFodSBGaXJlYnJlYXRoZSBSb3RhdGluZyc6ICc1NzVBJywgLy8gQ29uYWwgYnJlYXRoLCByb3RhdGluZ1xyXG4gICAgJ0RlbHVicnVtIERhaHUgSGVhZCBEb3duJzogJzU3NTYnLCAvLyBsaW5lIGFvZSBjaGFyZ2UgZnJvbSBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtIERhaHUgSHVudGVyXFwncyBDbGF3JzogJzU3NTcnLCAvLyBjaXJjdWxhciBncm91bmQgYW9lIGNlbnRlcmVkIG9uIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW0gRGFodSBGYWxsaW5nIFJvY2snOiAnNTc1QycsIC8vIGdyb3VuZCBhb2UgZnJvbSBSZXZlcmJlcmF0aW5nIFJvYXJcclxuICAgICdEZWx1YnJ1bSBEYWh1IEhvdCBDaGFyZ2UnOiAnNTc2NCcsIC8vIGRvdWJsZSBjaGFyZ2VcclxuICAgICdEZWx1YnJ1bSBEYWh1IFJpcHBlciBDbGF3JzogJzU3NUQnLCAvLyBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgVGFpbCBTd2luZyc6ICc1NzVGJywgLy8gdGFpbCBzd2luZyA7KVxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFBhd24gT2ZmJzogJzU4MDYnLCAvLyBRdWVlbidzIFNvbGRpZXIgU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2VcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgMSc6ICc1ODBEJywgLy8gUXVlZW4ncyBHdW5uZXIgcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFR1cnJldFxcJ3MgVG91ciAyJzogJzU4MEUnLCAvLyBRdWVlbidzIEd1bm5lciByZWZsZWN0aXZlIHR1cnJldCBzaG90XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgVHVycmV0XFwncyBUb3VyIDMnOiAnNTgwRicsIC8vIFF1ZWVuJ3MgR3VubmVyIHJlZmxlY3RpdmUgdHVycmV0IHNob3RcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzU3RjMnLCAvLyBRdWVlbidzIEtuaWdodCBzaGllbGQgZ2V0IHVuZGVyXHJcbiAgICAnRGVsdWJydW0gR3VhcmQgT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU3RjInLCAvLyBRdWVlbidzIEtuaWdodCBzd29yZCBnZXQgb3V0XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgQ291bnRlcnBsYXknOiAnNTdGNicsIC8vIEhpdHRpbmcgYWV0aGVyaWFsIHdhcmQgZGlyZWN0aW9uYWwgYmFycmllclxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDEnOiAnNTdBOScsIC8vIEluaXRpYWwgcGhhbnRvbSBkb251dCBhb2UgZnJvbSBjaXJjbGVcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAyJzogJzU3QUEnLCAvLyBNb3ZpbmcgcGhhbnRvbSBkb251dCBhb2VzIGZyb20gY2lyY2xlXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEnOiAnNTdBNScsIC8vIHBoYW50b20gbGluZSBhb2UgZnJvbSBzcXVhcmVcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIFZpbGUgV2F2ZSc6ICc1N0IxJywgLy8gcGhhbnRvbSBjb25hbCBhb2VcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgRnVyeSBPZiBCb3pqYSc6ICc1OTczJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJvdXRcIlxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBGbGFzaHZhbmUnOiAnNTk3MicsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGJlaGluZFwiXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEluZmVybmFsIFNsYXNoJzogJzU5NzEnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBmcm9udFwiXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEZsYW1lcyBPZiBCb3pqYSc6ICc1OTY4JywgLy8gODAlIGZsb29yIGFvZSBiZWZvcmUgc2hpbW1lcmluZyBzaG90IHN3b3Jkc1xyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBHbGVhbWluZyBBcnJvdyc6ICc1OTc0JywgLy8gVHJpbml0eSBBdmF0YXIgbGluZSBhb2VzIGZyb20gb3V0c2lkZVxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBNZWFucyAxJzogJzU5QkInLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgTWVhbnMgMic6ICc1OUJEJywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIEVuZCAxJzogJzU5QkEnLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBFbmQgMic6ICc1OUJDJywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBOb3J0aHN3YWluXFwncyBHbG93JzogJzU5QzQnLCAvLyBleHBhbmRpbmcgbGluZXMgd2l0aCBleHBsb3Npb24gaW50ZXJzZWN0aW9uc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIEp1ZGdtZW50IEJsYWRlIExlZnQnOiAnNUI4MycsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0JzogJzVCODMnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggcmlnaHQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gUXVlZW5cXCdzIEp1c3RpY2UnOiAnNTlCRicsIC8vIGZhaWxpbmcgdG8gd2FsayB0aGUgcmlnaHQgbnVtYmVyIG9mIHNxdWFyZXNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMSc6ICc1OUUwJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMic6ICc1OUUxJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgMyc6ICc1OUUyJywgLy8gcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdCBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBQYXduIE9mZic6ICc1OURBJywgLy8gU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2UgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1OUNFJywgLy8gUXVlZW4ncyBLbmlnaHQgc2hpZWxkIGdldCB1bmRlciBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTlDQycsIC8vIFF1ZWVuJ3MgS25pZ2h0IHN3b3JkIGdldCBvdXQgZHVyaW5nIFF1ZWVuXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGVsdWJydW0gSGlkZGVuIFRyYXAgTWFzc2l2ZSBFeHBsb3Npb24nOiAnNUE2RScsIC8vIGV4cGxvc2lvbiB0cmFwXHJcbiAgICAnRGVsdWJydW0gSGlkZGVuIFRyYXAgUG9pc29uIFRyYXAnOiAnNUE2RicsIC8vIHBvaXNvbiB0cmFwXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEhlYXQgU2hvY2snOiAnNTk1RScsIC8vIHRvbyBtdWNoIGhlYXQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBDb2xkIFNob2NrJzogJzU5NUYnLCAvLyB0b28gbXVjaCBjb2xkIG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBNb29uJzogJzI2MicsIC8vIFwiUGV0cmlmaWNhdGlvblwiIGZyb20gQWV0aGVyaWFsIE9yYiBsb29rYXdheVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRGVsdWJydW0gRGFodSBIZWF0IEJyZWF0aCc6ICc1NzY2JywgLy8gdGFuayBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgV3JhdGggT2YgQm96amEnOiAnNTk3NScsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBBdCBsZWFzdCBkdXJpbmcgVGhlIFF1ZWVuLCB0aGVzZSBhYmlsaXR5IGlkcyBjYW4gYmUgb3JkZXJlZCBkaWZmZXJlbnRseSxcclxuICAgICAgLy8gYW5kIHRoZSBmaXJzdCBleHBsb3Npb24gXCJoaXRzXCIgZXZlcnlvbmUsIGFsdGhvdWdoIHdpdGggXCIxQlwiIGZsYWdzLlxyXG4gICAgICBpZDogJ0RlbHVicnVtIExvdHMgQ2FzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1NjVBJywgJzU2NUInLCAnNTdGRCcsICc1N0ZFJywgJzVCODYnLCAnNUI4NycsICc1OUQyJywgJzVEOTMnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogRGFodSA1Nzc2IFNwaXQgRmxhbWUgc2hvdWxkIGFsd2F5cyBoaXQgYSBNYXJjaG9zaWFzXHJcbi8vIFRPRE86IGhpdHRpbmcgcGhhbnRvbSB3aXRoIGljZSBzcGlrZXMgd2l0aCBhbnl0aGluZyBidXQgZGlzcGVsP1xyXG4vLyBUT0RPOiBmYWlsaW5nIGljeS9maWVyeSBwb3J0ZW50IChndWFyZCBhbmQgcXVlZW4pXHJcbi8vICAgICAgIGAxODpQeXJldGljIERvVCBUaWNrIG9uICR7bmFtZX0gZm9yICR7ZGFtYWdlfSBkYW1hZ2UuYFxyXG4vLyBUT0RPOiBXaW5kcyBPZiBGYXRlIC8gV2VpZ2h0IE9mIEZvcnR1bmU/XHJcbi8vIFRPRE86IFR1cnJldCdzIFRvdXI/XHJcbi8vIGdlbmVyYWwgdHJhcHM6IGV4cGxvc2lvbjogNUE3MSwgcG9pc29uIHRyYXA6IDVBNzIsIG1pbmk6IDVBNzNcclxuLy8gZHVlbCB0cmFwczogbWluaTogNTdBMSwgaWNlOiA1NzlGLCB0b2FkOiA1N0EwXHJcbi8vIFRPRE86IHRha2luZyBtYW5hIGZsYW1lIHdpdGhvdXQgcmVmbGVjdFxyXG4vLyBUT0RPOiB0YWtpbmcgTWFlbHN0cm9tJ3MgQm9sdCB3aXRob3V0IGxpZ2h0bmluZyBidWZmXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdWJydW1SZWdpbmFlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgU2xpbWVzIEhlbGxpc2ggU2xhc2gnOiAnNTdFQScsIC8vIEJvemphbiBTb2xkaWVyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBTbGltZXMgVmlzY291cyBSdXB0dXJlJzogJzUwMTYnLCAvLyBGdWxseSBtZXJnZWQgdmlzY291cyBzbGltZSBhb2VcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEdvbGVtcyBEZW1vbGlzaCc6ICc1ODgwJywgLy8gaW50ZXJydXB0aWJsZSBSdWlucyBHb2xlbSBjYXN0XHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBCYWxlZnVsIFN3YXRoZSc6ICc1QUQxJywgLy8gR3JvdW5kIGFvZSB0byBlaXRoZXIgc2lkZSBvZiBib3NzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgQmxhZGUnOiAnNUIyQScsIC8vIEhpZGUgYmVoaW5kIHBpbGxhcnMgYXR0YWNrXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIFNjb3JjaGluZyBTaGFja2xlJzogJzVBQ0InLCAvLyBDaGFpbnNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgMSc6ICc1Qjk0JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDInOiAnNUFCOScsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCAzJzogJzVBQkEnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgNCc6ICc1QUJCJywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDUnOiAnNUFCQycsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjaWZ1bCBCcmVlemUnOiAnNUFDOCcsIC8vIFdhZmZsZSBjcmlzcy1jcm9zcyBmbG9vciBtYXJrZXJzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgQ29tZXQnOiAnNUFENycsIC8vIENsb25lIG1ldGVvciBkcm9wcGluZyBiZWZvcmUgY2hhcmdlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBCYWxlZnVsIEZpcmVzdG9ybSc6ICc1QUQ4JywgLy8gQ2xvbmUgY2hhcmdlIGFmdGVyIEJhbGVmdWwgQ29tZXRcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBSb3NlJzogJzVBRDknLCAvLyBDbG9uZSBsaW5lIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDEnOiAnNUFDMScsIC8vIEJsdWUgcmluIGcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAyJzogJzVBQzInLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAzJzogJzVBQzMnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMSc6ICc1QUM0JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAyJzogJzVBQzUnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDMnOiAnNUFDNicsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEFjdCBPZiBNZXJjeSc6ICc1QUNGJywgLy8gY3Jvc3Mtc2hhcGVkIGxpbmUgYW9lc1xyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IFJpZ2h0LVNpZGVkIFNob2Nrd2F2ZSAxJzogJzU3NzAnLCAvLyBSaWdodCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IFJpZ2h0LVNpZGVkIFNob2Nrd2F2ZSAyJzogJzU3NzInLCAvLyBSaWdodCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlIDEnOiAnNTc2RicsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBMZWZ0LVNpZGVkIFNob2Nrd2F2ZSAyJzogJzU3NzEnLCAvLyBMZWZ0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmlyZWJyZWF0aGUnOiAnNTc3NCcsIC8vIENvbmFsIGJyZWF0aFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmlyZWJyZWF0aGUgUm90YXRpbmcnOiAnNTc2QycsIC8vIENvbmFsIGJyZWF0aCwgcm90YXRpbmdcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEhlYWQgRG93bic6ICc1NzY4JywgLy8gbGluZSBhb2UgY2hhcmdlIGZyb20gTWFyY2hvc2lhcyBhZGRcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEh1bnRlclxcJ3MgQ2xhdyc6ICc1NzY5JywgLy8gY2lyY3VsYXIgZ3JvdW5kIGFvZSBjZW50ZXJlZCBvbiBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgRmFsbGluZyBSb2NrJzogJzU3NkUnLCAvLyBncm91bmQgYW9lIGZyb20gUmV2ZXJiZXJhdGluZyBSb2FyXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBIb3QgQ2hhcmdlJzogJzU3NzMnLCAvLyBkb3VibGUgY2hhcmdlXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgTWFzc2l2ZSBFeHBsb3Npb24nOiAnNTc5RScsIC8vIGJvbWJzIGJlaW5nIGNsZWFyZWRcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIFZpY2lvdXMgU3dpcGUnOiAnNTc5NycsIC8vIGNpcmN1bGFyIGFvZSBhcm91bmQgYm9zc1xyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRm9jdXNlZCBUcmVtb3IgMSc6ICc1NzhGJywgLy8gc3F1YXJlIGZsb29yIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIEZvY3VzZWQgVHJlbW9yIDInOiAnNTc5MScsIC8vIHNxdWFyZSBmbG9vciBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBEZXZvdXInOiAnNTc4OScsIC8vIGNvbmFsIGFvZSBhZnRlciB3aXRoZXJpbmcgY3Vyc2VcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIEZsYWlsaW5nIFN0cmlrZSAxJzogJzU3OEMnLCAvLyBpbml0aWFsIHJvdGF0aW5nIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRmxhaWxpbmcgU3RyaWtlIDInOiAnNTc4RCcsIC8vIHJvdGF0aW5nIGNsZWF2ZXNcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBPZmZlbnNpdmUgU3dvcmQnOiAnNTgxOScsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIE9mZmVuc2l2ZSBTaGllbGQnOiAnNTgxQScsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTgxNicsIC8vIE9wdGltYWwgUGxheSBTd29yZCBcImdldCBvdXRcIlxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBTaGllbGQnOiAnNTgxNycsIC8vIE9wdGltYWwgcGxheSBzaGllbGQgXCJnZXQgaW5cIlxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBDbGVhdmUnOiAnNTgxOCcsIC8vIE9wdGltYWwgUGxheSBjbGVhdmVzIGZvciBzd29yZC9zaGllbGRcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBVbmx1Y2t5IExvdCc6ICc1ODFEJywgLy8gUXVlZW4ncyBLbmlnaHQgb3JiIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIEJ1cm4gMSc6ICc1ODNEJywgLy8gc21hbGwgZmlyZSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQnVybiAyJzogJzU4M0UnLCAvLyBsYXJnZSBmaXJlIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBQYXduIE9mZic6ICc1ODNBJywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAxJzogJzU4NDcnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAxXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAyJzogJzU4NDgnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAyXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVHVycmV0XFwncyBUb3VyIE5vcm1hbCAzJzogJzU4NDknLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgc2Vjb25kIGxpbmVzXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQ291bnRlcnBsYXknOiAnNThGNScsIC8vIEhpdHRpbmcgYWV0aGVyaWFsIHdhcmQgZGlyZWN0aW9uYWwgYmFycmllclxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAxJzogJzU3QjgnLCAvLyBJbml0aWFsIHBoYW50b20gZG9udXQgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBTd2lybGluZyBNaWFzbWEgMic6ICc1N0I5JywgLy8gTW92aW5nIHBoYW50b20gZG9udXQgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gQ3JlZXBpbmcgTWlhc21hIDEnOiAnNTdCNCcsIC8vIEluaXRpYWwgcGhhbnRvbSBsaW5lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gQ3JlZXBpbmcgTWlhc21hIDInOiAnNTdCNScsIC8vIExhdGVyIHBoYW50b20gbGluZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIExpbmdlcmluZyBNaWFzbWEgMSc6ICc1N0I2JywgLy8gSW5pdGlhbCBwaGFudG9tIGNpcmNsZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIExpbmdlcmluZyBNaWFzbWEgMic6ICc1N0I3JywgLy8gTW92aW5nIHBoYW50b20gY2lyY2xlIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gVmlsZSBXYXZlJzogJzU3QkYnLCAvLyBwaGFudG9tIGNvbmFsIGFvZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgRnVyeSBPZiBCb3pqYSc6ICc1OTRDJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJvdXRcIlxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBGbGFzaHZhbmUnOiAnNTk0QicsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGJlaGluZFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEluZmVybmFsIFNsYXNoJzogJzU5NEEnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBmcm9udFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEZsYW1lcyBPZiBCb3pqYSc6ICc1OTM5JywgLy8gODAlIGZsb29yIGFvZSBiZWZvcmUgc2hpbW1lcmluZyBzaG90IHN3b3Jkc1xyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBHbGVhbWluZyBBcnJvdyc6ICc1OTREJywgLy8gVHJpbml0eSBBdmF0YXIgbGluZSBhb2VzIGZyb20gb3V0c2lkZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIFdoYWNrJzogJzU3RDAnLCAvLyBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIERldmFzdGF0aW5nIEJvbHQgMSc6ICc1N0M1JywgLy8gbGlnaHRuaW5nIHJpbmdzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBEZXZhc3RhdGluZyBCb2x0IDInOiAnNTdDNicsIC8vIGxpZ2h0bmluZyByaW5nc1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRWxlY3Ryb2N1dGlvbic6ICc1N0NDJywgLy8gcmFuZG9tIGNpcmNsZSBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBSYXBpZCBCb2x0cyc6ICc1N0MzJywgLy8gZHJvcHBlZCBsaWdodG5pbmcgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgMTExMS1Ub256ZSBTd2luZyc6ICc1N0Q4JywgLy8gdmVyeSBsYXJnZSBcImdldCBvdXRcIiBzd2luZ1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgTW9uayBBdHRhY2snOiAnNTVBNicsIC8vIE1vbmsgYWRkIGF1dG8tYXR0YWNrXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE5vcnRoc3dhaW5cXCdzIEdsb3cnOiAnNTlGNCcsIC8vIGV4cGFuZGluZyBsaW5lcyB3aXRoIGV4cGxvc2lvbiBpbnRlcnNlY3Rpb25zXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIE1lYW5zIDEnOiAnNTlFNycsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFRoZSBNZWFucyAyJzogJzU5RUEnLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgRW5kIDEnOiAnNTlFOCcsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIEVuZCAyJzogJzU5RTknLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE9wdGltYWwgT2ZmZW5zaXZlIFN3b3JkJzogJzVBMDInLCAvLyBtaWRkbGUgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBPZmZlbnNpdmUgU2hpZWxkJzogJzVBMDMnLCAvLyBtaWRkbGUgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gSnVkZ21lbnQgQmxhZGUgTGVmdCAxJzogJzU5RjInLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggbGVmdCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0IDInOiAnNUI4NScsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0IDEnOiAnNTlGMScsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBSaWdodCAyJzogJzVCODQnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggcmlnaHQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gUGF3biBPZmYnOiAnNUExRCcsIC8vIFF1ZWVuJ3MgU29sZGllciBTZWNyZXRzIFJldmVhbGVkIHRldGhlcmVkIGNsb25lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE9wdGltYWwgUGxheSBTd29yZCc6ICc1OUZGJywgLy8gT3B0aW1hbCBQbGF5IFN3b3JkIFwiZ2V0IG91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1QTAwJywgLy8gT3B0aW1hbCBwbGF5IHNoaWVsZCBcImdldCBpblwiXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IENsZWF2ZSc6ICc1QTAxJywgLy8gT3B0aW1hbCBQbGF5IGNsZWF2ZXMgZm9yIHN3b3JkL3NoaWVsZFxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMSc6ICc1QTI4JywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIGluaXRpYWwgbGluZXMgMVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMic6ICc1QTJBJywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIGluaXRpYWwgbGluZXMgMlxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMyc6ICc1QTI5JywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIHNlY29uZCBsaW5lc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBIZWF0IFNob2NrJzogJzU5MjcnLCAvLyB0b28gbXVjaCBoZWF0IG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgQ29sZCBTaG9jayc6ICc1OTI4JywgLy8gdG9vIG11Y2ggY29sZCBvciBmYWlsaW5nIHRvIHJlZ3VsYXRlIHRlbXBlcmF0dXJlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gUXVlZW5cXCdzIEp1c3RpY2UnOiAnNTlFQicsIC8vIGZhaWxpbmcgdG8gd2FsayB0aGUgcmlnaHQgbnVtYmVyIG9mIHNxdWFyZXNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBHdW5uaGlsZHJcXCdzIEJsYWRlcyc6ICc1QjIyJywgLy8gbm90IGJlaW5nIGluIHRoZSBjaGVzcyBibHVlIHNhZmUgc3F1YXJlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVW5sdWNreSBMb3QnOiAnNTVCNicsIC8vIGxpZ2h0bmluZyBvcmIgYXR0YWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY2lmdWwgTW9vbic6ICcyNjInLCAvLyBcIlBldHJpZmljYXRpb25cIiBmcm9tIEFldGhlcmlhbCBPcmIgbG9va2F3YXlcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBQaGFudG9tIEJhbGVmdWwgT25zbGF1Z2h0JzogJzVBRDYnLCAvLyBzb2xvIHRhbmsgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBGb2UgU3BsaXR0ZXInOiAnNTdENycsIC8vIHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBUaGVzZSBhYmlsaXR5IGlkcyBjYW4gYmUgb3JkZXJlZCBkaWZmZXJlbnRseSBhbmQgXCJoaXRcIiBwZW9wbGUgd2hlbiBsZXZpdGF0aW5nLlxyXG4gICAgICBpZDogJ0RlbHVicnVtU2F2IEd1YXJkIExvdHMgQ2FzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc1ODI3JywgJzU4MjgnLCAnNUI2QycsICc1QjZEJywgJzVCQjYnLCAnNUJCNycsICc1Qjg4JywgJzVCODknXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5mbGFncy5zbGljZSgtMikgPT09ICcwMycsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgR29sZW0gQ29tcGFjdGlvbicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTc0NicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgdGV4dDogYCR7bWF0Y2hlcy5zb3VyY2V9OiAke21hdGNoZXMuYWJpbGl0eX1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0RlbHVicnVtU2F2IFNsaW1lIFNhbmd1aW5lIEZ1c2lvbicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTU0RCcgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgdGV4dDogYCR7bWF0Y2hlcy5zb3VyY2V9OiAke21hdGNoZXMuYWJpbGl0eX1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlUmVzdXJyZWN0aW9uLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMU4gRWRlblxcJ3MgVGh1bmRlciBJSUknOiAnNDRFRCcsXHJcbiAgICAnRTFOIEVkZW5cXCdzIEJsaXp6YXJkIElJSSc6ICc0NEVDJyxcclxuICAgICdFMU4gUHVyZSBCZWFtJzogJzNEOUUnLFxyXG4gICAgJ0UxTiBQYXJhZGlzZSBMb3N0JzogJzNEQTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxTiBFZGVuXFwncyBGbGFyZSc6ICczRDk3JyxcclxuICAgICdFMU4gUHVyZSBMaWdodCc6ICczREEzJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxTiBGaXJlIElJSSc6ICc0NEVCJyxcclxuICAgICdFMU4gVmljZSBPZiBWYW5pdHknOiAnNDRFNycsIC8vIHRhbmsgbGFzZXJzXHJcbiAgICAnRTFOIFZpY2UgT2YgQXBhdGh5JzogJzQ0RTgnLCAvLyBkcHMgcHVkZGxlc1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBmYWlsaW5nIHRvIGludGVycnVwdCBNYW5hIEJvb3N0ICgzRDhEKVxyXG4vLyBUT0RPOiBmYWlsaW5nIHRvIHBhc3MgaGVhbGVyIGRlYnVmZj9cclxuLy8gVE9ETzogd2hhdCBoYXBwZW5zIGlmIHlvdSBkb24ndCBraWxsIGEgbWV0ZW9yIGR1cmluZyBmb3VyIG9yYnM/XHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVSZXN1cnJlY3Rpb25TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxUyBFZGVuXFwncyBUaHVuZGVyIElJSSc6ICc0NEY3JyxcclxuICAgICdFMVMgRWRlblxcJ3MgQmxpenphcmQgSUlJJzogJzQ0RjYnLFxyXG4gICAgJ0UxUyBFZGVuXFwncyBSZWdhaW5lZCBCbGl6emFyZCBJSUknOiAnNDRGQScsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBUcmlkZW50IDEnOiAnM0Q4MycsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBUcmlkZW50IDInOiAnM0Q4NCcsXHJcbiAgICAnRTFTIFBhcmFkaXNlIExvc3QnOiAnM0Q4NycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTFTIEVkZW5cXCdzIEZsYXJlJzogJzNENzMnLFxyXG4gICAgJ0UxUyBQdXJlIExpZ2h0JzogJzNEOEEnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTFTIEZpcmUvVGh1bmRlciBJSUknOiAnNDRGQicsXHJcbiAgICAnRTFTIFB1cmUgQmVhbSBTaW5nbGUnOiAnM0Q4MScsXHJcbiAgICAnRTFTIFZpY2UgT2YgVmFuaXR5JzogJzQ0RjEnLCAvLyB0YW5rIGxhc2Vyc1xyXG4gICAgJ0UxUyBWaWNlIG9mIEFwYXRoeSc6ICc0NEYyJywgLy8gZHBzIHB1ZGRsZXNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBzaGFkb3dleWUgZmFpbHVyZSAodG9wIGxpbmUgZmFpbCwgYm90dG9tIGxpbmUgc3VjY2VzcywgZWZmZWN0IHRoZXJlIHRvbylcclxuLy8gWzE2OjE3OjM1Ljk2Nl0gMTY6NDAwMTEwRkU6Vm9pZHdhbGtlcjo0MEI3OlNoYWRvd2V5ZToxMDYxMjM0NTpUaW5pIFBvdXRpbmk6RjoxMDAwMDoxMDAxOTBGOlxyXG4vLyBbMTY6MTc6MzUuOTY2XSAxNjo0MDAxMTBGRTpWb2lkd2Fsa2VyOjQwQjc6U2hhZG93ZXllOjEwNjc4OTBBOlBvdGF0byBDaGlwcHk6MTowOjFDOjgwMDA6XHJcbi8vIGdhaW5zIHRoZSBlZmZlY3Qgb2YgUGV0cmlmaWNhdGlvbiBmcm9tIFZvaWR3YWxrZXIgZm9yIDEwLjAwIFNlY29uZHMuXHJcbi8vIFRPRE86IHB1ZGRsZSBmYWlsdXJlP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZURlc2NlbnQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UyTiBEb29tdm9pZCBTbGljZXInOiAnM0UzQycsXHJcbiAgICAnRTJOIERvb212b2lkIEd1aWxsb3RpbmUnOiAnM0UzQicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UyTiBOeXgnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICczRTNEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0Jvb3BlZCcsXHJcbiAgICAgICAgICAgIGRlOiAnTnl4IGJlcsO8aHJ0JyxcclxuICAgICAgICAgICAgZnI6ICdNYWx1cyBkZSBkw6lnw6J0cycsXHJcbiAgICAgICAgICAgIGphOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGNuOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGtvOiAn64uJ7IqkJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogc2hhZG93ZXllIGZhaWx1cmVcclxuLy8gVE9ETzogRW1wdHkgSGF0ZSAoM0U1OS8zRTVBKSBoaXRzIGV2ZXJ5Ym9keSwgc28gaGFyZCB0byB0ZWxsIGFib3V0IGtub2NrYmFja1xyXG4vLyBUT0RPOiBtYXliZSBtYXJrIGhlbGwgd2luZCBwZW9wbGUgd2hvIGdvdCBjbGlwcGVkIGJ5IHN0YWNrP1xyXG4vLyBUT0RPOiBtaXNzaW5nIHB1ZGRsZXM/XHJcbi8vIFRPRE86IG1pc3NpbmcgbGlnaHQvZGFyayBjaXJjbGUgc3RhY2tcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVEZXNjZW50U2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMlMgRG9vbXZvaWQgU2xpY2VyJzogJzNFNTAnLFxyXG4gICAgJ0UzUyBFbXB0eSBSYWdlJzogJzNFNkMnLFxyXG4gICAgJ0UzUyBEb29tdm9pZCBHdWlsbG90aW5lJzogJzNFNEYnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTJTIERvb212b2lkIENsZWF2ZXInOiAnM0U2NCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UyUyBTaGFkb3dleWUnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBTdG9uZSBDdXJzZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTg5JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UyUyBOeXgnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICczRTUxJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0Jvb3BlZCcsXHJcbiAgICAgICAgICAgIGRlOiAnTnl4IGJlcsO8aHJ0JyxcclxuICAgICAgICAgICAgZnI6ICdNYWx1cyBkZSBkw6lnw6J0cycsXHJcbiAgICAgICAgICAgIGphOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGNuOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGtvOiAn64uJ7IqkJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVJbnVuZGF0aW9uLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFM04gTW9uc3RlciBXYXZlIDEnOiAnM0ZDQScsXHJcbiAgICAnRTNOIE1vbnN0ZXIgV2F2ZSAyJzogJzNGRTknLFxyXG4gICAgJ0UzTiBNYWVsc3Ryb20nOiAnM0ZEOScsXHJcbiAgICAnRTNOIFN3aXJsaW5nIFRzdW5hbWknOiAnM0ZENScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTNOIFRlbXBvcmFyeSBDdXJyZW50IDEnOiAnM0ZDRScsXHJcbiAgICAnRTNOIFRlbXBvcmFyeSBDdXJyZW50IDInOiAnM0ZDRCcsXHJcbiAgICAnRTNOIFNwaW5uaW5nIERpdmUnOiAnM0ZEQicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFM04gUmlwIEN1cnJlbnQnOiAnM0ZDNycsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IFNjb3VyaW5nIFRzdW5hbWkgKDNDRTApIG9uIHNvbWVib2R5IG90aGVyIHRoYW4gdGFyZ2V0XHJcbi8vIFRPRE86IFN3ZWVwaW5nIFRzdW5hbWkgKDNGRjUpIG9uIHNvbWVib2R5IG90aGVyIHRoYW4gdGFua3NcclxuLy8gVE9ETzogUmlwIEN1cnJlbnQgKDNGRTAsIDNGRTEpIG9uIHNvbWVib2R5IG90aGVyIHRoYW4gdGFyZ2V0L3RhbmtzXHJcbi8vIFRPRE86IEJvaWxlZCBBbGl2ZSAoNDAwNikgaXMgZmFpbGluZyBwdWRkbGVzPz8/XHJcbi8vIFRPRE86IGZhaWxpbmcgdG8gY2xlYW5zZSBTcGxhc2hpbmcgV2F0ZXJzXHJcbi8vIFRPRE86IGRvZXMgZ2V0dGluZyBoaXQgYnkgdW5kZXJzZWEgcXVha2UgY2F1c2UgYW4gYWJpbGl0eT9cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZUludW5kYXRpb25TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UzUyBNb25zdGVyIFdhdmUgMSc6ICczRkU1JyxcclxuICAgICdFM1MgTW9uc3RlciBXYXZlIDInOiAnM0ZFOScsXHJcbiAgICAnRTNTIE1hZWxzdHJvbSc6ICczRkZCJyxcclxuICAgICdFM1MgU3dpcmxpbmcgVHN1bmFtaSc6ICczRkY0JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFM1MgVGVtcG9yYXJ5IEN1cnJlbnQgMSc6ICczRkVBJyxcclxuICAgICdFM1MgVGVtcG9yYXJ5IEN1cnJlbnQgMic6ICczRkVCJyxcclxuICAgICdFM1MgVGVtcG9yYXJ5IEN1cnJlbnQgMyc6ICczRkVDJyxcclxuICAgICdFM1MgVGVtcG9yYXJ5IEN1cnJlbnQgNCc6ICczRkVEJyxcclxuICAgICdFM1MgU3Bpbm5pbmcgRGl2ZSc6ICczRkZEJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVNlcHVsdHVyZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTROIFdlaWdodCBvZiB0aGUgTGFuZCc6ICc0MEVCJyxcclxuICAgICdFNE4gRXZpbCBFYXJ0aCc6ICc0MEVGJyxcclxuICAgICdFNE4gQWZ0ZXJzaG9jayAxJzogJzQxQjQnLFxyXG4gICAgJ0U0TiBBZnRlcnNob2NrIDInOiAnNDBGMCcsXHJcbiAgICAnRTROIEV4cGxvc2lvbiAxJzogJzQwRUQnLFxyXG4gICAgJ0U0TiBFeHBsb3Npb24gMic6ICc0MEY1JyxcclxuICAgICdFNE4gTGFuZHNsaWRlJzogJzQxMUInLFxyXG4gICAgJ0U0TiBSaWdodHdhcmQgTGFuZHNsaWRlJzogJzQxMDAnLFxyXG4gICAgJ0U0TiBMZWZ0d2FyZCBMYW5kc2xpZGUnOiAnNDBGRicsXHJcbiAgICAnRTROIE1hc3NpdmUgTGFuZHNsaWRlJzogJzQwRkMnLFxyXG4gICAgJ0U0TiBTZWlzbWljIFdhdmUnOiAnNDBGMycsXHJcbiAgICAnRTROIEZhdWx0IExpbmUnOiAnNDEwMScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGZhdWx0TGluZVRhcmdldD86IHN0cmluZztcclxufVxyXG5cclxuLy8gVE9ETzogY291bGQgdHJhY2sgcGVvcGxlIGdldCBoaXR0aW5nIGJ5IG1hcmtlcnMgdGhleSBzaG91bGRuJ3RcclxuLy8gVE9ETzogY291bGQgdHJhY2sgbm9uLXRhbmtzIGdldHRpbmcgaGl0IGJ5IHRhbmtidXN0ZXJzLCBtZWdhbGl0aHNcclxuLy8gVE9ETzogY291bGQgdHJhY2sgbm9uLXRhcmdldCBnZXR0aW5nIGhpdCBieSB0YW5rYnVzdGVyXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlU2VwdWx0dXJlU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNFMgV2VpZ2h0IG9mIHRoZSBMYW5kJzogJzQxMDgnLFxyXG4gICAgJ0U0UyBFdmlsIEVhcnRoJzogJzQxMEMnLFxyXG4gICAgJ0U0UyBBZnRlcnNob2NrIDEnOiAnNDFCNScsXHJcbiAgICAnRTRTIEFmdGVyc2hvY2sgMic6ICc0MTBEJyxcclxuICAgICdFNFMgRXhwbG9zaW9uJzogJzQxMEEnLFxyXG4gICAgJ0U0UyBMYW5kc2xpZGUnOiAnNDExQicsXHJcbiAgICAnRTRTIFJpZ2h0d2FyZCBMYW5kc2xpZGUnOiAnNDExRCcsXHJcbiAgICAnRTRTIExlZnR3YXJkIExhbmRzbGlkZSc6ICc0MTFDJyxcclxuICAgICdFNFMgTWFzc2l2ZSBMYW5kc2xpZGUgMSc6ICc0MTE4JyxcclxuICAgICdFNFMgTWFzc2l2ZSBMYW5kc2xpZGUgMic6ICc0MTE5JyxcclxuICAgICdFNFMgU2Vpc21pYyBXYXZlJzogJzQxMTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U0UyBEdWFsIEVhcnRoZW4gRmlzdHMgMSc6ICc0MTM1JyxcclxuICAgICdFNFMgRHVhbCBFYXJ0aGVuIEZpc3RzIDInOiAnNDY4NycsXHJcbiAgICAnRTRTIFBsYXRlIEZyYWN0dXJlJzogJzQzRUEnLFxyXG4gICAgJ0U0UyBFYXJ0aGVuIEZpc3QgMSc6ICc0M0NBJyxcclxuICAgICdFNFMgRWFydGhlbiBGaXN0IDInOiAnNDNDOScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U0UyBGYXVsdCBMaW5lIENvbGxlY3QnLFxyXG4gICAgICB0eXBlOiAnU3RhcnRzVXNpbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ1RpdGFuJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ+OCv+OCpOOCv+ODsycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICfms7DlnaYnIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAn7YOA7J207YOEJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuZmF1bHRMaW5lVGFyZ2V0ID0gbWF0Y2hlcy50YXJnZXQ7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U0UyBGYXVsdCBMaW5lJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDExRScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5mYXVsdExpbmVUYXJnZXQgIT09IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1J1biBPdmVyJyxcclxuICAgICAgICAgICAgZGU6ICdXdXJkZSDDvGJlcmZhaHJlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSDDqWNyYXPDqShlKScsXHJcbiAgICAgICAgICAgIGphOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGNuOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICAgIGtvOiBtYXRjaGVzLmFiaWxpdHksIC8vIEZJWE1FXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNPcmI/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgY2xvdWRNYXJrZXJzPzogc3RyaW5nW107XHJcbn1cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVsbWluYXRpb24sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U1TiBJbXBhY3QnOiAnNEUzQScsIC8vIFN0cmF0b3NwZWFyIGxhbmRpbmcgQW9FXHJcbiAgICAnRTVOIExpZ2h0bmluZyBCb2x0JzogJzRCOUMnLCAvLyBTdG9ybWNsb3VkIHN0YW5kYXJkIGF0dGFja1xyXG4gICAgJ0U1TiBHYWxsb3AnOiAnNEI5NycsIC8vIFNpZGV3YXlzIGFkZCBjaGFyZ2VcclxuICAgICdFNU4gU2hvY2sgU3RyaWtlJzogJzRCQTEnLCAvLyBTbWFsbCBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgICAnRTVOIFZvbHQgU3RyaWtlJzogJzRDRjInLCAvLyBMYXJnZSBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTVOIEp1ZGdtZW50IEpvbHQnOiAnNEI4RicsIC8vIFN0cmF0b3NwZWFyIGV4cGxvc2lvbnNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgaGFwcGVucyB3aGVuIGEgcGxheWVyIGdldHMgNCsgc3RhY2tzIG9mIG9yYnMuIERvbid0IGJlIGdyZWVkeSFcclxuICAgICAgaWQ6ICdFNU4gU3RhdGljIENvbmRlbnNhdGlvbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEhlbHBlciBmb3Igb3JiIHBpY2t1cCBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0U1TiBPcmIgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNPcmIgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBPcmIgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QjQnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNPcmIgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gRGl2aW5lIEp1ZGdlbWVudCBWb2x0cycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCOUEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAobm8gb3JiKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChrZWluIE9yYilgLFxyXG4gICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAocGFzIGQnb3JiZSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zu3546J54Sh44GXKWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmsqHlkIPnkIMpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIFN0b3JtY2xvdWQgVGFyZ2V0IFRyYWNraW5nJyxcclxuICAgICAgdHlwZTogJ0hlYWRNYXJrZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMDZFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuY2xvdWRNYXJrZXJzID8/PSBbXTtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2Vycy5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBpcyBzZWVuIG9ubHkgaWYgcGxheWVycyBzdGFja2VkIHRoZSBjbG91ZHMgaW5zdGVhZCBvZiBzcHJlYWRpbmcgdGhlbS5cclxuICAgICAgaWQ6ICdFNU4gVGhlIFBhcnRpbmcgQ2xvdWRzJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEI5RCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAzMCxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgZGF0YS5jbG91ZE1hcmtlcnMgPz8gW10pIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgICAgYmxhbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoY2xvdWRzIHRvbyBjbG9zZSlgLFxyXG4gICAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChXb2xrZW4genUgbmFoZSlgLFxyXG4gICAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChudWFnZXMgdHJvcCBwcm9jaGVzKWAsXHJcbiAgICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbsui/keOBmeOBjilgLFxyXG4gICAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7fkupHph43lj6ApYCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gU3Rvcm1jbG91ZCBjbGVhbnVwJyxcclxuICAgICAgdHlwZTogJ0hlYWRNYXJrZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHsgaWQ6ICcwMDZFJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAzMCwgLy8gU3Rvcm1jbG91ZHMgcmVzb2x2ZSB3ZWxsIGJlZm9yZSB0aGlzLlxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuY2xvdWRNYXJrZXJzO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaGFzT3JiPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG4gIGhhdGVkPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG4gIGNsb3VkTWFya2Vycz86IHN0cmluZ1tdO1xyXG59XHJcblxyXG4vLyBUT0RPOiBpcyB0aGVyZSBhIGRpZmZlcmVudCBhYmlsaXR5IGlmIHRoZSBzaGllbGQgZHV0eSBhY3Rpb24gaXNuJ3QgdXNlZCBwcm9wZXJseT9cclxuLy8gVE9ETzogaXMgdGhlcmUgYW4gYWJpbGl0eSBmcm9tIFJhaWRlbiAodGhlIGJpcmQpIGlmIHlvdSBnZXQgZWF0ZW4/XHJcbi8vIFRPRE86IG1heWJlIGNoYWluIGxpZ2h0bmluZyB3YXJuaW5nIGlmIHlvdSBnZXQgaGl0IHdoaWxlIHlvdSBoYXZlIHN5c3RlbSBzaG9jayAoOEI4KVxyXG5cclxuY29uc3Qgbm9PcmIgPSAoc3RyOiBzdHJpbmcpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKG5vIG9yYiknLFxyXG4gICAgZGU6IHN0ciArICcgKGtlaW4gT3JiKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRcXCdvcmJlKScsXHJcbiAgICBqYTogc3RyICsgJyAo6Zu3546J54Sh44GXKScsXHJcbiAgICBjbjogc3RyICsgJyAo5rKh5ZCD55CDKScsXHJcbiAgICBrbzogc3RyICsgJyAo6rWs7IqsIOyXhuydjCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1bG1pbmF0aW9uU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNVMgSW1wYWN0JzogJzRFM0InLCAvLyBTdHJhdG9zcGVhciBsYW5kaW5nIEFvRVxyXG4gICAgJ0U1UyBHYWxsb3AnOiAnNEJCNCcsIC8vIFNpZGV3YXlzIGFkZCBjaGFyZ2VcclxuICAgICdFNVMgU2hvY2sgU3RyaWtlJzogJzRCQzEnLCAvLyBTbWFsbCBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgICAnRTVTIFN0ZXBwZWQgTGVhZGVyIFR3aXN0ZXInOiAnNEJDNycsIC8vIFR3aXN0ZXIgc3RlcHBlZCBsZWFkZXJcclxuICAgICdFNVMgU3RlcHBlZCBMZWFkZXIgRG9udXQnOiAnNEJDOCcsIC8vIERvbnV0IHN0ZXBwZWQgbGVhZGVyXHJcbiAgICAnRTVTIFNob2NrJzogJzRFM0QnLCAvLyBIYXRlZCBvZiBMZXZpbiBTdG9ybWNsb3VkLWNsZWFuc2FibGUgZXhwbG9kaW5nIGRlYnVmZlxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U1UyBKdWRnbWVudCBKb2x0JzogJzRCQTcnLCAvLyBTdHJhdG9zcGVhciBleHBsb3Npb25zXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFNVMgVm9sdCBTdHJpa2UgRG91YmxlJzogJzRCQzMnLCAvLyBMYXJnZSBBb0UgY2lyY2xlcyBkdXJpbmcgVGh1bmRlcnN0b3JtXHJcbiAgICAnRTVTIENyaXBwbGluZyBCbG93JzogJzRCQ0EnLFxyXG4gICAgJ0U1UyBDaGFpbiBMaWdodG5pbmcgRG91YmxlJzogJzRCQzUnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSGVscGVyIGZvciBvcmIgcGlja3VwIGZhaWx1cmVzXHJcbiAgICAgIGlkOiAnRTVTIE9yYiBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCNCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc09yYiA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIE9yYiBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCNCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc09yYiA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBEaXZpbmUgSnVkZ2VtZW50IFZvbHRzJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJCNycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEuaGFzT3JiIHx8ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub09yYihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBWb2x0IFN0cmlrZSBPcmInLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QkMzJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiAhZGF0YS5oYXNPcmIgfHwgIWRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vT3JiKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIERlYWRseSBEaXNjaGFyZ2UgQmlnIEtub2NrYmFjaycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQjInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9PcmIobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgTGlnaHRuaW5nIEJvbHQnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QkI5JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gSGF2aW5nIGEgbm9uLWlkZW1wb3RlbnQgY29uZGl0aW9uIGZ1bmN0aW9uIGlzIGEgYml0IDxfPFxyXG4gICAgICAgIC8vIE9ubHkgY29uc2lkZXIgbGlnaHRuaW5nIGJvbHQgZGFtYWdlIGlmIHlvdSBoYXZlIGEgZGVidWZmIHRvIGNsZWFyLlxyXG4gICAgICAgIGlmICghZGF0YS5oYXRlZCB8fCAhZGF0YS5oYXRlZFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgZGVsZXRlIGRhdGEuaGF0ZWRbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgSGF0ZWQgb2YgTGV2aW4nLFxyXG4gICAgICB0eXBlOiAnSGVhZE1hcmtlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwRDInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXRlZCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXRlZFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgU3Rvcm1jbG91ZCBUYXJnZXQgVHJhY2tpbmcnLFxyXG4gICAgICB0eXBlOiAnSGVhZE1hcmtlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMgPz89IFtdO1xyXG4gICAgICAgIGRhdGEuY2xvdWRNYXJrZXJzLnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhpcyBhYmlsaXR5IGlzIHNlZW4gb25seSBpZiBwbGF5ZXJzIHN0YWNrZWQgdGhlIGNsb3VkcyBpbnN0ZWFkIG9mIHNwcmVhZGluZyB0aGVtLlxyXG4gICAgICBpZDogJ0U1UyBUaGUgUGFydGluZyBDbG91ZHMnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QkJBJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDMwLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBkYXRhLmNsb3VkTWFya2VycyA/PyBbXSkge1xyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgICBibGFtZTogbmFtZSxcclxuICAgICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChjbG91ZHMgdG9vIGNsb3NlKWAsXHJcbiAgICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKFdvbGtlbiB6dSBuYWhlKWAsXHJcbiAgICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKG51YWdlcyB0cm9wIHByb2NoZXMpYCxcclxuICAgICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zuy6L+R44GZ44GOKWAsXHJcbiAgICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbt+S6kemHjeWPoClgLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIGNsZWFudXAnLFxyXG4gICAgICB0eXBlOiAnSGVhZE1hcmtlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICAvLyBTdG9ybWNsb3VkcyByZXNvbHZlIHdlbGwgYmVmb3JlIHRoaXMuXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMzAsXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkZWxldGUgZGF0YS5jbG91ZE1hcmtlcnM7XHJcbiAgICAgICAgZGVsZXRlIGRhdGEuaGF0ZWQ7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1cm9yLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNk4gVGhvcm5zJzogJzRCREEnLCAvLyBBb0UgbWFya2VycyBhZnRlciBFbnVtZXJhdGlvblxyXG4gICAgJ0U2TiBGZXJvc3Rvcm0gMSc6ICc0QkREJyxcclxuICAgICdFNk4gRmVyb3N0b3JtIDInOiAnNEJFNScsXHJcbiAgICAnRTZOIFN0b3JtIE9mIEZ1cnkgMSc6ICc0QkUwJywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tR2FydWRhXHJcbiAgICAnRTZOIFN0b3JtIE9mIEZ1cnkgMic6ICc0QkU2JywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tUmFrdGFwYWtzYVxyXG4gICAgJ0U2TiBFeHBsb3Npb24nOiAnNEJFMicsIC8vIEFvRSBjaXJjbGVzLCBHYXJ1ZGEgb3Jic1xyXG4gICAgJ0U2TiBIZWF0IEJ1cnN0JzogJzRCRUMnLFxyXG4gICAgJ0U2TiBDb25mbGFnIFN0cmlrZSc6ICc0QkVFJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRVxyXG4gICAgJ0U2TiBTcGlrZSBPZiBGbGFtZSc6ICc0QkYwJywgLy8gT3JiIGV4cGxvc2lvbnMgYWZ0ZXIgU3RyaWtlIFNwYXJrXHJcbiAgICAnRTZOIFJhZGlhbnQgUGx1bWUnOiAnNEJGMicsXHJcbiAgICAnRTZOIEVydXB0aW9uJzogJzRCRjQnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U2TiBWYWN1dW0gU2xpY2UnOiAnNEJENScsIC8vIERhcmsgbGluZSBBb0UgZnJvbSBHYXJ1ZGFcclxuICAgICdFNk4gRG93bmJ1cnN0JzogJzRCREInLCAvLyBCbHVlIGtub2NrYmFjayBjaXJjbGUuIEFjdHVhbCBrbm9ja2JhY2sgaXMgdW5rbm93biBhYmlsaXR5IDRDMjBcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gS2lsbHMgbm9uLXRhbmtzIHdobyBnZXQgaGl0IGJ5IGl0LlxyXG4gICAgJ0U2TiBJbnN0YW50IEluY2luZXJhdGlvbic6ICc0QkVEJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IFNpbXBsZU9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbi8vIFRPRE86IGNoZWNrIHRldGhlcnMgYmVpbmcgY3V0ICh3aGVuIHRoZXkgc2hvdWxkbid0KVxyXG4vLyBUT0RPOiBjaGVjayBmb3IgY29uY3Vzc2VkIGRlYnVmZlxyXG4vLyBUT0RPOiBjaGVjayBmb3IgdGFraW5nIHRhbmtidXN0ZXIgd2l0aCBsaWdodGhlYWRlZFxyXG4vLyBUT0RPOiBjaGVjayBmb3Igb25lIHBlcnNvbiB0YWtpbmcgbXVsdGlwbGUgU3Rvcm0gT2YgRnVyeSBUZXRoZXJzICg0QzAxLzRDMDgpXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBTaW1wbGVPb3BzeVRyaWdnZXJTZXQgPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1cm9yU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgIC8vIEl0J3MgY29tbW9uIHRvIGp1c3QgaWdub3JlIGZ1dGJvbCBtZWNoYW5pY3MsIHNvIGRvbid0IHdhcm4gb24gU3RyaWtlIFNwYXJrLlxyXG4gICAgLy8gJ1NwaWtlIE9mIEZsYW1lJzogJzRDMTMnLCAvLyBPcmIgZXhwbG9zaW9ucyBhZnRlciBTdHJpa2UgU3BhcmtcclxuXHJcbiAgICAnRTZTIFRob3Jucyc6ICc0QkZBJywgLy8gQW9FIG1hcmtlcnMgYWZ0ZXIgRW51bWVyYXRpb25cclxuICAgICdFNlMgRmVyb3N0b3JtIDEnOiAnNEJGRCcsXHJcbiAgICAnRTZTIEZlcm9zdG9ybSAyJzogJzRDMDYnLFxyXG4gICAgJ0U2UyBTdG9ybSBPZiBGdXJ5IDEnOiAnNEMwMCcsIC8vIENpcmNsZSBBb0UgZHVyaW5nIHRldGhlcnMtLUdhcnVkYVxyXG4gICAgJ0U2UyBTdG9ybSBPZiBGdXJ5IDInOiAnNEMwNycsIC8vIENpcmNsZSBBb0UgZHVyaW5nIHRldGhlcnMtLVJha3RhcGFrc2FcclxuICAgICdFNlMgRXhwbG9zaW9uJzogJzRDMDMnLCAvLyBBb0UgY2lyY2xlcywgR2FydWRhIG9yYnNcclxuICAgICdFNlMgSGVhdCBCdXJzdCc6ICc0QzFGJyxcclxuICAgICdFNlMgQ29uZmxhZyBTdHJpa2UnOiAnNEMxMCcsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0VcclxuICAgICdFNlMgUmFkaWFudCBQbHVtZSc6ICc0QzE1JyxcclxuICAgICdFNlMgRXJ1cHRpb24nOiAnNEMxNycsXHJcbiAgICAnRTZTIFdpbmQgQ3V0dGVyJzogJzRDMDInLCAvLyBUZXRoZXItY3V0dGluZyBsaW5lIGFvZVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U2UyBWYWN1dW0gU2xpY2UnOiAnNEJGNScsIC8vIERhcmsgbGluZSBBb0UgZnJvbSBHYXJ1ZGFcclxuICAgICdFNlMgRG93bmJ1cnN0IDEnOiAnNEJGQicsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZSAoR2FydWRhKS5cclxuICAgICdFNlMgRG93bmJ1cnN0IDInOiAnNEJGQycsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZSAoUmFrdGFwYWtzYSkuXHJcbiAgICAnRTZTIE1ldGVvciBTdHJpa2UnOiAnNEMwRicsIC8vIEZyb250YWwgYXZvaWRhYmxlIHRhbmsgYnVzdGVyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFNlMgSGFuZHMgb2YgSGVsbCc6ICc0QzBbQkNdJywgLy8gVGV0aGVyIGNoYXJnZVxyXG4gICAgJ0U2UyBIYW5kcyBvZiBGbGFtZSc6ICc0QzBBJywgLy8gRmlyc3QgVGFua2J1c3RlclxyXG4gICAgJ0U2UyBJbnN0YW50IEluY2luZXJhdGlvbic6ICc0QzBFJywgLy8gU2Vjb25kIFRhbmtidXN0ZXJcclxuICAgICdFNlMgQmxhemUnOiAnNEMxQicsIC8vIEZsYW1lIFRvcm5hZG8gQ2xlYXZlXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgJ0U2UyBBaXIgQnVtcCc6ICc0QkY5JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaGFzQXN0cmFsPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG4gIGhhc1VtYnJhbD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuY29uc3Qgd3JvbmdCdWZmID0gKHN0cjogc3RyaW5nKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnICh3cm9uZyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoZmFsc2NoZXIgQnVmZiknLFxyXG4gICAgZnI6IHN0ciArICcgKG1hdXZhaXMgYnVmZiknLFxyXG4gICAgamE6IHN0ciArICcgKOS4jemBqeWIh+OBquODkOODlSknLFxyXG4gICAgY246IHN0ciArICcgKEJ1ZmbplJnkuoYpJyxcclxuICAgIGtvOiBzdHIgKyAnICjrsoTtlIQg7YuA66a8KScsXHJcbiAgfTtcclxufTtcclxuXHJcbmNvbnN0IG5vQnVmZiA9IChzdHI6IHN0cmluZykgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAobm8gYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGtlaW4gQnVmZiknLFxyXG4gICAgZnI6IHN0ciArICcgKHBhcyBkZSBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo44OQ44OV54Sh44GXKScsXHJcbiAgICBjbjogc3RyICsgJyAo5rKh5pyJQnVmZiknLFxyXG4gICAga286IHN0ciArICco67KE7ZSEIOyXhuydjCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUljb25vY2xhc20sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U3TiBTdHlnaWFuIFN3b3JkJzogJzRDNTUnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRXMgYWZ0ZXIgRmFsc2UgVHdpbGlnaHRcclxuICAgICdFN04gU3RyZW5ndGggSW4gTnVtYmVycyBEb251dCc6ICc0QzRDJywgLy8gTGFyZ2UgZG9udXQgZ3JvdW5kIEFvRXMsIGludGVybWlzc2lvblxyXG4gICAgJ0U3TiBTdHJlbmd0aCBJbiBOdW1iZXJzIDInOiAnNEM0RCcsIC8vIExhcmdlIGNpcmNsZSBncm91bmQgQW9FcywgaW50ZXJtaXNzaW9uXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFN04gU3R5Z2lhbiBTdGFrZSc6ICc0QzMzJywgLy8gTGFzZXIgdGFuayBidXN0ZXIsIG91dHNpZGUgaW50ZXJtaXNzaW9uIHBoYXNlXHJcbiAgICAnRTVOIFNpbHZlciBTaG90JzogJzRFN0QnLCAvLyBTcHJlYWQgbWFya2VycywgaW50ZXJtaXNzaW9uXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBBc3RyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gQXN0cmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gVW1icmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBMaWdodFxcJ3MgQ291cnNlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzRDM0UnLCAnNEM0MCcsICc0QzIyJywgJzRDM0MnLCAnNEU2MyddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzVW1icmFsIHx8ICFkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEuaGFzQXN0cmFsICYmIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiB3cm9uZ0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN04gRGFya3NcXCdzIENvdXJzZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc0QzNEJywgJzRDMjMnLCAnNEM0MScsICc0QzQzJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNBc3RyYWwgfHwgIWRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNVbWJyYWwgJiYgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgLy8gVGhpcyBjYXNlIGlzIHByb2JhYmx5IGltcG9zc2libGUsIGFzIHRoZSBkZWJ1ZmYgdGlja3MgYWZ0ZXIgZGVhdGgsXHJcbiAgICAgICAgLy8gYnV0IGxlYXZpbmcgaXQgaGVyZSBpbiBjYXNlIHRoZXJlJ3Mgc29tZSByZXogb3IgZGlzY29ubmVjdCB0aW1pbmdcclxuICAgICAgICAvLyB0aGF0IGNvdWxkIGxlYWQgdG8gdGhpcy5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiBtaXNzaW5nIGFuIG9yYiBkdXJpbmcgdG9ybmFkbyBwaGFzZVxyXG4vLyBUT0RPOiBqdW1waW5nIGluIHRoZSB0b3JuYWRvIGRhbWFnZT8/XHJcbi8vIFRPRE86IHRha2luZyBzdW5ncmFjZSg0QzgwKSBvciBtb29uZ3JhY2UoNEM4Mikgd2l0aCB3cm9uZyBkZWJ1ZmZcclxuLy8gVE9ETzogc3R5Z2lhbiBzcGVhci9zaWx2ZXIgc3BlYXIgd2l0aCB0aGUgd3JvbmcgZGVidWZmXHJcbi8vIFRPRE86IHRha2luZyBleHBsb3Npb24gZnJvbSB0aGUgd3JvbmcgQ2hpYXJvL1NjdXJvIG9yYlxyXG4vLyBUT0RPOiBoYW5kbGUgNEM4OSBTaWx2ZXIgU3Rha2UgdGFua2J1c3RlciAybmQgaGl0LCBhcyBpdCdzIG9rIHRvIGhhdmUgdHdvIGluLlxyXG5cclxuY29uc3Qgd3JvbmdCdWZmID0gKHN0cjogc3RyaW5nKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnICh3cm9uZyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoZmFsc2NoZXIgQnVmZiknLFxyXG4gICAgZnI6IHN0ciArICcgKG1hdXZhaXMgYnVmZiknLFxyXG4gICAgamE6IHN0ciArICcgKOS4jemBqeWIh+OBquODkOODlSknLFxyXG4gICAgY246IHN0ciArICcgKEJ1ZmbplJnkuoYpJyxcclxuICAgIGtvOiBzdHIgKyAnICjrsoTtlIQg7YuA66a8KScsXHJcbiAgfTtcclxufTtcclxuXHJcbmNvbnN0IG5vQnVmZiA9IChzdHI6IHN0cmluZykgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAobm8gYnVmZiknLFxyXG4gICAgZGU6IHN0ciArICcgKGtlaW4gQnVmZiknLFxyXG4gICAgZnI6IHN0ciArICcgKHBhcyBkZSBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo44OQ44OV54Sh44GXKScsXHJcbiAgICBjbjogc3RyICsgJyAo5rKh5pyJQnVmZiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDsl4bsnYwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNBc3RyYWw/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgaGFzVW1icmFsPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUljb25vY2xhc21TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U3UyBTaWx2ZXIgU3dvcmQnOiAnNEM4RScsIC8vIGdyb3VuZCBhb2VcclxuICAgICdFN1MgT3ZlcndoZWxtaW5nIEZvcmNlJzogJzRDNzMnLCAvLyBhZGQgcGhhc2UgZ3JvdW5kIGFvZVxyXG4gICAgJ0U3UyBTdHJlbmd0aCBpbiBOdW1iZXJzIDEnOiAnNEM3MCcsIC8vIGFkZCBnZXQgdW5kZXJcclxuICAgICdFN1MgU3RyZW5ndGggaW4gTnVtYmVycyAyJzogJzRDNzEnLCAvLyBhZGQgZ2V0IG91dFxyXG4gICAgJ0U3UyBQYXBlciBDdXQnOiAnNEM3RCcsIC8vIHRvcm5hZG8gZ3JvdW5kIGFvZXNcclxuICAgICdFN1MgQnVmZmV0JzogJzRDNzcnLCAvLyB0b3JuYWRvIGdyb3VuZCBhb2VzIGFsc28/P1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U3UyBCZXR3aXh0IFdvcmxkcyc6ICc0QzZCJywgLy8gcHVycGxlIGdyb3VuZCBsaW5lIGFvZXNcclxuICAgICdFN1MgQ3J1c2FkZSc6ICc0QzU4JywgLy8gYmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChzdGFuZGluZyBpbiBpdClcclxuICAgICdFN1MgRXhwbG9zaW9uJzogJzRDNkYnLCAvLyBkaWRuJ3Qga2lsbCBhbiBhZGRcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U3UyBTdHlnaWFuIFN0YWtlJzogJzRDMzQnLCAvLyBMYXNlciB0YW5rIGJ1c3RlciAxXHJcbiAgICAnRTdTIFNpbHZlciBTaG90JzogJzRDOTInLCAvLyBTcHJlYWQgbWFya2Vyc1xyXG4gICAgJ0U3UyBTaWx2ZXIgU2NvdXJnZSc6ICc0QzkzJywgLy8gSWNlIG1hcmtlcnNcclxuICAgICdFN1MgQ2hpYXJvIFNjdXJvIEV4cGxvc2lvbiAxJzogJzREMTQnLCAvLyBvcmIgZXhwbG9zaW9uXHJcbiAgICAnRTdTIENoaWFybyBTY3VybyBFeHBsb3Npb24gMic6ICc0RDE1JywgLy8gb3JiIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSW50ZXJydXB0XHJcbiAgICAgIGlkOiAnRTdTIEFkdmVudCBPZiBMaWdodCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEM2RScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRPRE86IGlzIHRoaXMgYmxhbWUgY29ycmVjdD8gZG9lcyB0aGlzIGhhdmUgYSB0YXJnZXQ/XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgQXN0cmFsIEVmZmVjdCBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbCA9IGRhdGEuaGFzQXN0cmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBBc3RyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBVbWJyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID0gZGF0YS5oYXNVbWJyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIFVtYnJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPSBkYXRhLmhhc1VtYnJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIExpZ2h0XFwncyBDb3Vyc2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEM2MicsICc0QzYzJywgJzRDNjQnLCAnNEM1QicsICc0QzVGJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNVbWJyYWwgfHwgIWRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNBc3RyYWwgJiYgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBEYXJrc1xcJ3MgQ291cnNlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzRDNjUnLCAnNEM2NicsICc0QzY3JywgJzRDNUEnLCAnNEM2MCddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4gIWRhdGEuaGFzQXN0cmFsIHx8ICFkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEuaGFzVW1icmFsICYmIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiB3cm9uZ0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICAgIC8vIFRoaXMgY2FzZSBpcyBwcm9iYWJseSBpbXBvc3NpYmxlLCBhcyB0aGUgZGVidWZmIHRpY2tzIGFmdGVyIGRlYXRoLFxyXG4gICAgICAgIC8vIGJ1dCBsZWF2aW5nIGl0IGhlcmUgaW4gY2FzZSB0aGVyZSdzIHNvbWUgcmV6IG9yIGRpc2Nvbm5lY3QgdGltaW5nXHJcbiAgICAgICAgLy8gdGhhdCBjb3VsZCBsZWFkIHRvIHRoaXMuXHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBDcnVzYWRlIEtub2NrYmFjaycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gNEM3NiBpcyB0aGUga25vY2tiYWNrIGRhbWFnZSwgNEM1OCBpcyB0aGUgZGFtYWdlIGZvciBzdGFuZGluZyBvbiB0aGUgcHVjay5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRDNzYnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlUmVmdWxnZW5jZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRThOIEJpdGluZyBGcm9zdCc6ICc0RERCJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgU2hpdmFcclxuICAgICdFOE4gRHJpdmluZyBGcm9zdCc6ICc0RERDJywgLy8gUmVhciBjb25lIEFvRSwgU2hpdmFcclxuICAgICdFOE4gRnJpZ2lkIFN0b25lJzogJzRFNjYnLCAvLyBTbWFsbCBzcHJlYWQgY2lyY2xlcywgcGhhc2UgMVxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgQXhlIEtpY2snOiAnNEUwMCcsIC8vIExhcmdlIGNpcmNsZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOE4gUmVmbGVjdGVkIFNjeXRoZSBLaWNrJzogJzRFMDEnLCAvLyBEb251dCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOE4gRnJpZ2lkIEVydXB0aW9uJzogJzRFMDknLCAvLyBTbWFsbCBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOE4gSWNpY2xlIEltcGFjdCc6ICc0RTBBJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThOIEF4ZSBLaWNrJzogJzRERTInLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBTY3l0aGUgS2ljayc6ICc0REUzJywgLy8gRG9udXQgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgQml0aW5nIEZyb3N0JzogJzRERkUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThOIFJlZmxlY3RlZCBEcml2aW5nIEZyb3N0JzogJzRERkYnLCAvLyBDb25lIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge30sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOE4gU2hpbmluZyBBcm1vcicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc5NScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOE4gSGVhdmVubHkgU3RyaWtlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEREOCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc3Rvw59lbiEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67Cx65CoIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBGcm9zdCBBcm1vcicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFRoaW4gSWNlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEYnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1NsaWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAncnVudGVyZ2VydXRzY2h0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSBnbGlzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+a7keOBo+OBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5ruR6JC9JyxcclxuICAgICAgICAgICAga286ICfrr7jrgYTrn6zsp5AhJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogcnVzaCBoaXR0aW5nIHRoZSBjcnlzdGFsXHJcbi8vIFRPRE86IGFkZHMgbm90IGJlaW5nIGtpbGxlZFxyXG4vLyBUT0RPOiB0YWtpbmcgdGhlIHJ1c2ggdHdpY2UgKHdoZW4geW91IGhhdmUgZGVidWZmKVxyXG4vLyBUT0RPOiBub3QgaGl0dGluZyB0aGUgZHJhZ29uIGZvdXIgdGltZXMgZHVyaW5nIHd5cm0ncyBsYW1lbnRcclxuLy8gVE9ETzogZGVhdGggcmVhc29ucyBmb3Igbm90IHBpY2tpbmcgdXAgcHVkZGxlXHJcbi8vIFRPRE86IG5vdCBiZWluZyBpbiB0aGUgdG93ZXIgd2hlbiB5b3Ugc2hvdWxkXHJcbi8vIFRPRE86IHBpY2tpbmcgdXAgdG9vIG1hbnkgc3RhY2tzXHJcblxyXG4vLyBOb3RlOiBCYW5pc2ggSUlJICg0REE4KSBhbmQgQmFuaXNoIElpaSBEaXZpZGVkICg0REE5KSBib3RoIGFyZSB0eXBlPTB4MTYgbGluZXMuXHJcbi8vIFRoZSBzYW1lIGlzIHRydWUgZm9yIEJhbmlzaCAoNERBNikgYW5kIEJhbmlzaCBEaXZpZGVkICg0REE3KS5cclxuLy8gSSdtIG5vdCBzdXJlIHRoaXMgbWFrZXMgYW55IHNlbnNlPyBCdXQgY2FuJ3QgdGVsbCBpZiB0aGUgc3ByZWFkIHdhcyBhIG1pc3Rha2Ugb3Igbm90LlxyXG4vLyBNYXliZSB3ZSBjb3VsZCBjaGVjayBmb3IgXCJNYWdpYyBWdWxuZXJhYmlsaXR5IFVwXCI/XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZVJlZnVsZ2VuY2VTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U4UyBCaXRpbmcgRnJvc3QnOiAnNEQ2NicsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIFNoaXZhXHJcbiAgICAnRThTIERyaXZpbmcgRnJvc3QnOiAnNEQ2NycsIC8vIFJlYXIgY29uZSBBb0UsIFNoaXZhXHJcbiAgICAnRThTIEF4ZSBLaWNrJzogJzRENkQnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBTY3l0aGUgS2ljayc6ICc0RDZFJywgLy8gRG9udXQgQW9FLCBTaGl2YVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgQXhlIEtpY2snOiAnNERCOScsIC8vIExhcmdlIGNpcmNsZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIFNjeXRoZSBLaWNrJzogJzREQkEnLCAvLyBEb251dCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgRnJpZ2lkIEVydXB0aW9uJzogJzREOUYnLCAvLyBTbWFsbCBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOFMgRnJpZ2lkIE5lZWRsZSc6ICc0RDlEJywgLy8gOC13YXkgXCJmbG93ZXJcIiBleHBsb3Npb25cclxuICAgICdFOFMgSWNpY2xlIEltcGFjdCc6ICc0REEwJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSBwdWRkbGVzLCBwaGFzZSAxXHJcbiAgICAnRThTIFJlZmxlY3RlZCBCaXRpbmcgRnJvc3QgMSc6ICc0REI3JywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgQml0aW5nIEZyb3N0IDInOiAnNERDMycsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIERyaXZpbmcgRnJvc3QgMSc6ICc0REI4JywgLy8gQ29uZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOFMgUmVmbGVjdGVkIERyaXZpbmcgRnJvc3QgMic6ICc0REM0JywgLy8gQ29uZSBBb0UsIEZyb3plbiBNaXJyb3JcclxuXHJcbiAgICAnRThTIEhhbGxvd2VkIFdpbmdzIDEnOiAnNEQ3NScsIC8vIExlZnQgY2xlYXZlXHJcbiAgICAnRThTIEhhbGxvd2VkIFdpbmdzIDInOiAnNEQ3NicsIC8vIFJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U4UyBIYWxsb3dlZCBXaW5ncyAzJzogJzRENzcnLCAvLyBLbm9ja2JhY2sgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDEnOiAnNEQ5MCcsIC8vIFJlZmxlY3RlZCBsZWZ0IDJcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDInOiAnNERCQicsIC8vIFJlZmxlY3RlZCBsZWZ0IDFcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDMnOiAnNERDNycsIC8vIFJlZmxlY3RlZCByaWdodCAyXHJcbiAgICAnRThTIFJlZmxlY3RlZCBIYWxsb3dlZCBXaW5ncyA0JzogJzREOTEnLCAvLyBSZWZsZWN0ZWQgcmlnaHQgMVxyXG4gICAgJ0U4UyBUd2luIFN0aWxsbmVzcyAxJzogJzRENjgnLFxyXG4gICAgJ0U4UyBUd2luIFN0aWxsbmVzcyAyJzogJzRENkInLFxyXG4gICAgJ0U4UyBUd2luIFNpbGVuY2UgMSc6ICc0RDY5JyxcclxuICAgICdFOFMgVHdpbiBTaWxlbmNlIDInOiAnNEQ2QScsXHJcbiAgICAnRThTIEFraCBSaGFpJzogJzREOTknLFxyXG4gICAgJ0U4UyBFbWJpdHRlcmVkIERhbmNlIDEnOiAnNEQ3MCcsXHJcbiAgICAnRThTIEVtYml0dGVyZWQgRGFuY2UgMic6ICc0RDcxJyxcclxuICAgICdFOFMgU3BpdGVmdWwgRGFuY2UgMSc6ICc0RDZGJyxcclxuICAgICdFOFMgU3BpdGVmdWwgRGFuY2UgMic6ICc0RDcyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIEJyb2tlbiB0ZXRoZXIuXHJcbiAgICAnRThTIFJlZnVsZ2VudCBGYXRlJzogJzREQTQnLFxyXG4gICAgLy8gU2hhcmVkIG9yYiwgY29ycmVjdCBpcyBCcmlnaHQgUHVsc2UgKDREOTUpXHJcbiAgICAnRThTIEJsaW5kaW5nIFB1bHNlJzogJzREOTYnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRThTIFBhdGggb2YgTGlnaHQnOiAnNERBMScsIC8vIFByb3RlYW5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThTIFNoaW5pbmcgQXJtb3InLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBTdHVuXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc5NScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSW50ZXJydXB0XHJcbiAgICAgIGlkOiAnRThTIFN0b25lc2tpbicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEQ4NScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VVbWJyYSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTlOIFRoZSBBcnQgT2YgRGFya25lc3MgMSc6ICc1MjIzJywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOU4gVGhlIEFydCBPZiBEYXJrbmVzcyAyJzogJzUyMjQnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5TiBXaWRlLUFuZ2xlIFBhcnRpY2xlIEJlYW0nOiAnNUFGRicsIC8vIGZyb250YWwgY2xlYXZlIHR1dG9yaWFsIG1lY2hhbmljXHJcbiAgICAnRTlOIFdpZGUtQW5nbGUgUGhhc2VyJzogJzU1RTEnLCAvLyB3aWRlLWFuZ2xlIFwic2lkZXNcIlxyXG4gICAgJ0U5TiBCYWQgVmlicmF0aW9ucyc6ICc1NUU2JywgLy8gdGV0aGVyZWQgb3V0c2lkZSBnaWFudCB0cmVlIGdyb3VuZCBhb2VzXHJcbiAgICAnRTlOIEVhcnRoLVNoYXR0ZXJpbmcgUGFydGljbGUgQmVhbSc6ICc1MjI1JywgLy8gbWlzc2luZyB0b3dlcnM/XHJcbiAgICAnRTlOIEFudGktQWlyIFBhcnRpY2xlIEJlYW0nOiAnNTVEQycsIC8vIFwiZ2V0IG91dFwiIGR1cmluZyBwYW5lbHNcclxuICAgICdFOU4gWmVyby1Gb3JtIFBhcnRpY2xlIEJlYW0gMic6ICc1NURCJywgLy8gQ2xvbmUgbGluZSBhb2VzIHcvIEFudGktQWlyIFBhcnRpY2xlIEJlYW1cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFOU4gV2l0aGRyYXcnOiAnNTUzNCcsIC8vIFNsb3cgdG8gYnJlYWsgc2VlZCBjaGFpbiwgZ2V0IHN1Y2tlZCBiYWNrIGluIHlpa2VzXHJcbiAgICAnRTlOIEFldGhlcm9zeW50aGVzaXMnOiAnNTUzNScsIC8vIFN0YW5kaW5nIG9uIHNlZWRzIGR1cmluZyBleHBsb3Npb24gKHBvc3NpYmx5IHZpYSBXaXRoZHJhdylcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U5TiBaZXJvLUZvcm0gUGFydGljbGUgQmVhbSAxJzogJzU1RUInLCAvLyB0YW5rIGxhc2VyIHdpdGggbWFya2VyXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogNTYxRCBFdmlsIFNlZWQgaGl0cyBldmVyeW9uZSwgaGFyZCB0byBrbm93IGlmIHRoZXJlJ3MgYSBkb3VibGUgdGFwXHJcbi8vIFRPRE86IGZhbGxpbmcgdGhyb3VnaCBwYW5lbCBqdXN0IGRvZXMgZGFtYWdlIHdpdGggbm8gYWJpbGl0eSBuYW1lLCBsaWtlIGEgZGVhdGggd2FsbFxyXG4vLyBUT0RPOiB3aGF0IGhhcHBlbnMgaWYgeW91IGp1bXAgaW4gc2VlZCB0aG9ybnM/XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlVW1icmFTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U5UyBCYWQgVmlicmF0aW9ucyc6ICc1NjFDJywgLy8gdGV0aGVyZWQgb3V0c2lkZSBnaWFudCB0cmVlIGdyb3VuZCBhb2VzXHJcbiAgICAnRTlTIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1QjAwJywgLy8gYW50aS1haXIgXCJzaWRlc1wiXHJcbiAgICAnRTlTIFdpZGUtQW5nbGUgUGhhc2VyIFVubGltaXRlZCc6ICc1NjBFJywgLy8gd2lkZS1hbmdsZSBcInNpZGVzXCJcclxuICAgICdFOVMgQW50aS1BaXIgUGFydGljbGUgQmVhbSc6ICc1QjAxJywgLy8gd2lkZS1hbmdsZSBcIm91dFwiXHJcbiAgICAnRTlTIFRoZSBTZWNvbmQgQXJ0IE9mIERhcmtuZXNzIDEnOiAnNTYwMScsIC8vIGxlZnQtcmlnaHQgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBTZWNvbmQgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTYwMicsIC8vIGxlZnQtcmlnaHQgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgMSc6ICc1QTk1JywgLy8gYm9zcyBsZWZ0LXJpZ2h0IHN1bW1vbi9wYW5lbCBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyAyJzogJzVBOTYnLCAvLyBib3NzIGxlZnQtcmlnaHQgc3VtbW9uL3BhbmVsIGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIENsb25lIDEnOiAnNTYxRScsIC8vIGNsb25lIGxlZnQtcmlnaHQgc3VtbW9uIGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIENsb25lIDInOiAnNTYxRicsIC8vIGNsb25lIGxlZnQtcmlnaHQgc3VtbW9uIGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgVGhpcmQgQXJ0IE9mIERhcmtuZXNzIDEnOiAnNTYwMycsIC8vIHRoaXJkIGFydCBsZWZ0LXJpZ2h0IGNsZWF2ZSBpbml0aWFsXHJcbiAgICAnRTlTIFRoZSBUaGlyZCBBcnQgT2YgRGFya25lc3MgMic6ICc1NjA0JywgLy8gdGhpcmQgYXJ0IGxlZnQtcmlnaHQgY2xlYXZlIGluaXRpYWxcclxuICAgICdFOVMgQXJ0IE9mIERhcmtuZXNzJzogJzU2MDYnLCAvLyB0aGlyZCBhcnQgbGVmdC1yaWdodCBjbGVhdmUgZmluYWxcclxuICAgICdFOVMgRnVsbC1QZXJpbWl0ZXIgUGFydGljbGUgQmVhbSc6ICc1NjI5JywgLy8gcGFuZWwgXCJnZXQgaW5cIlxyXG4gICAgJ0U5UyBEYXJrIENoYWlucyc6ICc1RkFDJywgLy8gU2xvdyB0byBicmVhayBwYXJ0bmVyIGNoYWluc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U5UyBXaXRoZHJhdyc6ICc1NjFBJywgLy8gU2xvdyB0byBicmVhayBzZWVkIGNoYWluLCBnZXQgc3Vja2VkIGJhY2sgaW4geWlrZXNcclxuICAgICdFOVMgQWV0aGVyb3N5bnRoZXNpcyc6ICc1NjFCJywgLy8gU3RhbmRpbmcgb24gc2VlZHMgZHVyaW5nIGV4cGxvc2lvbiAocG9zc2libHkgdmlhIFdpdGhkcmF3KVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnRTlTIFN0eWdpYW4gVGVuZHJpbHMnOiAnOTUyJywgLy8gc3RhbmRpbmcgaW4gdGhlIGJyYW1ibGVzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFOVMgSHlwZXItRm9jdXNlZCBQYXJ0aWNsZSBCZWFtJzogJzU1RkQnLCAvLyBBcnQgT2YgRGFya25lc3MgcHJvdGVhblxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTlTIENvbmRlbnNlZCBXaWRlLUFuZ2xlIFBhcnRpY2xlIEJlYW0nOiAnNTYxMCcsIC8vIHdpZGUtYW5nbGUgXCJ0YW5rIGxhc2VyXCJcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAnRTlTIE11bHRpLVByb25nZWQgUGFydGljbGUgQmVhbSc6ICc1NjAwJywgLy8gQXJ0IE9mIERhcmtuZXNzIFBhcnRuZXIgU3RhY2tcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEFudGktYWlyIFwidGFuayBzcHJlYWRcIi4gIFRoaXMgY2FuIGJlIHN0YWNrZWQgYnkgdHdvIHRhbmtzIGludnVsbmluZy5cclxuICAgICAgLy8gTm90ZTogdGhpcyB3aWxsIHN0aWxsIHNob3cgc29tZXRoaW5nIGZvciBob2xtZ2FuZy9saXZpbmcsIGJ1dFxyXG4gICAgICAvLyBhcmd1YWJseSBhIGhlYWxlciBtaWdodCBuZWVkIHRvIGRvIHNvbWV0aGluZyBhYm91dCB0aGF0LCBzbyBtYXliZVxyXG4gICAgICAvLyBpdCdzIG9rIHRvIHN0aWxsIHNob3cgYXMgYSB3YXJuaW5nPz9cclxuICAgICAgaWQ6ICdFOVMgQ29uZGVuc2VkIEFudGktQWlyIFBhcnRpY2xlIEJlYW0nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgdHlwZTogJzIyJywgaWQ6ICc1NjE1JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gQW50aS1haXIgXCJvdXRcIi4gIFRoaXMgY2FuIGJlIGludnVsbmVkIGJ5IGEgdGFuayBhbG9uZyB3aXRoIHRoZSBzcHJlYWQgYWJvdmUuXHJcbiAgICAgIGlkOiAnRTlTIEFudGktQWlyIFBoYXNlciBVbmxpbWl0ZWQnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc1NjEyJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUxpdGFueSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEwTiBGb3J3YXJkIEltcGxvc2lvbic6ICc1NkI0JywgLy8gaG93bCBib3NzIGltcGxvc2lvblxyXG4gICAgJ0UxME4gRm9yd2FyZCBTaGFkb3cgSW1wbG9zaW9uJzogJzU2QjUnLCAvLyBob3dsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBOIEJhY2t3YXJkIEltcGxvc2lvbic6ICc1NkI3JywgLy8gdGFpbCBib3NzIGltcGxvc2lvblxyXG4gICAgJ0UxME4gQmFja3dhcmQgU2hhZG93IEltcGxvc2lvbic6ICc1NkI4JywgLy8gdGFpbCBzaGFkb3cgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBCYXJicyBPZiBBZ29ueSAxJzogJzU2RDknLCAvLyBTaGFkb3cgV2FycmlvciAzIGRvZyByb29tIGNsZWF2ZVxyXG4gICAgJ0UxME4gQmFyYnMgT2YgQWdvbnkgMic6ICc1QjI2JywgLy8gU2hhZG93IFdhcnJpb3IgMyBkb2cgcm9vbSBjbGVhdmVcclxuICAgICdFMTBOIENsb2FrIE9mIFNoYWRvd3MnOiAnNUIxMScsIC8vIG5vbi1zcXVpZ2dseSBsaW5lIGV4cGxvc2lvbnNcclxuICAgICdFMTBOIFRocm9uZSBPZiBTaGFkb3cnOiAnNTZDNycsIC8vIHN0YW5kaW5nIHVwIGdldCBvdXRcclxuICAgICdFMTBOIFJpZ2h0IEdpZ2EgU2xhc2gnOiAnNTZBRScsIC8vIGJvc3MgcmlnaHQgZ2lnYSBzbGFzaFxyXG4gICAgJ0UxME4gUmlnaHQgU2hhZG93IFNsYXNoJzogJzU2QUYnLCAvLyBnaWdhIHNsYXNoIGZyb20gc2hhZG93XHJcbiAgICAnRTEwTiBMZWZ0IEdpZ2EgU2xhc2gnOiAnNTZCMScsIC8vIGJvc3MgbGVmdCBnaWdhIHNsYXNoXHJcbiAgICAnRTEwTiBMZWZ0IFNoYWRvdyBTbGFzaCc6ICc1NkJEJywgLy8gZ2lnYSBzbGFzaCBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxME4gU2hhZG93eSBFcnVwdGlvbic6ICc1NkUxJywgLy8gYmFpdGVkIGdyb3VuZCBhb2UgbWFya2VycyBwYWlyZWQgd2l0aCBiYXJic1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEwTiBTaGFkb3dcXCdzIEVkZ2UnOiAnNTZEQicsIC8vIFRhbmtidXN0ZXIgc2luZ2xlIHRhcmdldCBmb2xsb3d1cFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IGhpdHRpbmcgc2hhZG93IG9mIHRoZSBoZXJvIHdpdGggYWJpbGl0aWVzIGNhbiBjYXVzZSB5b3UgdG8gdGFrZSBkYW1hZ2UsIGxpc3QgdGhvc2U/XHJcbi8vICAgICAgIGUuZy4gcGlja2luZyB1cCB5b3VyIGZpcnN0IHBpdGNoIGJvZyBwdWRkbGUgd2lsbCBjYXVzZSB5b3UgdG8gZGllIHRvIHRoZSBkYW1hZ2VcclxuLy8gICAgICAgeW91ciBzaGFkb3cgdGFrZXMgZnJvbSBEZWVwc2hhZG93IE5vdmEgb3IgRGlzdGFudCBTY3JlYW0uXHJcbi8vIFRPRE86IDU3M0IgQmxpZ2h0aW5nIEJsaXR6IGlzc3VlcyBkdXJpbmcgbGltaXQgY3V0IG51bWJlcnNcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VMaXRhbnlTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFNpbmdsZSAxJzogJzU2RjInLCAvLyBzaW5nbGUgdGFpbCB1cCBzaGFkb3cgaW1wbG9zaW9uXHJcbiAgICAnRTEwUyBJbXBsb3Npb24gU2luZ2xlIDInOiAnNTZFRicsIC8vIHNpbmdsZSBob3dsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBTIEltcGxvc2lvbiBRdWFkcnVwbGUgMSc6ICc1NkVGJywgLy8gcXVhZHJ1cGxlIHNldCBvZiBzaGFkb3cgaW1wbG9zaW9uc1xyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFF1YWRydXBsZSAyJzogJzU2RjInLCAvLyBxdWFkcnVwbGUgc2V0IG9mIHNoYWRvdyBpbXBsb3Npb25zXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFNpbmdsZSAxJzogJzU2RUMnLCAvLyBHaWdhIHNsYXNoIHNpbmdsZSBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBTaW5nbGUgMic6ICc1NkVEJywgLy8gR2lnYSBzbGFzaCBzaW5nbGUgZnJvbSBzaGFkb3dcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggQm94IDEnOiAnNTcwOScsIC8vIEdpZ2Egc2xhc2ggYm94IGZyb20gZm91ciBncm91bmQgc2hhZG93c1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBCb3ggMic6ICc1NzBEJywgLy8gR2lnYSBzbGFzaCBib3ggZnJvbSBmb3VyIGdyb3VuZCBzaGFkb3dzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFF1YWRydXBsZSAxJzogJzU2RUMnLCAvLyBxdWFkcnVwbGUgc2V0IG9mIGdpZ2Egc2xhc2ggY2xlYXZlc1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBRdWFkcnVwbGUgMic6ICc1NkU5JywgLy8gcXVhZHJ1cGxlIHNldCBvZiBnaWdhIHNsYXNoIGNsZWF2ZXNcclxuICAgICdFMTBTIENsb2FrIE9mIFNoYWRvd3MgMSc6ICc1QjEzJywgLy8gaW5pdGlhbCBub24tc3F1aWdnbHkgbGluZSBleHBsb3Npb25zXHJcbiAgICAnRTEwUyBDbG9hayBPZiBTaGFkb3dzIDInOiAnNUIxNCcsIC8vIHNlY29uZCBzcXVpZ2dseSBsaW5lIGV4cGxvc2lvbnNcclxuICAgICdFMTBTIFRocm9uZSBPZiBTaGFkb3cnOiAnNTcxNycsIC8vIHN0YW5kaW5nIHVwIGdldCBvdXRcclxuICAgICdFMTBTIFNoYWRvd3kgRXJ1cHRpb24nOiAnNTczOCcsIC8vIGJhaXRlZCBncm91bmQgYW9lIGR1cmluZyBhbXBsaWZpZXJcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTBTIFN3YXRoIE9mIFNpbGVuY2UgMSc6ICc1NzFBJywgLy8gU2hhZG93IGNsb25lIGNsZWF2ZSAodG9vIGNsb3NlKVxyXG4gICAgJ0UxMFMgU3dhdGggT2YgU2lsZW5jZSAyJzogJzVCQkYnLCAvLyBTaGFkb3cgY2xvbmUgY2xlYXZlICh0aW1lZClcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMFMgU2hhZGVmaXJlJzogJzU3MzInLCAvLyBwdXJwbGUgdGFuayB1bWJyYWwgb3Jic1xyXG4gICAgJ0UxMFMgUGl0Y2ggQm9nJzogJzU3MjInLCAvLyBtYXJrZXIgc3ByZWFkIHRoYXQgZHJvcHMgYSBzaGFkb3cgcHVkZGxlXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMTBTIFNoYWRvd1xcJ3MgRWRnZSc6ICc1NzI1JywgLy8gVGFua2J1c3RlciBzaW5nbGUgdGFyZ2V0IGZvbGxvd3VwXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMFMgRGFtYWdlIERvd24gT3JicycsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnRmxhbWVzaGFkb3cnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdTY2hhdHRlbmZsYW1tZScsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ0ZsYW1tZSBvbWJyYWxlJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAn44K344Oj44OJ44Km44OV44Os44Kk44OgJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZGFtYWdlJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBgJHttYXRjaGVzLmVmZmVjdH0gKHBhcnRpYWwgc3RhY2spYCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTBTIERhbWFnZSBEb3duIEJvc3MnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBTaGFja2xlcyBiZWluZyBtZXNzZWQgdXAgYXBwZWFyIHRvIGp1c3QgZ2l2ZSB0aGUgRGFtYWdlIERvd24sIHdpdGggbm90aGluZyBlbHNlLlxyXG4gICAgICAvLyBNZXNzaW5nIHVwIHRvd2VycyBpcyB0aGUgVGhyaWNlLUNvbWUgUnVpbiBlZmZlY3QgKDlFMiksIGJ1dCBhbHNvIERhbWFnZSBEb3duLlxyXG4gICAgICAvLyBUT0RPOiBzb21lIG9mIHRoZXNlIHdpbGwgYmUgZHVwbGljYXRlZCB3aXRoIG90aGVycywgbGlrZSBgRTEwUyBUaHJvbmUgT2YgU2hhZG93YC5cclxuICAgICAgLy8gTWF5YmUgaXQnZCBiZSBuaWNlIHRvIGZpZ3VyZSBvdXQgaG93IHRvIHB1dCB0aGUgZGFtYWdlIG1hcmtlciBvbiB0aGF0P1xyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NoYWRvd2tlZXBlcicsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NjaGF0dGVua8O2bmlnJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnUm9pIERlIExcXCdPbWJyZScsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ+W9seOBrueOiycsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2RhbWFnZScsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogYCR7bWF0Y2hlcy5lZmZlY3R9YCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gU2hhZG93IFdhcnJpb3IgNCBkb2cgcm9vbSBjbGVhdmVcclxuICAgICAgLy8gVGhpcyBjYW4gYmUgbWl0aWdhdGVkIGJ5IHRoZSB3aG9sZSBncm91cCwgc28gYWRkIGEgZGFtYWdlIGNvbmRpdGlvbi5cclxuICAgICAgaWQ6ICdFMTBTIEJhcmJzIE9mIEFnb255JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzU3MkEnLCAnNUIyNyddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VBbmFtb3JwaG9zaXMsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMU4gQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjJFJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFOIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2MkMnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gQnVybnQgU3RyaWtlIEhvbHknOiAnNTYzMCcsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBCdXJub3V0JzogJzU2MkYnLCAvLyBCdXJudCBTdHJpa2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gICAgJ0UxMU4gU2hpbmluZyBCbGFkZSc6ICc1NjMxJywgLy8gQmFpdGVkIGV4cGxvc2lvblxyXG4gICAgJ0UxMU4gSGFsbyBPZiBGbGFtZSBCcmlnaHRmaXJlJzogJzU2M0InLCAvLyBSZWQgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFOIEhhbG8gT2YgTGV2aW4gQnJpZ2h0ZmlyZSc6ICc1NjNDJywgLy8gQmx1ZSBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMU4gUmVzb3VuZGluZyBDcmFjayc6ICc1NjREJywgLy8gRGVtaS1HdWt1bWF0eiAyNzAgZGVncmVlIGZyb250YWwgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgTGlnaHRuaW5nJzogJzU2NDUnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybnQgU3RyaWtlIEZpcmUnOiAnNTY0MycsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJub3V0JzogJzU2NDYnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTExTiBCbGFzdGluZyBab25lJzogJzU2M0UnLCAvLyBQcmlzbWF0aWMgRGVjZXB0aW9uIGNoYXJnZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMU4gQnVybiBNYXJrJzogJzU2NEYnLCAvLyBQb3dkZXIgTWFyayBkZWJ1ZmYgZXhwbG9zaW9uXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMU4gQmxhc3RidXJuIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyA1NjJEID0gQnVybnQgU3RyaWtlIGZpcmUgZm9sbG93dXAgZHVyaW5nIG1vc3Qgb2YgdGhlIGZpZ2h0XHJcbiAgICAgIC8vIDU2NDQgPSBzYW1lIHRoaW5nLCBidXQgZnJvbSBGYXRlYnJlYWtlcidzIEltYWdlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1NjJEJywgJzU2NDQnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyA1NjVBLzU2OEQgU2luc21va2UgQm91bmQgT2YgRmFpdGggc2hhcmVcclxuLy8gNTY1RS81Njk5IEJvd3Nob2NrIGhpdHMgdGFyZ2V0IG9mIDU2NUQgKHR3aWNlKSBhbmQgdHdvIG90aGVyc1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUFuYW1vcnBob3Npc1NhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjUyJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY1NCcsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgSG9seSc6ICc1NjU2JywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIFNoaW5pbmcgQmxhZGUnOiAnNTY1NycsIC8vIEJhaXRlZCBleHBsb3Npb25cclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBDeWNsZSBGaXJlJzogJzU2OEUnLCAvLyBMaW5lIGNsZWF2ZSBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBDeWNsZSBMaWdodG5pbmcnOiAnNTY5NScsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIEhvbHknOiAnNTY5RCcsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgU2hpbmluZyBCbGFkZSBDeWNsZSc6ICc1NjlFJywgLy8gQmFpdGVkIGV4cGxvc2lvbiBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIEhhbG8gT2YgRmxhbWUgQnJpZ2h0ZmlyZSc6ICc1NjZEJywgLy8gUmVkIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBIYWxvIE9mIExldmluIEJyaWdodGZpcmUnOiAnNTY2QycsIC8vIEJsdWUgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFBvcnRhbCBPZiBGbGFtZSBCcmlnaHQgUHVsc2UnOiAnNTY3MScsIC8vIFJlZCBjYXJkIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFBvcnRhbCBPZiBMZXZpbiBCcmlnaHQgUHVsc2UnOiAnNTY3MCcsIC8vIEJsdWUgY2FyZCBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExUyBSZXNvbmFudCBXaW5kcyc6ICc1Njg5JywgLy8gRGVtaS1HdWt1bWF0eiBcImdldCBpblwiXHJcbiAgICAnRTExUyBSZXNvdW5kaW5nIENyYWNrJzogJzU2ODgnLCAvLyBEZW1pLUd1a3VtYXR6IDI3MCBkZWdyZWUgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFMTFTIEltYWdlIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY3QicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJub3V0JzogJzU2N0MnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgRmlyZSc6ICc1Njc5JywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBIb2x5JzogJzU2N0InLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgU2hpbmluZyBCbGFkZSc6ICc1NjdFJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgYmFpdGVkIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMVMgQnVybm91dCc6ICc1NjU1JywgLy8gQnVybnQgU3RyaWtlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFTIEJ1cm5vdXQgQ3ljbGUnOiAnNTY5NicsIC8vIEJ1cm50IFN0cmlrZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExUyBCbGFzdGluZyBab25lJzogJzU2NzQnLCAvLyBQcmlzbWF0aWMgRGVjZXB0aW9uIGNoYXJnZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UxMVMgRWxlbWVudGFsIEJyZWFrJzogJzU2NjQnLCAvLyBFbGVtZW50YWwgQnJlYWsgcHJvdGVhblxyXG4gICAgJ0UxMVMgRWxlbWVudGFsIEJyZWFrIEN5Y2xlJzogJzU2OEMnLCAvLyBFbGVtZW50YWwgQnJlYWsgcHJvdGVhbiBkdXJpbmcgQ3ljbGVcclxuICAgICdFMTFTIFNpbnNtaXRlJzogJzU2NjcnLCAvLyBMaWdodG5pbmcgRWxlbWVudGFsIEJyZWFrIHNwcmVhZFxyXG4gICAgJ0UxMVMgU2luc21pdGUgQ3ljbGUnOiAnNTY5NCcsIC8vIExpZ2h0bmluZyBFbGVtZW50YWwgQnJlYWsgc3ByZWFkIGR1cmluZyBDeWNsZVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTExUyBCdXJuIE1hcmsnOiAnNTZBMycsIC8vIFBvd2RlciBNYXJrIGRlYnVmZiBleHBsb3Npb25cclxuICAgICdFMTFTIFNpbnNpZ2h0IDEnOiAnNTY2MScsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyXHJcbiAgICAnRTExUyBTaW5zaWdodCAyJzogJzVCQzcnLCAvLyBIb2x5IEJvdW5kIE9mIEZhaXRoIHRldGhlciBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICdFMTFTIFNpbnNpZ2h0IDMnOiAnNTZBMCcsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyIGR1cmluZyBDeWNsZVxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgICdFMTFTIEhvbHkgU2luc2lnaHQgR3JvdXAgU2hhcmUnOiAnNTY2OScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMVMgQmxhc3RidXJuIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyA1NjUzID0gQnVybnQgU3RyaWtlIGZpcmUgZm9sbG93dXAgZHVyaW5nIG1vc3Qgb2YgdGhlIGZpZ2h0XHJcbiAgICAgIC8vIDU2N0EgPSBzYW1lIHRoaW5nLCBidXQgZnJvbSBGYXRlYnJlYWtlcidzIEltYWdlXHJcbiAgICAgIC8vIDU2OEYgPSBzYW1lIHRoaW5nLCBidXQgZHVyaW5nIEN5Y2xlIG9mIEZhaXRoXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1NjUzJywgJzU2N0EnLCAnNTY4RiddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlRXRlcm5pdHksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMk4gSnVkZ21lbnQgSm9sdCBTaW5nbGUnOiAnNTg1RicsIC8vIFJhbXVoIGdldCBvdXQgY2FzdFxyXG4gICAgJ0UxMk4gSnVkZ21lbnQgSm9sdCc6ICc0RTMwJywgLy8gUmFtdWggZ2V0IG91dCBjYXN0XHJcbiAgICAnRTEyTiBUZW1wb3JhcnkgQ3VycmVudCBTaW5nbGUnOiAnNTg1QycsIC8vIExldmkgZ2V0IHVuZGVyIGNhc3RcclxuICAgICdFMTJOIFRlbXBvcmFyeSBDdXJyZW50JzogJzRFMkQnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0XHJcbiAgICAnRTEyTiBDb25mbGFnIFN0cmlrZSBTaW5nbGUnOiAnNTg1RCcsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0XHJcbiAgICAnRTEyTiBDb25mbGFnIFN0cmlrZSc6ICc0RTJFJywgLy8gSWZyaXQgZ2V0IHNpZGVzIGNhc3RcclxuICAgICdFMTJOIEZlcm9zdG9ybSBTaW5nbGUnOiAnNTg1RScsIC8vIEdhcnVkYSBnZXQgaW50ZXJjYXJkaW5hbHMgY2FzdFxyXG4gICAgJ0UxMk4gRmVyb3N0b3JtJzogJzRFMkYnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3RcclxuICAgICdFMTJOIFJhcHR1cm91cyBSZWFjaCAxJzogJzU4NzgnLCAvLyBIYWlyY3V0XHJcbiAgICAnRTEyTiBSYXB0dXJvdXMgUmVhY2ggMic6ICc1ODc3JywgLy8gSGFpcmN1dFxyXG4gICAgJ0UxMk4gQm9tYiBFeHBsb3Npb24nOiAnNTg2RCcsIC8vIFNtYWxsIGJvbWIgZXhwbG9zaW9uXHJcbiAgICAnRTEyTiBUaXRhbmljIEJvbWIgRXhwbG9zaW9uJzogJzU4NkYnLCAvLyBMYXJnZSBib21iIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEyTiBFYXJ0aHNoYWtlcic6ICc1ODg1JywgLy8gRWFydGhzaGFrZXIgb24gZmlyc3QgcGxhdGZvcm1cclxuICAgICdFMTJOIFByb21pc2UgRnJpZ2lkIFN0b25lIDEnOiAnNTg2NycsIC8vIFNoaXZhIHNwcmVhZCB3aXRoIHNsaWRpbmdcclxuICAgICdFMTJOIFByb21pc2UgRnJpZ2lkIFN0b25lIDInOiAnNTg2OScsIC8vIFNoaXZhIHNwcmVhZCB3aXRoIFJhcHR1cm91cyBSZWFjaFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgeyBMYW5nIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL2xhbmd1YWdlcyc7XHJcbmltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IHsgVW5yZWFjaGFibGVDb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25vdF9yZWFjaGVkJztcclxuaW1wb3J0IE91dHB1dHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL291dHB1dHMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE5ldE1hdGNoZXMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9uZXRfbWF0Y2hlcyc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgTG9jYWxlVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL3RyaWdnZXInO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBkZWNPZmZzZXQ/OiBudW1iZXI7XHJcbiAgbGFzZXJOYW1lVG9OdW0/OiB7IFtuYW1lOiBzdHJpbmddOiBudW1iZXIgfTtcclxuICBzY3VscHR1cmVUZXRoZXJOYW1lVG9JZD86IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9O1xyXG4gIHNjdWxwdHVyZVlQb3NpdGlvbnM/OiB7IFtzY3VscHR1cmVJZDogc3RyaW5nXTogbnVtYmVyIH07XHJcbiAgYmxhZGVPZkZsYW1lQ291bnQ/OiBudW1iZXI7XHJcbiAgcGlsbGFySWRUb093bmVyPzogeyBbcGlsbGFySWQ6IHN0cmluZ106IHN0cmluZyB9O1xyXG4gIHNtYWxsTGlvbklkVG9Pd25lcj86IHsgW3BpbGxhcklkOiBzdHJpbmddOiBzdHJpbmcgfTtcclxuICBzbWFsbExpb25Pd25lcnM/OiBzdHJpbmdbXTtcclxuICBub3J0aEJpZ0xpb24/OiBzdHJpbmc7XHJcbiAgZmlyZT86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuLy8gVE9ETzogYWRkIHNlcGFyYXRlIGRhbWFnZVdhcm4tZXNxdWUgaWNvbiBmb3IgZGFtYWdlIGRvd25zP1xyXG4vLyBUT0RPOiA1OEE2IFVuZGVyIFRoZSBXZWlnaHQgLyA1OEIyIENsYXNzaWNhbCBTY3VscHR1cmUgbWlzc2luZyBzb21lYm9keSBpbiBwYXJ0eSB3YXJuaW5nP1xyXG4vLyBUT0RPOiA1OENBIERhcmsgV2F0ZXIgSUlJIC8gNThDNSBTaGVsbCBDcnVzaGVyIHNob3VsZCBoaXQgZXZlcnlvbmUgaW4gcGFydHlcclxuLy8gVE9ETzogRGFyayBBZXJvIElJSSA1OEQ0IHNob3VsZCBub3QgYmUgYSBzaGFyZSBleGNlcHQgb24gYWR2YW5jZWQgcmVsYXRpdml0eSBmb3IgZG91YmxlIGFlcm8uXHJcbi8vIChmb3IgZ2FpbnMgZWZmZWN0LCBzaW5nbGUgYWVybyA9IH4yMyBzZWNvbmRzLCBkb3VibGUgYWVybyA9IH4zMSBzZWNvbmRzIGR1cmF0aW9uKVxyXG5cclxuLy8gRHVlIHRvIGNoYW5nZXMgaW50cm9kdWNlZCBpbiBwYXRjaCA1LjIsIG92ZXJoZWFkIG1hcmtlcnMgbm93IGhhdmUgYSByYW5kb20gb2Zmc2V0XHJcbi8vIGFkZGVkIHRvIHRoZWlyIElELiBUaGlzIG9mZnNldCBjdXJyZW50bHkgYXBwZWFycyB0byBiZSBzZXQgcGVyIGluc3RhbmNlLCBzb1xyXG4vLyB3ZSBjYW4gZGV0ZXJtaW5lIHdoYXQgaXQgaXMgZnJvbSB0aGUgZmlyc3Qgb3ZlcmhlYWQgbWFya2VyIHdlIHNlZS5cclxuLy8gVGhlIGZpcnN0IDFCIG1hcmtlciBpbiB0aGUgZW5jb3VudGVyIGlzIHRoZSBmb3JtbGVzcyB0YW5rYnVzdGVyLCBJRCAwMDRGLlxyXG5jb25zdCBmaXJzdEhlYWRtYXJrZXIgPSBwYXJzZUludCgnMDBEQScsIDE2KTtcclxuY29uc3QgZ2V0SGVhZG1hcmtlcklkID0gKGRhdGE6IERhdGEsIG1hdGNoZXM6IE5ldE1hdGNoZXNbJ0hlYWRNYXJrZXInXSkgPT4ge1xyXG4gIC8vIElmIHdlIG5haXZlbHkganVzdCBjaGVjayAhZGF0YS5kZWNPZmZzZXQgYW5kIGxlYXZlIGl0LCBpdCBicmVha3MgaWYgdGhlIGZpcnN0IG1hcmtlciBpcyAwMERBLlxyXG4gIC8vIChUaGlzIG1ha2VzIHRoZSBvZmZzZXQgMCwgYW5kICEwIGlzIHRydWUuKVxyXG4gIGlmICh0eXBlb2YgZGF0YS5kZWNPZmZzZXQgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgZGF0YS5kZWNPZmZzZXQgPSBwYXJzZUludChtYXRjaGVzLmlkLCAxNikgLSBmaXJzdEhlYWRtYXJrZXI7XHJcbiAgLy8gVGhlIGxlYWRpbmcgemVyb2VzIGFyZSBzdHJpcHBlZCB3aGVuIGNvbnZlcnRpbmcgYmFjayB0byBzdHJpbmcsIHNvIHdlIHJlLWFkZCB0aGVtIGhlcmUuXHJcbiAgLy8gRm9ydHVuYXRlbHksIHdlIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgd2hldGhlciBvciBub3QgdGhpcyBpcyByb2J1c3QsXHJcbiAgLy8gc2luY2Ugd2Uga25vdyBhbGwgdGhlIElEcyB0aGF0IHdpbGwgYmUgcHJlc2VudCBpbiB0aGUgZW5jb3VudGVyLlxyXG4gIHJldHVybiAocGFyc2VJbnQobWF0Y2hlcy5pZCwgMTYpIC0gZGF0YS5kZWNPZmZzZXQpLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpLnBhZFN0YXJ0KDQsICcwJyk7XHJcbn07XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlRXRlcm5pdHlTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBSYXB0dXJvdXMgUmVhY2ggTGVmdCc6ICc1OEFEJywgLy8gSGFpcmN1dCB3aXRoIGxlZnQgc2FmZSBzaWRlXHJcbiAgICAnRTEyUyBQcm9taXNlIFJhcHR1cm91cyBSZWFjaCBSaWdodCc6ICc1OEFFJywgLy8gSGFpcmN1dCB3aXRoIHJpZ2h0IHNhZmUgc2lkZVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBUZW1wb3JhcnkgQ3VycmVudCc6ICc0RTQ0JywgLy8gTGV2aSBnZXQgdW5kZXIgY2FzdCAoZGFtYWdlIGRvd24pXHJcbiAgICAnRTEyUyBQcm9taXNlIENvbmZsYWcgU3RyaWtlJzogJzRFNDUnLCAvLyBJZnJpdCBnZXQgc2lkZXMgY2FzdCAoZGFtYWdlIGRvd24pXHJcbiAgICAnRTEyUyBQcm9taXNlIEZlcm9zdG9ybSc6ICc0RTQ2JywgLy8gR2FydWRhIGdldCBpbnRlcmNhcmRpbmFscyBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgSnVkZ21lbnQgSm9sdCc6ICc0RTQ3JywgLy8gUmFtdWggZ2V0IG91dCBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgU2hhdHRlcic6ICc1ODlDJywgLy8gSWNlIFBpbGxhciBleHBsb3Npb24gaWYgdGV0aGVyIG5vdCBnb3R0ZW5cclxuICAgICdFMTJTIFByb21pc2UgSW1wYWN0JzogJzU4QTEnLCAvLyBUaXRhbiBib21iIGRyb3BcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEJsaXp6YXJkIElJSSc6ICc1OEQzJywgLy8gUmVsYXRpdml0eSBkb251dCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIEFwb2NhbHlwc2UnOiAnNThFNicsIC8vIExpZ2h0IHVwIGNpcmNsZSBleHBsb3Npb25zIChkYW1hZ2UgZG93bilcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTJTIE9yYWNsZSBNYWVsc3Ryb20nOiAnNThEQScsIC8vIEFkdmFuY2VkIFJlbGF0aXZpdHkgdHJhZmZpYyBsaWdodCBhb2VcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0UxMlMgT3JhY2xlIERvb20nOiAnOUQ0JywgLy8gUmVsYXRpdml0eSBwdW5pc2htZW50IGZvciBtdWx0aXBsZSBtaXN0YWtlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIEZyaWdpZCBTdG9uZSc6ICc1ODlFJywgLy8gU2hpdmEgc3ByZWFkXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFya2VzdCBEYW5jZSc6ICc0RTMzJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgKyBqdW1wIGJlZm9yZSBrbm9ja2JhY2tcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEN1cnJlbnQnOiAnNThEOCcsIC8vIEJhaXRlZCB0cmFmZmljIGxpZ2h0IGxhc2Vyc1xyXG4gICAgJ0UxMlMgT3JhY2xlIFNwaXJpdCBUYWtlcic6ICc1OEM2JywgLy8gUmFuZG9tIGp1bXAgc3ByZWFkIG1lY2hhbmljIGFmdGVyIFNoZWxsIENydXNoZXJcclxuICAgICdFMTJTIE9yYWNsZSBTb21iZXIgRGFuY2UgMSc6ICc1OEJGJywgLy8gRmFydGhlc3QgdGFyZ2V0IGJhaXQgZm9yIER1YWwgQXBvY2FseXBzZVxyXG4gICAgJ0UxMlMgT3JhY2xlIFNvbWJlciBEYW5jZSAyJzogJzU4QzAnLCAvLyBTZWNvbmQgc29tYmVyIGRhbmNlIGp1bXBcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBXZWlnaHQgT2YgVGhlIFdvcmxkJzogJzU4QTUnLCAvLyBUaXRhbiBib21iIGJsdWUgbWFya2VyXHJcbiAgICAnRTEyUyBQcm9taXNlIFB1bHNlIE9mIFRoZSBMYW5kJzogJzU4QTMnLCAvLyBUaXRhbiBib21iIHllbGxvdyBtYXJrZXJcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrIEVydXB0aW9uIDEnOiAnNThDRScsIC8vIEluaXRpYWwgd2FybXVwIHNwcmVhZCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgRXJ1cHRpb24gMic6ICc1OENEJywgLy8gUmVsYXRpdml0eSBzcHJlYWQgbWVjaGFuaWNcclxuICAgICdFMTJTIE9yYWNsZSBCbGFjayBIYWxvJzogJzU4QzcnLCAvLyBUYW5rYnVzdGVyIGNsZWF2ZVxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgICdFMTJTIFByb21pc2UgRm9yY2UgT2YgVGhlIExhbmQnOiAnNThBNCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBCaWcgY2lyY2xlIGdyb3VuZCBhb2VzIGR1cmluZyBTaGl2YSBqdW5jdGlvbi5cclxuICAgICAgLy8gVGhpcyBjYW4gYmUgc2hpZWxkZWQgdGhyb3VnaCBhcyBsb25nIGFzIHRoYXQgcGVyc29uIGRvZXNuJ3Qgc3RhY2suXHJcbiAgICAgIGlkOiAnRTEyUyBJY2ljbGUgSW1wYWN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEU1QScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBIZWFkbWFya2VyJyxcclxuICAgICAgdHlwZTogJ0hlYWRNYXJrZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5oZWFkTWFya2VyKHt9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlkID0gZ2V0SGVhZG1hcmtlcklkKGRhdGEsIG1hdGNoZXMpO1xyXG4gICAgICAgIGNvbnN0IGZpcnN0TGFzZXJNYXJrZXIgPSAnMDA5MSc7XHJcbiAgICAgICAgY29uc3QgbGFzdExhc2VyTWFya2VyID0gJzAwOTgnO1xyXG4gICAgICAgIGlmIChpZCA+PSBmaXJzdExhc2VyTWFya2VyICYmIGlkIDw9IGxhc3RMYXNlck1hcmtlcikge1xyXG4gICAgICAgICAgLy8gaWRzIGFyZSBzZXF1ZW50aWFsOiAjMSBzcXVhcmUsICMyIHNxdWFyZSwgIzMgc3F1YXJlLCAjNCBzcXVhcmUsICMxIHRyaWFuZ2xlIGV0Y1xyXG4gICAgICAgICAgY29uc3QgZGVjT2Zmc2V0ID0gcGFyc2VJbnQoaWQsIDE2KSAtIHBhcnNlSW50KGZpcnN0TGFzZXJNYXJrZXIsIDE2KTtcclxuXHJcbiAgICAgICAgICAvLyBkZWNPZmZzZXQgaXMgMC03LCBzbyBtYXAgMC0zIHRvIDEtNCBhbmQgNC03IHRvIDEtNC5cclxuICAgICAgICAgIGRhdGEubGFzZXJOYW1lVG9OdW0gPz89IHt9O1xyXG4gICAgICAgICAgZGF0YS5sYXNlck5hbWVUb051bVttYXRjaGVzLnRhcmdldF0gPSBkZWNPZmZzZXQgJSA0ICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVzZSBzY3VscHR1cmVzIGFyZSBhZGRlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGZpZ2h0LCBzbyB3ZSBuZWVkIHRvIGNoZWNrIHdoZXJlIHRoZXlcclxuICAgICAgLy8gdXNlIHRoZSBcIkNsYXNzaWNhbCBTY3VscHR1cmVcIiBhYmlsaXR5IGFuZCBlbmQgdXAgb24gdGhlIGFyZW5hIGZvciByZWFsLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBDaGlzZWxlZCBTY3VscHR1cmUgQ2xhc3NpY2FsIFNjdWxwdHVyZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdDaGlzZWxlZCBTY3VscHR1cmUnLCBpZDogJzU4QjInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVGhpcyB3aWxsIHJ1biBwZXIgcGVyc29uIHRoYXQgZ2V0cyBoaXQgYnkgdGhlIHNhbWUgc2N1bHB0dXJlLCBidXQgdGhhdCdzIGZpbmUuXHJcbiAgICAgICAgLy8gUmVjb3JkIHRoZSB5IHBvc2l0aW9uIG9mIGVhY2ggc2N1bHB0dXJlIHNvIHdlIGNhbiB1c2UgaXQgZm9yIGJldHRlciB0ZXh0IGxhdGVyLlxyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucyA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV0gPSBwYXJzZUZsb2F0KG1hdGNoZXMueSk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGUgc291cmNlIG9mIHRoZSB0ZXRoZXIgaXMgdGhlIHBsYXllciwgdGhlIHRhcmdldCBpcyB0aGUgc2N1bHB0dXJlLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBDaGlzZWxlZCBTY3VscHR1cmUgVGV0aGVyJyxcclxuICAgICAgdHlwZTogJ1RldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHRhcmdldDogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkID8/PSB7fTtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkW21hdGNoZXMuc291cmNlXSA9IG1hdGNoZXMudGFyZ2V0SWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEJsYWRlIE9mIEZsYW1lIENvdW50ZXInLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICdDaGlzZWxlZCBTY3VscHR1cmUnLCBpZDogJzU4QjMnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDEsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuYmxhZGVPZkZsYW1lQ291bnQgPSBkYXRhLmJsYWRlT2ZGbGFtZUNvdW50IHx8IDA7XHJcbiAgICAgICAgZGF0YS5ibGFkZU9mRmxhbWVDb3VudCsrO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhpcyBpcyB0aGUgQ2hpc2VsZWQgU2N1bHB0dXJlIGxhc2VyIHdpdGggdGhlIGxpbWl0IGN1dCBkb3RzLlxyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBCbGFkZSBPZiBGbGFtZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHR5cGU6ICcyMicsIHNvdXJjZTogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnNThCMycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmxhc2VyTmFtZVRvTnVtIHx8ICFkYXRhLnNjdWxwdHVyZVRldGhlck5hbWVUb0lkIHx8ICFkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnMpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIEZpbmQgdGhlIHBlcnNvbiB3aG8gaGFzIHRoaXMgbGFzZXIgbnVtYmVyIGFuZCBpcyB0ZXRoZXJlZCB0byB0aGlzIHN0YXR1ZS5cclxuICAgICAgICBjb25zdCBudW1iZXIgPSAoZGF0YS5ibGFkZU9mRmxhbWVDb3VudCB8fCAwKSArIDE7XHJcbiAgICAgICAgY29uc3Qgc291cmNlSWQgPSBtYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBPYmplY3Qua2V5cyhkYXRhLmxhc2VyTmFtZVRvTnVtKTtcclxuICAgICAgICBjb25zdCB3aXRoTnVtID0gbmFtZXMuZmlsdGVyKChuYW1lKSA9PiBkYXRhLmxhc2VyTmFtZVRvTnVtPy5bbmFtZV0gPT09IG51bWJlcik7XHJcbiAgICAgICAgY29uc3Qgb3duZXJzID0gd2l0aE51bS5maWx0ZXIoKG5hbWUpID0+IGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQ/LltuYW1lXSA9PT0gc291cmNlSWQpO1xyXG5cclxuICAgICAgICAvLyBpZiBzb21lIGxvZ2ljIGVycm9yLCBqdXN0IGFib3J0LlxyXG4gICAgICAgIGlmIChvd25lcnMubGVuZ3RoICE9PSAxKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBUaGUgb3duZXIgaGl0dGluZyB0aGVtc2VsdmVzIGlzbid0IGEgbWlzdGFrZS4uLnRlY2huaWNhbGx5LlxyXG4gICAgICAgIGlmIChvd25lcnNbMF0gPT09IG1hdGNoZXMudGFyZ2V0KVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBOb3cgdHJ5IHRvIGZpZ3VyZSBvdXQgd2hpY2ggc3RhdHVlIGlzIHdoaWNoLlxyXG4gICAgICAgIC8vIFBlb3BsZSBjYW4gcHV0IHRoZXNlIHdoZXJldmVyLiAgVGhleSBjb3VsZCBnbyBzaWRld2F5cywgb3IgZGlhZ29uYWwsIG9yIHdoYXRldmVyLlxyXG4gICAgICAgIC8vIEl0IHNlZW1zIG1vb29vb3N0IHBlb3BsZSBwdXQgdGhlc2Ugbm9ydGggLyBzb3V0aCAob24gdGhlIHNvdXRoIGVkZ2Ugb2YgdGhlIGFyZW5hKS5cclxuICAgICAgICAvLyBMZXQncyBzYXkgYSBtaW5pbXVtIG9mIDIgeWFsbXMgYXBhcnQgaW4gdGhlIHkgZGlyZWN0aW9uIHRvIGNvbnNpZGVyIHRoZW0gXCJub3J0aC9zb3V0aFwiLlxyXG4gICAgICAgIGNvbnN0IG1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMgPSAyO1xyXG5cclxuICAgICAgICBsZXQgaXNTdGF0dWVQb3NpdGlvbktub3duID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGlzU3RhdHVlTm9ydGggPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBzY3VscHR1cmVJZHMgPSBPYmplY3Qua2V5cyhkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnMpO1xyXG4gICAgICAgIGlmIChzY3VscHR1cmVJZHMubGVuZ3RoID09PSAyICYmIHNjdWxwdHVyZUlkcy5pbmNsdWRlcyhzb3VyY2VJZCkpIHtcclxuICAgICAgICAgIGNvbnN0IG90aGVySWQgPSBzY3VscHR1cmVJZHNbMF0gPT09IHNvdXJjZUlkID8gc2N1bHB0dXJlSWRzWzFdIDogc2N1bHB0dXJlSWRzWzBdO1xyXG4gICAgICAgICAgY29uc3Qgc291cmNlWSA9IGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9uc1tzb3VyY2VJZF07XHJcbiAgICAgICAgICBjb25zdCBvdGhlclkgPSBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnNbb3RoZXJJZCA/PyAnJ107XHJcbiAgICAgICAgICBpZiAoc291cmNlWSA9PT0gdW5kZWZpbmVkIHx8IG90aGVyWSA9PT0gdW5kZWZpbmVkIHx8IG90aGVySWQgPT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFVucmVhY2hhYmxlQ29kZSgpO1xyXG4gICAgICAgICAgY29uc3QgeURpZmYgPSBNYXRoLmFicyhzb3VyY2VZIC0gb3RoZXJZKTtcclxuICAgICAgICAgIGlmICh5RGlmZiA+IG1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMpIHtcclxuICAgICAgICAgICAgaXNTdGF0dWVQb3NpdGlvbktub3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgaXNTdGF0dWVOb3J0aCA9IHNvdXJjZVkgPCBvdGhlclk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvd25lciA9IG93bmVyc1swXTtcclxuICAgICAgICBjb25zdCBvd25lck5pY2sgPSBkYXRhLlNob3J0TmFtZShvd25lcik7XHJcbiAgICAgICAgbGV0IHRleHQgPSB7XHJcbiAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICMke251bWJlcn0pYCxcclxuICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtvd25lck5pY2t944GL44KJ44CBIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtudW1iZXJ967KIKWAsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoaXNTdGF0dWVQb3NpdGlvbktub3duICYmIGlzU3RhdHVlTm9ydGgpIHtcclxuICAgICAgICAgIHRleHQgPSB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBub3J0aClgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBub3JkZW4pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOWMl+OBriR7b3duZXJOaWNrfeOBi+OCieOAgSMke251bWJlcn0pYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHquWMl+aWuSR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogg67aB7Kq9KWAsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNTdGF0dWVQb3NpdGlvbktub3duICYmICFpc1N0YXR1ZU5vcnRoKSB7XHJcbiAgICAgICAgICB0ZXh0ID0ge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICMke251bWJlcn0gc291dGgpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke293bmVyTmlja30sICMke251bWJlcn0gU8O8ZGVuKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjljZfjga4ke293bmVyTmlja33jgYvjgonjgIEjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmnaXoh6rljZfmlrkke293bmVyTmlja33vvIwjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtudW1iZXJ967KIIOuCqOyqvSlgLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIGJsYW1lOiBvd25lcixcclxuICAgICAgICAgIHRleHQ6IHRleHQsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEljZSBQaWxsYXIgVHJhY2tlcicsXHJcbiAgICAgIHR5cGU6ICdUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdJY2UgUGlsbGFyJywgaWQ6IFsnMDAwMScsICcwMDM5J10gfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnBpbGxhcklkVG9Pd25lciA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5waWxsYXJJZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZF0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEljZSBQaWxsYXIgTWlzdGFrZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ0ljZSBQaWxsYXInLCBpZDogJzU4OUInIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLnBpbGxhcklkVG9Pd25lcilcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gbWF0Y2hlcy50YXJnZXQgIT09IGRhdGEucGlsbGFySWRUb093bmVyW21hdGNoZXMuc291cmNlSWRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBpbGxhck93bmVyID0gZGF0YS5TaG9ydE5hbWUoZGF0YS5waWxsYXJJZFRvT3duZXI/LlttYXRjaGVzLnNvdXJjZUlkXSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtwaWxsYXJPd25lcn0pYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZGUgJHtwaWxsYXJPd25lcn0pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7cGlsbGFyT3duZXJ944GL44KJKWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjmnaXoh6oke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtwaWxsYXJPd25lcn1cIilgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgR2FpbiBGaXJlIFJlc2lzdGFuY2UgRG93biBJSScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFRoZSBCZWFzdGx5IFNjdWxwdHVyZSBnaXZlcyBhIDMgc2Vjb25kIGRlYnVmZiwgdGhlIFJlZ2FsIFNjdWxwdHVyZSBnaXZlcyBhIDE0cyBvbmUuXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4MzInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5maXJlID8/PSB7fTtcclxuICAgICAgICBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIExvc2UgRmlyZSBSZXNpc3RhbmNlIERvd24gSUknLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnODMyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuZmlyZSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgU21hbGwgTGlvbiBUZXRoZXInLFxyXG4gICAgICB0eXBlOiAnVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQmVhc3RseSBTY3VscHR1cmUnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0FiYmlsZCBFaW5lcyBMw7Z3ZW4nLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0Nyw6lhdGlvbiBMw6lvbmluZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAn5Ym144KJ44KM44Gf542F5a2QJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uSWRUb093bmVyID8/PSB7fTtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkLnRvVXBwZXJDYXNlKCldID0gbWF0Y2hlcy50YXJnZXQ7XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25Pd25lcnMgPz89IFtdO1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uT3duZXJzLnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgU21hbGwgTGlvbiBMaW9uc2JsYXplJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0JlYXN0bHkgU2N1bHB0dXJlJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0FiYmlsZCBFaW5lcyBMw7Z3ZW4nLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQ3LDqWF0aW9uIEzDqW9uaW5lJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ+WJteOCieOCjOOBn+eNheWtkCcsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gRm9sa3MgYmFpdGluZyB0aGUgYmlnIGxpb24gc2Vjb25kIGNhbiB0YWtlIHRoZSBmaXJzdCBzbWFsbCBsaW9uIGhpdCxcclxuICAgICAgICAvLyBzbyBpdCdzIG5vdCBzdWZmaWNpZW50IHRvIGNoZWNrIG9ubHkgdGhlIG93bmVyLlxyXG4gICAgICAgIGlmICghZGF0YS5zbWFsbExpb25Pd25lcnMpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgb3duZXIgPSBkYXRhLnNtYWxsTGlvbklkVG9Pd25lcj8uW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV07XHJcbiAgICAgICAgaWYgKCFvd25lcilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAobWF0Y2hlcy50YXJnZXQgPT09IG93bmVyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgdGFyZ2V0IGFsc28gaGFzIGEgc21hbGwgbGlvbiB0ZXRoZXIsIHRoYXQgaXMgYWx3YXlzIGEgbWlzdGFrZS5cclxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0J3Mgb25seSBhIG1pc3Rha2UgaWYgdGhlIHRhcmdldCBoYXMgYSBmaXJlIGRlYnVmZi5cclxuICAgICAgICBjb25zdCBoYXNTbWFsbExpb24gPSBkYXRhLnNtYWxsTGlvbk93bmVycy5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgICAgY29uc3QgaGFzRmlyZURlYnVmZiA9IGRhdGEuZmlyZSAmJiBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdO1xyXG5cclxuICAgICAgICBpZiAoaGFzU21hbGxMaW9uIHx8IGhhc0ZpcmVEZWJ1ZmYpIHtcclxuICAgICAgICAgIGNvbnN0IG93bmVyTmljayA9IGRhdGEuU2hvcnROYW1lKG93bmVyKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBjZW50ZXJZID0gLTc1O1xyXG4gICAgICAgICAgY29uc3QgeCA9IHBhcnNlRmxvYXQobWF0Y2hlcy54KTtcclxuICAgICAgICAgIGNvbnN0IHkgPSBwYXJzZUZsb2F0KG1hdGNoZXMueSk7XHJcbiAgICAgICAgICBsZXQgZGlyT2JqID0gbnVsbDtcclxuICAgICAgICAgIGlmICh5IDwgY2VudGVyWSkge1xyXG4gICAgICAgICAgICBpZiAoeCA+IDApXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJORTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyTlc7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoeCA+IDApXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJTRTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIGRpck9iaiA9IE91dHB1dHMuZGlyU1c7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgICBibGFtZTogb3duZXIsXHJcbiAgICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtvd25lck5pY2t9LCAke2Rpck9ialsnZW4nXX0pYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2RlJ119KWAsXHJcbiAgICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKGRlICR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2ZyJ119KWAsXHJcbiAgICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7b3duZXJOaWNrfeOBi+OCiSwgJHtkaXJPYmpbJ2phJ119KWAsXHJcbiAgICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7b3duZXJOaWNrfSwgJHtkaXJPYmpbJ2NuJ119YCxcclxuICAgICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtvd25lck5pY2t9XCIsICR7ZGlyT2JqWydrbyddfSlgLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBOb3J0aCBCaWcgTGlvbicsXHJcbiAgICAgIHR5cGU6ICdBZGRlZENvbWJhdGFudCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFkZGVkQ29tYmF0YW50RnVsbCh7IG5hbWU6ICdSZWdhbCBTY3VscHR1cmUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgeSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgICBjb25zdCBjZW50ZXJZID0gLTc1O1xyXG4gICAgICAgIGlmICh5IDwgY2VudGVyWSlcclxuICAgICAgICAgIGRhdGEubm9ydGhCaWdMaW9uID0gbWF0Y2hlcy5pZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmlnIExpb24gS2luZ3NibGF6ZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ1JlZ2FsIFNjdWxwdHVyZScsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ0FiYmlsZCBlaW5lcyBncm/Dn2VuIEzDtndlbicsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ2Nyw6lhdGlvbiBsw6lvbmluZSByb3lhbGUnLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmFiaWxpdHkoeyBzb3VyY2U6ICflibXjgonjgozjgZ/njYXlrZDnjosnLCBpZDogJzRGOUUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNpbmdsZVRhcmdldCA9IG1hdGNoZXMudHlwZSA9PT0gJzIxJztcclxuICAgICAgICBjb25zdCBoYXNGaXJlRGVidWZmID0gZGF0YS5maXJlICYmIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF07XHJcblxyXG4gICAgICAgIC8vIFN1Y2Nlc3MgaWYgb25seSBvbmUgcGVyc29uIHRha2VzIGl0IGFuZCB0aGV5IGhhdmUgbm8gZmlyZSBkZWJ1ZmYuXHJcbiAgICAgICAgaWYgKHNpbmdsZVRhcmdldCAmJiAhaGFzRmlyZURlYnVmZilcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgbm9ydGhCaWdMaW9uOiBMb2NhbGVUZXh0ID0ge1xyXG4gICAgICAgICAgZW46ICdub3J0aCBiaWcgbGlvbicsXHJcbiAgICAgICAgICBkZTogJ05vcmRlbSwgZ3Jvw59lciBMw7Z3ZScsXHJcbiAgICAgICAgICBqYTogJ+Wkp+ODqeOCpOOCquODsyjljJcpJyxcclxuICAgICAgICAgIGNuOiAn5YyX5pa55aSn54uu5a2QJyxcclxuICAgICAgICAgIGtvOiAn67aB7Kq9IO2BsCDsgqzsnpAnLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgc291dGhCaWdMaW9uOiBMb2NhbGVUZXh0ID0ge1xyXG4gICAgICAgICAgZW46ICdzb3V0aCBiaWcgbGlvbicsXHJcbiAgICAgICAgICBkZTogJ1PDvGRlbiwgZ3Jvw59lciBMw7Z3ZScsXHJcbiAgICAgICAgICBqYTogJ+Wkp+ODqeOCpOOCquODsyjljZcpJyxcclxuICAgICAgICAgIGNuOiAn5Y2X5pa55aSn54uu5a2QJyxcclxuICAgICAgICAgIGtvOiAn64Ko7Kq9IO2BsCDsgqzsnpAnLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3Qgc2hhcmVkOiBMb2NhbGVUZXh0ID0ge1xyXG4gICAgICAgICAgZW46ICdzaGFyZWQnLFxyXG4gICAgICAgICAgZGU6ICdnZXRlaWx0JyxcclxuICAgICAgICAgIGphOiAn6YeN44Gt44GfJyxcclxuICAgICAgICAgIGNuOiAn6YeN5Y+gJyxcclxuICAgICAgICAgIGtvOiAn6rCZ7J20IOunnuydjCcsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBmaXJlRGVidWZmOiBMb2NhbGVUZXh0ID0ge1xyXG4gICAgICAgICAgZW46ICdoYWQgZmlyZScsXHJcbiAgICAgICAgICBkZTogJ2hhdHRlIEZldWVyJyxcclxuICAgICAgICAgIGphOiAn54KO5LuY44GNJyxcclxuICAgICAgICAgIGNuOiAn54GrRGVidWZmJyxcclxuICAgICAgICAgIGtvOiAn7ZmU7Je8IOuUlOuyhO2UhCDrsJvsnYwnLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IGxhYmVscyA9IFtdO1xyXG4gICAgICAgIGNvbnN0IGxhbmc6IExhbmcgPSBkYXRhLm9wdGlvbnMuUGFyc2VyTGFuZ3VhZ2U7XHJcblxyXG4gICAgICAgIGlmIChkYXRhLm5vcnRoQmlnTGlvbikge1xyXG4gICAgICAgICAgaWYgKGRhdGEubm9ydGhCaWdMaW9uID09PSBtYXRjaGVzLnNvdXJjZUlkKVxyXG4gICAgICAgICAgICBsYWJlbHMucHVzaChub3J0aEJpZ0xpb25bbGFuZ10gPz8gbm9ydGhCaWdMaW9uWydlbiddKTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgbGFiZWxzLnB1c2goc291dGhCaWdMaW9uW2xhbmddID8/IHNvdXRoQmlnTGlvblsnZW4nXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc2luZ2xlVGFyZ2V0KVxyXG4gICAgICAgICAgbGFiZWxzLnB1c2goc2hhcmVkW2xhbmddID8/IHNoYXJlZFsnZW4nXSk7XHJcbiAgICAgICAgaWYgKGhhc0ZpcmVEZWJ1ZmYpXHJcbiAgICAgICAgICBsYWJlbHMucHVzaChmaXJlRGVidWZmW2xhbmddID8/IGZpcmVEZWJ1ZmZbJ2VuJ10pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke2xhYmVscy5qb2luKCcsICcpfSlgLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIC8vIDU4OUEgPSBJY2UgUGlsbGFyIChwcm9taXNlIHNoaXZhIHBoYXNlKVxyXG4gICAgICAvLyA1OEI2ID0gUGFsbSBPZiBUZW1wZXJhbmNlIChwcm9taXNlIHN0YXR1ZSBoYW5kKVxyXG4gICAgICAvLyA1OEI3ID0gTGFzZXIgRXllIChwcm9taXNlIGxpb24gcGhhc2UpXHJcbiAgICAgIC8vIDU4QzEgPSBEYXJrZXN0IERhbmNlIChvcmFjbGUgdGFuayBqdW1wICsga25vY2tiYWNrIGluIGJlZ2lubmluZyBhbmQgdHJpcGxlIGFwb2MpXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1ODlBJywgJzU4QjYnLCAnNThCNycsICc1OEMxJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBPcmFjbGUgU2hhZG93ZXllJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNThEMicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogd2FybmluZyBmb3IgdGFraW5nIERpYW1vbmQgRmxhc2ggKDVGQTEpIHN0YWNrIG9uIHlvdXIgb3duP1xyXG5cclxuLy8gRGlhbW9uZCBXZWFwb24gRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ2xvdWREZWNrRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyAxJzogJzVGQUYnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDInOiAnNUZCMicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgMyc6ICc1RkNEJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA0JzogJzVGQ0UnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDUnOiAnNUZDRicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNic6ICc1RkY4JywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA3JzogJzYxNTknLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXJ0aWN1bGF0ZWQgQml0IEFldGhlcmlhbCBCdWxsZXQnOiAnNUZBQicsIC8vIGJpdCBsYXNlcnMgZHVyaW5nIGFsbCBwaGFzZXNcclxuICAgICdEaWFtb25kRXggRGlhbW9uZCBTaHJhcG5lbCAxJzogJzVGQ0InLCAvLyBjaGFzaW5nIGNpcmNsZXNcclxuICAgICdEaWFtb25kRXggRGlhbW9uZCBTaHJhcG5lbCAyJzogJzVGQ0MnLCAvLyBjaGFzaW5nIGNpcmNsZXNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEaWFtb25kRXggQ2xhdyBTd2lwZSBMZWZ0JzogJzVGQzInLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmRFeCBDbGF3IFN3aXBlIFJpZ2h0JzogJzVGQzMnLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEN5Y2xvbmUgMSc6ICc1RkQxJywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kRXggQXVyaSBDeWNsb25lIDInOiAnNUZEMicsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZEV4IEFpcnNoaXBcXCdzIEJhbmUgMSc6ICc1RkZFJywgLy8gZGVzdHJveWluZyBvbmUgb2YgdGhlIHBsYXRmb3JtcyBhZnRlciBBdXJpIEN5Y2xvbmVcclxuICAgICdEaWFtb25kRXggQWlyc2hpcFxcJ3MgQmFuZSAyJzogJzVGRDMnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRGlhbW9uZEV4IFRhbmsgTGFzZXJzJzogJzVGQzgnLCAvLyBjbGVhdmluZyB5ZWxsb3cgbGFzZXJzIG9uIHRvcCB0d28gZW5taXR5XHJcbiAgICAnRGlhbW9uZEV4IEhvbWluZyBMYXNlcic6ICc1RkM0JywgLy8gQWRhbWFudGUgUHVyZ2Ugc3ByZWFkXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdEaWFtb25kRXggRmxvb2QgUmF5JzogJzVGQzcnLCAvLyBcImxpbWl0IGN1dFwiIGNsZWF2ZXNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGlhbW9uZEV4IFZlcnRpY2FsIENsZWF2ZSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNUZEMCcgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gRGlhbW9uZCBXZWFwb24gTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDbG91ZERlY2ssXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEF1cmkgQXJ0cyc6ICc1RkUzJywgLy8gQXVyaSBBcnRzIGRhc2hlc1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIERpYW1vbmQgU2hyYXBuZWwgSW5pdGlhbCc6ICc1RkUxJywgLy8gaW5pdGlhbCBjaXJjbGUgb2YgRGlhbW9uZCBTaHJhcG5lbFxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIERpYW1vbmQgU2hyYXBuZWwgQ2hhc2luZyc6ICc1RkUyJywgLy8gZm9sbG93dXAgY2lyY2xlcyBmcm9tIERpYW1vbmQgU2hyYXBuZWxcclxuICAgICdEaWFtb25kIFdlYXBvbiBBZXRoZXJpYWwgQnVsbGV0JzogJzVGRDUnLCAvLyBiaXQgbGFzZXJzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQ2xhdyBTd2lwZSBMZWZ0JzogJzVGRDknLCAvLyBBZGFtYW50IFB1cmdlIHBsYXRmb3JtIGNsZWF2ZVxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIENsYXcgU3dpcGUgUmlnaHQnOiAnNUZEQScsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBDeWNsb25lIDEnOiAnNUZFNicsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBDeWNsb25lIDInOiAnNUZFNycsIC8vIHN0YW5kaW5nIG9uIHRoZSBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQWlyc2hpcFxcJ3MgQmFuZSAxJzogJzVGRTgnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEFpcnNoaXBcXCdzIEJhbmUgMic6ICc1RkZFJywgLy8gZGVzdHJveWluZyBvbmUgb2YgdGhlIHBsYXRmb3JtcyBhZnRlciBBdXJpIEN5Y2xvbmVcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEhvbWluZyBMYXNlcic6ICc1RkRCJywgLy8gc3ByZWFkIG1hcmtlcnNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGlhbW9uZCBXZWFwb24gVmVydGljYWwgQ2xlYXZlIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1RkU1JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNhc3RydW1NYXJpbnVtRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRW1lcmFsZEV4IEhlYXQgUmF5JzogJzVCRDMnLCAvLyBFbWVyYWxkIEJlYW0gaW5pdGlhbCBjb25hbFxyXG4gICAgJ0VtZXJhbGRFeCBQaG90b24gTGFzZXIgMSc6ICc1NTdCJywgLy8gRW1lcmFsZCBCZWFtIGluc2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkRXggUGhvdG9uIExhc2VyIDInOiAnNTU3RCcsIC8vIEVtZXJhbGQgQmVhbSBvdXRzaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGRFeCBIZWF0IFJheSAxJzogJzU1N0EnLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGRFeCBIZWF0IFJheSAyJzogJzU1NzknLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGRFeCBFeHBsb3Npb24nOiAnNTU5NicsIC8vIE1hZ2l0ZWsgTWluZSBleHBsb3Npb25cclxuICAgICdFbWVyYWxkRXggVGVydGl1cyBUZXJtaW51cyBFc3QgSW5pdGlhbCc6ICc1NUNEJywgLy8gc3dvcmQgaW5pdGlhbCBwdWRkbGVzXHJcbiAgICAnRW1lcmFsZEV4IFRlcnRpdXMgVGVybWludXMgRXN0IEV4cGxvc2lvbic6ICc1NUNFJywgLy8gc3dvcmQgZXhwbG9zaW9uc1xyXG4gICAgJ0VtZXJhbGRFeCBBaXJib3JuZSBFeHBsb3Npb24nOiAnNTVCRCcsIC8vIGV4YWZsYXJlXHJcbiAgICAnRW1lcmFsZEV4IFNpZGVzY2F0aGUgMSc6ICc1NUQ0JywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkRXggU2lkZXNjYXRoZSAyJzogJzU1RDUnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGRFeCBTaG90cyBGaXJlZCc6ICc1NUI3JywgLy8gcmFuayBhbmQgZmlsZSBzb2xkaWVyc1xyXG4gICAgJ0VtZXJhbGRFeCBTZWN1bmR1cyBUZXJtaW51cyBFc3QnOiAnNTVDQicsIC8vIGRyb3BwZWQgKyBhbmQgeCBoZWFkbWFya2Vyc1xyXG4gICAgJ0VtZXJhbGRFeCBFeHBpcmUnOiAnNTVEMScsIC8vIGdyb3VuZCBhb2Ugb24gYm9zcyBcImdldCBvdXRcIlxyXG4gICAgJ0VtZXJhbGRFeCBBaXJlIFRhbSBTdG9ybSc6ICc1NUQwJywgLy8gZXhwYW5kaW5nIHJlZCBhbmQgYmxhY2sgZ3JvdW5kIGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRW1lcmFsZEV4IERpdmlkZSBFdCBJbXBlcmEnOiAnNTVEOScsIC8vIG5vbi10YW5rIHByb3RlYW4gc3ByZWFkXHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgMSc6ICc1NUM0JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgMic6ICc1NUM1JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgMyc6ICc1NUM2JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgICAnRW1lcmFsZEV4IFByaW11cyBUZXJtaW51cyBFc3QgNCc6ICc1NUM3JywgLy8ga25vY2tiYWNrIGFycm93XHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkNhc3RydW1NYXJpbnVtLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFbWVyYWxkIFdlYXBvbiBIZWF0IFJheSc6ICc0RjlEJywgLy8gRW1lcmFsZCBCZWFtIGluaXRpYWwgY29uYWxcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQaG90b24gTGFzZXIgMSc6ICc1NTM0JywgLy8gRW1lcmFsZCBCZWFtIGluc2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQaG90b24gTGFzZXIgMic6ICc1NTM2JywgLy8gRW1lcmFsZCBCZWFtIG1pZGRsZSBjaXJjbGVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQaG90b24gTGFzZXIgMyc6ICc1NTM4JywgLy8gRW1lcmFsZCBCZWFtIG91dHNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gSGVhdCBSYXkgMSc6ICc1NTMyJywgLy8gRW1lcmFsZCBCZWFtIHJvdGF0aW5nIHB1bHNpbmcgbGFzZXJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBIZWF0IFJheSAyJzogJzU1MzMnLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIE1hZ25ldGljIE1pbmUgRXhwbG9zaW9uJzogJzVCMDQnLCAvLyByZXB1bHNpbmcgbWluZSBleHBsb3Npb25zXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSAxJzogJzU1M0YnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgMic6ICc1NTQwJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDMnOiAnNTU0MScsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSA0JzogJzU1NDInLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEJpdCBTdG9ybSc6ICc1NTRBJywgLy8gXCJnZXQgaW5cIlxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEVtZXJhbGQgQ3J1c2hlcic6ICc1NTNDJywgLy8gYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFB1bHNlIExhc2VyJzogJzU1NDgnLCAvLyBsaW5lIGFvZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEVuZXJneSBBZXRoZXJvcGxhc20nOiAnNTU1MScsIC8vIGhpdHRpbmcgYSBnbG93eSBvcmJcclxuICAgICdFbWVyYWxkIFdlYXBvbiBEaXZpZGUgRXQgSW1wZXJhIEdyb3VuZCc6ICc1NTZGJywgLy8gcGFydHkgdGFyZ2V0ZWQgZ3JvdW5kIGNvbmVzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUHJpbXVzIFRlcm1pbnVzIEVzdCc6ICc0QjNFJywgLy8gZ3JvdW5kIGNpcmNsZSBkdXJpbmcgYXJyb3cgaGVhZG1hcmtlcnNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTZWN1bmR1cyBUZXJtaW51cyBFc3QnOiAnNTU2QScsIC8vIFggLyArIGhlYWRtYXJrZXJzXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gVGVydGl1cyBUZXJtaW51cyBFc3QnOiAnNTU2RCcsIC8vIHRyaXBsZSBzd29yZHNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaG90cyBGaXJlZCc6ICc1NTVGJywgLy8gbGluZSBhb2VzIGZyb20gc29sZGllcnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIERpdmlkZSBFdCBJbXBlcmEgUDEnOiAnNTU0RScsIC8vIHRhbmtidXN0ZXIsIHByb2JhYmx5IGNsZWF2ZXMsIHBoYXNlIDFcclxuICAgICdFbWVyYWxkIFdlYXBvbiBEaXZpZGUgRXQgSW1wZXJhIFAyJzogJzU1NzAnLCAvLyB0YW5rYnVzdGVyLCBwcm9iYWJseSBjbGVhdmVzLCBwaGFzZSAyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0VtZXJhbGQgV2VhcG9uIEVtZXJhbGQgQ3J1c2hlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNTUzRScgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEdldHRpbmcga25vY2tlZCBpbnRvIGEgd2FsbCBmcm9tIHRoZSBhcnJvdyBoZWFkbWFya2VyLlxyXG4gICAgICBpZDogJ0VtZXJhbGQgV2VhcG9uIFByaW11cyBUZXJtaW51cyBFc3QgV2FsbCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU1NjMnLCAnNTU2NCddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1B1c2hlZCBpbnRvIHdhbGwnLFxyXG4gICAgICAgICAgICBkZTogJ1LDvGNrc3Rvw58gaW4gZGllIFdhbmQnLFxyXG4gICAgICAgICAgICBqYTogJ+WjgeOBuOODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA6Iez5aKZJyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaGFzRGFyaz86IHN0cmluZ1tdO1xyXG4gIGhhc0JleW9uZERlYXRoPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG4gIGhhc0Rvb20/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbi8vIEhhZGVzIEV4XHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVNaW5zdHJlbHNCYWxsYWRIYWRlc3NFbGVneSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3ByZWFkIDInOiAnNDdBQScsXHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3ByZWFkIDMnOiAnNDdFNCcsXHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3ByZWFkIDQnOiAnNDdFNScsXHJcbiAgICAvLyBFdmVyeWJvZHkgc3RhY2tzIGluIGdvb2QgZmFpdGggZm9yIEJhZCBGYWl0aCwgc28gZG9uJ3QgY2FsbCBpdCBhIG1pc3Rha2UuXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggMSc6ICc0N0FEJyxcclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCAyJzogJzQ3QjAnLFxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDMnOiAnNDdBRScsXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggNCc6ICc0N0FGJyxcclxuICAgICdIYWRlc0V4IEJyb2tlbiBGYWl0aCc6ICc0N0IyJyxcclxuICAgICdIYWRlc0V4IE1hZ2ljIFNwZWFyJzogJzQ3QjYnLFxyXG4gICAgJ0hhZGVzRXggTWFnaWMgQ2hha3JhbSc6ICc0N0I1JyxcclxuICAgICdIYWRlc0V4IEZvcmtlZCBMaWdodG5pbmcnOiAnNDdDOScsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEN1cnJlbnQgMSc6ICc0N0YxJyxcclxuICAgICdIYWRlc0V4IERhcmsgQ3VycmVudCAyJzogJzQ3RjInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0hhZGVzRXggQ29tZXQnOiAnNDdCOScsIC8vIG1pc3NlZCB0b3dlclxyXG4gICAgJ0hhZGVzRXggQW5jaWVudCBFcnVwdGlvbic6ICc0N0QzJyxcclxuICAgICdIYWRlc0V4IFB1cmdhdGlvbiAxJzogJzQ3RUMnLFxyXG4gICAgJ0hhZGVzRXggUHVyZ2F0aW9uIDInOiAnNDdFRCcsXHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3RyZWFtJzogJzQ3RUEnLFxyXG4gICAgJ0hhZGVzRXggRGVhZCBTcGFjZSc6ICc0N0VFJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0hhZGVzRXggU2hhZG93IFNwcmVhZCBJbml0aWFsJzogJzQ3QTknLFxyXG4gICAgJ0hhZGVzRXggUmF2ZW5vdXMgQXNzYXVsdCc6ICcoPzo0N0E2fDQ3QTcpJyxcclxuICAgICdIYWRlc0V4IERhcmsgRmxhbWUgMSc6ICc0N0M2JyxcclxuICAgICdIYWRlc0V4IERhcmsgRnJlZXplIDEnOiAnNDdDNCcsXHJcbiAgICAnSGFkZXNFeCBEYXJrIEZyZWV6ZSAyJzogJzQ3REYnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERhcmsgSUkgVGV0aGVyJyxcclxuICAgICAgdHlwZTogJ1RldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ1NoYWRvdyBvZiB0aGUgQW5jaWVudHMnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEYXJrID8/PSBbXTtcclxuICAgICAgICBkYXRhLmhhc0RhcmsucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRGFyayBJSScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyB0eXBlOiAnMjInLCBpZDogJzQ3QkEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIERvbid0IGJsYW1lIHBlb3BsZSB3aG8gZG9uJ3QgaGF2ZSB0ZXRoZXJzLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLmhhc0RhcmsgJiYgZGF0YS5oYXNEYXJrLmluY2x1ZGVzKG1hdGNoZXMudGFyZ2V0KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJvc3MgVGV0aGVyJyxcclxuICAgICAgdHlwZTogJ1RldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogWydJZ2V5b3JobVxcJ3MgU2hhZGUnLCAnTGFoYWJyZWFcXCdzIFNoYWRlJ10sIGlkOiAnMDAwRScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBtaXN0YWtlOiB7XHJcbiAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgIGVuOiAnQm9zc2VzIFRvbyBDbG9zZScsXHJcbiAgICAgICAgICBkZTogJ0Jvc3NlcyB6dSBOYWhlJyxcclxuICAgICAgICAgIGZyOiAnQm9zcyB0cm9wIHByb2NoZXMnLFxyXG4gICAgICAgICAgamE6ICfjg5zjgrnov5HjgZnjgY7jgosnLFxyXG4gICAgICAgICAgY246ICdCT1NT6Z2g5aSq6L+R5LqGJyxcclxuICAgICAgICAgIGtvOiAn7KuE65Ok7J20IOuEiOustCDqsIDquYzsm4AnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRGVhdGggU2hyaWVrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDdDQicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBCZXlvbmQgRGVhdGggR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEb29tIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNkU5JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRG9vbSBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzZFOScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0Rvb20gPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEb29tJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzZFOScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbVttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIEhhZGVzIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRHlpbmdHYXNwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdIYWRlcyBCYWQgRmFpdGggMSc6ICc0MTRCJyxcclxuICAgICdIYWRlcyBCYWQgRmFpdGggMic6ICc0MTRDJyxcclxuICAgICdIYWRlcyBEYXJrIEVydXB0aW9uJzogJzQxNTInLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTcHJlYWQgMSc6ICc0MTU2JyxcclxuICAgICdIYWRlcyBTaGFkb3cgU3ByZWFkIDInOiAnNDE1NycsXHJcbiAgICAnSGFkZXMgQnJva2VuIEZhaXRoJzogJzQxNEUnLFxyXG4gICAgJ0hhZGVzIEhlbGxib3JuIFlhd3AnOiAnNDE2RicsXHJcbiAgICAnSGFkZXMgUHVyZ2F0aW9uJzogJzQxNzInLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTdHJlYW0nOiAnNDE1QycsXHJcbiAgICAnSGFkZXMgQWVybyc6ICc0NTk1JyxcclxuICAgICdIYWRlcyBFY2hvIDEnOiAnNDE2MycsXHJcbiAgICAnSGFkZXMgRWNobyAyJzogJzQxNjQnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnSGFkZXMgTmV0aGVyIEJsYXN0JzogJzQxNjMnLFxyXG4gICAgJ0hhZGVzIFJhdmVub3VzIEFzc2F1bHQnOiAnNDE1OCcsXHJcbiAgICAnSGFkZXMgQW5jaWVudCBEYXJrbmVzcyc6ICc0NTkzJyxcclxuICAgICdIYWRlcyBEdWFsIFN0cmlrZSc6ICc0MTYyJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSW5ub2NlbmNlIEV4dHJlbWVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNyb3duT2ZUaGVJbW1hY3VsYXRlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSW5ub0V4IER1ZWwgRGVzY2VudCc6ICczRUQyJyxcclxuICAgICdJbm5vRXggUmVwcm9iYXRpb24gMSc6ICczRUUwJyxcclxuICAgICdJbm5vRXggUmVwcm9iYXRpb24gMic6ICczRUNDJyxcclxuICAgICdJbm5vRXggU3dvcmQgb2YgQ29uZGVtbmF0aW9uIDEnOiAnM0VERScsXHJcbiAgICAnSW5ub0V4IFN3b3JkIG9mIENvbmRlbW5hdGlvbiAyJzogJzNFREYnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCAxJzogJzNFRDMnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCAyJzogJzNFRDQnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCAzJzogJzNFRDUnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA0JzogJzNFRDYnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA1JzogJzNFRkInLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA2JzogJzNFRkMnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA3JzogJzNFRkQnLFxyXG4gICAgJ0lubm9FeCBEcmVhbSBvZiB0aGUgUm9vZCA4JzogJzNFRkUnLFxyXG4gICAgJ0lubm9FeCBIb2x5IFRyaW5pdHknOiAnM0VEQicsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgMSc6ICczRUQ3JyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSAyJzogJzNFRDgnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDMnOiAnM0VEOScsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNCc6ICczRURBJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA1JzogJzNFRkYnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDYnOiAnM0YwMCcsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNyc6ICczRjAxJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA4JzogJzNGMDInLFxyXG4gICAgJ0lubm9FeCBHb2QgUmF5IDEnOiAnM0VFNicsXHJcbiAgICAnSW5ub0V4IEdvZCBSYXkgMic6ICczRUU3JyxcclxuICAgICdJbm5vRXggR29kIFJheSAzJzogJzNFRTgnLFxyXG4gICAgJ0lubm9FeCBFeHBsb3Npb24nOiAnM0VGMCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIElubm9jZW5jZSBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNyb3duT2ZUaGVJbW1hY3VsYXRlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdJbm5vIERheWJyZWFrJzogJzNFOUQnLFxyXG4gICAgJ0lubm8gSG9seSBUcmluaXR5JzogJzNFQjMnLFxyXG5cclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDEnOiAnM0VCNicsXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiAyJzogJzNFQjgnLFxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gMyc6ICczRUNCJyxcclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDQnOiAnM0VCNycsXHJcblxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSAxJzogJzNFQjEnLFxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSAyJzogJzNFQjInLFxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSAzJzogJzNFRjknLFxyXG4gICAgJ0lubm8gU291bCBhbmQgQm9keSA0JzogJzNFRkEnLFxyXG5cclxuICAgICdJbm5vIEdvZCBSYXkgMSc6ICczRUJEJyxcclxuICAgICdJbm5vIEdvZCBSYXkgMic6ICczRUJFJyxcclxuICAgICdJbm5vIEdvZCBSYXkgMyc6ICczRUJGJyxcclxuICAgICdJbm5vIEdvZCBSYXkgNCc6ICczRUMwJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBJdCdzIGhhcmQgdG8gY2FwdHVyZSB0aGUgcmVmbGVjdGlvbiBhYmlsaXRpZXMgZnJvbSBMZXZpYXRoYW4ncyBIZWFkIGFuZCBUYWlsIGlmIHlvdSB1c2VcclxuLy8gcmFuZ2VkIHBoeXNpY2FsIGF0dGFja3MgLyBtYWdpYyBhdHRhY2tzIHJlc3BlY3RpdmVseSwgYXMgdGhlIGFiaWxpdHkgbmFtZXMgYXJlIHRoZVxyXG4vLyBhYmlsaXR5IHlvdSB1c2VkIGFuZCBkb24ndCBhcHBlYXIgdG8gc2hvdyB1cCBpbiB0aGUgbG9nIGFzIG5vcm1hbCBcImFiaWxpdHlcIiBsaW5lcy5cclxuLy8gVGhhdCBzYWlkLCBkb3RzIHN0aWxsIHRpY2sgaW5kZXBlbmRlbnRseSBvbiBib3RoIHNvIGl0J3MgbGlrZWx5IHRoYXQgcGVvcGxlIHdpbGwgYXRhY2tcclxuLy8gdGhlbSBhbnl3YXkuXHJcblxyXG4vLyBUT0RPOiBGaWd1cmUgb3V0IHdoeSBEcmVhZCBUaWRlIC8gV2F0ZXJzcG91dCBhcHBlYXIgbGlrZSBzaGFyZXMgKGkuZS4gMHgxNiBpZCkuXHJcbi8vIERyZWFkIFRpZGUgPSA1Q0NBLzVDQ0IvNUNDQywgV2F0ZXJzcG91dCA9IDVDRDFcclxuXHJcbi8vIExldmlhdGhhbiBVbnJlYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdob3JsZWF0ZXJVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0xldmlVbiBHcmFuZCBGYWxsJzogJzVDREYnLCAvLyB2ZXJ5IGxhcmdlIGNpcmN1bGFyIGFvZSBiZWZvcmUgc3Bpbm55IGRpdmVzLCBhcHBsaWVzIGhlYXZ5XHJcbiAgICAnTGV2aVVuIEh5ZHJvc2hvdCc6ICc1Q0Q1JywgLy8gV2F2ZXNwaW5lIFNhaGFnaW4gYW9lIHRoYXQgZ2l2ZXMgRHJvcHN5IGVmZmVjdFxyXG4gICAgJ0xldmlVbiBEcmVhZHN0b3JtJzogJzVDRDYnLCAvLyBXYXZldG9vdGggU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBIeXN0ZXJpYSBlZmZlY3RcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdMZXZpVW4gQm9keSBTbGFtJzogJzVDRDInLCAvLyBsZXZpIHNsYW0gdGhhdCB0aWx0cyB0aGUgYm9hdFxyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDEnOiAnNUNEQicsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpVW4gU3Bpbm5pbmcgRGl2ZSAyJzogJzVDRTMnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgMyc6ICc1Q0U4JywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDQnOiAnNUNFOScsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0xldmlVbiBEcm9wc3knOiAnMTEwJywgLy8gc3RhbmRpbmcgaW4gdGhlIGh5ZHJvIHNob3QgZnJvbSB0aGUgV2F2ZXNwaW5lIFNhaGFnaW5cclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0xldmlVbiBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBzdGFuZGluZyBpbiB0aGUgZHJlYWRzdG9ybSBmcm9tIHRoZSBXYXZldG9vdGggU2FoYWdpblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdMZXZpVW4gQm9keSBTbGFtIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1Q0QyJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiB0YWtpbmcgdHdvIGRpZmZlcmVudCBIaWdoLVBvd2VyZWQgSG9taW5nIExhc2VycyAoNEFEOClcclxuLy8gVE9ETzogY291bGQgYmxhbWUgdGhlIHRldGhlcmVkIHBsYXllciBmb3IgV2hpdGUgQWdvbnkgLyBXaGl0ZSBGdXJ5IGZhaWx1cmVzP1xyXG5cclxuLy8gUnVieSBXZWFwb24gRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2luZGVyRHJpZnRFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdSdWJ5RXggUnVieSBCaXQgTWFnaXRlayBSYXknOiAnNEFEMicsIC8vIGxpbmUgYW9lcyBkdXJpbmcgaGVsaWNvY2xhd1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSAxJzogJzRBRDMnLCAvLyBpbml0aWFsIGV4cGxvc2lvbiBkdXJpbmcgaGVsaWNvY2xhd1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSAyJzogJzRCMkYnLCAvLyBmb2xsb3d1cCBoZWxpY29jbGF3IGV4cGxvc2lvbnNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgMyc6ICc0RDA0JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSA0JzogJzREMDUnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDUnOiAnNEFDRCcsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgNic6ICc0QUNFJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBVbmRlcm1pbmUnOiAnNEFEMCcsIC8vIGdyb3VuZCBhb2VzIHVuZGVyIHRoZSByYXZlbnNjbGF3IHBhdGNoZXNcclxuICAgICdSdWJ5RXggUnVieSBSYXknOiAnNEIwMicsIC8vIGZyb250YWwgbGFzZXJcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDEnOiAnNEFEOScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMic6ICc0QURBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAzJzogJzRBREQnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDQnOiAnNEFERScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNSc6ICc0QURGJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA2JzogJzRBRTAnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDcnOiAnNEFFMScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgOCc6ICc0QUUyJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA5JzogJzRBRTMnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDEwJzogJzRBRTQnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDExJzogJzRBRTUnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDEyJzogJzRBRTYnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDEzJzogJzRBRTcnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE0JzogJzRBRTgnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE1JzogJzRBRTknLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE2JzogJzRBRUEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE3JzogJzRFNkInLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE4JzogJzRFNkMnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDE5JzogJzRFNkQnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDIwJzogJzRFNkUnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDIxJzogJzRFNkYnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDIyJzogJzRFNzAnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gMSc6ICc0QjA1JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biAyJzogJzRCMDYnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDMnOiAnNEIwNycsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gNCc6ICc0QjA4JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biA1JzogJzRET0QnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IE1ldGVvciBCdXJzdCc6ICc0QUYyJywgLy8gbWV0ZW9yIGV4cGxvZGluZ1xyXG4gICAgJ1J1YnlFeCBCcmFkYW1hbnRlJzogJzRFMzgnLCAvLyBoZWFkbWFya2VycyB3aXRoIGxpbmUgYW9lc1xyXG4gICAgJ1J1YnlFeCBDb21ldCBIZWF2eSBJbXBhY3QnOiAnNEFGNicsIC8vIGxldHRpbmcgYSB0YW5rIGNvbWV0IGxhbmRcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdSdWJ5RXggUnVieSBTcGhlcmUgQnVyc3QnOiAnNEFDQicsIC8vIGV4cGxvZGluZyB0aGUgcmVkIG1pbmVcclxuICAgICdSdWJ5RXggTHVuYXIgRHluYW1vJzogJzRFQjAnLCAvLyBcImdldCBpblwiIGZyb20gUmF2ZW4ncyBJbWFnZVxyXG4gICAgJ1J1YnlFeCBJcm9uIENoYXJpb3QnOiAnNEVCMScsIC8vIFwiZ2V0IG91dFwiIGZyb20gUmF2ZW4ncyBJbWFnZVxyXG4gICAgJ1J1YnlFeCBIZWFydCBJbiBUaGUgTWFjaGluZSc6ICc0QUZBJywgLy8gV2hpdGUgQWdvbnkvRnVyeSBza3VsbCBoaXR0aW5nIHBsYXllcnNcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ1J1YnlFeCBIeXN0ZXJpYSc6ICcxMjgnLCAvLyBOZWdhdGl2ZSBBdXJhIGxvb2thd2F5IGZhaWx1cmVcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1J1YnlFeCBIb21pbmcgTGFzZXJzJzogJzRBRDYnLCAvLyBzcHJlYWQgbWFya2VycyBkdXJpbmcgY3V0IGFuZCBydW5cclxuICAgICdSdWJ5RXggTWV0ZW9yIFN0cmVhbSc6ICc0RTY4JywgLy8gc3ByZWFkIG1hcmtlcnMgZHVyaW5nIFAyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1J1YnlFeCBTY3JlZWNoJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0QUVFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIGludG8gd2FsbCcsXHJcbiAgICAgICAgICAgIGRlOiAnUsO8Y2tzdG/DnyBpbiBkaWUgV2FuZCcsXHJcbiAgICAgICAgICAgIGphOiAn5aOB44G444OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDoh7PlopknLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBSdWJ5IE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2luZGVyRHJpZnQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1J1YnkgUmF2ZW5zY2xhdyc6ICc0QTkzJywgLy8gY2VudGVyZWQgY2lyY2xlIGFvZSBmb3IgcmF2ZW5zY2xhd1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMSc6ICc0QTlBJywgLy8gaW5pdGlhbCBleHBsb3Npb24gZHVyaW5nIGhlbGljb2NsYXdcclxuICAgICdSdWJ5IFNwaWtlIE9mIEZsYW1lIDInOiAnNEIyRScsIC8vIGZvbGxvd3VwIGhlbGljb2NsYXcgZXhwbG9zaW9uc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMyc6ICc0QTk0JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNCc6ICc0QTk1JywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNSc6ICc0RDAyJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgNic6ICc0RDAzJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnkgUnVieSBSYXknOiAnNEFDNicsIC8vIGZyb250YWwgbGFzZXJcclxuICAgICdSdWJ5IFVuZGVybWluZSc6ICc0QTk3JywgLy8gZ3JvdW5kIGFvZXMgdW5kZXIgdGhlIHJhdmVuc2NsYXcgcGF0Y2hlc1xyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDEnOiAnNEU2OScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDInOiAnNEU2QScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDMnOiAnNEFBMScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDQnOiAnNEFBMicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDUnOiAnNEFBMycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDYnOiAnNEFBNCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDcnOiAnNEFBNScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDgnOiAnNEFBNicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDknOiAnNEFBNycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDEwJzogJzRDMjEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IFJhdmVuc2ZsaWdodCAxMSc6ICc0QzJBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBDb21ldCBCdXJzdCc6ICc0QUI0JywgLy8gbWV0ZW9yIGV4cGxvZGluZ1xyXG4gICAgJ1J1YnkgQnJhZGFtYW50ZSc6ICc0QUJDJywgLy8gaGVhZG1hcmtlcnMgd2l0aCBsaW5lIGFvZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1J1YnkgSG9taW5nIExhc2VyJzogJzRBQzUnLCAvLyBzcHJlYWQgbWFya2VycyBpbiBQMVxyXG4gICAgJ1J1YnkgTWV0ZW9yIFN0cmVhbSc6ICc0RTY3JywgLy8gc3ByZWFkIG1hcmtlcnMgaW4gUDJcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTaGl2YSBVbnJlYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFraEFmYWhBbXBoaXRoZWF0cmVVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUV4IEljaWNsZSBJbXBhY3QnOiAnNTM3QicsXHJcbiAgICAvLyBcImdldCBpblwiIGFvZVxyXG4gICAgJ1NoaXZhRXggV2hpdGVvdXQnOiAnNTM3NicsXHJcbiAgICAvLyBBdm9pZGFibGUgdGFuayBzdHVuLlxyXG4gICAgJ1NoaXZhRXggR2xhY2llciBCYXNoJzogJzUzNzUnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gMjcwIGRlZ3JlZSBhdHRhY2suXHJcbiAgICAnU2hpdmFFeCBHbGFzcyBEYW5jZSc6ICc1Mzc4JyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gSGFpbHN0b3JtIHNwcmVhZCBtYXJrZXIuXHJcbiAgICAnU2hpdmFFeCBIYWlsc3Rvcm0nOiAnNTM2RicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgIC8vIExhc2VyLiAgVE9ETzogbWF5YmUgYmxhbWUgdGhlIHBlcnNvbiBpdCdzIG9uPz9cclxuICAgICdTaGl2YUV4IEF2YWxhbmNoZSc6ICc1Mzc5JyxcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAvLyBQYXJ0eSBzaGFyZWQgdGFuayBidXN0ZXIuXHJcbiAgICAnU2hpdmFFeCBJY2VicmFuZCc6ICc1MzczJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFFeCBEZWVwIEZyZWV6ZScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFNoaXZhIGFsc28gdXNlcyBhYmlsaXR5IDUzN0Egb24geW91LCBidXQgaXQgaGFzIGFuIHVua25vd24gbmFtZS5cclxuICAgICAgLy8gU28sIHVzZSB0aGUgZWZmZWN0IGluc3RlYWQgZm9yIGZyZWUgdHJhbnNsYXRpb24uXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxRTcnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBidXQgZm9yIGEgc2hvcnRlciBkdXJhdGlvbi5cclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSA+IDIwO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEYW5jaW5nUGxhZ3VlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbmlhIFdvb2RcXCdzIEVtYnJhY2UnOiAnM0Q1MCcsXHJcbiAgICAvLyAnVGl0YW5pYSBGcm9zdCBSdW5lJzogJzNENEUnLFxyXG4gICAgJ1RpdGFuaWEgR2VudGxlIEJyZWV6ZSc6ICczRjgzJyxcclxuICAgICdUaXRhbmlhIExlYWZzdG9ybSAxJzogJzNENTUnLFxyXG4gICAgJ1RpdGFuaWEgUHVja1xcJ3MgUmVidWtlJzogJzNENTgnLFxyXG4gICAgJ1RpdGFuaWEgTGVhZnN0b3JtIDInOiAnM0UwMycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5pYSBQaGFudG9tIFJ1bmUgMSc6ICczRDVEJyxcclxuICAgICdUaXRhbmlhIFBoYW50b20gUnVuZSAyJzogJzNENUUnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVGl0YW5pYSBEaXZpbmF0aW9uIFJ1bmUnOiAnM0Q1QicsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEYW5jaW5nUGxhZ3VlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5pYUV4IFdvb2RcXCdzIEVtYnJhY2UnOiAnM0QyRicsXHJcbiAgICAvLyAnVGl0YW5pYUV4IEZyb3N0IFJ1bmUnOiAnM0QyQicsXHJcbiAgICAnVGl0YW5pYUV4IEdlbnRsZSBCcmVlemUnOiAnM0Y4MicsXHJcbiAgICAnVGl0YW5pYUV4IExlYWZzdG9ybSAxJzogJzNEMzknLFxyXG4gICAgJ1RpdGFuaWFFeCBQdWNrXFwncyBSZWJ1a2UnOiAnM0Q0MycsXHJcbiAgICAnVGl0YW5pYUV4IFdhbGxvcCc6ICczRDNCJyxcclxuICAgICdUaXRhbmlhRXggTGVhZnN0b3JtIDInOiAnM0Q0OScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5pYUV4IFBoYW50b20gUnVuZSAxJzogJzNENEMnLFxyXG4gICAgJ1RpdGFuaWFFeCBQaGFudG9tIFJ1bmUgMic6ICczRDREJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gVE9ETzogVGhpcyBjb3VsZCBtYXliZSBibGFtZSB0aGUgcGVyc29uIHdpdGggdGhlIHRldGhlcj9cclxuICAgICdUaXRhbmlhRXggVGh1bmRlciBSdW5lJzogJzNEMjknLFxyXG4gICAgJ1RpdGFuaWFFeCBEaXZpbmF0aW9uIFJ1bmUnOiAnM0Q0QScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRpdGFuIFVucmVhbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlTmF2ZWxVbnJlYWwsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuVW4gV2VpZ2h0IE9mIFRoZSBMYW5kJzogJzU4RkUnLFxyXG4gICAgJ1RpdGFuVW4gQnVyc3QnOiAnNUFERicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5VbiBMYW5kc2xpZGUnOiAnNUFEQycsXHJcbiAgICAnVGl0YW5VbiBHYW9sZXIgTGFuZHNsaWRlJzogJzU5MDInLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGl0YW5VbiBSb2NrIEJ1c3Rlcic6ICc1OEY2JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuVW4gTW91bnRhaW4gQnVzdGVyJzogJzU4RjcnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NZW1vcmlhTWlzZXJhRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCAxJzogJzRDRDInLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgMic6ICc0Q0QzJyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDMnOiAnNENENCcsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCA0JzogJzRDRDUnLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgNSc6ICc0Q0Q2JyxcclxuICAgICdWYXJpc0V4IElnbmlzIEVzdCAxJzogJzRDQjUnLFxyXG4gICAgJ1ZhcmlzRXggSWduaXMgRXN0IDInOiAnNENDNScsXHJcbiAgICAnVmFyaXNFeCBWZW50dXMgRXN0IDEnOiAnNENDNycsXHJcbiAgICAnVmFyaXNFeCBWZW50dXMgRXN0IDInOiAnNENDOCcsXHJcbiAgICAnVmFyaXNFeCBBc3NhdWx0IENhbm5vbic6ICc0Q0U1JyxcclxuICAgICdWYXJpc0V4IEZvcnRpdXMgUm90YXRpbmcnOiAnNENFOScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyBEb24ndCBoaXQgdGhlIHNoaWVsZHMhXHJcbiAgICAnVmFyaXNFeCBSZXBheSc6ICc0Q0REJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gVGhpcyBpcyB0aGUgXCJwcm90ZWFuXCIgZm9ydGl1cy5cclxuICAgICdWYXJpc0V4IEZvcnRpdXMgUHJvdGVhbic6ICc0Q0U3JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1ZhcmlzRXggTWFnaXRlayBCdXJzdCc6ICc0Q0RGJyxcclxuICAgICdWYXJpc0V4IEFldGhlcm9jaGVtaWNhbCBHcmVuYWRvJzogJzRDRUQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdWYXJpc0V4IFRlcm1pbnVzIEVzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRDQjQnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBSYWRpYW50IEJyYXZlciBpcyA0RjE2LzRGMTcoeDIpLCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IERlc3BlcmFkbyBpcyA0RjE4LzRGMTksIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgTWV0ZW9yIGlzIDRGMUEsIGFuZCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBtb3JlIHRoYW4gMT9cclxuLy8gVE9ETzogbWlzc2luZyBhIHRvd2VyP1xyXG5cclxuLy8gTm90ZTogRGVsaWJlcmF0ZWx5IG5vdCBpbmNsdWRpbmcgcHlyZXRpYyBkYW1hZ2UgYXMgYW4gZXJyb3IuXHJcbi8vIE5vdGU6IEl0IGRvZXNuJ3QgYXBwZWFyIHRoYXQgdGhlcmUncyBhbnkgd2F5IHRvIHRlbGwgd2hvIGZhaWxlZCB0aGUgY3V0c2NlbmUuXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlU2VhdE9mU2FjcmlmaWNlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdXT0wgU29sZW1uIENvbmZpdGVvcic6ICc0RjJBJywgLy8gZ3JvdW5kIHB1ZGRsZXNcclxuICAgICdXT0wgQ29ydXNjYW50IFNhYmVyIEluJzogJzRGMTAnLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTCBDb3J1c2NhbnQgU2FiZXIgT3V0JzogJzRGMTEnLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0wgSW1idWVkIENvcnVzYW5jZSBPdXQnOiAnNEY0QicsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTCBJbWJ1ZWQgQ29ydXNhbmNlIEluJzogJzRGNEMnLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTCBTaGluaW5nIFdhdmUnOiAnNEYyNicsIC8vIHN3b3JkIHRyaWFuZ2xlXHJcbiAgICAnV09MIENhdXRlcml6ZSc6ICc0RjI1JyxcclxuICAgICdXT0wgQnJpbXN0b25lIEVhcnRoIDEnOiAnNEYxRScsIC8vIGNvcm5lciBncm93aW5nIGNpcmNsZXMsIGluaXRpYWxcclxuICAgICdXT0wgQnJpbXN0b25lIEVhcnRoIDInOiAnNEYxRicsIC8vIGNvcm5lciBncm93aW5nIGNpcmNsZXMsIGdyb3dpbmdcclxuICAgICdXT0wgRmxhcmUgQnJlYXRoJzogJzRGMjQnLFxyXG4gICAgJ1dPTCBEZWNpbWF0aW9uJzogJzRGMjMnLFxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnV09MIERlZXAgRnJlZXplJzogJzRFNicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTCBUcnVlIFdhbGtpbmcgRGVhZCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEUnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IFJhZGlhbnQgQnJhdmVyIGlzIDRFRjcvNEVGOCh4MiksIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgRGVzcGVyYWRvIGlzIDRFRjkvNEVGQSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBNZXRlb3IgaXMgNEVGQywgYW5kIHNob3VsZG4ndCBnZXQgaGl0IGJ5IG1vcmUgdGhhbiAxP1xyXG4vLyBUT0RPOiBBYnNvbHV0ZSBIb2x5IHNob3VsZCBiZSBzaGFyZWQ/XHJcbi8vIFRPRE86IGludGVyc2VjdGluZyBicmltc3RvbmVzP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVNlYXRPZlNhY3JpZmljZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dPTEV4IFNvbGVtbiBDb25maXRlb3InOiAnNEYwQycsIC8vIGdyb3VuZCBwdWRkbGVzXHJcbiAgICAnV09MRXggQ29ydXNjYW50IFNhYmVyIEluJzogJzRFRjInLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTEV4IENvcnVzY2FudCBTYWJlciBPdXQnOiAnNEVGMScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTEV4IEltYnVlZCBDb3J1c2FuY2UgT3V0JzogJzRGNDknLCAvLyBzYWJlciBvdXRcclxuICAgICdXT0xFeCBJbWJ1ZWQgQ29ydXNhbmNlIEluJzogJzRGNEEnLCAvLyBzYWJlciBpblxyXG4gICAgJ1dPTEV4IFNoaW5pbmcgV2F2ZSc6ICc0RjA4JywgLy8gc3dvcmQgdHJpYW5nbGVcclxuICAgICdXT0xFeCBDYXV0ZXJpemUnOiAnNEYwNycsXHJcbiAgICAnV09MRXggQnJpbXN0b25lIEVhcnRoJzogJzRGMDAnLCAvLyBjb3JuZXIgZ3Jvd2luZyBjaXJjbGVzLCBncm93aW5nXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdXT0xFeCBEZWVwIEZyZWV6ZSc6ICc0RTYnLCAvLyBmYWlsaW5nIEFic29sdXRlIEJsaXp6YXJkIElJSVxyXG4gICAgJ1dPTEV4IERhbWFnZSBEb3duJzogJzI3NCcsIC8vIGZhaWxpbmcgQWJzb2x1dGUgRmxhc2hcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1dPTEV4IEFic29sdXRlIFN0b25lIElJSSc6ICc0RUVCJywgLy8gcHJvdGVhbiB3YXZlIGltYnVlZCBtYWdpY1xyXG4gICAgJ1dPTEV4IEZsYXJlIEJyZWF0aCc6ICc0RjA2JywgLy8gdGV0aGVyIGZyb20gc3VtbW9uZWQgYmFoYW11dHNcclxuICAgICdXT0xFeCBQZXJmZWN0IERlY2ltYXRpb24nOiAnNEYwNScsIC8vIHNtbi93YXIgcGhhc2UgbWFya2VyXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ1dvbEV4IEthdG9uIFNhbiBTaGFyZSc6ICc0RUZFJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MRXggVHJ1ZSBXYWxraW5nIERlYWQnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEZGJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0xFeCBUb3dlcicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEYwNCcsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBtaXN0YWtlOiB7XHJcbiAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgIGVuOiAnTWlzc2VkIFRvd2VyJyxcclxuICAgICAgICAgIGRlOiAnVHVybSB2ZXJwYXNzdCcsXHJcbiAgICAgICAgICBmcjogJ1RvdXIgbWFucXXDqWUnLFxyXG4gICAgICAgICAgamE6ICfloZTjgpLouI/jgb7jgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgY246ICfmsqHouKnloZQnLFxyXG4gICAgICAgICAga286ICfsnqXtjJAg7Iuk7IiYJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0xFeCBUcnVlIEhhbGxvd2VkIEdyb3VuZCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnNEY0NCcgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBGb3IgQmVyc2VyayBhbmQgRGVlcCBEYXJrc2lkZVxyXG4gICAgICBpZDogJ1dPTEV4IE1pc3NlZCBJbnRlcnJ1cHQnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1MTU2JywgJzUxNTgnXSB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc1Rocm90dGxlPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG4gIGphZ2RUZXRoZXI/OiB7IFtzb3VyY2VJZDogc3RyaW5nXTogc3RyaW5nIH07XHJcbn1cclxuXHJcbi8vIFRPRE86IEZJWCBsdW1pbm91cyBhZXRoZXJvcGxhc20gd2FybmluZyBub3Qgd29ya2luZ1xyXG4vLyBUT0RPOiBGSVggZG9sbCBkZWF0aCBub3Qgd29ya2luZ1xyXG4vLyBUT0RPOiBmYWlsaW5nIGhhbmQgb2YgcGFpbi9wYXJ0aW5nIChjaGVjayBmb3IgaGlnaCBkYW1hZ2U/KVxyXG4vLyBUT0RPOiBtYWtlIHN1cmUgZXZlcnlib2R5IHRha2VzIGV4YWN0bHkgb25lIHByb3RlYW4gKHJhdGhlciB0aGFuIHdhdGNoaW5nIGRvdWJsZSBoaXRzKVxyXG4vLyBUT0RPOiB0aHVuZGVyIG5vdCBoaXR0aW5nIGV4YWN0bHkgMj9cclxuLy8gVE9ETzogcGVyc29uIHdpdGggd2F0ZXIvdGh1bmRlciBkZWJ1ZmYgZHlpbmdcclxuLy8gVE9ETzogYmFkIG5pc2kgcGFzc1xyXG4vLyBUT0RPOiBmYWlsZWQgZ2F2ZWwgbWVjaGFuaWNcclxuLy8gVE9ETzogZG91YmxlIHJvY2tldCBwdW5jaCBub3QgaGl0dGluZyBleGFjdGx5IDI/IChvciB0YW5rcylcclxuLy8gVE9ETzogc3RhbmRpbmcgaW4gc2x1ZGdlIHB1ZGRsZXMgYmVmb3JlIGhpZGRlbiBtaW5lP1xyXG4vLyBUT0RPOiBoaWRkZW4gbWluZSBmYWlsdXJlP1xyXG4vLyBUT0RPOiBmYWlsdXJlcyBvZiBvcmRhaW5lZCBtb3Rpb24gLyBzdGlsbG5lc3NcclxuLy8gVE9ETzogZmFpbHVyZXMgb2YgcGxhaW50IG9mIHNldmVyaXR5ICh0ZXRoZXJzKVxyXG4vLyBUT0RPOiBmYWlsdXJlcyBvZiBwbGFpbnQgb2Ygc29saWRhcml0eSAoc2hhcmVkIHNlbnRlbmNlKVxyXG4vLyBUT0RPOiBvcmRhaW5lZCBjYXBpdGFsIHB1bmlzaG1lbnQgaGl0dGluZyBub24tdGFua3NcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVFcGljT2ZBbGV4YW5kZXJVbHRpbWF0ZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVEVBIFNsdWljZSc6ICc0OUIxJyxcclxuICAgICdURUEgUHJvdGVhbiBXYXZlIDEnOiAnNDgyNCcsXHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSAyJzogJzQ5QjUnLFxyXG4gICAgJ1RFQSBTcGluIENydXNoZXInOiAnNEE3MicsXHJcbiAgICAnVEVBIFNhY3JhbWVudCc6ICc0ODVGJyxcclxuICAgICdURUEgUmFkaWFudCBTYWNyYW1lbnQnOiAnNDg4NicsXHJcbiAgICAnVEVBIEFsbWlnaHR5IEp1ZGdtZW50JzogJzQ4OTAnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RFQSBIYXdrIEJsYXN0ZXInOiAnNDgzMCcsXHJcbiAgICAnVEVBIENoYWtyYW0nOiAnNDg1NScsXHJcbiAgICAnVEVBIEVudW1lcmF0aW9uJzogJzQ4NTAnLFxyXG4gICAgJ1RFQSBBcG9jYWx5cHRpYyBSYXknOiAnNDg0QycsXHJcbiAgICAnVEVBIFByb3BlbGxlciBXaW5kJzogJzQ4MzInLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVEVBIFByb3RlYW4gV2F2ZSBEb3VibGUgMSc6ICc0OUI2JyxcclxuICAgICdURUEgUHJvdGVhbiBXYXZlIERvdWJsZSAyJzogJzQ4MjUnLFxyXG4gICAgJ1RFQSBGbHVpZCBTd2luZyc6ICc0OUIwJyxcclxuICAgICdURUEgRmx1aWQgU3RyaWtlJzogJzQ5QjcnLFxyXG4gICAgJ1RFQSBIaWRkZW4gTWluZSc6ICc0ODUyJyxcclxuICAgICdURUEgQWxwaGEgU3dvcmQnOiAnNDg2QicsXHJcbiAgICAnVEVBIEZsYXJldGhyb3dlcic6ICc0ODZCJyxcclxuICAgICdURUEgQ2hhc3RlbmluZyBIZWF0JzogJzRBODAnLFxyXG4gICAgJ1RFQSBEaXZpbmUgU3BlYXInOiAnNEE4MicsXHJcbiAgICAnVEVBIE9yZGFpbmVkIFB1bmlzaG1lbnQnOiAnNDg5MScsXHJcbiAgICAvLyBPcHRpY2FsIFNwcmVhZFxyXG4gICAgJ1RFQSBJbmRpdmlkdWFsIFJlcHJvYmF0aW9uJzogJzQ4OEMnLFxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgIC8vIE9wdGljYWwgU3RhY2tcclxuICAgICdURUEgQ29sbGVjdGl2ZSBSZXByb2JhdGlvbic6ICc0ODhEJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFwidG9vIG11Y2ggbHVtaW5vdXMgYWV0aGVyb3BsYXNtXCJcclxuICAgICAgLy8gV2hlbiB0aGlzIGhhcHBlbnMsIHRoZSB0YXJnZXQgZXhwbG9kZXMsIGhpdHRpbmcgbmVhcmJ5IHBlb3BsZVxyXG4gICAgICAvLyBidXQgYWxzbyB0aGVtc2VsdmVzLlxyXG4gICAgICBpZDogJ1RFQSBFeGhhdXN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDgxRicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMudGFyZ2V0ID09PSBtYXRjaGVzLnNvdXJjZSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdsdW1pbm91cyBhZXRoZXJvcGxhc20nLFxyXG4gICAgICAgICAgICBkZTogJ0x1bWluaXN6ZW50ZXMgw4R0aGVyb3BsYXNtYScsXHJcbiAgICAgICAgICAgIGZyOiAnw4l0aMOpcm9wbGFzbWEgbHVtaW5ldXgnLFxyXG4gICAgICAgICAgICBqYTogJ+WFieaAp+eIhumbtycsXHJcbiAgICAgICAgICAgIGNuOiAn5YWJ5oCn54iG6Zu3JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIERyb3BzeScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxMjEnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFRldGhlciBUcmFja2luZycsXHJcbiAgICAgIHR5cGU6ICdUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdKYWdkIERvbGwnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5qYWdkVGV0aGVyID8/PSB7fTtcclxuICAgICAgICBkYXRhLmphZ2RUZXRoZXJbbWF0Y2hlcy5zb3VyY2VJZF0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFJlZHVjaWJsZSBDb21wbGV4aXR5JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDgyMScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgLy8gVGhpcyBtYXkgYmUgdW5kZWZpbmVkLCB3aGljaCBpcyBmaW5lLlxyXG4gICAgICAgICAgbmFtZTogZGF0YS5qYWdkVGV0aGVyID8gZGF0YS5qYWdkVGV0aGVyW21hdGNoZXMuc291cmNlSWRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0RvbGwgRGVhdGgnLFxyXG4gICAgICAgICAgICBkZTogJ1B1cHBlIFRvdCcsXHJcbiAgICAgICAgICAgIGZyOiAnUG91cMOpZSBtb3J0ZScsXHJcbiAgICAgICAgICAgIGphOiAn44OJ44O844Or44GM5q2744KT44GgJyxcclxuICAgICAgICAgICAgY246ICfmta7lo6vlvrfmrbvkuqEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgRHJhaW5hZ2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0ODI3JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiAhZGF0YS5wYXJ0eS5pc1RhbmsobWF0Y2hlcy50YXJnZXQpLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFRocm90dGxlIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMkJDJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVGhyb3R0bGUgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVGhyb3R0bGVbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFRocm90dGxlIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnMkJDJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVGhyb3R0bGUgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVGhyb3R0bGVbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBUaHJvdHRsZScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc1Rocm90dGxlKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEJhbGxvb24gUG9wcGluZy4gIEl0IHNlZW1zIGxpa2UgdGhlIHBlcnNvbiB3aG8gcG9wcyBpdCBpcyB0aGVcclxuICAgICAgLy8gZmlyc3QgcGVyc29uIGxpc3RlZCBkYW1hZ2Utd2lzZSwgc28gdGhleSBhcmUgbGlrZWx5IHRoZSBjdWxwcml0LlxyXG4gICAgICBpZDogJ1RFQSBPdXRidXJzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ4MkEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogNSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuc291cmNlIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgZmlsZTAgZnJvbSAnLi8wMC1taXNjL2dlbmVyYWwudHMnO1xuaW1wb3J0IGZpbGUxIGZyb20gJy4vMDAtbWlzYy90ZXN0LnRzJztcbmltcG9ydCBmaWxlMiBmcm9tICcuLzAyLWFyci90cmlhbC9pZnJpdC1ubS50cyc7XG5pbXBvcnQgZmlsZTMgZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4tbm0udHMnO1xuaW1wb3J0IGZpbGU0IGZyb20gJy4vMDItYXJyL3RyaWFsL2xldmktZXgudHMnO1xuaW1wb3J0IGZpbGU1IGZyb20gJy4vMDItYXJyL3RyaWFsL3NoaXZhLWhtLnRzJztcbmltcG9ydCBmaWxlNiBmcm9tICcuLzAyLWFyci90cmlhbC9zaGl2YS1leC50cyc7XG5pbXBvcnQgZmlsZTcgZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4taG0udHMnO1xuaW1wb3J0IGZpbGU4IGZyb20gJy4vMDItYXJyL3RyaWFsL3RpdGFuLWV4LnRzJztcbmltcG9ydCBmaWxlOSBmcm9tICcuLzAzLWh3L2FsbGlhbmNlL3dlZXBpbmdfY2l0eS50cyc7XG5pbXBvcnQgZmlsZTEwIGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9hZXRoZXJvY2hlbWljYWxfcmVzZWFyY2hfZmFjaWxpdHkudHMnO1xuaW1wb3J0IGZpbGUxMSBmcm9tICcuLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0udHMnO1xuaW1wb3J0IGZpbGUxMiBmcm9tICcuLzAzLWh3L2R1bmdlb24vZ3ViYWxfbGlicmFyeV9oYXJkLnRzJztcbmltcG9ydCBmaWxlMTMgZnJvbSAnLi8wMy1ody9kdW5nZW9uL3NvaG1fYWxfaGFyZC50cyc7XG5pbXBvcnQgZmlsZTE0IGZyb20gJy4vMDMtaHcvcmFpZC9hNm4udHMnO1xuaW1wb3J0IGZpbGUxNSBmcm9tICcuLzAzLWh3L3JhaWQvYTEybi50cyc7XG5pbXBvcnQgZmlsZTE2IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9hbGFfbWhpZ28udHMnO1xuaW1wb3J0IGZpbGUxNyBmcm9tICcuLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUudHMnO1xuaW1wb3J0IGZpbGUxOCBmcm9tICcuLzA0LXNiL2R1bmdlb24vZHJvd25lZF9jaXR5X29mX3NrYWxsYS50cyc7XG5pbXBvcnQgZmlsZTE5IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLnRzJztcbmltcG9ydCBmaWxlMjAgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3NpcmVuc29uZ19zZWEudHMnO1xuaW1wb3J0IGZpbGUyMSBmcm9tICcuLzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC50cyc7XG5pbXBvcnQgZmlsZTIyIGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9zd2FsbG93c19jb21wYXNzLnRzJztcbmltcG9ydCBmaWxlMjMgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3RlbXBsZV9vZl90aGVfZmlzdC50cyc7XG5pbXBvcnQgZmlsZTI0IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi50cyc7XG5pbXBvcnQgZmlsZTI1IGZyb20gJy4vMDQtc2IvcmFpZC9vMW4udHMnO1xuaW1wb3J0IGZpbGUyNiBmcm9tICcuLzA0LXNiL3JhaWQvbzFzLnRzJztcbmltcG9ydCBmaWxlMjcgZnJvbSAnLi8wNC1zYi9yYWlkL28ybi50cyc7XG5pbXBvcnQgZmlsZTI4IGZyb20gJy4vMDQtc2IvcmFpZC9vMnMudHMnO1xuaW1wb3J0IGZpbGUyOSBmcm9tICcuLzA0LXNiL3JhaWQvbzNuLnRzJztcbmltcG9ydCBmaWxlMzAgZnJvbSAnLi8wNC1zYi9yYWlkL28zcy50cyc7XG5pbXBvcnQgZmlsZTMxIGZyb20gJy4vMDQtc2IvcmFpZC9vNG4udHMnO1xuaW1wb3J0IGZpbGUzMiBmcm9tICcuLzA0LXNiL3JhaWQvbzRzLnRzJztcbmltcG9ydCBmaWxlMzMgZnJvbSAnLi8wNC1zYi9yYWlkL281bi50cyc7XG5pbXBvcnQgZmlsZTM0IGZyb20gJy4vMDQtc2IvcmFpZC9vNm4udHMnO1xuaW1wb3J0IGZpbGUzNSBmcm9tICcuLzA0LXNiL3JhaWQvbzduLnRzJztcbmltcG9ydCBmaWxlMzYgZnJvbSAnLi8wNC1zYi9yYWlkL283cy50cyc7XG5pbXBvcnQgZmlsZTM3IGZyb20gJy4vMDQtc2IvcmFpZC9vOG4udHMnO1xuaW1wb3J0IGZpbGUzOCBmcm9tICcuLzA0LXNiL3JhaWQvbzluLnRzJztcbmltcG9ydCBmaWxlMzkgZnJvbSAnLi8wNC1zYi9yYWlkL28xMG4udHMnO1xuaW1wb3J0IGZpbGU0MCBmcm9tICcuLzA0LXNiL3JhaWQvbzExbi50cyc7XG5pbXBvcnQgZmlsZTQxIGZyb20gJy4vMDQtc2IvcmFpZC9vMTJuLnRzJztcbmltcG9ydCBmaWxlNDIgZnJvbSAnLi8wNC1zYi9yYWlkL28xMnMudHMnO1xuaW1wb3J0IGZpbGU0MyBmcm9tICcuLzA0LXNiL3RyaWFsL2J5YWtrby1leC50cyc7XG5pbXBvcnQgZmlsZTQ0IGZyb20gJy4vMDQtc2IvdHJpYWwvc2hpbnJ5dS50cyc7XG5pbXBvcnQgZmlsZTQ1IGZyb20gJy4vMDQtc2IvdHJpYWwvc3VzYW5vLWV4LnRzJztcbmltcG9ydCBmaWxlNDYgZnJvbSAnLi8wNC1zYi90cmlhbC9zdXpha3UudHMnO1xuaW1wb3J0IGZpbGU0NyBmcm9tICcuLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUudHMnO1xuaW1wb3J0IGZpbGU0OCBmcm9tICcuLzA0LXNiL3VsdGltYXRlL3VuZW5kaW5nX2NvaWxfdWx0aW1hdGUudHMnO1xuaW1wb3J0IGZpbGU0OSBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfY29waWVkX2ZhY3RvcnkudHMnO1xuaW1wb3J0IGZpbGU1MCBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIudHMnO1xuaW1wb3J0IGZpbGU1MSBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfdG93ZXJfYXRfcGFyYWRpZ21zX2JyZWFjaC50cyc7XG5pbXBvcnQgZmlsZTUyIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYWthZGFlbWlhX2FueWRlci50cyc7XG5pbXBvcnQgZmlsZTUzIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYW1hdXJvdC50cyc7XG5pbXBvcnQgZmlsZTU0IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYW5hbW5lc2lzX2FueWRlci50cyc7XG5pbXBvcnQgZmlsZTU1IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vZG9obl9taGVnLnRzJztcbmltcG9ydCBmaWxlNTYgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQudHMnO1xuaW1wb3J0IGZpbGU1NyBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2hvbG1pbnN0ZXJfc3dpdGNoLnRzJztcbmltcG9ydCBmaWxlNTggZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9tYWxpa2Foc193ZWxsLnRzJztcbmltcG9ydCBmaWxlNTkgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC50cyc7XG5pbXBvcnQgZmlsZTYwIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbXRfZ3VsZy50cyc7XG5pbXBvcnQgZmlsZTYxIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vcGFnbHRoYW4udHMnO1xuaW1wb3J0IGZpbGU2MiBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC50cyc7XG5pbXBvcnQgZmlsZTYzIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vdGhlX2dyYW5kX2Nvc21vcy50cyc7XG5pbXBvcnQgZmlsZTY0IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vdHdpbm5pbmcudHMnO1xuaW1wb3J0IGZpbGU2NSBmcm9tICcuLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS50cyc7XG5pbXBvcnQgZmlsZTY2IGZyb20gJy4vMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlX3NhdmFnZS50cyc7XG5pbXBvcnQgZmlsZTY3IGZyb20gJy4vMDUtc2hiL3JhaWQvZTFuLnRzJztcbmltcG9ydCBmaWxlNjggZnJvbSAnLi8wNS1zaGIvcmFpZC9lMXMudHMnO1xuaW1wb3J0IGZpbGU2OSBmcm9tICcuLzA1LXNoYi9yYWlkL2Uybi50cyc7XG5pbXBvcnQgZmlsZTcwIGZyb20gJy4vMDUtc2hiL3JhaWQvZTJzLnRzJztcbmltcG9ydCBmaWxlNzEgZnJvbSAnLi8wNS1zaGIvcmFpZC9lM24udHMnO1xuaW1wb3J0IGZpbGU3MiBmcm9tICcuLzA1LXNoYi9yYWlkL2Uzcy50cyc7XG5pbXBvcnQgZmlsZTczIGZyb20gJy4vMDUtc2hiL3JhaWQvZTRuLnRzJztcbmltcG9ydCBmaWxlNzQgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNHMudHMnO1xuaW1wb3J0IGZpbGU3NSBmcm9tICcuLzA1LXNoYi9yYWlkL2U1bi50cyc7XG5pbXBvcnQgZmlsZTc2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTVzLnRzJztcbmltcG9ydCBmaWxlNzcgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNm4udHMnO1xuaW1wb3J0IGZpbGU3OCBmcm9tICcuLzA1LXNoYi9yYWlkL2U2cy50cyc7XG5pbXBvcnQgZmlsZTc5IGZyb20gJy4vMDUtc2hiL3JhaWQvZTduLnRzJztcbmltcG9ydCBmaWxlODAgZnJvbSAnLi8wNS1zaGIvcmFpZC9lN3MudHMnO1xuaW1wb3J0IGZpbGU4MSBmcm9tICcuLzA1LXNoYi9yYWlkL2U4bi50cyc7XG5pbXBvcnQgZmlsZTgyIGZyb20gJy4vMDUtc2hiL3JhaWQvZThzLnRzJztcbmltcG9ydCBmaWxlODMgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOW4udHMnO1xuaW1wb3J0IGZpbGU4NCBmcm9tICcuLzA1LXNoYi9yYWlkL2U5cy50cyc7XG5pbXBvcnQgZmlsZTg1IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEwbi50cyc7XG5pbXBvcnQgZmlsZTg2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEwcy50cyc7XG5pbXBvcnQgZmlsZTg3IGZyb20gJy4vMDUtc2hiL3JhaWQvZTExbi50cyc7XG5pbXBvcnQgZmlsZTg4IGZyb20gJy4vMDUtc2hiL3JhaWQvZTExcy50cyc7XG5pbXBvcnQgZmlsZTg5IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEybi50cyc7XG5pbXBvcnQgZmlsZTkwIGZyb20gJy4vMDUtc2hiL3JhaWQvZTEycy50cyc7XG5pbXBvcnQgZmlsZTkxIGZyb20gJy4vMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLWV4LnRzJztcbmltcG9ydCBmaWxlOTIgZnJvbSAnLi8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24udHMnO1xuaW1wb3J0IGZpbGU5MyBmcm9tICcuLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi1leC50cyc7XG5pbXBvcnQgZmlsZTk0IGZyb20gJy4vMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLnRzJztcbmltcG9ydCBmaWxlOTUgZnJvbSAnLi8wNS1zaGIvdHJpYWwvaGFkZXMtZXgudHMnO1xuaW1wb3J0IGZpbGU5NiBmcm9tICcuLzA1LXNoYi90cmlhbC9oYWRlcy50cyc7XG5pbXBvcnQgZmlsZTk3IGZyb20gJy4vMDUtc2hiL3RyaWFsL2lubm9jZW5jZS1leC50cyc7XG5pbXBvcnQgZmlsZTk4IGZyb20gJy4vMDUtc2hiL3RyaWFsL2lubm9jZW5jZS50cyc7XG5pbXBvcnQgZmlsZTk5IGZyb20gJy4vMDUtc2hiL3RyaWFsL2xldmktdW4udHMnO1xuaW1wb3J0IGZpbGUxMDAgZnJvbSAnLi8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXgudHMnO1xuaW1wb3J0IGZpbGUxMDEgZnJvbSAnLi8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24udHMnO1xuaW1wb3J0IGZpbGUxMDIgZnJvbSAnLi8wNS1zaGIvdHJpYWwvc2hpdmEtdW4udHMnO1xuaW1wb3J0IGZpbGUxMDMgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdGl0YW5pYS50cyc7XG5pbXBvcnQgZmlsZTEwNCBmcm9tICcuLzA1LXNoYi90cmlhbC90aXRhbmlhLWV4LnRzJztcbmltcG9ydCBmaWxlMTA1IGZyb20gJy4vMDUtc2hiL3RyaWFsL3RpdGFuLXVuLnRzJztcbmltcG9ydCBmaWxlMTA2IGZyb20gJy4vMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LnRzJztcbmltcG9ydCBmaWxlMTA3IGZyb20gJy4vMDUtc2hiL3RyaWFsL3dvbC50cyc7XG5pbXBvcnQgZmlsZTEwOCBmcm9tICcuLzA1LXNoYi90cmlhbC93b2wtZXgudHMnO1xuaW1wb3J0IGZpbGUxMDkgZnJvbSAnLi8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLnRzJztcblxuZXhwb3J0IGRlZmF1bHQgeycwMC1taXNjL2dlbmVyYWwudHMnOiBmaWxlMCwnMDAtbWlzYy90ZXN0LnRzJzogZmlsZTEsJzAyLWFyci90cmlhbC9pZnJpdC1ubS50cyc6IGZpbGUyLCcwMi1hcnIvdHJpYWwvdGl0YW4tbm0udHMnOiBmaWxlMywnMDItYXJyL3RyaWFsL2xldmktZXgudHMnOiBmaWxlNCwnMDItYXJyL3RyaWFsL3NoaXZhLWhtLnRzJzogZmlsZTUsJzAyLWFyci90cmlhbC9zaGl2YS1leC50cyc6IGZpbGU2LCcwMi1hcnIvdHJpYWwvdGl0YW4taG0udHMnOiBmaWxlNywnMDItYXJyL3RyaWFsL3RpdGFuLWV4LnRzJzogZmlsZTgsJzAzLWh3L2FsbGlhbmNlL3dlZXBpbmdfY2l0eS50cyc6IGZpbGU5LCcwMy1ody9kdW5nZW9uL2FldGhlcm9jaGVtaWNhbF9yZXNlYXJjaF9mYWNpbGl0eS50cyc6IGZpbGUxMCwnMDMtaHcvZHVuZ2Vvbi9mcmFjdGFsX2NvbnRpbnV1bS50cyc6IGZpbGUxMSwnMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQudHMnOiBmaWxlMTIsJzAzLWh3L2R1bmdlb24vc29obV9hbF9oYXJkLnRzJzogZmlsZTEzLCcwMy1ody9yYWlkL2E2bi50cyc6IGZpbGUxNCwnMDMtaHcvcmFpZC9hMTJuLnRzJzogZmlsZTE1LCcwNC1zYi9kdW5nZW9uL2FsYV9taGlnby50cyc6IGZpbGUxNiwnMDQtc2IvZHVuZ2Vvbi9iYXJkYW1zX21ldHRsZS50cyc6IGZpbGUxNywnMDQtc2IvZHVuZ2Vvbi9kcm93bmVkX2NpdHlfb2Zfc2thbGxhLnRzJzogZmlsZTE4LCcwNC1zYi9kdW5nZW9uL2t1Z2FuZV9jYXN0bGUudHMnOiBmaWxlMTksJzA0LXNiL2R1bmdlb24vc2lyZW5zb25nX3NlYS50cyc6IGZpbGUyMCwnMDQtc2IvZHVuZ2Vvbi9zdF9tb2NpYW5uZV9oYXJkLnRzJzogZmlsZTIxLCcwNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MudHMnOiBmaWxlMjIsJzA0LXNiL2R1bmdlb24vdGVtcGxlX29mX3RoZV9maXN0LnRzJzogZmlsZTIzLCcwNC1zYi9kdW5nZW9uL3RoZV9idXJuLnRzJzogZmlsZTI0LCcwNC1zYi9yYWlkL28xbi50cyc6IGZpbGUyNSwnMDQtc2IvcmFpZC9vMXMudHMnOiBmaWxlMjYsJzA0LXNiL3JhaWQvbzJuLnRzJzogZmlsZTI3LCcwNC1zYi9yYWlkL28ycy50cyc6IGZpbGUyOCwnMDQtc2IvcmFpZC9vM24udHMnOiBmaWxlMjksJzA0LXNiL3JhaWQvbzNzLnRzJzogZmlsZTMwLCcwNC1zYi9yYWlkL280bi50cyc6IGZpbGUzMSwnMDQtc2IvcmFpZC9vNHMudHMnOiBmaWxlMzIsJzA0LXNiL3JhaWQvbzVuLnRzJzogZmlsZTMzLCcwNC1zYi9yYWlkL282bi50cyc6IGZpbGUzNCwnMDQtc2IvcmFpZC9vN24udHMnOiBmaWxlMzUsJzA0LXNiL3JhaWQvbzdzLnRzJzogZmlsZTM2LCcwNC1zYi9yYWlkL284bi50cyc6IGZpbGUzNywnMDQtc2IvcmFpZC9vOW4udHMnOiBmaWxlMzgsJzA0LXNiL3JhaWQvbzEwbi50cyc6IGZpbGUzOSwnMDQtc2IvcmFpZC9vMTFuLnRzJzogZmlsZTQwLCcwNC1zYi9yYWlkL28xMm4udHMnOiBmaWxlNDEsJzA0LXNiL3JhaWQvbzEycy50cyc6IGZpbGU0MiwnMDQtc2IvdHJpYWwvYnlha2tvLWV4LnRzJzogZmlsZTQzLCcwNC1zYi90cmlhbC9zaGlucnl1LnRzJzogZmlsZTQ0LCcwNC1zYi90cmlhbC9zdXNhbm8tZXgudHMnOiBmaWxlNDUsJzA0LXNiL3RyaWFsL3N1emFrdS50cyc6IGZpbGU0NiwnMDQtc2IvdWx0aW1hdGUvdWx0aW1hX3dlYXBvbl91bHRpbWF0ZS50cyc6IGZpbGU0NywnMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS50cyc6IGZpbGU0OCwnMDUtc2hiL2FsbGlhbmNlL3RoZV9jb3BpZWRfZmFjdG9yeS50cyc6IGZpbGU0OSwnMDUtc2hiL2FsbGlhbmNlL3RoZV9wdXBwZXRzX2J1bmtlci50cyc6IGZpbGU1MCwnMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLnRzJzogZmlsZTUxLCcwNS1zaGIvZHVuZ2Vvbi9ha2FkYWVtaWFfYW55ZGVyLnRzJzogZmlsZTUyLCcwNS1zaGIvZHVuZ2Vvbi9hbWF1cm90LnRzJzogZmlsZTUzLCcwNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLnRzJzogZmlsZTU0LCcwNS1zaGIvZHVuZ2Vvbi9kb2huX21oZWcudHMnOiBmaWxlNTUsJzA1LXNoYi9kdW5nZW9uL2hlcm9lc19nYXVudGxldC50cyc6IGZpbGU1NiwnMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2gudHMnOiBmaWxlNTcsJzA1LXNoYi9kdW5nZW9uL21hbGlrYWhzX3dlbGwudHMnOiBmaWxlNTgsJzA1LXNoYi9kdW5nZW9uL21hdG95YXNfcmVsaWN0LnRzJzogZmlsZTU5LCcwNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLnRzJzogZmlsZTYwLCcwNS1zaGIvZHVuZ2Vvbi9wYWdsdGhhbi50cyc6IGZpbGU2MSwnMDUtc2hiL2R1bmdlb24vcWl0YW5hX3JhdmVsLnRzJzogZmlsZTYyLCcwNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLnRzJzogZmlsZTYzLCcwNS1zaGIvZHVuZ2Vvbi90d2lubmluZy50cyc6IGZpbGU2NCwnMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlLnRzJzogZmlsZTY1LCcwNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLnRzJzogZmlsZTY2LCcwNS1zaGIvcmFpZC9lMW4udHMnOiBmaWxlNjcsJzA1LXNoYi9yYWlkL2Uxcy50cyc6IGZpbGU2OCwnMDUtc2hiL3JhaWQvZTJuLnRzJzogZmlsZTY5LCcwNS1zaGIvcmFpZC9lMnMudHMnOiBmaWxlNzAsJzA1LXNoYi9yYWlkL2Uzbi50cyc6IGZpbGU3MSwnMDUtc2hiL3JhaWQvZTNzLnRzJzogZmlsZTcyLCcwNS1zaGIvcmFpZC9lNG4udHMnOiBmaWxlNzMsJzA1LXNoYi9yYWlkL2U0cy50cyc6IGZpbGU3NCwnMDUtc2hiL3JhaWQvZTVuLnRzJzogZmlsZTc1LCcwNS1zaGIvcmFpZC9lNXMudHMnOiBmaWxlNzYsJzA1LXNoYi9yYWlkL2U2bi50cyc6IGZpbGU3NywnMDUtc2hiL3JhaWQvZTZzLnRzJzogZmlsZTc4LCcwNS1zaGIvcmFpZC9lN24udHMnOiBmaWxlNzksJzA1LXNoYi9yYWlkL2U3cy50cyc6IGZpbGU4MCwnMDUtc2hiL3JhaWQvZThuLnRzJzogZmlsZTgxLCcwNS1zaGIvcmFpZC9lOHMudHMnOiBmaWxlODIsJzA1LXNoYi9yYWlkL2U5bi50cyc6IGZpbGU4MywnMDUtc2hiL3JhaWQvZTlzLnRzJzogZmlsZTg0LCcwNS1zaGIvcmFpZC9lMTBuLnRzJzogZmlsZTg1LCcwNS1zaGIvcmFpZC9lMTBzLnRzJzogZmlsZTg2LCcwNS1zaGIvcmFpZC9lMTFuLnRzJzogZmlsZTg3LCcwNS1zaGIvcmFpZC9lMTFzLnRzJzogZmlsZTg4LCcwNS1zaGIvcmFpZC9lMTJuLnRzJzogZmlsZTg5LCcwNS1zaGIvcmFpZC9lMTJzLnRzJzogZmlsZTkwLCcwNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24tZXgudHMnOiBmaWxlOTEsJzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi50cyc6IGZpbGU5MiwnMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LnRzJzogZmlsZTkzLCcwNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24udHMnOiBmaWxlOTQsJzA1LXNoYi90cmlhbC9oYWRlcy1leC50cyc6IGZpbGU5NSwnMDUtc2hiL3RyaWFsL2hhZGVzLnRzJzogZmlsZTk2LCcwNS1zaGIvdHJpYWwvaW5ub2NlbmNlLWV4LnRzJzogZmlsZTk3LCcwNS1zaGIvdHJpYWwvaW5ub2NlbmNlLnRzJzogZmlsZTk4LCcwNS1zaGIvdHJpYWwvbGV2aS11bi50cyc6IGZpbGU5OSwnMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLWV4LnRzJzogZmlsZTEwMCwnMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLnRzJzogZmlsZTEwMSwnMDUtc2hiL3RyaWFsL3NoaXZhLXVuLnRzJzogZmlsZTEwMiwnMDUtc2hiL3RyaWFsL3RpdGFuaWEudHMnOiBmaWxlMTAzLCcwNS1zaGIvdHJpYWwvdGl0YW5pYS1leC50cyc6IGZpbGUxMDQsJzA1LXNoYi90cmlhbC90aXRhbi11bi50cyc6IGZpbGUxMDUsJzA1LXNoYi90cmlhbC92YXJpcy1leC50cyc6IGZpbGUxMDYsJzA1LXNoYi90cmlhbC93b2wudHMnOiBmaWxlMTA3LCcwNS1zaGIvdHJpYWwvd29sLWV4LnRzJzogZmlsZTEwOCwnMDUtc2hiL3VsdGltYXRlL3RoZV9lcGljX29mX2FsZXhhbmRlci50cyc6IGZpbGUxMDksfTsiXSwic291cmNlUm9vdCI6IiJ9