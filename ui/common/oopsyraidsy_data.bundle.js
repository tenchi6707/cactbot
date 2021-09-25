(self["webpackChunkcactbot"] = self["webpackChunkcactbot"] || []).push([[727],{

/***/ 1338:
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











































































































/* harmony default export */ const oopsy_manifest = ({'00-misc/general.ts': general,'00-misc/test.ts': test,'02-arr/trial/ifrit-nm.ts': ifrit_nm,'02-arr/trial/titan-nm.ts': titan_nm,'02-arr/trial/levi-ex.ts': levi_ex,'02-arr/trial/shiva-hm.ts': shiva_hm,'02-arr/trial/shiva-ex.ts': shiva_ex,'02-arr/trial/titan-hm.ts': titan_hm,'02-arr/trial/titan-ex.ts': titan_ex,'03-hw/alliance/weeping_city.ts': weeping_city,'03-hw/dungeon/aetherochemical_research_facility.ts': aetherochemical_research_facility,'03-hw/dungeon/fractal_continuum.ts': fractal_continuum,'03-hw/dungeon/gubal_library_hard.ts': gubal_library_hard,'03-hw/dungeon/sohm_al_hard.ts': sohm_al_hard,'03-hw/raid/a6n.ts': a6n,'03-hw/raid/a12n.ts': a12n,'04-sb/dungeon/ala_mhigo.ts': ala_mhigo,'04-sb/dungeon/bardams_mettle.ts': bardams_mettle,'04-sb/dungeon/drowned_city_of_skalla.ts': drowned_city_of_skalla,'04-sb/dungeon/kugane_castle.ts': kugane_castle,'04-sb/dungeon/sirensong_sea.ts': sirensong_sea,'04-sb/dungeon/st_mocianne_hard.ts': st_mocianne_hard,'04-sb/dungeon/swallows_compass.ts': swallows_compass,'04-sb/dungeon/temple_of_the_fist.ts': temple_of_the_fist,'04-sb/dungeon/the_burn.ts': the_burn,'04-sb/raid/o1n.ts': o1n,'04-sb/raid/o1s.ts': o1s,'04-sb/raid/o2n.ts': o2n,'04-sb/raid/o2s.ts': o2s,'04-sb/raid/o3n.ts': o3n,'04-sb/raid/o3s.ts': o3s,'04-sb/raid/o4n.ts': o4n,'04-sb/raid/o4s.ts': o4s,'04-sb/raid/o7s.ts': o7s,'04-sb/raid/o9n.ts': o9n,'04-sb/raid/o10n.ts': o10n,'04-sb/raid/o11n.ts': o11n,'04-sb/raid/o12n.ts': o12n,'04-sb/raid/o12s.ts': o12s,'04-sb/trial/byakko-ex.ts': byakko_ex,'04-sb/trial/shinryu.ts': shinryu,'04-sb/trial/susano-ex.ts': susano_ex,'04-sb/trial/suzaku.ts': suzaku,'04-sb/ultimate/ultima_weapon_ultimate.ts': ultima_weapon_ultimate,'04-sb/ultimate/unending_coil_ultimate.ts': unending_coil_ultimate,'05-shb/alliance/the_copied_factory.ts': the_copied_factory,'05-shb/alliance/the_puppets_bunker.ts': the_puppets_bunker,'05-shb/alliance/the_tower_at_paradigms_breach.ts': the_tower_at_paradigms_breach,'05-shb/dungeon/akadaemia_anyder.ts': akadaemia_anyder,'05-shb/dungeon/amaurot.ts': amaurot,'05-shb/dungeon/anamnesis_anyder.ts': anamnesis_anyder,'05-shb/dungeon/dohn_mheg.ts': dohn_mheg,'05-shb/dungeon/heroes_gauntlet.ts': heroes_gauntlet,'05-shb/dungeon/holminster_switch.ts': holminster_switch,'05-shb/dungeon/malikahs_well.ts': malikahs_well,'05-shb/dungeon/matoyas_relict.ts': matoyas_relict,'05-shb/dungeon/mt_gulg.ts': mt_gulg,'05-shb/dungeon/paglthan.ts': paglthan,'05-shb/dungeon/qitana_ravel.ts': qitana_ravel,'05-shb/dungeon/the_grand_cosmos.ts': the_grand_cosmos,'05-shb/dungeon/twinning.ts': twinning,'05-shb/eureka/delubrum_reginae.ts': delubrum_reginae,'05-shb/eureka/delubrum_reginae_savage.ts': delubrum_reginae_savage,'05-shb/raid/e1n.ts': e1n,'05-shb/raid/e1s.ts': e1s,'05-shb/raid/e2n.ts': e2n,'05-shb/raid/e2s.ts': e2s,'05-shb/raid/e3n.ts': e3n,'05-shb/raid/e3s.ts': e3s,'05-shb/raid/e4n.ts': e4n,'05-shb/raid/e4s.ts': e4s,'05-shb/raid/e5n.ts': e5n,'05-shb/raid/e5s.ts': e5s,'05-shb/raid/e6n.ts': e6n,'05-shb/raid/e6s.ts': e6s,'05-shb/raid/e7n.ts': e7n,'05-shb/raid/e7s.ts': e7s,'05-shb/raid/e8n.ts': e8n,'05-shb/raid/e8s.ts': e8s,'05-shb/raid/e9n.ts': e9n,'05-shb/raid/e9s.ts': e9s,'05-shb/raid/e10n.ts': e10n,'05-shb/raid/e10s.ts': e10s,'05-shb/raid/e11n.ts': e11n,'05-shb/raid/e11s.ts': e11s,'05-shb/raid/e12n.ts': e12n,'05-shb/raid/e12s.ts': e12s,'05-shb/trial/diamond_weapon-ex.ts': diamond_weapon_ex,'05-shb/trial/diamond_weapon.ts': diamond_weapon,'05-shb/trial/emerald_weapon-ex.ts': emerald_weapon_ex,'05-shb/trial/emerald_weapon.ts': emerald_weapon,'05-shb/trial/hades-ex.ts': hades_ex,'05-shb/trial/hades.ts': hades,'05-shb/trial/innocence-ex.ts': innocence_ex,'05-shb/trial/innocence.ts': innocence,'05-shb/trial/levi-un.ts': levi_un,'05-shb/trial/ruby_weapon-ex.ts': ruby_weapon_ex,'05-shb/trial/ruby_weapon.ts': ruby_weapon,'05-shb/trial/shiva-un.ts': shiva_un,'05-shb/trial/titania.ts': titania,'05-shb/trial/titania-ex.ts': titania_ex,'05-shb/trial/titan-un.ts': titan_un,'05-shb/trial/varis-ex.ts': varis_ex,'05-shb/trial/wol.ts': wol,'05-shb/trial/wol-ex.ts': wol_ex,'05-shb/ultimate/the_epic_of_alexander.ts': the_epic_of_alexander,});

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL2dlbmVyYWwudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDAtbWlzYy90ZXN0LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC9pZnJpdC1ubS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4tbm0udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL2xldmktZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3NoaXZhLWhtLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC9zaGl2YS1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4taG0udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3RpdGFuLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2FsbGlhbmNlL3dlZXBpbmdfY2l0eS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMy1ody9kdW5nZW9uL2FldGhlcm9jaGVtaWNhbF9yZXNlYXJjaF9mYWNpbGl0eS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMy1ody9kdW5nZW9uL2ZyYWN0YWxfY29udGludXVtLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vZ3ViYWxfbGlicmFyeV9oYXJkLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vc29obV9hbF9oYXJkLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L3JhaWQvYTZuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L3JhaWQvYTEybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL2FsYV9taGlnby50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL2JhcmRhbXNfbWV0dGxlLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vZHJvd25lZF9jaXR5X29mX3NrYWxsYS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL2t1Z2FuZV9jYXN0bGUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi9zaXJlbnNvbmdfc2VhLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vc3RfbW9jaWFubmVfaGFyZC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi90aGVfYnVybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28ybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28ycy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28zbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28zcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL280cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL283cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL285bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xMG4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvcmFpZC9vMTFuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3JhaWQvbzEybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9yYWlkL28xMnMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvYnlha2tvLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3NoaW5yeXUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdHJpYWwvc3VzYW5vLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3N1emFrdS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi91bHRpbWF0ZS91bHRpbWFfd2VhcG9uX3VsdGltYXRlLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3VsdGltYXRlL3VuZW5kaW5nX2NvaWxfdWx0aW1hdGUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2FsbGlhbmNlL3RoZV9jb3BpZWRfZmFjdG9yeS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvYWxsaWFuY2UvdGhlX3B1cHBldHNfYnVua2VyLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9hbGxpYW5jZS90aGVfdG93ZXJfYXRfcGFyYWRpZ21zX2JyZWFjaC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9ha2FkYWVtaWFfYW55ZGVyLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2FtYXVyb3QudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vYW5hbW5lc2lzX2FueWRlci50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9kb2huX21oZWcudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vaGVyb2VzX2dhdW50bGV0LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2hvbG1pbnN0ZXJfc3dpdGNoLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL21hbGlrYWhzX3dlbGwudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vbWF0b3lhc19yZWxpY3QudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vbXRfZ3VsZy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9wYWdsdGhhbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9xaXRhbmFfcmF2ZWwudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vdGhlX2dyYW5kX2Nvc21vcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi90d2lubmluZy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlX3NhdmFnZS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTFzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uybi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMnMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTNuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uzcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNG4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTRzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U1bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTZuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U2cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lN24udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTdzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U4bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lOHMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTluLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U5cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTBuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMHMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTExbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTFzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMm4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEycy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24tZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2hhZGVzLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9oYWRlcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvaW5ub2NlbmNlLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2xldmktdW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvc2hpdmEtdW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3RpdGFuaWEudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3RpdGFuaWEtZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3RpdGFuLXVuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC92YXJpcy1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvd29sLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC93b2wtZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3VsdGltYXRlL3RoZV9lcGljX29mX2FsZXhhbmRlci50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS9vb3BzeV9tYW5pZmVzdC50eHQiXSwibmFtZXMiOlsidHJpZ2dlclNldCIsInpvbmVJZCIsIlpvbmVJZCIsInRyaWdnZXJzIiwiaWQiLCJ0eXBlIiwibmV0UmVnZXgiLCJOZXRSZWdleGVzIiwiZWZmZWN0SWQiLCJjb25kaXRpb24iLCJfZGF0YSIsIm1hdGNoZXMiLCJ0YXJnZXQiLCJzb3VyY2UiLCJtaXN0YWtlIiwiZGF0YSIsImxvc3RGb29kIiwiaW5Db21iYXQiLCJibGFtZSIsInRleHQiLCJlbiIsImRlIiwiZnIiLCJqYSIsImNuIiwia28iLCJydW4iLCJJc1BsYXllcklkIiwic291cmNlSWQiLCJsaW5lIiwibmV0UmVnZXhGciIsIm5ldFJlZ2V4SmEiLCJuZXRSZWdleENuIiwibmV0UmVnZXhLbyIsIm1lIiwic3RyaWtpbmdEdW1teUJ5TG9jYWxlIiwic3RyaWtpbmdEdW1teU5hbWVzIiwiT2JqZWN0IiwidmFsdWVzIiwiaW5jbHVkZXMiLCJib290Q291bnQiLCJhYmlsaXR5IiwiRGFtYWdlRnJvbU1hdGNoZXMiLCJlZmZlY3QiLCJzdXBwcmVzc1NlY29uZHMiLCJwb2tlQ291bnQiLCJkZWxheVNlY29uZHMiLCJkYW1hZ2VXYXJuIiwic2hhcmVXYXJuIiwiZGFtYWdlRmFpbCIsImdhaW5zRWZmZWN0V2FybiIsImdhaW5zRWZmZWN0RmFpbCIsImRlYXRoUmVhc29uIiwibmFtZSIsInNoYXJlRmFpbCIsInNlZW5EaWFtb25kRHVzdCIsInNvbG9XYXJuIiwicGFyc2VGbG9hdCIsImR1cmF0aW9uIiwiem9tYmllIiwic2hpZWxkIiwiaGFzSW1wIiwicGxheWVyRGFtYWdlRmllbGRzIiwiYXNzYXVsdCIsInB1c2giLCJhYmlsaXR5V2FybiIsImFyZ3MiLCJhYmlsaXR5SWQiLCJjb25zb2xlIiwiZXJyb3IiLCJKU09OIiwic3RyaW5naWZ5IiwidHJpZ2dlciIsImZsYWdzIiwic3Vic3RyIiwic29sb0ZhaWwiLCJjYXB0dXJlIiwibmV0UmVnZXhEZSIsInBoYXNlTnVtYmVyIiwiaW5pdGlhbGl6ZWQiLCJnYW1lQ291bnQiLCJ0YXJnZXRJZCIsImlzRGVjaXNpdmVCYXR0bGVFbGVtZW50IiwiaXNOZW9FeGRlYXRoIiwiaGFzQmV5b25kRGVhdGgiLCJkb3VibGVBdHRhY2tNYXRjaGVzIiwiYXJyIiwibGVuZ3RoIiwidnVsbiIsImtGbGFnSW5zdGFudERlYXRoIiwiaGFzRG9vbSIsInNsaWNlIiwiZmF1bHRMaW5lVGFyZ2V0IiwiaGFzT3JiIiwiY2xvdWRNYXJrZXJzIiwibm9PcmIiLCJzdHIiLCJoYXRlZCIsIndyb25nQnVmZiIsIm5vQnVmZiIsImhhc0FzdHJhbCIsImhhc1VtYnJhbCIsImZpcnN0SGVhZG1hcmtlciIsInBhcnNlSW50IiwiZ2V0SGVhZG1hcmtlcklkIiwiZGVjT2Zmc2V0IiwidG9TdHJpbmciLCJ0b1VwcGVyQ2FzZSIsInBhZFN0YXJ0IiwiZmlyc3RMYXNlck1hcmtlciIsImxhc3RMYXNlck1hcmtlciIsImxhc2VyTmFtZVRvTnVtIiwic2N1bHB0dXJlWVBvc2l0aW9ucyIsInkiLCJzY3VscHR1cmVUZXRoZXJOYW1lVG9JZCIsImJsYWRlT2ZGbGFtZUNvdW50IiwibnVtYmVyIiwibmFtZXMiLCJrZXlzIiwid2l0aE51bSIsImZpbHRlciIsIm93bmVycyIsIm1pbmltdW1ZYWxtc0ZvclN0YXR1ZXMiLCJpc1N0YXR1ZVBvc2l0aW9uS25vd24iLCJpc1N0YXR1ZU5vcnRoIiwic2N1bHB0dXJlSWRzIiwib3RoZXJJZCIsInNvdXJjZVkiLCJvdGhlclkiLCJ1bmRlZmluZWQiLCJVbnJlYWNoYWJsZUNvZGUiLCJ5RGlmZiIsIk1hdGgiLCJhYnMiLCJvd25lciIsIm93bmVyTmljayIsIlNob3J0TmFtZSIsInBpbGxhcklkVG9Pd25lciIsInBpbGxhck93bmVyIiwiZmlyZSIsInNtYWxsTGlvbklkVG9Pd25lciIsInNtYWxsTGlvbk93bmVycyIsImhhc1NtYWxsTGlvbiIsImhhc0ZpcmVEZWJ1ZmYiLCJjZW50ZXJZIiwieCIsImRpck9iaiIsIk91dHB1dHMiLCJub3J0aEJpZ0xpb24iLCJzaW5nbGVUYXJnZXQiLCJzb3V0aEJpZ0xpb24iLCJzaGFyZWQiLCJmaXJlRGVidWZmIiwibGFiZWxzIiwibGFuZyIsIm9wdGlvbnMiLCJQYXJzZXJMYW5ndWFnZSIsImpvaW4iLCJoYXNEYXJrIiwiamFnZFRldGhlciIsInBhcnR5IiwiaXNUYW5rIiwiaGFzVGhyb3R0bGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQVFBO0FBQ0EsTUFBTUEsVUFBaUMsR0FBRztBQUN4Q0MsUUFBTSxFQUFFQyx3Q0FEZ0M7QUFFeENDLFVBQVEsRUFBRSxDQUNSO0FBQ0U7QUFDQUMsTUFBRSxFQUFFO0FBRk4sR0FEUSxFQUtSO0FBQ0VBLE1BQUUsRUFBRSxtQkFETjtBQUVFQyxRQUFJLEVBQUUsYUFGUjtBQUdFO0FBQ0FDLFlBQVEsRUFBRUMsaURBQUEsQ0FBdUI7QUFBRUMsY0FBUSxFQUFFO0FBQVosS0FBdkIsQ0FKWjtBQUtFQyxhQUFTLEVBQUUsQ0FBQ0MsS0FBRCxFQUFRQyxPQUFSLEtBQW9CO0FBQzdCO0FBQ0EsYUFBT0EsT0FBTyxDQUFDQyxNQUFSLEtBQW1CRCxPQUFPLENBQUNFLE1BQWxDO0FBQ0QsS0FSSDtBQVNFQyxXQUFPLEVBQUUsQ0FBQ0MsSUFBRCxFQUFPSixPQUFQLEtBQW1CO0FBQUE7O0FBQzFCLHdCQUFBSSxJQUFJLENBQUNDLFFBQUwsMkRBQUFELElBQUksQ0FBQ0MsUUFBTCxHQUFrQixFQUFsQixDQUQwQixDQUUxQjtBQUNBOztBQUNBLFVBQUksQ0FBQ0QsSUFBSSxDQUFDRSxRQUFOLElBQWtCRixJQUFJLENBQUNDLFFBQUwsQ0FBY0wsT0FBTyxDQUFDQyxNQUF0QixDQUF0QixFQUNFO0FBQ0ZHLFVBQUksQ0FBQ0MsUUFBTCxDQUFjTCxPQUFPLENBQUNDLE1BQXRCLElBQWdDLElBQWhDO0FBQ0EsYUFBTztBQUNMUCxZQUFJLEVBQUUsTUFERDtBQUVMYSxhQUFL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TSxzQ0FBc0MsZ0JBQU0sNkNBQTZDLHVCQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHVCQUF1QixHQUFNLHdCQUF3QixJQUFNLHdCQUF3QixJQUFNLHdCQUF3QixJQUFNLHdCQUF3QixJQUFNLHdCQUF3QixJQUFNLHdCQUF3QixJQUFNLHNDQUFzQyxpQkFBTSxtQ0FBbUMsY0FBTSxzQ0FBc0MsaUJBQU0sbUNBQW1DLGNBQU0sNkJBQTZCLFFBQU0sMEJBQTBCLEtBQU0saUNBQWlDLFlBQU0sOEJBQThCLFNBQU0sNEJBQTRCLE9BQU0sbUNBQW1DLGNBQU0sZ0NBQWdDLFdBQU0sNkJBQTZCLFFBQU0sNEJBQTRCLE9BQU0sK0JBQStCLFVBQU8sNkJBQTZCLFFBQU8sNkJBQTZCLFFBQU8sd0JBQXdCLEdBQU8sMkJBQTJCLE1BQU8sNkNBQTZDLHFCQUFPLEVBQUUsRSIsImZpbGUiOiJ1aS9jb21tb24vb29wc3lyYWlkc3lfZGF0YS5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBsb3N0Rm9vZD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuLy8gR2VuZXJhbCBtaXN0YWtlczsgdGhlc2UgYXBwbHkgZXZlcnl3aGVyZS5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hdGNoQWxsLFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRyaWdnZXIgaWQgZm9yIGludGVybmFsbHkgZ2VuZXJhdGVkIGVhcmx5IHB1bGwgd2FybmluZy5cclxuICAgICAgaWQ6ICdHZW5lcmFsIEVhcmx5IFB1bGwnLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIEZvb2QgQnVmZicsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIC8vIFdlbGwgRmVkXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0OCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gUHJldmVudCBcIkVvcyBsb3NlcyB0aGUgZWZmZWN0IG9mIFdlbGwgRmVkIGZyb20gQ3JpdGxvIE1jZ2VlXCJcclxuICAgICAgICByZXR1cm4gbWF0Y2hlcy50YXJnZXQgPT09IG1hdGNoZXMuc291cmNlO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEubG9zdEZvb2QgPz89IHt9O1xyXG4gICAgICAgIC8vIFdlbGwgRmVkIGJ1ZmYgaGFwcGVucyByZXBlYXRlZGx5IHdoZW4gaXQgZmFsbHMgb2ZmIChXSFkpLFxyXG4gICAgICAgIC8vIHNvIHN1cHByZXNzIG11bHRpcGxlIG9jY3VycmVuY2VzLlxyXG4gICAgICAgIGlmICghZGF0YS5pbkNvbWJhdCB8fCBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdsb3N0IGZvb2QgYnVmZicsXHJcbiAgICAgICAgICAgIGRlOiAnTmFocnVuZ3NidWZmIHZlcmxvcmVuJyxcclxuICAgICAgICAgICAgZnI6ICdCdWZmIG5vdXJyaXR1cmUgdGVybWluw6llJyxcclxuICAgICAgICAgICAgamE6ICfpo6/lirnmnpzjgYzlpLHjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WkseWOu+mjn+eJqUJVRkYnLFxyXG4gICAgICAgICAgICBrbzogJ+ydjOyLnSDrsoTtlIQg7ZW07KCcJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR2VuZXJhbCBXZWxsIEZlZCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0OCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEubG9zdEZvb2QpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZGVsZXRlIGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIFJhYmJpdCBNZWRpdW0nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzhFMCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuSXNQbGF5ZXJJZChtYXRjaGVzLnNvdXJjZUlkKSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnNvdXJjZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdidW5ueScsXHJcbiAgICAgICAgICAgIGRlOiAnSGFzZScsXHJcbiAgICAgICAgICAgIGZyOiAnbGFwaW4nLFxyXG4gICAgICAgICAgICBqYTogJ+OBhuOBleOBjicsXHJcbiAgICAgICAgICAgIGNuOiAn5YWU5a2QJyxcclxuICAgICAgICAgICAga286ICfthqDrgbwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgYm9vdENvdW50PzogbnVtYmVyO1xyXG4gIHBva2VDb3VudD86IG51bWJlcjtcclxufVxyXG5cclxuLy8gVGVzdCBtaXN0YWtlIHRyaWdnZXJzLlxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuTWlkZGxlTGFOb3NjZWEsXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IEJvdycsXHJcbiAgICAgIHR5cGU6ICdHYW1lTG9nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IGJvdyBjb3VydGVvdXNseSB0byB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdm91cyBpbmNsaW5leiBkZXZhbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOBq+OBiui+nuWEgOOBl+OBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirmga3mlazlnLDlr7nmnKjkurrooYznpLwuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7JeQ6rKMIOqzteyGkO2VmOqyjCDsnbjsgqztlanri4jri6QuKj8nIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAncHVsbCcsXHJcbiAgICAgICAgICBibGFtZTogZGF0YS5tZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb3cnLFxyXG4gICAgICAgICAgICBkZTogJ0JvZ2VuJyxcclxuICAgICAgICAgICAgZnI6ICdTYWx1ZXInLFxyXG4gICAgICAgICAgICBqYTogJ+OBiui+nuWEgCcsXHJcbiAgICAgICAgICAgIGNuOiAn6Z6g6LqsJyxcclxuICAgICAgICAgICAga286ICfsnbjsgqwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IFdpcGUnLFxyXG4gICAgICB0eXBlOiAnR2FtZUxvZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBiaWQgZmFyZXdlbGwgdG8gdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIGZhaXRlcyB2b3MgYWRpZXV4IGF1IG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgavliKXjgozjga7mjKjmi7bjgpLjgZfjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q5ZCR5pyo5Lq65ZGK5YirLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleyXkOqyjCDsnpHrs4Qg7J247IKs66W8IO2VqeuLiOuLpC4qPycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3aXBlJyxcclxuICAgICAgICAgIGJsYW1lOiBkYXRhLm1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1BhcnR5IFdpcGUnLFxyXG4gICAgICAgICAgICBkZTogJ0dydXBwZW53aXBlJyxcclxuICAgICAgICAgICAgZnI6ICdQYXJ0eSBXaXBlJyxcclxuICAgICAgICAgICAgamE6ICfjg6/jgqTjg5cnLFxyXG4gICAgICAgICAgICBjbjogJ+WboueBrScsXHJcbiAgICAgICAgICAgIGtvOiAn7YyM7YuwIOyghOupuCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgQm9vdHNoaW5lJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMzUnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKG1hdGNoZXMuc291cmNlICE9PSBkYXRhLm1lKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHN0cmlraW5nRHVtbXlCeUxvY2FsZSA9IHtcclxuICAgICAgICAgIGVuOiAnU3RyaWtpbmcgRHVtbXknLFxyXG4gICAgICAgICAgZGU6ICdUcmFpbmluZ3NwdXBwZScsXHJcbiAgICAgICAgICBmcjogJ01hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudCcsXHJcbiAgICAgICAgICBqYTogJ+acqOS6uicsXHJcbiAgICAgICAgICBjbjogJ+acqOS6uicsXHJcbiAgICAgICAgICBrbzogJ+uCmOustOyduO2YlScsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzdHJpa2luZ0R1bW15TmFtZXMgPSBPYmplY3QudmFsdWVzKHN0cmlraW5nRHVtbXlCeUxvY2FsZSk7XHJcbiAgICAgICAgcmV0dXJuIHN0cmlraW5nRHVtbXlOYW1lcy5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5ib290Q291bnQgPz89IDA7XHJcbiAgICAgICAgZGF0YS5ib290Q291bnQrKztcclxuICAgICAgICBjb25zdCB0ZXh0ID0gYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtkYXRhLmJvb3RDb3VudH0pOiAke2RhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcyl9YDtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiB0ZXh0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgTGVhZGVuIEZpc3QnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNzQ1JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5zb3VyY2UgPT09IGRhdGEubWUsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2dvb2QnLCBibGFtZTogZGF0YS5tZSwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBPb3BzJyxcclxuICAgICAgdHlwZTogJ0dhbWVMb2cnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJy4qb29wcy4qJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxMCxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmxpbmUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBQb2tlIENvbGxlY3QnLFxyXG4gICAgICB0eXBlOiAnR2FtZUxvZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBwb2tlIHRoZSBzdHJpa2luZyBkdW1teS4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnVm91cyB0b3VjaGV6IGzDqWfDqHJlbWVudCBsZSBtYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQgZHUgZG9pZ3QuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q44Gv5pyo5Lq644KS44Gk44Gk44GE44GfLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKueUqOaJi+aMh+aIs+WQkeacqOS6ui4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirrgpjrrLTsnbjtmJXsnYQg7L+h7L+hIOywjOumheuLiOuLpC4qPycgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnBva2VDb3VudCA9IChkYXRhLnBva2VDb3VudCA/PyAwKSArIDE7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgUG9rZScsXHJcbiAgICAgIHR5cGU6ICdHYW1lTG9nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IHBva2UgdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIHRvdWNoZXogbMOpZ8OocmVtZW50IGxlIG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudCBkdSBkb2lndC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgpLjgaTjgaTjgYTjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q55So5omL5oyH5oiz5ZCR5pyo5Lq6Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleydhCDsv6Hsv6Eg7LCM66aF64uI64ukLio/JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIDEgcG9rZSBhdCBhIHRpbWUgaXMgZmluZSwgYnV0IG1vcmUgdGhhbiBvbmUgaW4gNSBzZWNvbmRzIGlzIChPQlZJT1VTTFkpIGEgbWlzdGFrZS5cclxuICAgICAgICBpZiAoIWRhdGEucG9rZUNvdW50IHx8IGRhdGEucG9rZUNvdW50IDw9IDEpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBkYXRhLm1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYFRvbyBtYW55IHBva2VzICgke2RhdGEucG9rZUNvdW50fSlgLFxyXG4gICAgICAgICAgICBkZTogYFp1IHZpZWxlIFBpZWtzZXIgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGZyOiBgVHJvcCBkZSB0b3VjaGVzICgke2RhdGEucG9rZUNvdW50fSlgLFxyXG4gICAgICAgICAgICBqYTogYOOBhOOBo+OBseOBhOOBpOOBpOOBhOOBnyAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAgY246IGDmiLPlpKrlpJrkuIvllaYgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGtvOiBg64SI66y0IOunjuydtCDssIzrpoQgKCR7ZGF0YS5wb2tlQ291bnR967KIKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IGRlbGV0ZSBkYXRhLnBva2VDb3VudCxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIElmcml0IFN0b3J5IE1vZGVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUJvd2xPZkVtYmVycyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSWZyaXRObSBSYWRpYW50IFBsdW1lJzogJzJERScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdJZnJpdE5tIEluY2luZXJhdGUnOiAnMUM1JyxcclxuICAgICdJZnJpdE5tIEVydXB0aW9uJzogJzJERCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRpdGFuIFN0b3J5IE1vZGVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbk5tIFdlaWdodCBPZiBUaGUgTGFuZCc6ICczQ0QnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuTm0gTGFuZHNsaWRlJzogJzI4QScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhbk5tIFJvY2sgQnVzdGVyJzogJzI4MScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSXQncyBoYXJkIHRvIGNhcHR1cmUgdGhlIHJlZmxlY3Rpb24gYWJpbGl0aWVzIGZyb20gTGV2aWF0aGFuJ3MgSGVhZCBhbmQgVGFpbCBpZiB5b3UgdXNlXHJcbi8vIHJhbmdlZCBwaHlzaWNhbCBhdHRhY2tzIC8gbWFnaWMgYXR0YWNrcyByZXNwZWN0aXZlbHksIGFzIHRoZSBhYmlsaXR5IG5hbWVzIGFyZSB0aGVcclxuLy8gYWJpbGl0eSB5b3UgdXNlZCBhbmQgZG9uJ3QgYXBwZWFyIHRvIHNob3cgdXAgaW4gdGhlIGxvZyBhcyBub3JtYWwgXCJhYmlsaXR5XCIgbGluZXMuXHJcbi8vIFRoYXQgc2FpZCwgZG90cyBzdGlsbCB0aWNrIGluZGVwZW5kZW50bHkgb24gYm90aCBzbyBpdCdzIGxpa2VseSB0aGF0IHBlb3BsZSB3aWxsIGF0YWNrXHJcbi8vIHRoZW0gYW55d2F5LlxyXG5cclxuLy8gVE9ETzogRmlndXJlIG91dCB3aHkgRHJlYWQgVGlkZSAvIFdhdGVyc3BvdXQgYXBwZWFyIGxpa2Ugc2hhcmVzIChpLmUuIDB4MTYgaWQpLlxyXG4vLyBEcmVhZCBUaWRlID0gODIzLzgyNC84MjUsIFdhdGVyc3BvdXQgPSA4MjlcclxuXHJcbi8vIExldmlhdGhhbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXaG9ybGVhdGVyRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTGV2aUV4IEdyYW5kIEZhbGwnOiAnODJGJywgLy8gdmVyeSBsYXJnZSBjaXJjdWxhciBhb2UgYmVmb3JlIHNwaW5ueSBkaXZlcywgYXBwbGllcyBoZWF2eVxyXG4gICAgJ0xldmlFeCBIeWRybyBTaG90JzogJzc0OCcsIC8vIFdhdmVzcGluZSBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIERyb3BzeSBlZmZlY3RcclxuICAgICdMZXZpRXggRHJlYWRzdG9ybSc6ICc3NDknLCAvLyBXYXZldG9vdGggU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBIeXN0ZXJpYSBlZmZlY3RcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdMZXZpRXggQm9keSBTbGFtJzogJzgyQScsIC8vIGxldmkgc2xhbSB0aGF0IHRpbHRzIHRoZSBib2F0XHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMSc6ICc4OEEnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMic6ICc4OEInLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMyc6ICc4MkMnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdMZXZpRXggRHJvcHN5JzogJzExMCcsIC8vIHN0YW5kaW5nIGluIHRoZSBoeWRybyBzaG90IGZyb20gdGhlIFdhdmVzcGluZSBTYWhhZ2luXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdMZXZpRXggSHlzdGVyaWEnOiAnMTI4JywgLy8gc3RhbmRpbmcgaW4gdGhlIGRyZWFkc3Rvcm0gZnJvbSB0aGUgV2F2ZXRvb3RoIFNhaGFnaW5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTGV2aUV4IEJvZHkgU2xhbSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnODJBJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgc2VlbkRpYW1vbmREdXN0PzogYm9vbGVhbjtcclxufVxyXG5cclxuLy8gU2hpdmEgSGFyZFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZUhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUhtIEljaWNsZSBJbXBhY3QnOiAnOTkzJyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFIbSBHbGFjaWVyIEJhc2gnOiAnOUExJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gS25vY2tiYWNrIHRhbmsgY2xlYXZlLlxyXG4gICAgJ1NoaXZhSG0gSGVhdmVubHkgU3RyaWtlJzogJzlBMCcsXHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUhtIEhhaWxzdG9ybSc6ICc5OTgnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBUYW5rYnVzdGVyLiAgVGhpcyBpcyBTaGl2YSBIYXJkIG1vZGUsIG5vdCBTaGl2YSBFeHRyZW1lLiAgUGxlYXNlIVxyXG4gICAgJ1NoaXZhSG0gSWNlYnJhbmQnOiAnOTk2JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFIbSBEaWFtb25kIER1c3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzk4QScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnNlZW5EaWFtb25kRHVzdCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhSG0gRGVlcCBGcmVlemUnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBTaGl2YSBhbHNvIHVzZXMgYWJpbGl0eSA5QTMgb24geW91LCBidXQgaXQgaGFzIHRoZSB1bnRyYW5zbGF0ZWQgbmFtZVxyXG4gICAgICAvLyDpgI/mmI7vvJrjgrfjg7TjgqHvvJrlh43ntZDjg6zjgq/jg4jvvJrjg47jg4Pjgq/jg5Djg4Pjgq/nlKguIFNvLCB1c2UgdGhlIGVmZmVjdCBpbnN0ZWFkIGZvciBmcmVlIHRyYW5zbGF0aW9uLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUU3JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBzbyBvbmx5IGEgbWlzdGFrZSBhZnRlciB0aGF0LlxyXG4gICAgICAgIC8vIFVubGlrZSBleHRyZW1lLCB0aGlzIGhhcyB0aGUgc2FtZSAyMCBzZWNvbmQgZHVyYXRpb24gYXMgdGhlIGludGVybWlzc2lvbi5cclxuICAgICAgICByZXR1cm4gZGF0YS5zZWVuRGlhbW9uZER1c3Q7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTaGl2YSBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVBa2hBZmFoQW1waGl0aGVhdHJlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBMYXJnZSB3aGl0ZSBjaXJjbGVzLlxyXG4gICAgJ1NoaXZhRXggSWNpY2xlIEltcGFjdCc6ICdCRUInLFxyXG4gICAgLy8gXCJnZXQgaW5cIiBhb2VcclxuICAgICdTaGl2YUV4IFdoaXRlb3V0JzogJ0JFQycsXHJcbiAgICAvLyBBdm9pZGFibGUgdGFuayBzdHVuLlxyXG4gICAgJ1NoaXZhRXggR2xhY2llciBCYXNoJzogJ0JFOScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyAyNzAgZGVncmVlIGF0dGFjay5cclxuICAgICdTaGl2YUV4IEdsYXNzIERhbmNlJzogJ0JERicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEhhaWxzdG9ybSBzcHJlYWQgbWFya2VyLlxyXG4gICAgJ1NoaXZhRXggSGFpbHN0b3JtJzogJ0JFMicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgIC8vIExhc2VyLiAgVE9ETzogbWF5YmUgYmxhbWUgdGhlIHBlcnNvbiBpdCdzIG9uPz9cclxuICAgICdTaGl2YUV4IEF2YWxhbmNoZSc6ICdCRTAnLFxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFBhcnR5IHNoYXJlZCB0YW5rYnVzdGVyXHJcbiAgICAnU2hpdmFFeCBJY2VicmFuZCc6ICdCRTEnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGl2YUV4IERlZXAgRnJlZXplJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gU2hpdmEgYWxzbyB1c2VzIGFiaWxpdHkgQzhBIG9uIHlvdSwgYnV0IGl0IGhhcyB0aGUgdW50cmFuc2xhdGVkIG5hbWVcclxuICAgICAgLy8g6YCP5piO77ya44K344O044Kh77ya5YeN57WQ44Os44Kv44OI77ya44OO44OD44Kv44OQ44OD44Kv55SoL+ODkuODreOCpOODg+OCry4gU28sIHVzZSB0aGUgZWZmZWN0IGluc3RlYWQgZm9yIGZyZWUgdHJhbnNsYXRpb24uXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxRTcnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBidXQgZm9yIGEgc2hvcnRlciBkdXJhdGlvbi5cclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSA+IDIwO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRpdGFuIEhhcmRcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsSGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5IbSBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNTUzJyxcclxuICAgICdUaXRhbkhtIEJ1cnN0JzogJzQxQycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5IbSBMYW5kc2xpZGUnOiAnNTU0JyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuSG0gUm9jayBCdXN0ZXInOiAnNTUwJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuSG0gTW91bnRhaW4gQnVzdGVyJzogJzI4MycsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRpdGFuIEV4dHJlbWVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5FeCBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNUJFJyxcclxuICAgICdUaXRhbkV4IEJ1cnN0JzogJzVCRicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5FeCBMYW5kc2xpZGUnOiAnNUJCJyxcclxuICAgICdUaXRhbkV4IEdhb2xlciBMYW5kc2xpZGUnOiAnNUMzJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuRXggUm9jayBCdXN0ZXInOiAnNUI3JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuRXggTW91bnRhaW4gQnVzdGVyJzogJzVCOCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIHpvbWJpZT86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBzaGllbGQ/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXZWVwaW5nQ2l0eU9mTWhhY2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgQ3JpdGljYWwgQml0ZSc6ICcxODQ4JywgLy8gU2Fyc3VjaHVzIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSZWFsbSBTaGFrZXInOiAnMTgzRScsIC8vIEZpcnN0IERhdWdodGVyIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIFNpbGtzY3JlZW4nOiAnMTgzQycsIC8vIEZpcnN0IERhdWdodGVyIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBTaWxrZW4gU3ByYXknOiAnMTgyNCcsIC8vIEFyYWNobmUgRXZlIHJlYXIgY29uYWwgYW9lXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAxJzogJzE4MzcnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAxXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAyJzogJzE4MzYnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAyXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAzJzogJzE4MzUnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAzXHJcbiAgICAnV2VlcGluZyBTcGlkZXIgVGhyZWFkJzogJzE4MzknLCAvLyBBcmFjaG5lIEV2ZSBzcGlkZXIgbGluZSBhb2VcclxuICAgICdXZWVwaW5nIEZpcmUgSUknOiAnMTg0RScsIC8vIEJsYWNrIE1hZ2UgQ29ycHNlIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIE5lY3JvcHVyZ2UnOiAnMTdENycsIC8vIEZvcmdhbGwgU2hyaXZlbGVkIFRhbG9uIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSb3R0ZW4gQnJlYXRoJzogJzE3RDAnLCAvLyBGb3JnYWxsIERhaGFrIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBNb3cnOiAnMTdEMicsIC8vIEZvcmdhbGwgSGFhZ2VudGkgdW5tYXJrZWQgY2xlYXZlXHJcbiAgICAnV2VlcGluZyBEYXJrIEVydXB0aW9uJzogJzE3QzMnLCAvLyBGb3JnYWxsIHB1ZGRsZSBtYXJrZXJcclxuICAgIC8vIDE4MDYgaXMgYWxzbyBGbGFyZSBTdGFyLCBidXQgaWYgeW91IGdldCBieSAxODA1IHlvdSBhbHNvIGdldCBoaXQgYnkgMTgwNj9cclxuICAgICdXZWVwaW5nIEZsYXJlIFN0YXInOiAnMTgwNScsIC8vIE96bWEgY3ViZSBwaGFzZSBkb251dFxyXG4gICAgJ1dlZXBpbmcgRXhlY3JhdGlvbic6ICcxODI5JywgLy8gT3ptYSB0cmlhbmdsZSBsYXNlclxyXG4gICAgJ1dlZXBpbmcgSGFpcmN1dCAxJzogJzE4MEInLCAvLyBDYWxvZmlzdGVyaSAxODAgY2xlYXZlIDFcclxuICAgICdXZWVwaW5nIEhhaXJjdXQgMic6ICcxODBGJywgLy8gQ2Fsb2Zpc3RlcmkgMTgwIGNsZWF2ZSAyXHJcbiAgICAnV2VlcGluZyBFbnRhbmdsZW1lbnQnOiAnMTgxRCcsIC8vIENhbG9maXN0ZXJpIGxhbmRtaW5lIHB1ZGRsZSBwcm9jXHJcbiAgICAnV2VlcGluZyBFdmlsIEN1cmwnOiAnMTgxNicsIC8vIENhbG9maXN0ZXJpIGF4ZVxyXG4gICAgJ1dlZXBpbmcgRXZpbCBUcmVzcyc6ICcxODE3JywgLy8gQ2Fsb2Zpc3RlcmkgYnVsYlxyXG4gICAgJ1dlZXBpbmcgRGVwdGggQ2hhcmdlJzogJzE4MjAnLCAvLyBDYWxvZmlzdGVyaSBjaGFyZ2UgdG8gZWRnZVxyXG4gICAgJ1dlZXBpbmcgRmVpbnQgUGFydGljbGUgQmVhbSc6ICcxOTI4JywgLy8gQ2Fsb2Zpc3Rlcmkgc2t5IGxhc2VyXHJcbiAgICAnV2VlcGluZyBFdmlsIFN3aXRjaCc6ICcxODE1JywgLy8gQ2Fsb2Zpc3RlcmkgbGFzZXJzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdXZWVwaW5nIEh5c3RlcmlhJzogJzEyOCcsIC8vIEFyYWNobmUgRXZlIEZyb25kIEFmZmVhcmRcclxuICAgICdXZWVwaW5nIFpvbWJpZmljYXRpb24nOiAnMTczJywgLy8gRm9yZ2FsbCB0b28gbWFueSB6b21iaWUgcHVkZGxlc1xyXG4gICAgJ1dlZXBpbmcgVG9hZCc6ICcxQjcnLCAvLyBGb3JnYWxsIEJyYW5kIG9mIHRoZSBGYWxsZW4gZmFpbHVyZVxyXG4gICAgJ1dlZXBpbmcgRG9vbSc6ICczOEUnLCAvLyBGb3JnYWxsIEhhYWdlbnRpIE1vcnRhbCBSYXlcclxuICAgICdXZWVwaW5nIEFzc2ltaWxhdGlvbic6ICc0MkMnLCAvLyBPem1hc2hhZGUgQXNzaW1pbGF0aW9uIGxvb2stYXdheVxyXG4gICAgJ1dlZXBpbmcgU3R1bic6ICc5NScsIC8vIENhbG9maXN0ZXJpIFBlbmV0cmF0aW9uIGxvb2stYXdheVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnV2VlcGluZyBBcmFjaG5lIFdlYic6ICcxODVFJywgLy8gQXJhY2huZSBFdmUgaGVhZG1hcmtlciB3ZWIgYW9lXHJcbiAgICAnV2VlcGluZyBFYXJ0aCBBZXRoZXInOiAnMTg0MScsIC8vIEFyYWNobmUgRXZlIG9yYnNcclxuICAgICdXZWVwaW5nIEVwaWdyYXBoJzogJzE4NTInLCAvLyBIZWFkc3RvbmUgdW50ZWxlZ3JhcGhlZCBsYXNlciBsaW5lIHRhbmsgYXR0YWNrXHJcbiAgICAvLyBUaGlzIGlzIHRvbyBub2lzeS4gIEJldHRlciB0byBwb3AgdGhlIGJhbGxvb25zIHRoYW4gd29ycnkgYWJvdXQgZnJpZW5kcy5cclxuICAgIC8vICdXZWVwaW5nIEV4cGxvc2lvbic6ICcxODA3JywgLy8gT3ptYXNwaGVyZSBDdWJlIG9yYiBleHBsb3Npb25cclxuICAgICdXZWVwaW5nIFNwbGl0IEVuZCAxJzogJzE4MEMnLCAvLyBDYWxvZmlzdGVyaSB0YW5rIGNsZWF2ZSAxXHJcbiAgICAnV2VlcGluZyBTcGxpdCBFbmQgMic6ICcxODEwJywgLy8gQ2Fsb2Zpc3RlcmkgdGFuayBjbGVhdmUgMlxyXG4gICAgJ1dlZXBpbmcgQmxvb2RpZWQgTmFpbCc6ICcxODFGJywgLy8gQ2Fsb2Zpc3RlcmkgYXhlL2J1bGIgYXBwZWFyaW5nXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBHcmFkdWFsIFpvbWJpZmljYXRpb24gR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0MTUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuem9tYmllW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBHcmFkdWFsIFpvbWJpZmljYXRpb24gTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0MTUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPSBkYXRhLnpvbWJpZSB8fCB7fTtcclxuICAgICAgICBkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIE1lZ2EgRGVhdGgnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzE3Q0EnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLnpvbWJpZSAmJiAhZGF0YS56b21iaWVbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgSGVhZHN0b25lIFNoaWVsZCBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzE1RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNoaWVsZCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBIZWFkc3RvbmUgU2hpZWxkIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnMTVFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc2hpZWxkID0gZGF0YS5zaGllbGQgfHwge307XHJcbiAgICAgICAgZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRmxhcmluZyBFcGlncmFwaCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMTg1NicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuc2hpZWxkICYmICFkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBuYW1lIGlzIGhlbHBmdWxseSBjYWxsZWQgXCJBdHRhY2tcIiBzbyBuYW1lIGl0IHNvbWV0aGluZyBlbHNlLlxyXG4gICAgICBpZDogJ1dlZXBpbmcgT3ptYSBUYW5rIExhc2VyJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgdHlwZTogJzIyJywgaWQ6ICcxODMxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdUYW5rIExhc2VyJyxcclxuICAgICAgICAgICAgZGU6ICdUYW5rIExhc2VyJyxcclxuICAgICAgICAgICAgZnI6ICdUYW5rIExhc2VyJyxcclxuICAgICAgICAgICAgamE6ICfjgr/jg7Pjgq/jg6zjgrbjg7wnLFxyXG4gICAgICAgICAgICBjbjogJ+WdpuWFi+a/gOWFiScsXHJcbiAgICAgICAgICAgIGtvOiAn7YOx7LukIOugiOydtOyggCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgT3ptYSBIb2x5JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxODJFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdTbGlkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ2lzdCBydW50ZXJnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDvvIEnLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwseuQqCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBBZXRoZXJvY2hlbWljYWwgUmVzZWFyY2ggRmFjaWxpdHlcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFldGhlcm9jaGVtaWNhbFJlc2VhcmNoRmFjaWxpdHksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FSRiBHcmFuZCBTd29yZCc6ICcyMTYnLCAvLyBDb25hbCBBb0UsIFNjcmFtYmxlZCBJcm9uIEdpYW50IHRyYXNoXHJcbiAgICAnQVJGIENlcm1ldCBEcmlsbCc6ICcyMEUnLCAvLyBMaW5lIEFvRSwgNnRoIExlZ2lvbiBNYWdpdGVrIFZhbmd1YXJkIHRyYXNoXHJcbiAgICAnQVJGIE1hZ2l0ZWsgU2x1Zyc6ICcxMERCJywgLy8gTGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICcxMEUyJywgLy8gTGFyZ2UgdGFyZ2V0ZWQgY2lyY2xlIEFvRSwgTWFnaXRlayBUdXJyZXQgSUksIGJvc3MgMVxyXG4gICAgJ0FSRiBNYWdpdGVrIFNwcmVhZCc6ICcxMERDJywgLy8gMjcwLWRlZ3JlZSByb29td2lkZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBFZXJpZSBTb3VuZHdhdmUnOiAnMTE3MCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEN1bHR1cmVkIEVtcHVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBUYWlsIFNsYXAnOiAnMTI1RicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgRGFuY2VyIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIENhbGNpZnlpbmcgTWlzdCc6ICcxMjNBJywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBOYWdhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFB1bmN0dXJlJzogJzExNzEnLCAvLyBTaG9ydCBsaW5lIEFvRSwgQ3VsdHVyZWQgRW1wdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFNpZGVzd2lwZSc6ICcxMUE3JywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBSZXB0b2lkIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIEd1c3QnOiAnMzk1JywgLy8gVGFyZ2V0ZWQgc21hbGwgY2lyY2xlIEFvRSwgQ3VsdHVyZWQgTWlycm9ya25pZ2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIE1hcnJvdyBEcmFpbic6ICdEMEUnLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIENoaW1lcmEgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgUmlkZGxlIE9mIFRoZSBTcGhpbngnOiAnMTBFNCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIGJvc3MgMlxyXG4gICAgJ0FSRiBLYSc6ICcxMDZFJywgLy8gQ29uYWwgQW9FLCBib3NzIDJcclxuICAgICdBUkYgUm90b3N3aXBlJzogJzExQ0MnLCAvLyBDb25hbCBBb0UsIEZhY2lsaXR5IERyZWFkbm91Z2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEF1dG8tY2Fubm9ucyc6ICcxMkQ5JywgLy8gTGluZSBBb0UsIE1vbml0b3JpbmcgRHJvbmUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBUkYgRGVhdGhcXCdzIERvb3InOiAnNEVDJywgLy8gTGluZSBBb0UsIEN1bHR1cmVkIFNoYWJ0aSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBTcGVsbHN3b3JkJzogJzRFQicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgU2hhYnRpIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEVuZCBPZiBEYXlzJzogJzEwRkQnLCAvLyBMaW5lIEFvRSwgYm9zcyAzXHJcbiAgICAnQVJGIEJsaXp6YXJkIEJ1cnN0JzogJzEwRkUnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgSWdleW9yaG0sIGJvc3MgM1xyXG4gICAgJ0FSRiBGaXJlIEJ1cnN0JzogJzEwRkYnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgTGFoYWJyZWEsIGJvc3MgM1xyXG4gICAgJ0FSRiBTZWEgT2YgUGl0Y2gnOiAnMTJERScsIC8vIFRhcmdldGVkIHBlcnNpc3RlbnQgY2lyY2xlIEFvRXMsIGJvc3MgM1xyXG4gICAgJ0FSRiBEYXJrIEJsaXp6YXJkIElJJzogJzEwRjMnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIElnZXlvcmhtLCBib3NzIDNcclxuICAgICdBUkYgRGFyayBGaXJlIElJJzogJzEwRjgnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIExhaGFicmVhLCBib3NzIDNcclxuICAgICdBUkYgQW5jaWVudCBFcnVwdGlvbic6ICcxMTA0JywgLy8gU2VsZi10YXJnZXRlZCBjaXJjbGUgQW9FLCBib3NzIDRcclxuICAgICdBUkYgRW50cm9waWMgRmxhbWUnOiAnMTEwOCcsIC8vIExpbmUgQW9FcywgIGJvc3MgNFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQVJGIENodGhvbmljIEh1c2gnOiAnMTBFNycsIC8vIEluc3RhbnQgdGFuayBjbGVhdmUsIGJvc3MgMlxyXG4gICAgJ0FSRiBIZWlnaHQgT2YgQ2hhb3MnOiAnMTEwMScsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDRcclxuICAgICdBUkYgQW5jaWVudCBDaXJjbGUnOiAnMTEwMicsIC8vIFRhcmdldGVkIGRvbnV0IEFvRXMsIGJvc3MgNFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdBUkYgUGV0cmlmYWN0aW9uJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzAxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBGcmFjdGFsIENvbnRpbnV1bVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRnJhY3RhbENvbnRpbnV1bSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBEb3VibGUgU2V2ZXInOiAnRjdEJywgLy8gQ29uYWxzLCBib3NzIDFcclxuICAgICdGcmFjdGFsIEFldGhlcmljIENvbXByZXNzaW9uJzogJ0Y4MCcsIC8vIEdyb3VuZCBBb0UgY2lyY2xlcywgYm9zcyAxXHJcbiAgICAnRnJhY3RhbCAxMS1Ub256ZSBTd2lwZSc6ICdGODEnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0ZyYWN0YWwgMTAtVG9uemUgU2xhc2gnOiAnRjgzJywgLy8gRnJvbnRhbCBsaW5lLCBib3NzIDJcclxuICAgICdGcmFjdGFsIDExMS1Ub256ZSBTd2luZyc6ICdGODcnLCAvLyBHZXQtb3V0IEFvRSwgYm9zcyAyXHJcbiAgICAnRnJhY3RhbCBCcm9rZW4gR2xhc3MnOiAnRjhFJywgLy8gR2xvd2luZyBwYW5lbHMsIGJvc3MgM1xyXG4gICAgJ0ZyYWN0YWwgTWluZXMnOiAnRjkwJyxcclxuICAgICdGcmFjdGFsIFNlZWQgb2YgdGhlIFJpdmVycyc6ICdGOTEnLCAvLyBHcm91bmQgQW9FIGNpcmNsZXMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBTYW5jdGlmaWNhdGlvbic6ICdGODknLCAvLyBJbnN0YW50IGNvbmFsIGJ1c3RlciwgYm9zcyAzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc0ltcD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUdyZWF0R3ViYWxMaWJyYXJ5SGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBUZXJyb3IgRXllJzogJzkzMCcsIC8vIENpcmNsZSBBb0UsIFNwaW5lIEJyZWFrZXIgdHJhc2hcclxuICAgICdHdWJhbEhtIEJhdHRlcic6ICcxOThBJywgLy8gQ2lyY2xlIEFvRSwgdHJhc2ggYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gQ29uZGVtbmF0aW9uJzogJzM5MCcsIC8vIENvbmFsIEFvRSwgQmlibGlvdm9yZSB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMSc6ICcxOTQzJywgLy8gRmFsbGluZyBib29rIHNoYWRvdywgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBEaXNjb250aW51ZSAyJzogJzE5NDAnLCAvLyBSdXNoIEFvRSBmcm9tIGVuZHMsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMyc6ICcxOTQyJywgLy8gUnVzaCBBb0UgYWNyb3NzLCBib3NzIDFcclxuICAgICdHdWJhbEhtIEZyaWdodGZ1bCBSb2FyJzogJzE5M0InLCAvLyBHZXQtT3V0IEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBJc3N1ZSAxJzogJzE5M0QnLCAvLyBJbml0aWFsIGVuZCBib29rIHdhcm5pbmcgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIElzc3VlIDInOiAnMTkzRicsIC8vIEluaXRpYWwgZW5kIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gSXNzdWUgMyc6ICcxOTQxJywgLy8gSW5pdGlhbCBzaWRlIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGVzb2xhdGlvbic6ICcxOThDJywgLy8gTGluZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEb3VibGUgU21hc2gnOiAnMjZBJywgLy8gQ29uYWwgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGFya25lc3MnOiAnM0EwJywgLy8gQ29uYWwgQW9FLCBJbmtzdGFpbiB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRmlyZXdhdGVyJzogJzNCQScsIC8vIENpcmNsZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBFbGJvdyBEcm9wJzogJ0NCQScsIC8vIENvbmFsIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIERhcmsnOiAnMTlERicsIC8vIExhcmdlIGNpcmNsZSBBb0UsIElua3N0YWluIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBTZWFscyc6ICcxOTRBJywgLy8gU3VuL01vb25zZWFsIGZhaWx1cmUsIGJvc3MgMlxyXG4gICAgJ0d1YmFsSG0gV2F0ZXIgSUlJJzogJzFDNjcnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBQb3JvZ28gUGVnaXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBSYWdpbmcgQXhlJzogJzE3MDMnLCAvLyBTbWFsbCBjb25hbCBBb0UsIE1lY2hhbm9zZXJ2aXRvciB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gTWFnaWMgSGFtbWVyJzogJzE5OTAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBBcGFuZGEgbWluaS1ib3NzXHJcbiAgICAnR3ViYWxIbSBQcm9wZXJ0aWVzIE9mIEdyYXZpdHknOiAnMTk1MCcsIC8vIENpcmNsZSBBb0UgZnJvbSBncmF2aXR5IHB1ZGRsZXMsIGJvc3MgM1xyXG4gICAgJ0d1YmFsSG0gUHJvcGVydGllcyBPZiBMZXZpdGF0aW9uJzogJzE5NEYnLCAvLyBDaXJjbGUgQW9FIGZyb20gbGV2aXRhdGlvbiBwdWRkbGVzLCBib3NzIDNcclxuICAgICdHdWJhbEhtIENvbWV0JzogJzE5NjknLCAvLyBTbWFsbCBjaXJjbGUgQW9FLCBpbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0d1YmFsSG0gRWNsaXB0aWMgTWV0ZW9yJzogJzE5NUMnLCAvLyBMb1MgbWVjaGFuaWMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBTZWFyaW5nIFdpbmQnOiAnMTk0NCcsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDJcclxuICAgICdHdWJhbEhtIFRodW5kZXInOiAnMTlbQUJdJywgLy8gU3ByZWFkIG1hcmtlciwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBGaXJlIGdhdGUgaW4gaGFsbHdheSB0byBib3NzIDIsIG1hZ25ldCBmYWlsdXJlIG9uIGJvc3MgMlxyXG4gICAgICBpZDogJ0d1YmFsSG0gQnVybnMnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTBCJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIFRodW5kZXIgMyBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzSW1wID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0ltcFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHdWJhbEhtIEltcCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0ltcCA9IGRhdGEuaGFzSW1wIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzSW1wW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGFyZ2V0cyB3aXRoIEltcCB3aGVuIFRodW5kZXIgSUlJIHJlc29sdmVzIHJlY2VpdmUgYSB2dWxuZXJhYmlsaXR5IHN0YWNrIGFuZCBicmllZiBzdHVuXHJcbiAgICAgIGlkOiAnR3ViYWxIbSBJbXAgVGh1bmRlcicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NVtBQl0nLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuaGFzSW1wPy5bbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1Nob2NrZWQgSW1wJyxcclxuICAgICAgICAgICAgZGU6ICdTY2hvY2tpZXJ0ZXIgSW1wJyxcclxuICAgICAgICAgICAgamE6ICfjgqvjg4Pjg5HjgpLop6PpmaTjgZfjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+ays+erpeeKtuaAgeWQg+S6huaatOmbtycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gUXVha2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcxOTU2JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBBbHdheXMgaGl0cyB0YXJnZXQsIGJ1dCBpZiBjb3JyZWN0bHkgcmVzb2x2ZWQgd2lsbCBkZWFsIDAgZGFtYWdlXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gVG9ybmFkbycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NVs3OF0nLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIEFsd2F5cyBoaXRzIHRhcmdldCwgYnV0IGlmIGNvcnJlY3RseSByZXNvbHZlZCB3aWxsIGRlYWwgMCBkYW1hZ2VcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNvaG1BbEhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NvaG1BbEhtIERlYWRseSBWYXBvcic6ICcxREM5JywgLy8gRW52aXJvbm1lbnRhbCBjaXJjbGUgQW9Fc1xyXG4gICAgJ1NvaG1BbEhtIERlZXByb290JzogJzFDREEnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBCbG9vbWluZyBDaGljaHUgdHJhc2hcclxuICAgICdTb2htQWxIbSBPZGlvdXMgQWlyJzogJzFDREInLCAvLyBDb25hbCBBb0UsIEJsb29taW5nIENoaWNodSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEdsb3Jpb3VzIEJsYXplJzogJzFDMzMnLCAvLyBDaXJjbGUgQW9FLCBTbWFsbCBTcG9yZSBTYWMsIGJvc3MgMVxyXG4gICAgJ1NvaG1BbEhtIEZvdWwgV2F0ZXJzJzogJzExOEEnLCAvLyBDb25hbCBBb0UsIE1vdW50YWludG9wIE9wa2VuIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUGxhaW4gUG91bmQnOiAnMTE4NycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIE1vdW50YWludG9wIEhyb3BrZW4gdHJhc2hcclxuICAgICdTb2htQWxIbSBQYWxzeW55eGlzJzogJzExNjEnLCAvLyBDb25hbCBBb0UsIE92ZXJncm93biBEaWZmbHVnaWEgdHJhc2hcclxuICAgICdTb2htQWxIbSBTdXJmYWNlIEJyZWFjaCc6ICcxRTgwJywgLy8gQ2lyY2xlIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEZyZXNod2F0ZXIgQ2Fubm9uJzogJzExOUYnLCAvLyBMaW5lIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFRhaWwgU21hc2gnOiAnMUMzNScsIC8vIFVudGVsZWdyYXBoZWQgcmVhciBjb25hbCBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gVGFpbCBTd2luZyc6ICcxQzM2JywgLy8gVW50ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFJpcHBlciBDbGF3JzogJzFDMzcnLCAvLyBVbnRlbGVncmFwaGVkIGZyb250YWwgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFdpbmQgU2xhc2gnOiAnMUMzOCcsIC8vIENpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gV2lsZCBDaGFyZ2UnOiAnMUMzOScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEhvdCBDaGFyZ2UnOiAnMUMzQScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEZpcmViYWxsJzogJzFDM0InLCAvLyBVbnRlbGVncmFwaGVkIHRhcmdldGVkIGNpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gTGF2YSBGbG93JzogJzFDM0MnLCAvLyBVbnRlbGVncmFwaGVkIGNvbmFsIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBXaWxkIEhvcm4nOiAnMTUwNycsIC8vIENvbmFsIEFvRSwgQWJhbGF0aGlhbiBDbGF5IEdvbGVtIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTGF2YSBCcmVhdGgnOiAnMUM0RCcsIC8vIENvbmFsIEFvRSwgTGF2YSBDcmFiIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUmluZyBvZiBGaXJlJzogJzFDNEMnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBWb2xjYW5vIEFuYWxhIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMSc6ICcxQzQzJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMic6ICcxQzQ0JywgLy8gMjcwLWRlZ3JlZSByZWFyIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMyc6ICcxQzQyJywgLy8gUmluZyBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIFJlYWxtIFNoYWtlcic6ICcxQzQxJywgLy8gQ2lyY2xlIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXYXJucyBpZiBwbGF5ZXJzIHN0ZXAgaW50byB0aGUgbGF2YSBwdWRkbGVzLiBUaGVyZSBpcyB1bmZvcnR1bmF0ZWx5IG5vIGRpcmVjdCBkYW1hZ2UgZXZlbnQuXHJcbiAgICAgIGlkOiAnU29obUFsSG0gQnVybnMnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTFDJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxPb3BzeURhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFsZXhhbmRlclRoZUN1ZmZPZlRoZVNvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTWluZWZpZWxkJzogJzE3MEQnLCAvLyBDaXJjbGUgQW9FLCBtaW5lcy5cclxuICAgICdNaW5lJzogJzE3MEUnLCAvLyBNaW5lIGV4cGxvc2lvbi5cclxuICAgICdTdXBlcmNoYXJnZSc6ICcxNzEzJywgLy8gTWlyYWdlIGNoYXJnZS5cclxuICAgICdIZWlnaHQgRXJyb3InOiAnMTcxRCcsIC8vIEluY29ycmVjdCBwYW5lbCBmb3IgSGVpZ2h0LlxyXG4gICAgJ0VhcnRoIE1pc3NpbGUnOiAnMTcyNicsIC8vIENpcmNsZSBBb0UsIGZpcmUgcHVkZGxlcy5cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdVbHRyYSBGbGFzaCc6ICcxNzIyJywgLy8gUm9vbS13aWRlIGRlYXRoIEFvRSwgaWYgbm90IExvUydkLlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnSWNlIE1pc3NpbGUnOiAnMTcyNycsIC8vIEljZSBoZWFkbWFya2VyIEFvRSBjaXJjbGVzLlxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnU2luZ2xlIEJ1c3Rlcic6ICcxNzE3JywgLy8gU2luZ2xlIGxhc2VyIEF0dGFjaG1lbnQuIE5vbi10YW5rcyBhcmUgKnByb2JhYmx5KiBkZWFkLlxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgICdEb3VibGUgQnVzdGVyJzogJzE3MTgnLCAvLyBUd2luIGxhc2VyIEF0dGFjaG1lbnQuXHJcbiAgICAnRW51bWVyYXRpb24nOiAnMTcxRScsIC8vIEVudW1lcmF0aW9uIGNpcmNsZS5cclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgYXNzYXVsdD86IHN0cmluZ1tdO1xyXG59XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQWxleGFuZGVyVGhlU291bE9mVGhlQ3JlYXRvcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQTEyTiBTYWNyYW1lbnQnOiAnMUFFNicsIC8vIENyb3NzIExhc2Vyc1xyXG4gICAgJ0ExMk4gR3Jhdml0YXRpb25hbCBBbm9tYWx5JzogJzFBRUInLCAvLyBHcmF2aXR5IFB1ZGRsZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0ExMk4gRGl2aW5lIFNwZWFyJzogJzFBRTMnLCAvLyBJbnN0YW50IGNvbmFsIHRhbmsgY2xlYXZlXHJcbiAgICAnQTEyTiBCbGF6aW5nIFNjb3VyZ2UnOiAnMUFFOScsIC8vIE9yYW5nZSBoZWFkIG1hcmtlciBzcGxhc2ggZGFtYWdlXHJcbiAgICAnQTEyTiBQbGFpbnQgT2YgU2V2ZXJpdHknOiAnMUFGMScsIC8vIEFnZ3JhdmF0ZWQgQXNzYXVsdCBzcGxhc2ggZGFtYWdlXHJcbiAgICAnQTEyTiBDb21tdW5pb24nOiAnMUFGQycsIC8vIFRldGhlciBQdWRkbGVzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0ExMk4gQXNzYXVsdCBDb2xsZWN0JyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2MScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmFzc2F1bHQgPz89IFtdO1xyXG4gICAgICAgIGRhdGEuYXNzYXVsdC5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEl0IGlzIGEgZmFpbHVyZSBmb3IgYSBTZXZlcml0eSBtYXJrZXIgdG8gc3RhY2sgd2l0aCB0aGUgU29saWRhcml0eSBncm91cC5cclxuICAgICAgaWQ6ICdBMTJOIEFzc2F1bHQgRmFpbHVyZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzFBRjInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuYXNzYXVsdD8uaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0RpZG5cXCd0IFNwcmVhZCEnLFxyXG4gICAgICAgICAgICBkZTogJ05pY2h0IHZlcnRlaWx0IScsXHJcbiAgICAgICAgICAgIGZyOiAnTmUgc1xcJ2VzdCBwYXMgZGlzcGVyc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+aVo+mWi+OBl+OBquOBi+OBo+OBnyEnLFxyXG4gICAgICAgICAgICBjbjogJ+ayoeacieaVo+W8gCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdBMTJOIEFzc2F1bHQgQ2xlYW51cCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NjEnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDIwLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDUsXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkZWxldGUgZGF0YS5hc3NhdWx0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQWxhTWhpZ28sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FsYSBNaGlnbyBNYWdpdGVrIFJheSc6ICcyNENFJywgLy8gTGluZSBBb0UsIExlZ2lvbiBQcmVkYXRvciB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0FsYSBNaGlnbyBMb2NrIE9uJzogJzIwNDcnLCAvLyBIb21pbmcgY2lyY2xlcywgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIFRhaWwgTGFzZXIgMSc6ICcyMDQ5JywgLy8gRnJvbnRhbCBsaW5lIEFvRSwgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIFRhaWwgTGFzZXIgMic6ICcyMDRCJywgLy8gUmVhciBsaW5lIEFvRSwgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIFRhaWwgTGFzZXIgMyc6ICcyMDRDJywgLy8gUmVhciBsaW5lIEFvRSwgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIFNob3VsZGVyIENhbm5vbic6ICcyNEQwJywgLy8gQ2lyY2xlIEFvRSwgTGVnaW9uIEF2ZW5nZXIgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gQ2Fubm9uZmlyZSc6ICcyM0VEJywgLy8gRW52aXJvbm1lbnRhbCBjaXJjbGUgQW9FLCBwYXRoIHRvIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICcyMDVBJywgLy8gQ2lyY2xlIEFvRSwgYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIEludGVncmF0ZWQgQWV0aGVyb21vZHVsYXRvcic6ICcyMDVCJywgLy8gUmluZyBBb0UsIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBDaXJjbGUgT2YgRGVhdGgnOiAnMjRENCcsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBIZXhhZHJvbmUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gRXhoYXVzdCc6ICcyNEQzJywgLy8gTGluZSBBb0UsIExlZ2lvbiBDb2xvc3N1cyB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBHcmFuZCBTd29yZCc6ICcyNEQyJywgLy8gQ29uYWwgQW9FLCBMZWdpb24gQ29sb3NzdXMgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTdG9ybSAxJzogJzIwNjYnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgcHJlLWludGVybWlzc2lvbiwgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3Rvcm0gMic6ICcyNTg3JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIGludGVybWlzc2lvbiwgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIFZlaW4gU3BsaXR0ZXIgMSc6ICcyNEI2JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIHByaW1hcnkgZW50aXR5LCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gVmVpbiBTcGxpdHRlciAyJzogJzIwNkMnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgaGVscGVyIGVudGl0eSwgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIExpZ2h0bGVzcyBTcGFyayc6ICcyMDZCJywgLy8gQ29uYWwgQW9FLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0FsYSBNaGlnbyBEZW1pbWFnaWNrcyc6ICcyMDVFJyxcclxuICAgICdBbGEgTWhpZ28gVW5tb3ZpbmcgVHJvaWthJzogJzIwNjAnLFxyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN3b3JkIDEnOiAnMjA2OScsXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dvcmQgMic6ICcyNTg5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEl0J3MgcG9zc2libGUgcGxheWVycyBtaWdodCBqdXN0IHdhbmRlciBpbnRvIHRoZSBiYWQgb24gdGhlIG91dHNpZGUsXHJcbiAgICAgIC8vIGJ1dCBub3JtYWxseSBwZW9wbGUgZ2V0IHB1c2hlZCBpbnRvIGl0LlxyXG4gICAgICBpZDogJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN3ZWxsJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gRGFtYWdlIERvd25cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzJCOCcgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlciwgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIEZvciByZWFzb25zIG5vdCBjb21wbGV0ZWx5IHVuZGVyc3Rvb2QgYXQgdGhlIHRpbWUgdGhpcyB3YXMgbWVyZ2VkLFxyXG4vLyBidXQgbGlrZWx5IHJlbGF0ZWQgdG8gdGhlIGZhY3QgdGhhdCBubyBuYW1lcGxhdGVzIGFyZSB2aXNpYmxlIGR1cmluZyB0aGUgZW5jb3VudGVyLFxyXG4vLyBhbmQgdGhhdCBub3RoaW5nIGluIHRoZSBlbmNvdW50ZXIgYWN0dWFsbHkgZG9lcyBkYW1hZ2UsXHJcbi8vIHdlIGNhbid0IHVzZSBkYW1hZ2VXYXJuIG9yIGdhaW5zRWZmZWN0IGhlbHBlcnMgb24gdGhlIEJhcmRhbSBmaWdodC5cclxuLy8gSW5zdGVhZCwgd2UgdXNlIHRoaXMgaGVscGVyIGZ1bmN0aW9uIHRvIGxvb2sgZm9yIGZhaWx1cmUgZmxhZ3MuXHJcbi8vIElmIHRoZSBmbGFnIGlzIHByZXNlbnQsYSBmdWxsIHRyaWdnZXIgb2JqZWN0IGlzIHJldHVybmVkIHRoYXQgZHJvcHMgaW4gc2VhbWxlc3NseS5cclxuY29uc3QgYWJpbGl0eVdhcm4gPSAoYXJnczogeyBhYmlsaXR5SWQ6IHN0cmluZzsgaWQ6IHN0cmluZyB9KTogT29wc3lUcmlnZ2VyPERhdGE+ID0+IHtcclxuICBpZiAoIWFyZ3MuYWJpbGl0eUlkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBhYmlsaXR5ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgY29uc3QgdHJpZ2dlcjogT29wc3lUcmlnZ2VyPERhdGE+ID0ge1xyXG4gICAgaWQ6IGFyZ3MuaWQsXHJcbiAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBhcmdzLmFiaWxpdHlJZCB9KSxcclxuICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLmZsYWdzLnN1YnN0cigtMikgPT09ICcwRScsXHJcbiAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgfSxcclxuICB9O1xyXG4gIHJldHVybiB0cmlnZ2VyO1xyXG59O1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkJhcmRhbXNNZXR0bGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0JhcmRhbSBEaXJ0eSBDbGF3JzogJzIxQTgnLCAvLyBGcm9udGFsIGNsZWF2ZSwgR3VsbyBHdWxvIHRyYXNoXHJcbiAgICAnQmFyZGFtIEVwaWdyYXBoJzogJzIzQUYnLCAvLyBMaW5lIEFvRSwgV2FsbCBvZiBCYXJkYW0gdHJhc2hcclxuICAgICdCYXJkYW0gVGhlIER1c2sgU3Rhcic6ICcyMTg3JywgLy8gQ2lyY2xlIEFvRSwgZW52aXJvbm1lbnQgYmVmb3JlIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gVGhlIERhd24gU3Rhcic6ICcyMTg2JywgLy8gQ2lyY2xlIEFvRSwgZW52aXJvbm1lbnQgYmVmb3JlIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gQ3J1bWJsaW5nIENydXN0JzogJzFGMTMnLCAvLyBDaXJjbGUgQW9FcywgR2FydWxhLCBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIFJhbSBSdXNoJzogJzFFRkMnLCAvLyBMaW5lIEFvRXMsIFN0ZXBwZSBZYW1hYSwgZmlyc3QgYm9zcy5cclxuICAgICdCYXJkYW0gTHVsbGFieSc6ICcyNEIyJywgLy8gQ2lyY2xlIEFvRXMsIFN0ZXBwZSBTaGVlcCwgZmlyc3QgYm9zcy5cclxuICAgICdCYXJkYW0gSGVhdmUnOiAnMUVGNycsIC8vIEZyb250YWwgY2xlYXZlLCBHYXJ1bGEsIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gV2lkZSBCbGFzdGVyJzogJzI0QjMnLCAvLyBFbm9ybW91cyBmcm9udGFsIGNsZWF2ZSwgU3RlcHBlIENvZXVybCwgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBEb3VibGUgU21hc2gnOiAnMjZBJywgLy8gQ2lyY2xlIEFvRSwgTWV0dGxpbmcgRGhhcmEgdHJhc2hcclxuICAgICdCYXJkYW0gVHJhbnNvbmljIEJsYXN0JzogJzEyNjInLCAvLyBDaXJjbGUgQW9FLCBTdGVwcGUgRWFnbGUgdHJhc2hcclxuICAgICdCYXJkYW0gV2lsZCBIb3JuJzogJzIyMDgnLCAvLyBGcm9udGFsIGNsZWF2ZSwgS2h1biBHdXJ2ZWwgdHJhc2hcclxuICAgICdCYXJkYW0gSGVhdnkgU3RyaWtlIDEnOiAnMjU3OCcsIC8vIDEgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMic6ICcyNTc5JywgLy8gMiBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAzJzogJzI1N0EnLCAvLyAzIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gVHJlbWJsb3IgMSc6ICcyNTdCJywgLy8gMSBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIFRyZW1ibG9yIDInOiAnMjU3QycsIC8vIDIgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUaHJvd2luZyBTcGVhcic6ICcyNTdGJywgLy8gQ2hlY2tlcmJvYXJkIEFvRSwgVGhyb3dpbmcgU3BlYXIsIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIEJhcmRhbVxcJ3MgUmluZyc6ICcyNTgxJywgLy8gRG9udXQgQW9FIGhlYWRtYXJrZXJzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIENvbWV0JzogJzI1N0QnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBDb21ldCBJbXBhY3QnOiAnMjU4MCcsIC8vIENpcmNsZSBBb0VzLCBTdGFyIFNoYXJkLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBJcm9uIFNwaGVyZSBBdHRhY2snOiAnMTZCNicsIC8vIENvbnRhY3QgZGFtYWdlLCBJcm9uIFNwaGVyZSB0cmFzaCwgYmVmb3JlIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gVG9ybmFkbyc6ICcyNDdFJywgLy8gQ2lyY2xlIEFvRSwgS2h1biBTaGF2YXJhIHRyYXNoXHJcbiAgICAnQmFyZGFtIFBpbmlvbic6ICcxRjExJywgLy8gTGluZSBBb0UsIFlvbCBGZWF0aGVyLCB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIEZlYXRoZXIgU3F1YWxsJzogJzFGMEUnLCAvLyBEYXNoIGF0dGFjaywgWW9sLCB0aGlyZCBib3NzXHJcbiAgICAnQmFyZGFtIEZsdXR0ZXJmYWxsIFVudGFyZ2V0ZWQnOiAnMUYxMicsIC8vIFJvdGF0aW5nIGNpcmNsZSBBb0VzLCBZb2wsIHRoaXJkIGJvc3NcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0JhcmRhbSBDb25mdXNlZCc6ICcwQicsIC8vIEZhaWxlZCBnYXplIGF0dGFjaywgWW9sLCB0aGlyZCBib3NzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdCYXJkYW0gRmV0dGVycyc6ICc1NkYnLCAvLyBGYWlsaW5nIHR3byBtZWNoYW5pY3MgaW4gYW55IG9uZSBwaGFzZSBvbiBCYXJkYW0sIHNlY29uZCBib3NzLlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQmFyZGFtIEdhcnVsYSBSdXNoJzogJzFFRjknLCAvLyBMaW5lIEFvRSwgR2FydWxhLCBmaXJzdCBib3NzLlxyXG4gICAgJ0JhcmRhbSBGbHV0dGVyZmFsbCBUYXJnZXRlZCc6ICcxRjBDJywgLy8gQ2lyY2xlIEFvRSBoZWFkbWFya2VyLCBZb2wsIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gV2luZ2JlYXQnOiAnMUYwRicsIC8vIENvbmFsIEFvRSBoZWFkbWFya2VyLCBZb2wsIHRoaXJkIGJvc3NcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICAvLyAxIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gSGVhdnkgU3RyaWtlIDEnLCBhYmlsaXR5SWQ6ICcyNTc4JyB9KSxcclxuICAgIC8vIDIgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMicsIGFiaWxpdHlJZDogJzI1NzknIH0pLFxyXG4gICAgLy8gMyBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAzJywgYWJpbGl0eUlkOiAnMjU3QScgfSksXHJcbiAgICAvLyAxIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gVHJlbWJsb3IgMScsIGFiaWxpdHlJZDogJzI1N0InIH0pLFxyXG4gICAgLy8gMiBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIFRyZW1ibG9yIDInLCBhYmlsaXR5SWQ6ICcyNTdDJyB9KSxcclxuICAgIC8vIENoZWNrZXJib2FyZCBBb0UsIFRocm93aW5nIFNwZWFyLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBUaHJvd2luZyBTcGVhcicsIGFiaWxpdHlJZDogJzI1N0YnIH0pLFxyXG4gICAgLy8gR2F6ZSBhdHRhY2ssIFdhcnJpb3Igb2YgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBFbXB0eSBHYXplJywgYWJpbGl0eUlkOiAnMUYwNCcgfSksXHJcbiAgICAvLyBEb251dCBBb0UgaGVhZG1hcmtlcnMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW1cXCdzIFJpbmcnLCBhYmlsaXR5SWQ6ICcyNTgxJyB9KSxcclxuICAgIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIENvbWV0JywgYWJpbGl0eUlkOiAnMjU3RCcgfSksXHJcbiAgICAvLyBDaXJjbGUgQW9FcywgU3RhciBTaGFyZCwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gQ29tZXQgSW1wYWN0JywgYWJpbGl0eUlkOiAnMjU4MCcgfSksXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEcm93bmVkQ2l0eU9mU2thbGxhLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdIeWRyb2Nhbm5vbic6ICcyNjk3JywgLy8gTGluZSBBb0UsIFNhbHQgU3dhbGxvdyB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0YWduYW50IFNwcmF5JzogJzI2OTknLCAvLyBDb25hbCBBb0UsIFNrYWxsYSBOYW5rYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG5cclxuICAgICdCdWJibGUgQnVyc3QnOiAnMjYxQicsIC8vIEJ1YmJsZSBleHBsb3Npb24sIEh5ZHJvc3BoZXJlLCBib3NzIDFcclxuXHJcbiAgICAnUGxhaW4gUG91bmQnOiAnMjY5QScsIC8vIExhcmdlIGNpcmNsZSBBb0UsIERoYXJhIFNlbnRpbmVsIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQm91bGRlciBUb3NzJzogJzI2OUInLCAvLyBTbWFsbCBjaXJjbGUgQW9FLCBTdG9uZSBQaG9lYmFkIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnTGFuZHNsaXAnOiAnMjY5QycsIC8vIENvbmFsIEFvRSwgU3RvbmUgUGhvZWJhZCB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG5cclxuICAgICdNeXN0aWMgTGlnaHQnOiAnMjY1NycsIC8vIENvbmFsIEFvRSwgVGhlIE9sZCBPbmUsIGJvc3MgMlxyXG4gICAgJ015c3RpYyBGbGFtZSc6ICcyNjU5JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgVGhlIE9sZCBPbmUsIGJvc3MgMi4gMjY1OCBpcyB0aGUgY2FzdC10aW1lIGFiaWxpdHkuXHJcblxyXG4gICAgJ0RhcmsgSUknOiAnMTEwRScsIC8vIFRoaW4gY29uZSBBb0UsIExpZ2h0bGVzcyBIb211bmN1bHVzIHRyYXNoLCBhZnRlciBib3NzIDJcclxuICAgICdJbXBsb3NpdmUgQ3Vyc2UnOiAnMjY5RScsIC8vIENvbmFsIEFvRSwgWmFuZ2JldG8gdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ1VuZHlpbmcgRklyZSc6ICcyNjlGJywgLy8gQ2lyY2xlIEFvRSwgWmFuZ2JldG8gdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ0ZpcmUgSUknOiAnMjZBMCcsIC8vIENpcmNsZSBBb0UsIEFjY3Vyc2VkIElkb2wgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG5cclxuICAgICdSdXN0aW5nIENsYXcnOiAnMjY2MScsIC8vIEZyb250YWwgY2xlYXZlLCBIcm9kcmljIFBvaXNvbnRvbmd1ZSwgYm9zcyAzXHJcbiAgICAnV29yZHMgT2YgV29lJzogJzI2NjInLCAvLyBFeWUgbGFzZXJzLCBIcm9kcmljIFBvaXNvbnRvbmd1ZSwgYm9zcyAzXHJcbiAgICAnVGFpbCBEcml2ZSc6ICcyNjYzJywgLy8gUmVhciBjbGVhdmUsIEhyb2RyaWMgUG9pc29udG9uZ3VlLCBib3NzIDNcclxuICAgICdSaW5nIE9mIENoYW9zJzogJzI2NjcnLCAvLyBSaW5nIGhlYWRtYXJrZXIsIEhyb2RyaWMgUG9pc29udG9uZ3VlLCBib3NzIDNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdTZWxmLURldG9uYXRlJzogJzI2NUMnLCAvLyBSb29td2lkZSBleHBsb3Npb24sIFN1YnNlcnZpZW50LCBib3NzIDJcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0Ryb3BzeSc6ICcxMUInLCAvLyBTdGFuZGluZyBpbiBCbG9vZHkgUHVkZGxlcywgb3IgYmVpbmcga25vY2tlZCBvdXRzaWRlIHRoZSBhcmVuYSwgYm9zcyAxXHJcbiAgICAnQ29uZnVzZWQnOiAnMEInLCAvLyBGYWlsaW5nIHRoZSBnYXplIGF0dGFjaywgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdCbG9vZHkgUHVkZGxlJzogJzI2NTUnLCAvLyBMYXJnZSB3YXRlcnkgc3ByZWFkIGNpcmNsZXMsIEtlbHBpZSwgYm9zcyAxXHJcbiAgICAnQ3Jvc3MgT2YgQ2hhb3MnOiAnMjY2OCcsIC8vIENyb3NzIGhlYWRtYXJrZXIsIEhyb2RyaWMgUG9pc29udG9uZ3VlLCBib3NzIDNcclxuICAgICdDaXJjbGUgT2YgQ2hhb3MnOiAnMjY2OScsIC8vIFNwcmVhZCBjaXJjbGUgaGVhZG1hcmtlciwgSHJvZHJpYyBQb2lzb250b25ndWUsIGJvc3MgM1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5LdWdhbmVDYXN0bGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgVGVua2EgR29ra2VuJzogJzIzMjknLCAvLyBGcm9udGFsIGNvbmUgQW9FLCAgSm9pIEJsYWRlIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnS3VnYW5lIENhc3RsZSBLZW5raSBSZWxlYXNlIFRyYXNoJzogJzIzMzAnLCAvLyBDaGFyaW90IEFvRSwgSm9pIEtpeW9mdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQ2xlYXJvdXQnOiAnMUU5MicsIC8vIEZyb250YWwgY29uZSBBb0UsIFp1aWtvLU1hcnUsIGJvc3MgMVxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSGFyYS1LaXJpIDEnOiAnMUU5NicsIC8vIEdpYW50IGNpcmNsZSBBb0UsIEhhcmFraXJpIEtvc2hvLCBib3NzIDFcclxuICAgICdLdWdhbmUgQ2FzdGxlIEhhcmEtS2lyaSAyJzogJzI0RjknLCAvLyBHaWFudCBjaXJjbGUgQW9FLCBIYXJha2lyaSBLb3NobywgYm9zcyAxXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAxJzogJzIzMkQnLCAvLyBMaW5lIEFvRSwgS2FyYWt1cmkgT25taXRzdSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgMTAwMCBCYXJicyc6ICcyMTk4JywgLy8gTGluZSBBb0UsIEpvaSBLb2phIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSnVqaSBTaHVyaWtlbiAyJzogJzFFOTgnLCAvLyBMaW5lIEFvRSwgRG9qdW4gTWFydSwgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBUYXRhbWktR2Flc2hpJzogJzFFOUQnLCAvLyBGbG9vciB0aWxlIGxpbmUgYXR0YWNrLCBFbGtpdGUgT25taXRzdSwgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBKdWppIFNodXJpa2VuIDMnOiAnMUVBMCcsIC8vIExpbmUgQW9FLCBFbGl0ZSBPbm1pdHN1LCBib3NzIDJcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBBdXRvIENyb3NzYm93JzogJzIzMzMnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBLYXJha3VyaSBIYW55YSB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBIYXJha2lyaSAzJzogJzIzQzknLCAvLyBHaWFudCBDaXJjbGUgQW9FLCBIYXJha2lyaSAgSGFueWEgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIElhaS1HaXJpJzogJzFFQTInLCAvLyBDaGFyaW90IEFvRSwgWW9qaW1ibywgYm9zcyAzXHJcbiAgICAnS3VnYW5lIENhc3RsZSBGcmFnaWxpdHknOiAnMUVBQScsIC8vIENoYXJpb3QgQW9FLCBJbm9zaGlrYWNobywgYm9zcyAzXHJcbiAgICAnS3VnYW5lIENhc3RsZSBEcmFnb25maXJlJzogJzFFQUInLCAvLyBMaW5lIEFvRSwgRHJhZ29uIEhlYWQsIGJvc3MgM1xyXG4gIH0sXHJcblxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSXNzZW4nOiAnMUU5NycsIC8vIEluc3RhbnQgZnJvbnRhbCBjbGVhdmUsIERvanVuIE1hcnUsIGJvc3MgMlxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgQ2xvY2t3b3JrIFJhaXRvbic6ICcxRTlCJywgLy8gTGFyZ2UgbGlnaHRuaW5nIHNwcmVhZCBjaXJjbGVzLCBEb2p1biBNYXJ1LCBib3NzIDJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFN0YWNrIG1hcmtlciwgWnVpa28gTWFydSwgYm9zcyAxXHJcbiAgICAgIGlkOiAnS3VnYW5lIENhc3RsZSBIZWxtIENyYWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxRTk0JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMudHlwZSA9PT0gJzIxJywgLy8gVGFraW5nIHRoZSBzdGFjayBzb2xvIGlzICpwcm9iYWJseSogYSBtaXN0YWtlLlxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxvbmUpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsbGVpbilgLFxyXG4gICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoc2V1bChlKSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5LiA5Lq6KWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjljZXlkIMpYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKO2YvOyekCDrp57snYwpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVTaXJlbnNvbmdTZWEsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NpcmVuc29uZyBBbmNpZW50IFltaXIgSGVhZCBTbmF0Y2gnOiAnMjM1MycsIC8vIGZyb250YWwgY29uYWxcclxuICAgICdTaXJlbnNvbmcgUmVmbGVjdGlvbiBvZiBLYXJsYWJvcyBUYWlsIFNjcmV3JzogJzEyQjcnLCAvLyB0YXJnZXRlZCBjaXJjbGVcclxuICAgICdTaXJlbnNvbmcgTHVnYXQgQW1vcnBob3VzIEFwcGxhdXNlJzogJzFGNTYnLCAvLyBmcm9udGFsIDE4MCBjbGVhdmVcclxuICAgICdTaXJlbnNvbmcgTHVnYXQgQ29uY3Vzc2l2ZSBPc2NpbGxhdGlvbic6ICcxRjVCJywgLy8gNSBvciA3IGNpcmNsZXNcclxuICAgICdTaXJlbnNvbmcgVGhlIEphbmUgR3V5IEJhbGwgb2YgTWFsaWNlJzogJzFGNkEnLCAvLyBhbWJpZW50IGNhbm5vbiBjaXJjbGVcclxuICAgICdTaXJlbnNvbmcgRGFyayc6ICcxOURGJywgLy8gU2tpbmxlc3MgU2tpcHBlciAvIEZsZXNobGVzcyBDYXB0aXZlIHRhcmdldGVkIGNpcmNsZVxyXG4gICAgJ1NpcmVuc29uZyBUaGUgR292ZXJub3IgU2hhZG93c3RyaWtlJzogJzFGNUQnLCAvLyBzdGFuZGluZyBpbiBzaGFkb3dzXHJcbiAgICAnU2lyZW5zb25nIFVuZGVhZCBXYXJkZW4gTWFyY2ggb2YgdGhlIERlYWQnOiAnMjM1MScsIC8vIGZyb250YWwgY29uYWxcclxuICAgICdTaXJlbnNvbmcgRmxlc2hsZXNzIENhcHRpdmUgRmxvb2QnOiAnMjE4QicsIC8vIGNlbnRlcmVkIGNpcmNsZSBhZnRlciBzZWR1Y3RpdmUgc2NyZWFtXHJcbiAgICAnU2lyZW5zb25nIExvcmVsZWkgVm9pZCBXYXRlciBJSUknOiAnMUY2OCcsIC8vIGxhcmdlIHRhcmdldGVkIGNpcmNsZVxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuU2FpbnRNb2NpYW5uZXNBcmJvcmV0dW1IYXJkLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE11ZHN0cmVhbSc6ICczMEQ5JywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgSW1tYWN1bGF0ZSBBcGEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFNpbGtlbiBTcHJheSc6ICczMzg1JywgLy8gUmVhciBjb25lIEFvRSwgV2l0aGVyZWQgQmVsbGFkb25uYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgTXVkZHkgUHVkZGxlcyc6ICczMERBJywgLy8gU21hbGwgdGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIERvcnBva2t1ciB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgT2Rpb3VzIEFpcic6ICcyRTQ5JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTTHVkZ2UgQm9tYic6ICcyRTRFJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgT2Rpb3VzIEF0bW9zcGhlcmUnOiAnMkU1MScsIC8vIENoYW5uZWxlZCAzLzQgYXJlbmEgY2xlYXZlLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIENyZWVwaW5nIEl2eSc6ICczMUE1JywgLy8gRnJvbnRhbCBjb25lIEFvRSwgV2l0aGVyZWQgS3VsYWsgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFJvY2tzbGlkZSc6ICczMTM0JywgLy8gTGluZSBBb0UsIFNpbHQgR29sZW0sIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGhxdWFrZSBJbm5lcic6ICczMTJFJywgLy8gQ2hhcmlvdCBBb0UsIExha2hhbXUsIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGhxdWFrZSBPdXRlcic6ICczMTJGJywgLy8gRHluYW1vIEFvRSwgTGFraGFtdSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBFbWJhbG1pbmcgRWFydGgnOiAnMzFBNicsIC8vIExhcmdlIENoYXJpb3QgQW9FLCBNdWRkeSBNYXRhLCBhZnRlciBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFF1aWNrbWlyZSc6ICczMTM2JywgLy8gU2V3YWdlIHN1cmdlIGF2b2lkZWQgb24gcGxhdGZvcm1zLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUXVhZ21pcmUgUGxhdGZvcm1zJzogJzMxMzknLCAvLyBRdWFnbWlyZSBleHBsb3Npb24gb24gcGxhdGZvcm1zLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRmVjdWxlbnQgRmxvb2QnOiAnMzEzQycsIC8vIFRhcmdldGVkIHRoaW4gY29uZSBBb0UsIFRva2thcGNoaSwgYm9zcyAzXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBDb3JydXB0dXJlJzogJzMzQTAnLCAvLyBNdWQgU2xpbWUgZXhwbG9zaW9uLCBib3NzIDMuIChObyBleHBsb3Npb24gaWYgZG9uZSBjb3JyZWN0bHkuKVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTZWR1Y2VkJzogJzNERicsIC8vIEdhemUgZmFpbHVyZSwgV2l0aGVyZWQgQmVsbGFkb25uYSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgUG9sbGVuJzogJzEzJywgLy8gU2x1ZGdlIHB1ZGRsZXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgVHJhbnNmaWd1cmF0aW9uJzogJzY0OCcsIC8vIFJvbHktUG9seSBBb0UgY2lyY2xlIGZhaWx1cmUsIEJMb29taW5nIEJpbG9rbyB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgSHlzdGVyaWEnOiAnMTI4JywgLy8gR2F6ZSBmYWlsdXJlLCBMYWtoYW11LCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFN0YWIgV291bmQnOiAnNDVEJywgLy8gQXJlbmEgb3V0ZXIgd2FsbCBlZmZlY3QsIGJvc3MgMlxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBUYXByb290JzogJzJFNEMnLCAvLyBMYXJnZSBvcmFuZ2Ugc3ByZWFkIGNpcmNsZXMsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRWFydGggU2hha2VyJzogJzMxMzEnLCAvLyBFYXJ0aCBTaGFrZXIsIExha2hhbXUsIGJvc3MgMlxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEZhdWx0IFdhcnJlbic6ICcyRTRBJywgLy8gU3RhY2sgbWFya2VyLCBOdWxsY2h1LCBib3NzIDFcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlU3dhbGxvd3NDb21wYXNzLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEl2eSBGZXR0ZXJzJzogJzJDMDQnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRSwgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMVxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgV2lsZHN3aW5kIDEnOiAnMkMwNScsIC8vIFRvcm5hZG8gZ3JvdW5kIEFvRSwgcGxhY2VkIGJ5IFNhaSBUYWlzdWkgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBZYW1hLUthZ3VyYSc6ICcyQjk2JywgLy8gRnJvbnRhbCBsaW5lIEFvRSwgT3Rlbmd1LCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEZsYW1lcyBPZiBIYXRlJzogJzJCOTgnLCAvLyBGaXJlIG9yYiBleHBsb3Npb25zLCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIENvbmZsYWdyYXRlJzogJzJCOTknLCAvLyBDb2xsaXNpb24gd2l0aCBmaXJlIG9yYiwgYm9zcyAxXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVXB3ZWxsJzogJzJDMDYnLCAvLyBUYXJnZXRlZCBjaXJjbGUgZ3JvdW5kIEFvRSwgU2FpIFRhaXN1aSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQmFkIEJyZWF0aCc6ICcyQzA3JywgLy8gRnJvbnRhbCBjbGVhdmUsIEppbm1lbmp1IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgR3JlYXRlciBQYWxtIDEnOiAnMkI5RCcsIC8vIEhhbGYgYXJlbmEgcmlnaHQgY2xlYXZlLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEdyZWF0ZXIgUGFsbSAyJzogJzJCOUUnLCAvLyBIYWxmIGFyZW5hIGxlZnQgY2xlYXZlLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFRyaWJ1dGFyeSc6ICcyQkEwJywgLy8gVGFyZ2V0ZWQgdGhpbiBjb25hbCBncm91bmQgQW9FcywgRGFpZGFyYWJvdGNoaSwgYm9zcyAyXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgV2lsZHN3aW5kIDInOiAnMkMwNicsIC8vIENpcmNsZSBncm91bmQgQW9FLCBlbnZpcm9ubWVudCwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBXaWxkc3dpbmQgMyc6ICcyQzA3JywgLy8gQ2lyY2xlIGdyb3VuZCBBb0UsIHBsYWNlZCBieSBTYWkgVGFpc3VpIHRyYXNoLCBhZnRlciBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEZpbG9wbHVtZXMnOiAnMkM3NicsIC8vIEZyb250YWwgcmVjdGFuZ2xlIEFvRSwgRHJhZ29uIEJpIEZhbmcgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyAxJzogJzJCQTgnLCAvLyBDaGFyaW90IEFvRSwgUWl0aWFuIERhc2hlbmcsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgQm90aCBFbmRzIDInOiAnMkJBOScsIC8vIER5bmFtbyBBb0UsIFFpdGlhbiBEYXNoZW5nLCBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyAzJzogJzJCQUUnLCAvLyBDaGFyaW90IEFvRSwgU2hhZG93IE9mIFRoZSBTYWdlLCBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyA0JzogJzJCQUYnLCAvLyBEeW5hbW8gQW9FLCBTaGFkb3cgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgRXF1YWwgT2YgSGVhdmVuJzogJzJCQjQnLCAvLyBTbWFsbCBjaXJjbGUgZ3JvdW5kIEFvRXMsIFFpdGlhbiBEYXNoZW5nLCBib3NzIDNcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgSHlzdGVyaWEnOiAnMTI4JywgLy8gR2F6ZSBhdHRhY2sgZmFpbHVyZSwgT3Rlbmd1LCBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJsZWVkaW5nJzogJzExMkYnLCAvLyBTdGVwcGluZyBvdXRzaWRlIHRoZSBhcmVuYSwgYm9zcyAzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdTd2FsbG93cyBDb21wYXNzIE1pcmFnZSc6ICcyQkEyJywgLy8gUHJleS1jaGFzaW5nIHB1ZGRsZXMsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgTW91bnRhaW4gRmFsbHMnOiAnMkJBNScsIC8vIENpcmNsZSBzcHJlYWQgbWFya2VycywgRGFpZGFyYWJvdGNoaSwgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBUaGUgTG9uZyBFbmQnOiAnMkJBNycsIC8vIExhc2VyIHRldGhlciwgUWl0aWFuIERhc2hlbmcgIGJvc3MgM1xyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVGhlIExvbmcgRW5kIDInOiAnMkJBRCcsIC8vIExhc2VyIFRldGhlciwgU2hhZG93cyBPZiBUaGUgU2FnZSwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBTdGFuZGluZyBpbiB0aGUgbGFrZSwgRGlhZGFyYWJvdGNoaSwgYm9zcyAyXHJcbiAgICAgIGlkOiAnU3dhbGxvd3MgQ29tcGFzcyBTaXggRnVsbXMgVW5kZXInLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMjM3JyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBTdGFjayBtYXJrZXIsIGJvc3MgM1xyXG4gICAgICBpZDogJ1N3YWxsb3dzIENvbXBhc3MgRml2ZSBGaW5nZXJlZCBQdW5pc2htZW50JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnMkJBQicsICcyQkIwJ10sIHNvdXJjZTogWydRaXRpYW4gRGFzaGVuZycsICdTaGFkb3cgT2YgVGhlIFNhZ2UnXSB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMudHlwZSA9PT0gJzIxJywgLy8gVGFraW5nIHRoZSBzdGFjayBzb2xvIGlzICpwcm9iYWJseSogYSBtaXN0YWtlLlxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxvbmUpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsbGVpbilgLFxyXG4gICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoc2V1bChlKSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5LiA5Lq6KWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjljZXlkIMpYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKO2YvOyekCDrp57snYwpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVUZW1wbGVPZlRoZUZpc3QsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RlbXBsZSBGaXJlIEJyZWFrJzogJzIxRUQnLCAvLyBDb25hbCBBb0UsIEJsb29kZ2xpZGVyIE1vbmsgdHJhc2hcclxuICAgICdUZW1wbGUgUmFkaWFsIEJsYXN0ZXInOiAnMUZEMycsIC8vIENpcmNsZSBBb0UsIGJvc3MgMVxyXG4gICAgJ1RlbXBsZSBXaWRlIEJsYXN0ZXInOiAnMUZENCcsIC8vIENvbmFsIEFvRSwgYm9zcyAxXHJcbiAgICAnVGVtcGxlIENyaXBwbGluZyBCbG93JzogJzIwMTYnLCAvLyBMaW5lIEFvRXMsIGVudmlyb25tZW50YWwsIGJlZm9yZSBib3NzIDJcclxuICAgICdUZW1wbGUgQnJva2VuIEVhcnRoJzogJzIzNkUnLCAvLyBDaXJjbGUgQW9FLCBTaW5naGEgdHJhc2hcclxuICAgICdUZW1wbGUgU2hlYXInOiAnMUZERCcsIC8vIER1YWwgY29uYWwgQW9FLCBib3NzIDJcclxuICAgICdUZW1wbGUgQ291bnRlciBQYXJyeSc6ICcxRkUwJywgLy8gUmV0YWxpYXRpb24gZm9yIGluY29ycmVjdCBkaXJlY3Rpb24gYWZ0ZXIgS2lsbGVyIEluc3RpbmN0LCBib3NzIDJcclxuICAgICdUZW1wbGUgVGFwYXMnOiAnJywgLy8gVHJhY2tpbmcgY2lyY3VsYXIgZ3JvdW5kIEFvRXMsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBIZWxsc2VhbCc6ICcyMDBGJywgLy8gUmVkL0JsdWUgc3ltYm9sIGZhaWx1cmUsIGJvc3MgMlxyXG4gICAgJ1RlbXBsZSBQdXJlIFdpbGwnOiAnMjAxNycsIC8vIENpcmNsZSBBb0UsIFNwaXJpdCBGbGFtZSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBNZWdhYmxhc3Rlcic6ICcxNjMnLCAvLyBDb25hbCBBb0UsIENvZXVybCBQcmFuYSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBXaW5kYnVybic6ICcxRkU4JywgLy8gQ2lyY2xlIEFvRSwgVHdpc3RlciB3aW5kLCBib3NzIDNcclxuICAgICdUZW1wbGUgSHVycmljYW5lIEtpY2snOiAnMUZFNScsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBTaWxlbnQgUm9hcic6ICcxRkVCJywgLy8gRnJvbnRhbCBsaW5lIEFvRSwgYm9zcyAzXHJcbiAgICAnVGVtcGxlIE1pZ2h0eSBCbG93JzogJzFGRUEnLCAvLyBDb250YWN0IHdpdGggY29ldXJsIGhlYWQsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGVtcGxlIEhlYXQgTGlnaHRuaW5nJzogJzFGRDcnLCAvLyBQdXJwbGUgc3ByZWFkIGNpcmNsZXMsIGJvc3MgMVxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQnVybixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gRmFsbGluZyBSb2NrJzogJzMxQTMnLCAvLyBFbnZpcm9ubWVudGFsIGxpbmUgQW9FXHJcbiAgICAnVGhlIEJ1cm4gQWV0aGVyaWFsIEJsYXN0JzogJzMyOEInLCAvLyBMaW5lIEFvRSwgS3VrdWxrYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBNb2xlLWEtd2hhY2snOiAnMzI4RCcsIC8vIENpcmNsZSBBb0UsIERlc2VydCBEZXNtYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBIZWFkIEJ1dHQnOiAnMzI4RScsIC8vIFNtYWxsIGNvbmFsIEFvRSwgRGVzZXJ0IERlc21hbiB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFNoYXJkZmFsbCc6ICczMTkxJywgLy8gUm9vbXdpZGUgQW9FLCBMb1MgZm9yIHNhZmV0eSwgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gRGlzc29uYW5jZSc6ICczMTkyJywgLy8gRG9udXQgQW9FLCBIZWRldGV0LCBib3NzIDFcclxuICAgICdUaGUgQnVybiBDcnlzdGFsbGluZSBGcmFjdHVyZSc6ICczMTk3JywgLy8gQ2lyY2xlIEFvRSwgRGltIENyeXN0YWwsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFJlc29uYW50IEZyZXF1ZW5jeSc6ICczMTk4JywgLy8gQ2lyY2xlIEFvRSwgRGltIENyeXN0YWwsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFJvdG9zd2lwZSc6ICczMjkxJywgLy8gRnJvbnRhbCBjb25lIEFvRSwgQ2hhcnJlZCBEcmVhZG5hdWdodCB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFdyZWNraW5nIEJhbGwnOiAnMzI5MicsIC8vIENpcmNsZSBBb0UsIENoYXJyZWQgRHJlYWRuYXVnaHQgdHJhc2hcclxuICAgICdUaGUgQnVybiBTaGF0dGVyJzogJzMyOTQnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBDaGFycmVkIERvYmx5biB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIEF1dG8tQ2Fubm9ucyc6ICczMjk1JywgLy8gTGluZSBBb0UsIENoYXJyZWQgRHJvbmUgdHJhc2hcclxuICAgICdUaGUgQnVybiBTZWxmLURldG9uYXRlJzogJzMyOTYnLCAvLyBDaXJjbGUgQW9FLCBDaGFycmVkIERyb25lIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gRnVsbCBUaHJvdHRsZSc6ICcyRDc1JywgLy8gTGluZSBBb0UsIERlZmVjdGl2ZSBEcm9uZSwgYm9zcyAyXHJcbiAgICAnVGhlIEJ1cm4gVGhyb3R0bGUnOiAnMkQ3NicsIC8vIExpbmUgQW9FLCBNaW5pbmcgRHJvbmUgYWRkcywgYm9zcyAyXHJcbiAgICAnVGhlIEJ1cm4gQWRpdCBEcml2ZXInOiAnMkQ3OCcsIC8vIExpbmUgQW9FLCBSb2NrIEJpdGVyIGFkZHMsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIFRyZW1ibG9yJzogJzMyOTcnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBWZWlsZWQgR2lnYXdvcm0gdHJhc2hcclxuICAgICdUaGUgQnVybiBEZXNlcnQgU3BpY2UnOiAnMzI5OCcsIC8vIFRoZSBmcm9udGFsIGNsZWF2ZXMgbXVzdCBmbG93XHJcbiAgICAnVGhlIEJ1cm4gVG94aWMgU3ByYXknOiAnMzI5QScsIC8vIEZyb250YWwgY29uZSBBb0UsIEdpZ2F3b3JtIFN0YWxrZXIgdHJhc2hcclxuICAgICdUaGUgQnVybiBWZW5vbSBTcHJheSc6ICczMjlCJywgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRSwgR2lnYXdvcm0gU3RhbGtlciB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIFdoaXRlIERlYXRoJzogJzMxNDMnLCAvLyBSZWFjdGl2ZSBkdXJpbmcgaW52dWxuZXJhYmlsaXR5LCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRm9nIFBsdW1lIDEnOiAnMzE0NScsIC8vIFN0YXIgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRm9nIFBsdW1lIDInOiAnMzE0NicsIC8vIExpbmUgQW9FcyBhZnRlciBzdGFycywgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIENhdXRlcml6ZSc6ICczMTQ4JywgLy8gTGluZS9Td29vcCBBb0UsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaGUgQnVybiBDb2xkIEZvZyc6ICczMTQyJywgLy8gR3Jvd2luZyBjaXJjbGUgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdUaGUgQnVybiBMZWFkZW4nOiAnNDMnLCAvLyBQdWRkbGUgZWZmZWN0LCBib3NzIDIuIChBbHNvIGluZmxpY3RzIDExRiwgU2x1ZGdlLilcclxuICAgICdUaGUgQnVybiBQdWRkbGUgRnJvc3RiaXRlJzogJzExRCcsIC8vIEljZSBwdWRkbGUgZWZmZWN0LCBib3NzIDMuIChOT1QgdGhlIGNvbmFsLWluZmxpY3RlZCBvbmUsIDEwQy4pXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaGUgQnVybiBIYWlsZmlyZSc6ICczMTk0JywgLy8gSGVhZCBtYXJrZXIgbGluZSBBb0UsIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIFNoYXJkc3RyaWtlJzogJzMxOTUnLCAvLyBPcmFuZ2Ugc3ByZWFkIGhlYWQgbWFya2VycywgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gQ2hpbGxpbmcgQXNwaXJhdGlvbic6ICczMTREJywgLy8gSGVhZCBtYXJrZXIgY2xlYXZlLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgICAnVGhlIEJ1cm4gRnJvc3QgQnJlYXRoJzogJzMxNEMnLCAvLyBUYW5rIGNsZWF2ZSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBPMU4gLSBEZWx0YXNjYXBlIDEuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWMTAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08xTiBCdXJuJzogJzIzRDUnLCAvLyBGaXJlYmFsbCBleHBsb3Npb24gY2lyY2xlIEFvRXNcclxuICAgICdPMU4gQ2xhbXAnOiAnMjNFMicsIC8vIEZyb250YWwgcmVjdGFuZ2xlIGtub2NrYmFjayBBb0UsIEFsdGUgUm9pdGVcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08xTiBMZXZpbmJvbHQnOiAnMjNEQScsIC8vIHNtYWxsIHNwcmVhZCBjaXJjbGVzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIE8xUyAtIERlbHRhc2NhcGUgMS4wIFNhdmFnZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYxMFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzFTIFR1cmJ1bGVuY2UnOiAnMjU4NCcsIC8vIHN0YW5kaW5nIHVuZGVyIHRoZSBib3NzIGJlZm9yZSBkb3duYnVyc3RcclxuICAgICdPMVMgQmFsbCBPZiBGaXJlIEJ1cm4nOiAnMUVDQicsIC8vIGZpcmViYWxsIGV4cGxvc2lvblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ08xUyBDbGFtcCc6ICcxRURFJywgLy8gbGFyZ2UgZnJvbnRhbCBsaW5lIGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzFTIExldmluYm9sdCc6ICcxRUQyJywgLy8gbGlnaHRuaW5nIHNwcmVhZFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIE8yTiAtIERlbHRhc2NhcGUgMi4wIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYyMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzJOIE1haW4gUXVha2UnOiAnMjRBNScsIC8vIE5vbi10ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBGbGVzaHkgTWVtYmVyXHJcbiAgICAnTzJOIEVyb3Npb24nOiAnMjU5MCcsIC8vIFNtYWxsIGNpcmNsZSBBb0VzLCBGbGVzaHkgTWVtYmVyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMk4gUGFyYW5vcm1hbCBXYXZlJzogJzI1MEUnLCAvLyBJbnN0YW50IHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXZSBjb3VsZCB0cnkgdG8gc2VwYXJhdGUgb3V0IHRoZSBtaXN0YWtlIHRoYXQgbGVkIHRvIHRoZSBwbGF5ZXIgYmVpbmcgcGV0cmlmaWVkLlxyXG4gICAgICAvLyBIb3dldmVyLCBpdCdzIE5vcm1hbCBtb2RlLCB3aHkgb3ZlcnRoaW5rIGl0P1xyXG4gICAgICBpZDogJ08yTiBQZXRyaWZpY2F0aW9uJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIC8vIFRoZSB1c2VyIG1pZ2h0IGdldCBoaXQgYnkgYW5vdGhlciBwZXRyaWZ5aW5nIGFiaWxpdHkgYmVmb3JlIHRoZSBlZmZlY3QgZW5kcy5cclxuICAgICAgLy8gVGhlcmUncyBubyBwb2ludCBpbiBub3RpZnlpbmcgZm9yIHRoYXQuXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMTAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMk4gRWFydGhxdWFrZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI1MTUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIFRoaXMgZGVhbHMgZGFtYWdlIG9ubHkgdG8gbm9uLWZsb2F0aW5nIHRhcmdldHMuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIE8yUyAtIERlbHRhc2NhcGUgMi4wIFNhdmFnZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYyMFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzJTIFdlaWdodGVkIFdpbmcnOiAnMjNFRicsIC8vIFVuc3RhYmxlIEdyYXZpdHkgZXhwbG9zaW9ucyBvbiBwbGF5ZXJzIChhZnRlciBMb25nIERyb3ApXHJcbiAgICAnTzJTIEdyYXZpdGF0aW9uYWwgRXhwbG9zaW9uIDEnOiAnMjM2NycsIC8vIGZhaWxpbmcgRm91ciBGb2xkIFNhY3JpZmljZSA0IHBlcnNvbiBzdGFja1xyXG4gICAgJ08yUyBHcmF2aXRhdGlvbmFsIEV4cGxvc2lvbiAyJzogJzIzNjgnLCAvLyBmYWlsaW5nIEZvdXIgRm9sZCBTYWNyaWZpY2UgNCBwZXJzb24gc3RhY2tcclxuICAgICdPMlMgTWFpbiBRdWFrZSc6ICcyMzU5JywgLy8gdW50ZWxlZ3JhcGhlZCBleHBsb3Npb25zIGZyb20gZXBpY2VudGVyIHRlbnRhY2xlc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnTzJTIFN0b25lIEN1cnNlJzogJzU4OScsIC8vIGZhaWxpbmcgRGVhdGgncyBHYXplIG9yIHRha2luZyB0b28gbWFueSB0YW5rYnVzdGVyIHN0YWNrc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gZ3JvdW5kIGJsdWUgYXJlbmEgY2lyY2xlczsgKHByb2JhYmx5Pykgb25seSBkbyBkYW1hZ2UgaWYgbm90IGZsb2F0aW5nXHJcbiAgICAgIC8vIFRPRE86IHVzdWFsbHkgdGhpcyBqdXN0IGRvZXNuJ3QgaGl0IGFueWJvZHkgYXQgYWxsLCBkdWUgdG8gcGF0dGVybnMuXHJcbiAgICAgIC8vIEZsb2F0aW5nIG92ZXIgb25lIGlzIHVudGVzdGVkLlxyXG4gICAgICBpZDogJ08yUyBQZXRyb3NwaGVyZSBFeHBsb3Npb24nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDVEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gZmxvYXRpbmcgeWVsbG93IGFyZW5hIGNpcmNsZXM7IG9ubHkgZG8gZGFtYWdlIGlmIGZsb2F0aW5nXHJcbiAgICAgIGlkOiAnTzJTIFBvdGVudCBQZXRyb3NwaGVyZSBFeHBsb3Npb24nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyMzYyJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gTXVzdCBiZSBmbG9hdGluZyB0byBzdXJ2aXZlOyBoaXRzIGV2ZXJ5b25lIGJ1dCBvbmx5IGRvZXMgZGFtYWdlIGlmIG5vdCBmbG9hdGluZy5cclxuICAgICAgaWQ6ICdPMlMgRWFydGhxdWFrZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI0N0EnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBpbml0aWFsaXplZD86IGJvb2xlYW47XHJcbiAgcGhhc2VOdW1iZXI/OiBudW1iZXI7XHJcbiAgZ2FtZUNvdW50PzogbnVtYmVyO1xyXG59XHJcblxyXG4vLyBPM04gLSBEZWx0YXNjYXBlIDMuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWMzAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08zTiBTcGVsbGJsYWRlIEZpcmUgSUlJJzogJzI0NjAnLCAvLyBEb251dCBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gU3BlbGxibGFkZSBCbGl6emFyZCBJSUknOiAnMjQ2MScsIC8vIENpcmNsZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gU3BlbGxibGFkZSBUaHVuZGVyIElJSSc6ICcyNDYyJywgLy8gTGluZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gQ3Jvc3MgUmVhcGVyJzogJzI0NkInLCAvLyBDaXJjbGUgQW9FLCBTb3VsIFJlYXBlclxyXG4gICAgJ08zTiBHdXN0aW5nIEdvdWdlJzogJzI0NkMnLCAvLyBHcmVlbiBsaW5lIEFvRSwgU291bCBSZWFwZXJcclxuICAgICdPM04gU3dvcmQgRGFuY2UnOiAnMjQ3MCcsIC8vIFRhcmdldGVkIHRoaW4gY29uZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gVXBsaWZ0JzogJzI0NzMnLCAvLyBHcm91bmQgc3BlYXJzLCBRdWVlbidzIFdhbHR6IGVmZmVjdCwgSGFsaWNhcm5hc3N1c1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ08zTiBVbHRpbXVtJzogJzI0NzcnLCAvLyBJbnN0YW50IGtpbGwuIFVzZWQgaWYgdGhlIHBsYXllciBkb2VzIG5vdCBleGl0IHRoZSBzYW5kIG1hemUgZmFzdCBlbm91Z2guXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPM04gSG9seSBCbHVyJzogJzI0NjMnLCAvLyBTcHJlYWQgY2lyY2xlcy5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzNOIFBoYXNlIFRyYWNrZXInLFxyXG4gICAgICB0eXBlOiAnU3RhcnRzVXNpbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGlrYXJuYXNzb3MnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGljYXJuYXNzZScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICflk4jliKnljaHnurPoi4/mlq8nLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ+2VoOumrOy5tOultOuCmOyGjOyKpCcsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiBkYXRhLnBoYXNlTnVtYmVyID0gKGRhdGEucGhhc2VOdW1iZXIgPz8gMCkgKyAxLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlcmUncyBhIGxvdCB0byB0cmFjaywgYW5kIGluIG9yZGVyIHRvIG1ha2UgaXQgYWxsIGNsZWFuLCBpdCdzIHNhZmVzdCBqdXN0IHRvXHJcbiAgICAgIC8vIGluaXRpYWxpemUgaXQgYWxsIHVwIGZyb250IGluc3RlYWQgb2YgdHJ5aW5nIHRvIGd1YXJkIGFnYWluc3QgdW5kZWZpbmVkIGNvbXBhcmlzb25zLlxyXG4gICAgICBpZDogJ08zTiBJbml0aWFsaXppbmcnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICdIYWxpa2FybmFzc29zJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAnSGFsaWNhcm5hc3NlJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn5ZOI5Yip5Y2h57qz6IuP5pavJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn7ZWg66as7Lm066W064KY7IaM7IqkJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+ICFkYXRhLmluaXRpYWxpemVkLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5nYW1lQ291bnQgPSAwO1xyXG4gICAgICAgIC8vIEluZGV4aW5nIHBoYXNlcyBhdCAxIHNvIGFzIHRvIG1ha2UgcGhhc2VzIG1hdGNoIHdoYXQgaHVtYW5zIGV4cGVjdC5cclxuICAgICAgICAvLyAxOiBXZSBzdGFydCBoZXJlLlxyXG4gICAgICAgIC8vIDI6IENhdmUgcGhhc2Ugd2l0aCBVcGxpZnRzLlxyXG4gICAgICAgIC8vIDM6IFBvc3QtaW50ZXJtaXNzaW9uLCB3aXRoIGdvb2QgYW5kIGJhZCBmcm9ncy5cclxuICAgICAgICBkYXRhLnBoYXNlTnVtYmVyID0gMTtcclxuICAgICAgICBkYXRhLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzNOIFJpYmJpdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQ2NicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBXZSBETyB3YW50IHRvIGJlIGhpdCBieSBUb2FkL1JpYmJpdCBpZiB0aGUgbmV4dCBjYXN0IG9mIFRoZSBHYW1lXHJcbiAgICAgICAgLy8gaXMgNHggdG9hZCBwYW5lbHMuXHJcbiAgICAgICAgY29uc3QgZ2FtZUNvdW50ID0gZGF0YS5nYW1lQ291bnQgPz8gMDtcclxuICAgICAgICByZXR1cm4gIShkYXRhLnBoYXNlTnVtYmVyID09PSAzICYmIGdhbWVDb3VudCAlIDIgPT09IDApICYmIG1hdGNoZXMudGFyZ2V0SWQgIT09ICdFMDAwMDAwMCc7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXJlJ3MgYSBsb3Qgd2UgY291bGQgZG8gdG8gdHJhY2sgZXhhY3RseSBob3cgdGhlIHBsYXllciBmYWlsZWQgVGhlIEdhbWUuXHJcbiAgICAgIC8vIFdoeSBvdmVydGhpbmsgTm9ybWFsIG1vZGUsIGhvd2V2ZXI/XHJcbiAgICAgIGlkOiAnTzNOIFRoZSBHYW1lJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyBHdWVzcyB3aGF0IHlvdSBqdXN0IGxvc3Q/XHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0NkQnIH0pLFxyXG4gICAgICAvLyBJZiB0aGUgcGxheWVyIHRha2VzIG5vIGRhbWFnZSwgdGhleSBkaWQgdGhlIG1lY2hhbmljIGNvcnJlY3RseS5cclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGF0YS5nYW1lQ291bnQgPSAoZGF0YS5nYW1lQ291bnQgPz8gMCkgKyAxLFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBoYW5kbGUgUmliYml0ICgyMkY3KSwgT2luayAoMjJGOSwgaWYgZGFtYWdlKSwgU3F1ZWxjaCAoMjJGOCwgaWYgZGFtYWdlKVxyXG4vLyAgICAgICB3aGljaCBpcyBhbiBlcnJvciBleGNlcHQgZHVyaW5nIHRoZSBzZWNvbmQgZ2FtZVxyXG5cclxuLy8gTzNTIC0gRGVsdGFzY2FwZSAzLjAgU2F2YWdlXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjMwU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPM1MgU3BlbGxibGFkZSBGaXJlIElJSSc6ICcyMkVDJywgLy8gZG9udXRcclxuICAgICdPM1MgU3BlbGxibGFkZSBUaHVuZGVyIElJSSc6ICcyMkVFJywgLy8gbGluZVxyXG4gICAgJ08zUyBTcGVsbGJsYWRlIEJsaXp6YXJkIElJSSc6ICcyMkVEJywgLy8gY2lyY2xlXHJcbiAgICAnTzNTIFVwbGlmdCc6ICcyMzBEJywgLy8gbm90IHN0YW5kaW5nIG9uIGJsdWUgc3F1YXJlXHJcbiAgICAnTzNTIFNvdWwgUmVhcGVyIEd1c3RpbmcgR291Z2UnOiAnMjJGRicsIC8vIHJlYXBlciBsaW5lIGFvZSBkdXJpbmcgY2F2ZSBwaGFzZVxyXG4gICAgJ08zUyBTb3VsIFJlYXBlciBDcm9zcyBSZWFwZXInOiAnMjJGRCcsIC8vIG1pZGRsZSByZWFwZXIgY2lyY2xlXHJcbiAgICAnTzNTIFNvdWwgUmVhcGVyIFN0ZW5jaCBvZiBEZWF0aCc6ICcyMkZFJywgLy8gb3V0c2lkZSByZWFwZXJzIChkdXJpbmcgZmluYWwgcGhhc2UpXHJcbiAgICAnTzNTIEFwYW5kYSBNYWdpYyBIYW1tZXInOiAnMjMxNScsIC8vIGJvb2tzIHBoYXNlIG1hZ2ljIGhhbW1lciBjaXJjbGVcclxuICAgICdPM1MgQnJpYXIgVGhvcm4nOiAnMjMwOScsIC8vIG5vdCBicmVha2luZyB0ZXRoZXJzIGZhc3QgZW5vdWdoXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPM1MgSG9seSBFZGdlJzogJzIyRjAnLCAvLyBTcGVsbGJsYWRlIEhvbHkgc3ByZWFkXHJcbiAgICAnTzNTIFN3b3JkIERhbmNlJzogJzIzMDcnLCAvLyBwcm90ZWFuIHdhdmVcclxuICAgICdPM1MgR3JlYXQgRHJhZ29uIEZyb3N0IEJyZWF0aCc6ICcyMzEyJywgLy8gdGFuayBjbGVhdmUgZnJvbSBHcmVhdCBEcmFnb25cclxuICAgICdPM1MgSXJvbiBHaWFudCBHcmFuZCBTd29yZCc6ICcyMzE2JywgLy8gdGFuayBjbGVhdmUgZnJvbSBJcm9uIEdpYW50XHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdPM1MgRm9saW8nOiAnMjMwRicsIC8vIGJvb2tzIGJvb2tzIGJvb2tzXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ08zUyBIb2x5IEJsdXInOiAnMjJGMScsIC8vIFNwZWxsYmxhZGUgSG9seSBzdGFja1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gRXZlcnlib2R5IGdldHMgaGl0cyBieSB0aGlzLCBidXQgaXQncyBvbmx5IGEgZmFpbHVyZSBpZiBpdCBkb2VzIGRhbWFnZS5cclxuICAgICAgaWQ6ICdPM1MgVGhlIEdhbWUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyMzAxJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBPNE4gLSBEZWx0YXNjYXBlIDQuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWNDAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ080TiBCbGl6emFyZCBJSUknOiAnMjRCQycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBFeGRlYXRoXHJcbiAgICAnTzROIEVtcG93ZXJlZCBUaHVuZGVyIElJSSc6ICcyNEMxJywgLy8gVW50ZWxlZ3JhcGhlZCBsYXJnZSBjaXJjbGUgQW9FLCBFeGRlYXRoXHJcbiAgICAnTzROIFpvbWJpZSBCcmVhdGgnOiAnMjRDQicsIC8vIENvbmFsLCB0cmVlIGhlYWQgYWZ0ZXIgRGVjaXNpdmUgQmF0dGxlXHJcbiAgICAnTzROIENsZWFyb3V0JzogJzI0Q0MnLCAvLyBPdmVybGFwcGluZyBjb25lIEFvRXMsIERlYXRobHkgVmluZSAodGVudGFjbGVzIGFsb25nc2lkZSB0cmVlIGhlYWQpXHJcbiAgICAnTzROIEJsYWNrIFNwYXJrJzogJzI0QzknLCAvLyBFeHBsb2RpbmcgQmxhY2sgSG9sZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBFbXBvd2VyZWQgRmlyZSBJSUkgaW5mbGljdHMgdGhlIFB5cmV0aWMgZGVidWZmLCB3aGljaCBkZWFscyBkYW1hZ2UgaWYgdGhlIHBsYXllclxyXG4gICAgLy8gbW92ZXMgb3IgYWN0cyBiZWZvcmUgdGhlIGRlYnVmZiBmYWxscy4gVW5mb3J0dW5hdGVseSBpdCBkb2Vzbid0IGxvb2sgbGlrZSB0aGVyZSdzXHJcbiAgICAvLyBjdXJyZW50bHkgYSBsb2cgbGluZSBmb3IgdGhpcywgc28gdGhlIG9ubHkgd2F5IHRvIGNoZWNrIGZvciB0aGlzIGlzIHRvIGNvbGxlY3RcclxuICAgIC8vIHRoZSBkZWJ1ZmZzIGFuZCB0aGVuIHdhcm4gaWYgYSBwbGF5ZXIgdGFrZXMgYW4gYWN0aW9uIGR1cmluZyB0aGF0IHRpbWUuIE5vdCB3b3J0aCBpdFxyXG4gICAgLy8gZm9yIE5vcm1hbC5cclxuICAgICdPNE4gU3RhbmRhcmQgRmlyZSc6ICcyNEJBJyxcclxuICAgICdPNE4gQnVzdGVyIFRodW5kZXInOiAnMjRCRScsIC8vIEEgY2xlYXZpbmcgdGFuayBidXN0ZXJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEtpbGxzIHRhcmdldCBpZiBub3QgY2xlYW5zZWRcclxuICAgICAgaWQ6ICdPNE4gRG9vbScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0NsZWFuc2VycyBtaXNzZWQgRG9vbSEnLFxyXG4gICAgICAgICAgICBkZTogJ0Rvb20tUmVpbmlndW5nIHZlcmdlc3NlbiEnLFxyXG4gICAgICAgICAgICBmcjogJ05cXCdhIHBhcyDDqXTDqSBkaXNzaXDDqShlKSBkdSBHbGFzICEnLFxyXG4gICAgICAgICAgICBqYTogJ+atu+OBruWuo+WRiicsXHJcbiAgICAgICAgICAgIGNuOiAn5rKh6Kej5q275a6jJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFNob3J0IGtub2NrYmFjayBmcm9tIEV4ZGVhdGhcclxuICAgICAgaWQ6ICdPNE4gVmFjdXVtIFdhdmUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNEI4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1B1c2hlZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VzY2h1YnN0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBwb3Vzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+iQveOBoeOBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFJvb20td2lkZSBBb0UsIGZyZWV6ZXMgbm9uLW1vdmluZyB0YXJnZXRzXHJcbiAgICAgIGlkOiAnTzROIEVtcG93ZXJlZCBCbGl6emFyZCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0RTYnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBOZXRNYXRjaGVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvbmV0X21hdGNoZXMnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG4vLyBUT0RPOiB0YWtpbmcgdGhlIHdyb25nIGNvbG9yIHdoaXRlL2JsYWNrIGFudGlsaWdodFxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBpc0RlY2lzaXZlQmF0dGxlRWxlbWVudD86IGJvb2xlYW47XHJcbiAgaXNOZW9FeGRlYXRoPzogYm9vbGVhbjtcclxuICBoYXNCZXlvbmREZWF0aD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBkb3VibGVBdHRhY2tNYXRjaGVzPzogTmV0TWF0Y2hlc1snQWJpbGl0eSddW107XHJcbn1cclxuXHJcbi8vIE80UyAtIERlbHRhc2NhcGUgNC4wIFNhdmFnZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVY0MFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzRTMSBWaW5lIENsZWFyb3V0JzogJzI0MEMnLCAvLyBjaXJjbGUgb2YgdmluZXNcclxuICAgICdPNFMxIFpvbWJpZSBCcmVhdGgnOiAnMjQwQicsIC8vIHRyZWUgZXhkZWF0aCBjb25hbFxyXG4gICAgJ080UzEgVmFjdXVtIFdhdmUnOiAnMjNGRScsIC8vIGNpcmNsZSBjZW50ZXJlZCBvbiBleGRlYXRoXHJcbiAgICAnTzRTMiBOZW8gVmFjdXVtIFdhdmUnOiAnMjQxRCcsIC8vIFwib3V0IG9mIG1lbGVlXCJcclxuICAgICdPNFMyIERlYXRoIEJvbWInOiAnMjQzMScsIC8vIGZhaWxlZCBhY2NlbGVyYXRpb24gYm9tYlxyXG4gICAgJ080UzIgRW1wdGluZXNzIDEnOiAnMjQyMScsIC8vIGV4YWZsYXJlcyBpbml0aWFsXHJcbiAgICAnTzRTMiBFbXB0aW5lc3MgMic6ICcyNDIyJywgLy8gZXhhZmxhcmVzIG1vdmluZ1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ080UzEgQmxhY2sgSG9sZSBCbGFjayBTcGFyayc6ICcyNDA3JywgLy8gYmxhY2sgaG9sZSBjYXRjaGluZyB5b3VcclxuICAgICdPNFMyIEVkZ2UgT2YgRGVhdGgnOiAnMjQxNScsIC8vIHN0YW5kaW5nIGJldHdlZW4gdGhlIHR3byBjb2xvciBsYXNlcnNcclxuICAgICdPNFMyIElubmVyIEFudGlsaWdodCc6ICcyNDRDJywgLy8gaW5uZXIgbGFzZXJcclxuICAgICdPNFMyIE91dGVyIEFudGlsaWdodCc6ICcyNDEwJywgLy8gb3V0ZXIgbGFzZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ080UzEgRmlyZSBJSUknOiAnMjNGNicsIC8vIHNwcmVhZCBleHBsb3Npb25cclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ080UzEgVGh1bmRlciBJSUknOiAnMjNGQScsIC8vIHRhbmtidXN0ZXJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBEZWNpc2l2ZSBCYXR0bGUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0MDgnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMxIFZhY3V1bSBXYXZlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcyM0ZFJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50ID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQWxtYWdlc3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0MTcnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuaXNOZW9FeGRlYXRoID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCbGl6emFyZCBJSUknLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyM0Y4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBJZ25vcmUgdW5hdm9pZGFibGUgcmFpZCBhb2UgQmxpenphcmQgSUlJLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhKSA9PiAhZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIFRodW5kZXIgSUlJJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjNGRCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gT25seSBjb25zaWRlciB0aGlzIGR1cmluZyByYW5kb20gbWVjaGFuaWMgYWZ0ZXIgZGVjaXNpdmUgYmF0dGxlLlxyXG4gICAgICBjb25kaXRpb246IChkYXRhKSA9PiBkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgUGV0cmlmaWVkJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gT24gTmVvLCBiZWluZyBwZXRyaWZpZWQgaXMgYmVjYXVzZSB5b3UgbG9va2VkIGF0IFNocmllaywgc28geW91ciBmYXVsdC5cclxuICAgICAgICBpZiAoZGF0YS5pc05lb0V4ZGVhdGgpXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgICAvLyBPbiBub3JtYWwgRXhEZWF0aCwgdGhpcyBpcyBkdWUgdG8gV2hpdGUgSG9sZS5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIG5hbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEZvcmtlZCBMaWdodG5pbmcnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDJFJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgQmV5b25kIERlYXRoIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGggTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGgnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aClcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IG1hdGNoZXMuZWZmZWN0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgRG91YmxlIEF0dGFjayBDb2xsZWN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjQxQycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcyA9IGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcyB8fCBbXTtcclxuICAgICAgICBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXMucHVzaChtYXRjaGVzKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBEb3VibGUgQXR0YWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjQxQycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEpID0+IHtcclxuICAgICAgICBjb25zdCBhcnIgPSBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXM7XHJcbiAgICAgICAgaWYgKCFhcnIpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKGFyci5sZW5ndGggPD0gMilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAvLyBIYXJkIHRvIGtub3cgd2hvIHNob3VsZCBiZSBpbiB0aGlzIGFuZCB3aG8gc2hvdWxkbid0LCBidXRcclxuICAgICAgICAvLyBpdCBzaG91bGQgbmV2ZXIgaGl0IDMgcGVvcGxlLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgdGV4dDogYCR7YXJyWzBdPy5hYmlsaXR5ID8/ICcnfSB4ICR7YXJyLmxlbmd0aH1gIH07XHJcbiAgICAgIH0sXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IGRlbGV0ZSBkYXRhLmRvdWJsZUF0dGFja01hdGNoZXMsXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IG1pc3NpbmcgbWFueSBhYmlsaXRpZXMgaGVyZVxyXG5cclxuLy8gTzdTIC0gU2lnbWFzY2FwZSAzLjAgU2F2YWdlXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5TaWdtYXNjYXBlVjMwU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPN1MgU2VhcmluZyBXaW5kJzogJzI3NzcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ083UyBNaXNzaWxlJzogJzI3ODInLFxyXG4gICAgJ083UyBDaGFpbiBDYW5ub24nOiAnMjc4RicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ083UyBTdG9uZXNraW4nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzJBQjUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnNvdXJjZSwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBPOU4gLSBBbHBoYXNjYXBlIDEuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFscGhhc2NhcGVWMTAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ085TiBEYW1uaW5nIEVkaWN0JzogJzMxNTAnLCAvLyBodWdlIDE4MCBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ085TiBTdHJheSBTcHJheSc6ICczMTZDJywgLy8gRHluYW1pYyBGbHVpZCBkZWJ1ZmYgZG9udXQgZXhwbG9zaW9uXHJcbiAgICAnTzlOIFN0cmF5IEZsYW1lcyc6ICczMTZCJywgLy8gRW50cm9weSBkZWJ1ZmYgY2lyY2xlIGV4cGxvc2lvblxyXG4gICAgJ085TiBLbm9ja2Rvd24gQmlnIEJhbmcnOiAnMzE2MCcsIC8vIGJpZyBjaXJjbGUgd2hlcmUgS25vY2tkb3duIG1hcmtlciBkcm9wcGVkXHJcbiAgICAnTzlOIEZpcmUgQmlnIEJhbmcnOiAnMzE1RicsIC8vIGdyb3VuZCBjaXJjbGVzIGR1cmluZyBmaXJlIHBoYXNlXHJcbiAgICAnTzlOIFNob2Nrd2F2ZSc6ICczMTUzJywgLy8gTG9uZ2l0dWRpbmFsL0xhdGl1ZGluYWwgSW1wbG9zaW9uXHJcbiAgICAnTzlOIENoYW9zcGhlcmUgRmllbmRpc2ggT3JicyBPcmJzaGFkb3cgMSc6ICczMTYyJywgLy8gbGluZSBhb2VzIGZyb20gRWFydGggcGhhc2Ugb3Jic1xyXG4gICAgJ085TiBDaGFvc3BoZXJlIEZpZW5kaXNoIE9yYnMgT3Jic2hhZG93IDInOiAnMzE2MycsIC8vIGxpbmUgYW9lcyBmcm9tIEVhcnRoIHBoYXNlIG9yYnNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogQWtoIFJoYWkgKDM2MjQpIGlzIG5vdCB1bnVzdWFsIHRvIHRha2UgfjEgaGl0IGZyb20sIHNvIGRvbid0IGxpc3QuXHJcblxyXG4vLyBPMTBOIC0gQWxwaGFzY2FwZSAyLjAgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbHBoYXNjYXBlVjIwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMTBOIEF6dXJlIFdpbmdzJzogJzMxQ0QnLCAvLyBPdXRcclxuICAgICdPMTBOIFN0eWdpYW4gTWF3JzogJzMxQ0YnLCAvLyBJblxyXG4gICAgJ08xME4gSG9ycmlkIFJvYXInOiAnMzFEMycsIC8vIHRhcmdldGVkIGNpcmNsZXNcclxuICAgICdPMTBOIEJsb29kaWVkIE1hdyc6ICczMUQwJywgLy8gQ29ybmVyc1xyXG4gICAgJ08xME4gQ2F1dGVyaXplJzogJzMyNDEnLCAvLyBkaXZlYm9tYiBhdHRhY2tcclxuICAgICdPMTBOIFNjYXJsZXQgVGhyZWFkJzogJzM2MkInLCAvLyBvcmIgd2FmZmxlIGxpbmVzXHJcbiAgICAnTzEwTiBFeGFmbGFyZSAxJzogJzM2MkQnLFxyXG4gICAgJ08xME4gRXhhZmxhcmUgMic6ICczNjJGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08xME4gRWFydGggU2hha2VyJzogJzMxRDEnLCAvLyBhcyBpdCBzYXlzIG9uIHRoZSB0aW5cclxuICAgICdPMTBOIEZyb3N0IEJyZWF0aCc6ICczM0VFJywgLy8gQW5jaWVudCBEcmFnb24gZnJvbnRhbCBjb25hbFxyXG4gICAgJ08xME4gVGh1bmRlcnN0b3JtJzogJzMxRDInLCAvLyBwdXJwbGUgc3ByZWFkIG1hcmtlclxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBPMTFOIC0gQWxwaGFzY2FwZSAzLjAgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbHBoYXNjYXBlVjMwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMTFOIFN0YXJib2FyZCBXYXZlIENhbm5vbiAxJzogJzMyODEnLCAvLyBpbml0aWFsIHJpZ2h0IGNsZWF2ZVxyXG4gICAgJ08xMU4gU3RhcmJvYXJkIFdhdmUgQ2Fubm9uIDInOiAnMzI4MicsIC8vIGZvbGxvdy11cCByaWdodCBjbGVhdmVcclxuICAgICdPMTFOIExhcmJvYXJkIFdhdmUgQ2Fubm9uIDEnOiAnMzI4MycsIC8vIGluaXRpYWwgbGVmdCBjbGVhdmVcclxuICAgICdPMTFOIExhcmJvYXJkIFdhdmUgQ2Fubm9uIDInOiAnMzI4NCcsIC8vIGZvbGxvdy11cCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ08xMU4gRmxhbWUgVGhyb3dlcic6ICczMjdEJywgLy8gcGlud2hlZWwgY29uYWxzXHJcbiAgICAnTzExTiBDcml0aWNhbCBTdG9yYWdlIFZpb2xhdGlvbic6ICczMjc5JywgLy8gbWlzc2luZyBtaWRwaGFzZSB0b3dlcnNcclxuICAgICdPMTFOIExldmVsIENoZWNrZXIgUmVzZXQnOiAnMzVBQScsIC8vIFwiZ2V0IG91dFwiIGNpcmNsZVxyXG4gICAgJ08xMU4gTGV2ZWwgQ2hlY2tlciBSZWZvcm1hdCc6ICczNUE5JywgLy8gXCJnZXQgaW5cIiBkb251dFxyXG4gICAgJ08xMU4gUm9ja2V0IFB1bmNoIFJ1c2gnOiAnMzYwNicsIC8vIGdpYW50IGhhbmQgMS8zIGFyZW5hIGxpbmUgYW9lc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnTzExTiBCdXJucyc6ICdGQScsIC8vIHN0YW5kaW5nIGluIGJhbGxpc3RpYyBtaXNzaWxlIGZpcmUgcHVkZGxlXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdPMTFOIE1lbW9yeSBMb3NzJzogJzY1QScsIC8vIGZhaWxpbmcgdG8gY2xlYW5zZSBMb29wZXIgaW4gYSB0b3dlclxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnTzExTiBCYWxsaXN0aWMgSW1wYWN0JzogJzMyN0YnLCAvLyBzcHJlYWQgbWFya2Vyc1xyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnTzExTiBCbGFzdGVyJzogJzMyODAnLCAvLyB0YW5rIHRldGhlclxyXG4gIH0sXHJcbiAgc29sb0ZhaWw6IHtcclxuICAgICdPMTFOIEVsZWN0cmljIFNsaWRlJzogJzMyODUnLCAvLyBzdGFjayBtYXJrZXJcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBPMTJOIC0gQWxwaGFzY2FwZSA0LjAgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbHBoYXNjYXBlVjQwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMTJOIEZsb29kbGlnaHQnOiAnMzMwOScsIC8vIHRhcmdldGVkIGNpcmN1bGFyIGFvZXMgYWZ0ZXIgUHJvZ3JhbSBBbHBoYVxyXG4gICAgJ08xMk4gRWZmaWNpZW50IEJsYWRld29yayc6ICczMkZGJywgLy8gdGVsZWdyYXBoZWQgY2VudGVyZWQgY2lyY2xlXHJcbiAgICAnTzEyTiBFZmZpY2llbnQgQmxhZGV3b3JrIFVudGVsZWdyYXBoZWQnOiAnMzJGMycsIC8vIGNlbnRlcmVkIGNpcmNsZSBhZnRlciB0cmFuc2Zvcm1hdGlvblxyXG4gICAgJ08xMk4gT3B0aW1pemVkIEJsaXp6YXJkIElJSSc6ICczMzAzJywgLy8gY3Jvc3MgYW9lXHJcbiAgICAnTzEyTiBTdXBlcmxpbWluYWwgU3RlZWwgMSc6ICczMzA2JywgLy8gc2lkZXMgb2YgdGhlIHJvb21cclxuICAgICdPMTJOIFN1cGVybGltaW5hbCBTdGVlbCAyJzogJzMzMDcnLCAvLyBzaWRlcyBvZiB0aGUgcm9vbVxyXG4gICAgJ08xMk4gQmV5b25kIFN0cmVuZ3RoJzogJzMzMDAnLCAvLyBkb251dFxyXG4gICAgJ08xMk4gT3B0aWNhbCBMYXNlcic6ICczMzIwJywgLy8gbGluZSBhb2UgZnJvbSBleWVcclxuICAgICdPMTJOIE9wdGltaXplZCBTYWdpdHRhcml1cyBBcnJvdyc6ICczMzIzJywgLy8gbGluZSBhb2UgZnJvbSBPbWVnYS1NXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMTJOIFNvbGFyIFJheSc6ICczMzBGJywgLy8gY2lyY3VsYXIgdGFua2J1c3RlclxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgICdPMTJOIFNwb3RsaWdodCc6ICczMzBBJywgLy8gc3RhY2sgbWFya2VyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ08xMk4gRGlzY2hhcmdlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzJGNicgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIHZ1bG4/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbi8vIFRPRE86IGNvdWxkIGFkZCBQYXRjaCB3YXJuaW5ncyBmb3IgZG91YmxlL3VuYnJva2VuIHRldGhlcnNcclxuLy8gVE9ETzogSGVsbG8gV29ybGQgY291bGQgaGF2ZSBhbnkgd2FybmluZ3MgKHNvcnJ5KVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFscGhhc2NhcGVWNDBTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08xMlMxIFN1cGVybGltaW5hbCBNb3Rpb24gMSc6ICczMzM0JywgLy8gMzAwKyBkZWdyZWUgY2xlYXZlIHdpdGggYmFjayBzYWZlIGFyZWFcclxuICAgICdPMTJTMSBFZmZpY2llbnQgQmxhZGV3b3JrIDEnOiAnMzMyOScsIC8vIE9tZWdhLU0gXCJnZXQgb3V0XCIgY2VudGVyZWQgYW9lIGFmdGVyIHNwbGl0XHJcbiAgICAnTzEyUzEgRWZmaWNpZW50IEJsYWRld29yayAyJzogJzMzMkEnLCAvLyBPbWVnYS1NIFwiZ2V0IG91dFwiIGNlbnRlcmVkIGFvZSBkdXJpbmcgYmxhZGVzXHJcbiAgICAnTzEyUzEgQmV5b25kIFN0cmVuZ3RoJzogJzMzMjgnLCAvLyBPbWVnYS1NIFwiZ2V0IGluXCIgY2VudGVyZWQgYW9lIGR1cmluZyBzaGllbGRcclxuICAgICdPMTJTMSBTdXBlcmxpbWluYWwgU3RlZWwgMSc6ICczMzMwJywgLy8gT21lZ2EtRiBcImdldCBmcm9udC9iYWNrXCIgYmxhZGVzIHBoYXNlXHJcbiAgICAnTzEyUzEgU3VwZXJsaW1pbmFsIFN0ZWVsIDInOiAnMzMzMScsIC8vIE9tZWdhLUYgXCJnZXQgZnJvbnQvYmFja1wiIGJsYWRlcyBwaGFzZVxyXG4gICAgJ08xMlMxIE9wdGltaXplZCBCbGl6emFyZCBJSUknOiAnMzMzMicsIC8vIE9tZWdhLUYgZ2lhbnQgY3Jvc3NcclxuICAgICdPMTJTMiBEaWZmdXNlIFdhdmUgQ2Fubm9uJzogJzMzNjknLCAvLyBiYWNrL3NpZGVzIGxhc2Vyc1xyXG4gICAgJ08xMlMyIFJpZ2h0IEFybSBVbml0IEh5cGVyIFB1bHNlIDEnOiAnMzM1QScsIC8vIFJvdGF0aW5nIEFyY2hpdmUgUGVyaXBoZXJhbCBsYXNlcnNcclxuICAgICdPMTJTMiBSaWdodCBBcm0gVW5pdCBIeXBlciBQdWxzZSAyJzogJzMzNUInLCAvLyBSb3RhdGluZyBBcmNoaXZlIFBlcmlwaGVyYWwgbGFzZXJzXHJcbiAgICAnTzEyUzIgUmlnaHQgQXJtIFVuaXQgQ29sb3NzYWwgQmxvdyc6ICczMzVGJywgLy8gRXhwbG9kaW5nIEFyY2hpdmUgQWxsIGhhbmRzXHJcbiAgICAnTzEyUzIgTGVmdCBBcm0gVW5pdCBDb2xvc3NhbCBCbG93JzogJzMzNjAnLCAvLyBFeHBsb2RpbmcgQXJjaGl2ZSBBbGwgaGFuZHNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPMTJTMSBPcHRpY2FsIExhc2VyJzogJzMzNDcnLCAvLyBtaWRkbGUgbGFzZXIgZnJvbSBleWVcclxuICAgICdPMTJTMSBBZHZhbmNlZCBPcHRpY2FsIExhc2VyJzogJzMzNEEnLCAvLyBnaWFudCBjaXJjbGUgY2VudGVyZWQgb24gZXllXHJcbiAgICAnTzEyUzIgUmVhciBQb3dlciBVbml0IFJlYXIgTGFzZXJzIDEnOiAnMzM2MScsIC8vIEFyY2hpdmUgQWxsIGluaXRpYWwgbGFzZXJcclxuICAgICdPMTJTMiBSZWFyIFBvd2VyIFVuaXQgUmVhciBMYXNlcnMgMic6ICczMzYyJywgLy8gQXJjaGl2ZSBBbGwgcm90YXRpbmcgbGFzZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08xMlMxIE9wdGltaXplZCBGaXJlIElJSSc6ICczMzM3JywgLy8gZmlyZSBzcHJlYWRcclxuICAgICdPMTJTMiBIeXBlciBQdWxzZSBUZXRoZXInOiAnMzM1QycsIC8vIEluZGV4IEFuZCBBcmNoaXZlIFBlcmlwaGVyYWwgdGV0aGVyc1xyXG4gICAgJ08xMlMyIFdhdmUgQ2Fubm9uJzogJzMzNkInLCAvLyBJbmRleCBBbmQgQXJjaGl2ZSBQZXJpcGhlcmFsIGJhaXRlZCBsYXNlcnNcclxuICAgICdPMTJTMiBPcHRpbWl6ZWQgRmlyZSBJSUknOiAnMzM3OScsIC8vIEFyY2hpdmUgQWxsIHNwcmVhZFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnTzEyUzEgT3B0aW1pemVkIFNhZ2l0dGFyaXVzIEFycm93JzogJzMzNEQnLCAvLyBPbWVnYS1NIGJhcmQgbGltaXQgYnJlYWtcclxuICAgICdPMTJTMiBPdmVyc2FtcGxlZCBXYXZlIENhbm5vbic6ICczMzY2JywgLy8gTW9uaXRvciB0YW5rIGJ1c3RlcnNcclxuICAgICdPMTJTMiBTYXZhZ2UgV2F2ZSBDYW5ub24nOiAnMzM2RCcsIC8vIFRhbmsgYnVzdGVyIHdpdGggdGhlIHZ1bG4gZmlyc3RcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgRGlzY2hhcmdlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzMyNycgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgTWFnaWMgVnVsbmVyYWJpbGl0eSBVcCBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ3MicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnZ1bG4gPz89IHt9O1xyXG4gICAgICAgIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMTJTMSBNYWdpYyBWdWxuZXJhYmlsaXR5IFVwIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDcyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEudnVsbiA9IGRhdGEudnVsbiB8fCB7fTtcclxuICAgICAgICBkYXRhLnZ1bG5bbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgRGFtYWdlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyAzMzJFID0gUGlsZSBQaXRjaCBzdGFja1xyXG4gICAgICAvLyAzMzNFID0gRWxlY3RyaWMgU2xpZGUgKE9tZWdhLU0gc3F1YXJlIDEtNCBkYXNoZXMpXHJcbiAgICAgIC8vIDMzM0YgPSBFbGVjdHJpYyBTbGlkZSAoT21lZ2EtRiB0cmlhbmdsZSAxLTQgZGFzaGVzKVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzMzMkUnLCAnMzMzRScsICczMzNGJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS52dWxuICYmIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh3aXRoIHZ1bG4pYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKG1pdCBWZXJ3dW5kYmFya2VpdClgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6KKr44OA44Oh44O844K45LiK5piHKWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjluKbmmJPkvKQpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gQnlha2tvIEV4dHJlbWVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUphZGVTdG9hRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBQb3BwaW5nIFVucmVsZW50aW5nIEFuZ3Vpc2ggYnViYmxlc1xyXG4gICAgJ0J5YUV4IEFyYXRhbWEnOiAnMjdGNicsXHJcbiAgICAvLyBTdGVwcGluZyBpbiBncm93aW5nIG9yYlxyXG4gICAgJ0J5YUV4IFZhY3V1bSBDbGF3JzogJzI3RTknLFxyXG4gICAgLy8gTGlnaHRuaW5nIFB1ZGRsZXNcclxuICAgICdCeWFFeCBIdW5kZXJmb2xkIEhhdm9jIDEnOiAnMjdFNScsXHJcbiAgICAnQnlhRXggSHVuZGVyZm9sZCBIYXZvYyAyJzogJzI3RTYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0J5YUV4IFN3ZWVwIFRoZSBMZWcnOiAnMjdEQicsXHJcbiAgICAnQnlhRXggRmlyZSBhbmQgTGlnaHRuaW5nJzogJzI3REUnLFxyXG4gICAgJ0J5YUV4IERpc3RhbnQgQ2xhcCc6ICcyN0REJyxcclxuICAgIC8vIE1pZHBoYXNlIGxpbmUgYXR0YWNrXHJcbiAgICAnQnlhRXggSW1wZXJpYWwgR3VhcmQnOiAnMjdGMScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBQaW5rIGJ1YmJsZSBjb2xsaXNpb25cclxuICAgICAgaWQ6ICdCeWFFeCBPbWlub3VzIFdpbmQnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyN0VDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2J1YmJsZSBjb2xsaXNpb24nLFxyXG4gICAgICAgICAgICBkZTogJ0JsYXNlbiBzaW5kIHp1c2FtbWVuZ2VzdG/Dn2VuJyxcclxuICAgICAgICAgICAgZnI6ICdjb2xsaXNpb24gZGUgYnVsbGVzJyxcclxuICAgICAgICAgICAgamE6ICfooZ3nqoEnLFxyXG4gICAgICAgICAgICBjbjogJ+ebuOaSnicsXHJcbiAgICAgICAgICAgIGtvOiAn7J6l7YyQIOqyueyzkOyEnCDthLDsp5AnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTaGlucnl1IE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUm95YWxNZW5hZ2VyaWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NoaW5yeXUgQWtoIFJoYWknOiAnMUZBNicsIC8vIFNreSBsYXNlcnMgYWxvbmdzaWRlIEFraCBNb3JuLlxyXG4gICAgJ1NoaW5yeXUgQmxhemluZyBUcmFpbCc6ICcyMjFBJywgLy8gUmVjdGFuZ2xlIEFvRXMsIGludGVybWlzc2lvbiBhZGRzLlxyXG4gICAgJ1NoaW5yeXUgQ29sbGFwc2UnOiAnMjIxOCcsIC8vIENpcmNsZSBBb0VzLCBpbnRlcm1pc3Npb24gYWRkc1xyXG4gICAgJ1NoaW5yeXUgRHJhZ29uZmlzdCc6ICcyNEYwJywgLy8gR2lhbnQgcHVuY2h5IGNpcmNsZSBpbiB0aGUgY2VudGVyLlxyXG4gICAgJ1NoaW5yeXUgRWFydGggQnJlYXRoJzogJzFGOUQnLCAvLyBDb25hbCBhdHRhY2tzIHRoYXQgYXJlbid0IGFjdHVhbGx5IEVhcnRoIFNoYWtlcnMuXHJcbiAgICAnU2hpbnJ5dSBHeXJlIENoYXJnZSc6ICcxRkE4JywgLy8gR3JlZW4gZGl2ZSBib21iIGF0dGFjay5cclxuICAgICdTaGlucnl1IFNwaWtlc2ljbGUnOiAnMUZBYCcsIC8vIEJsdWUtZ3JlZW4gbGluZSBhdHRhY2tzIGZyb20gYmVoaW5kLlxyXG4gICAgJ1NoaW5yeXUgVGFpbCBTbGFwJzogJzFGOTMnLCAvLyBSZWQgc3F1YXJlcyBpbmRpY2F0aW5nIHRoZSB0YWlsJ3MgbGFuZGluZyBzcG90cy5cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1NoaW5yeXUgTGV2aW5ib2x0JzogJzFGOUMnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSWN5IGZsb29yIGF0dGFjay5cclxuICAgICAgaWQ6ICdTaGlucnl1IERpYW1vbmQgRHVzdCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFRoaW4gSWNlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEYnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1NsaWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlcnV0c2NodCEnLFxyXG4gICAgICAgICAgICBmcjogJ0EgZ2xpc3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfmu5HjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+a7keiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaW5yeXUgVGlkYWwgV2F2ZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzFGOEInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXNjaHVic3QhJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn6JC944Gh44GfJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gS25vY2tiYWNrIGZyb20gY2VudGVyLlxyXG4gICAgICBpZDogJ1NoaW5yeXUgQWVyaWFsIEJsYXN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMUY5MCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3NlciAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTdXNhbm8gRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUG9vbE9mVHJpYnV0ZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N1c0V4IENodXJuaW5nJzogJzIwM0YnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1N1c0V4IFJhc2VuIEthaWt5byc6ICcyMDJFJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTdXpha3UgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5IZWxsc0tpZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N1emFrdSBOb3JtYWwgQXNoZXMgVG8gQXNoZXMnOiAnMzIxRicsIC8vIFNjYXJsZXQgTGFkeSBhZGQsIHJhaWR3aWRlIGV4cGxvc2lvbiBpZiBub3Qga2lsbGVkIGluIHRpbWVcclxuICAgICdTdXpha3UgTm9ybWFsIEZsZWV0aW5nIFN1bW1lcic6ICczMjIzJywgLy8gQ29uZSBBb0UgKHJhbmRvbWx5IHRhcmdldGVkKVxyXG4gICAgJ1N1emFrdSBOb3JtYWwgV2luZyBBbmQgQSBQcmF5ZXInOiAnMzIyNScsIC8vIENpcmNsZSBBb0VzIGZyb20gdW5raWxsZWQgcGx1bWVzXHJcbiAgICAnU3V6YWt1IE5vcm1hbCBQaGFudG9tIEhhbGYnOiAnMzIzMycsIC8vIEdpYW50IGhhbGYtYXJlbmEgQW9FIGZvbGxvdy11cCBhZnRlciB0YW5rIGJ1c3RlclxyXG4gICAgJ1N1emFrdSBOb3JtYWwgV2VsbCBPZiBGbGFtZSc6ICczMjM2JywgLy8gTGFyZ2UgcmVjdGFuZ2xlIEFvRSAocmFuZG9tbHkgdGFyZ2V0ZWQpXHJcbiAgICAnU3V6YWt1IE5vcm1hbCBIb3RzcG90JzogJzMyMzgnLCAvLyBQbGF0Zm9ybSBmaXJlIHdoZW4gdGhlIHJ1bmVzIGFyZSBhY3RpdmF0ZWRcclxuICAgICdTdXpha3UgTm9ybWFsIFN3b29wJzogJzMyM0InLCAvLyBTdGFyIGNyb3NzIGxpbmUgQW9Fc1xyXG4gICAgJ1N1emFrdSBOb3JtYWwgQnVybic6ICczMjNEJywgLy8gVG93ZXIgbWVjaGFuaWMgZmFpbHVyZSBvbiBJbmNhbmRlc2NlbnQgSW50ZXJsdWRlIChwYXJ0eSBmYWlsdXJlLCBub3QgcGVyc29uYWwpXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdTdXpha3UgTm9ybWFsIFJla2luZGxlJzogJzMyMzUnLCAvLyBQdXJwbGUgc3ByZWFkIGNpcmNsZXNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU3V6YWt1IE5vcm1hbCBSdXRobGVzcyBSZWZyYWluJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMzIzMCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFVsdGltYSBXZWFwb24gVWx0aW1hdGVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdlYXBvbnNSZWZyYWluVWx0aW1hdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1VXVSBTZWFyaW5nIFdpbmQnOiAnMkI1QycsXHJcbiAgICAnVVdVIEVydXB0aW9uJzogJzJCNUEnLFxyXG4gICAgJ1VXVSBXZWlnaHQnOiAnMkI2NScsXHJcbiAgICAnVVdVIExhbmRzbGlkZTEnOiAnMkI3MCcsXHJcbiAgICAnVVdVIExhbmRzbGlkZTInOiAnMkI3MScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVVdVIEdyZWF0IFdoaXJsd2luZCc6ICcyQjQxJyxcclxuICAgICdVV1UgU2xpcHN0cmVhbSc6ICcyQjUzJyxcclxuICAgICdVV1UgV2lja2VkIFdoZWVsJzogJzJCNEUnLFxyXG4gICAgJ1VXVSBXaWNrZWQgVG9ybmFkbyc6ICcyQjRGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVVdVIFdpbmRidXJuJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0VCJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAyLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEZlYXRoZXJsYW5jZSBleHBsb3Npb24uICBJdCBzZWVtcyBsaWtlIHRoZSBwZXJzb24gd2hvIHBvcHMgaXQgaXMgdGhlXHJcbiAgICAgIC8vIGZpcnN0IHBlcnNvbiBsaXN0ZWQgZGFtYWdlLXdpc2UsIHNvIHRoZXkgYXJlIGxpa2VseSB0aGUgY3VscHJpdC5cclxuICAgICAgaWQ6ICdVV1UgRmVhdGhlcmxhbmNlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMkI0MycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5zb3VyY2UgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IGtGbGFnSW5zdGFudERlYXRoLCBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNEb29tPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG4vLyBVQ1UgLSBUaGUgVW5lbmRpbmcgQ29pbCBPZiBCYWhhbXV0IChVbHRpbWF0ZSlcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVVuZW5kaW5nQ29pbE9mQmFoYW11dFVsdGltYXRlLFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdVQ1UgTHVuYXIgRHluYW1vJzogJzI2QkMnLFxyXG4gICAgJ1VDVSBJcm9uIENoYXJpb3QnOiAnMjZCQicsXHJcbiAgICAnVUNVIEV4YWZsYXJlJzogJzI2RUYnLFxyXG4gICAgJ1VDVSBXaW5ncyBPZiBTYWx2YXRpb24nOiAnMjZDQScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBUd2lzdGVyIERlYXRoJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyBJbnN0YW50IGRlYXRoIGhhcyBhIHNwZWNpYWwgZmxhZyB2YWx1ZSwgZGlmZmVyZW50aWF0aW5nXHJcbiAgICAgIC8vIGZyb20gdGhlIGV4cGxvc2lvbiBkYW1hZ2UgeW91IHRha2Ugd2hlbiBzb21lYm9keSBlbHNlXHJcbiAgICAgIC8vIHBvcHMgb25lLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjZBQicsIC4uLnBsYXllckRhbWFnZUZpZWxkcywgZmxhZ3M6IGtGbGFnSW5zdGFudERlYXRoIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1R3aXN0ZXIgUG9wJyxcclxuICAgICAgICAgICAgZGU6ICdXaXJiZWxzdHVybSBiZXLDvGhydCcsXHJcbiAgICAgICAgICAgIGZyOiAnQXBwYXJpdGlvbiBkZXMgdG9ybmFkZXMnLFxyXG4gICAgICAgICAgICBqYTogJ+ODhOOCpOOCueOCv+ODvCcsXHJcbiAgICAgICAgICAgIGNuOiAn5peL6aOOJyxcclxuICAgICAgICAgICAga286ICftmozsmKTrpqwg67Cf7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIFRoZXJtaW9uaWMgQnVyc3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNkI5JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1BpenphIFNsaWNlJyxcclxuICAgICAgICAgICAgZGU6ICdQaXp6YXN0w7xjaycsXHJcbiAgICAgICAgICAgIGZyOiAnUGFydHMgZGUgcGl6emEnLFxyXG4gICAgICAgICAgICBqYTogJ+OCteODvOODn+OCquODi+ODg+OCr+ODkOODvOOCueODiCcsXHJcbiAgICAgICAgICAgIGNuOiAn5aSp5bSp5Zyw6KOCJyxcclxuICAgICAgICAgICAga286ICfsnqXtjJDsl5Ag66ee7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIENoYWluIExpZ2h0bmluZycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI2QzgnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIEl0J3MgaGFyZCB0byBhc3NpZ24gYmxhbWUgZm9yIGxpZ2h0bmluZy4gIFRoZSBkZWJ1ZmZzXHJcbiAgICAgICAgLy8gZ28gb3V0IGFuZCB0aGVuIGV4cGxvZGUgaW4gb3JkZXIsIGJ1dCB0aGUgYXR0YWNrZXIgaXNcclxuICAgICAgICAvLyB0aGUgZHJhZ29uIGFuZCBub3QgdGhlIHBsYXllci5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnaGl0IGJ5IGxpZ2h0bmluZycsXHJcbiAgICAgICAgICAgIGRlOiAndm9tIEJsaXR6IGdldHJvZmZlbicsXHJcbiAgICAgICAgICAgIGZyOiAnZnJhcHDDqShlKSBwYXIgbGEgZm91ZHJlJyxcclxuICAgICAgICAgICAgamE6ICfjg4HjgqfjgqTjg7Pjg6njgqTjg4jjg4vjg7PjgrAnLFxyXG4gICAgICAgICAgICBjbjogJ+mbt+WFiemTvicsXHJcbiAgICAgICAgICAgIGtvOiAn67KI6rCcIOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBCdXJucycsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdGQScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgU2x1ZGdlJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzExRicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgRG9vbSBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0QyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBEb29tIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnRDInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSBpcyBubyBjYWxsb3V0IGZvciBcInlvdSBmb3Jnb3QgdG8gY2xlYXIgZG9vbVwiLiAgVGhlIGxvZ3MgbG9va1xyXG4gICAgICAvLyBzb21ldGhpbmcgbGlrZSB0aGlzOlxyXG4gICAgICAvLyAgIFsyMDowMjozMC41NjRdIDFBOk9rb25vbWkgWWFraSBnYWlucyB0aGUgZWZmZWN0IG9mIERvb20gZnJvbSAgZm9yIDYuMDAgU2Vjb25kcy5cclxuICAgICAgLy8gICBbMjA6MDI6MzYuNDQzXSAxRTpPa29ub21pIFlha2kgbG9zZXMgdGhlIGVmZmVjdCBvZiBQcm90ZWN0IGZyb20gVGFrbyBZYWtpLlxyXG4gICAgICAvLyAgIFsyMDowMjozNi40NDNdIDFFOk9rb25vbWkgWWFraSBsb3NlcyB0aGUgZWZmZWN0IG9mIERvb20gZnJvbSAuXHJcbiAgICAgIC8vICAgWzIwOjAyOjM4LjUyNV0gMTk6T2tvbm9taSBZYWtpIHdhcyBkZWZlYXRlZCBieSBGaXJlaG9ybi5cclxuICAgICAgLy8gSW4gb3RoZXIgd29yZHMsIGRvb20gZWZmZWN0IGlzIHJlbW92ZWQgKy8tIG5ldHdvcmsgbGF0ZW5jeSwgYnV0IGNhbid0XHJcbiAgICAgIC8vIHRlbGwgdW50aWwgbGF0ZXIgdGhhdCBpdCB3YXMgYSBkZWF0aC4gIEFyZ3VhYmx5LCB0aGlzIGNvdWxkIGhhdmUgYmVlbiBhXHJcbiAgICAgIC8vIGNsb3NlLWJ1dC1zdWNjZXNzZnVsIGNsZWFyaW5nIG9mIGRvb20gYXMgd2VsbC4gIEl0IGxvb2tzIHRoZSBzYW1lLlxyXG4gICAgICAvLyBTdHJhdGVneTogaWYgeW91IGhhdmVuJ3QgY2xlYXJlZCBkb29tIHdpdGggMSBzZWNvbmQgdG8gZ28gdGhlbiB5b3UgcHJvYmFibHlcclxuICAgICAgLy8gZGllZCB0byBkb29tLiAgWW91IGNhbiBnZXQgbm9uLWZhdGFsbHkgaWNlYmFsbGVkIG9yIGF1dG8nZCBpbiBiZXR3ZWVuLFxyXG4gICAgICAvLyBidXQgd2hhdCBjYW4geW91IGRvLlxyXG4gICAgICBpZDogJ1VDVSBEb29tIERlYXRoJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0QyJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAxLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbSB8fCAhZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBsZXQgdGV4dDtcclxuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbik7XHJcbiAgICAgICAgaWYgKGR1cmF0aW9uIDwgOSlcclxuICAgICAgICAgIHRleHQgPSBtYXRjaGVzLmVmZmVjdCArICcgIzEnO1xyXG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uIDwgMTQpXHJcbiAgICAgICAgICB0ZXh0ID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMyJztcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICB0ZXh0ID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMzJztcclxuICAgICAgICByZXR1cm4geyBuYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogdGV4dCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVGhlIENvcGllZCBGYWN0b3J5XHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDb3BpZWRGYWN0b3J5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iJzogJzQ4QjQnLFxyXG4gICAgLy8gTWFrZSBzdXJlIGVuZW1pZXMgYXJlIGlnbm9yZWQgb24gdGhlc2VcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iYXJkbWVudCc6ICc0OEI4JyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBBc3NhdWx0JzogJzQ4QjYnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzQ4QzUnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gU3BpbiAxJzogJzQ4Q0InLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gMic6ICc0OENDJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIENlbnRyaWZ1Z2FsIFNwaW4nOiAnNDhDOScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBBaXItVG8tU3VyZmFjZSBFbmVyZ3knOiAnNDhCQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBIaWdoLUNhbGliZXIgTGFzZXInOiAnNDhGQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyAxJzogJzQ4QkMnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgMic6ICc0OEJEJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDMnOiAnNDhCRScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyA0JzogJzQ4QzAnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgNSc6ICc0OEMxJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDYnOiAnNDhDMicsXHJcblxyXG4gICAgJ0NvcGllZCBUcmFzaCBFbmVyZ3kgQm9tYic6ICc0OTFEJyxcclxuICAgICdDb3BpZWQgVHJhc2ggRnJvbnRhbCBTb21lcnNhdWx0JzogJzQ5MUInLFxyXG4gICAgJ0NvcGllZCBUcmFzaCBIaWdoLUZyZXF1ZW5jeSBMYXNlcic6ICc0OTFFJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ja2luZyBEaXNjaGFyZ2UnOiAnNDgwQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCAxJzogJzQ5QzUnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgMic6ICc0OUM2JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDMnOiAnNDlDNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCA0JzogJzQ4MEYnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgNSc6ICc0ODEwJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDYnOiAnNDgxMScsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAxJzogJzQ4MDInLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAyJzogJzQ4MDMnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAzJzogJzQ4MDQnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIFRvd2VyZmFsbCc6ICc0ODEzJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDEnOiAnNDgxNicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDInOiAnNDgxNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDMnOiAnNDgxOCcsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgT2lsIFdlbGwnOiAnNDgxQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBFbGVjdHJvbWFnbmV0aWMgUHVsc2UnOiAnNDgxOScsXHJcbiAgICAvLyBUT0RPOiB3aGF0J3MgdGhlIGVsZWN0cmlmaWVkIGZsb29yIHdpdGggY29udmV5b3IgYmVsdHM/XHJcblxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDEnOiAnNDkzNycsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgMic6ICc0OTM4JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyAzJzogJzQ5MzknLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDQnOiAnNDkzQScsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgNSc6ICc0OTM3JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBMYXNlciBUdXJyZXQnOiAnNDhFNicsXHJcblxyXG4gICAgJ0NvcGllZCBGbGlnaHQgVW5pdCBBcmVhIEJvbWJpbmcnOiAnNDk0MycsXHJcbiAgICAnQ29waWVkIEZsaWdodCBVbml0IExpZ2h0ZmFzdCBCbGFkZSc6ICc0OTQwJyxcclxuXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDEnOiAnNDcyOScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDInOiAnNDcyOCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDMnOiAnNDcyRicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDQnOiAnNDczMScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDUnOiAnNDcyQicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDYnOiAnNDcyRCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDcnOiAnNDczMicsXHJcblxyXG4gICAgJ0NvcGllZCBFbmdlbHMgSW5jZW5kaWFyeSBCb21iaW5nJzogJzQ3MzknLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgR3VpZGVkIE1pc3NpbGUnOiAnNDczNicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBTdXJmYWNlIE1pc3NpbGUnOiAnNDczNCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBMYXNlciBTaWdodCc6ICc0NzNCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIEZyYWNrJzogJzQ3NEQnLFxyXG5cclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggQ3J1c2gnOiAnNDhGQycsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBDcnVzaGluZyBXaGVlbCc6ICc0NzRCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggVGhydXN0JzogJzQ4RkMnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTGFzZXIgU3VwcHJlc3Npb24nOiAnNDhFMCcsIC8vIENhbm5vbnNcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCAxJzogJzQ5NzQnLFxyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDInOiAnNDhEQycsXHJcbiAgICAnQ29waWVkIDlTIEJhbGxpc3RpYyBJbXBhY3QgMyc6ICc0OEU0JyxcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCA0JzogJzQ4RTAnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTWFyeCBJbXBhY3QnOiAnNDhENCcsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBUYW5rIERlc3RydWN0aW9uIDEnOiAnNDhFOCcsXHJcbiAgICAnQ29waWVkIDlTIFRhbmsgRGVzdHJ1Y3Rpb24gMic6ICc0OEU5JyxcclxuXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDEnOiAnNDhBNScsXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDInOiAnNDhBNycsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdDb3BpZWQgSG9iYmVzIFNob3J0LVJhbmdlIE1pc3NpbGUnOiAnNDgxNScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IDUwOTMgdGFraW5nIEhpZ2gtUG93ZXJlZCBMYXNlciB3aXRoIGEgdnVsbiAoYmVjYXVzZSBvZiB0YWtpbmcgdHdvKVxyXG4vLyBUT0RPOiA0RkI1IHRha2luZyBIaWdoLVBvd2VyZWQgTGFzZXIgd2l0aCBhIHZ1bG4gKGJlY2F1c2Ugb2YgdGFraW5nIHR3bylcclxuLy8gVE9ETzogNTBEMyBBZXJpYWwgU3VwcG9ydDogQm9tYmFyZG1lbnQgZ29pbmcgb2ZmIGZyb20gYWRkXHJcbi8vIFRPRE86IDUyMTEgTWFuZXV2ZXI6IFZvbHQgQXJyYXkgbm90IGdldHRpbmcgaW50ZXJydXB0ZWRcclxuLy8gVE9ETzogNEZGNC80RkY1IE9uZSBvZiB0aGVzZSBpcyBmYWlsaW5nIGNoZW1pY2FsIGNvbmZsYWdyYXRpb25cclxuLy8gVE9ETzogc3RhbmRpbmcgaW4gd3JvbmcgdGVsZXBvcnRlcj8/IG1heWJlIDUzNjM/XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUHVwcGV0c0J1bmtlcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUHVwcGV0IEFlZ2lzIEJlYW0gQ2Fubm9ucyAxJzogJzUwNzQnLCAvLyByb3RhdGluZyBzZXBhcmF0aW5nIHdoaXRlIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQWVnaXMgQmVhbSBDYW5ub25zIDInOiAnNTA3NScsIC8vIHJvdGF0aW5nIHNlcGFyYXRpbmcgd2hpdGUgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBBZWdpcyBCZWFtIENhbm5vbnMgMyc6ICc1MDc2JywgLy8gcm90YXRpbmcgc2VwYXJhdGluZyB3aGl0ZSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEFlZ2lzIENvbGxpZGVyIENhbm5vbnMnOiAnNTA3RScsIC8vIHJvdGF0aW5nIHJlZCBncm91bmQgYW9lIHBpbndoZWVsXHJcbiAgICAnUHVwcGV0IEFlZ2lzIFN1cmZhY2UgTGFzZXIgMSc6ICc1MDkxJywgLy8gY2hhc2luZyBsYXNlciBpbml0aWFsXHJcbiAgICAnUHVwcGV0IEFlZ2lzIFN1cmZhY2UgTGFzZXIgMic6ICc1MDkyJywgLy8gY2hhc2luZyBsYXNlciBjaGFzaW5nXHJcbiAgICAnUHVwcGV0IEFlZ2lzIEZsaWdodCBQYXRoJzogJzUwOEMnLCAvLyBibHVlIGxpbmUgYW9lIGZyb20gZmx5aW5nIHVudGFyZ2V0YWJsZSBhZGRzXHJcbiAgICAnUHVwcGV0IEFlZ2lzIFJlZnJhY3Rpb24gQ2Fubm9ucyAxJzogJzUwODEnLCAvLyByZWZyYWN0aW9uIGNhbm5vbnMgYmV0d2VlbiB3aW5nc1xyXG4gICAgJ1B1cHBldCBBZWdpcyBMaWZlXFwncyBMYXN0IFNvbmcnOiAnNTNCMycsIC8vIHJpbmcgYW9lIHdpdGggZ2FwXHJcbiAgICAnUHVwcGV0IExpZ2h0IExvbmctQmFycmVsZWQgTGFzZXInOiAnNTIxMicsIC8vIGxpbmUgYW9lIGZyb20gYWRkXHJcbiAgICAnUHVwcGV0IExpZ2h0IFN1cmZhY2UgTWlzc2lsZSBJbXBhY3QnOiAnNTIwRicsIC8vIHVudGFyZ2V0ZWQgZ3JvdW5kIGFvZSBmcm9tIE5vIFJlc3RyaWN0aW9uc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBJbmNlbmRpYXJ5IEJvbWJpbmcnOiAnNEZCOScsIC8vIGZpcmUgcHVkZGxlIGluaXRpYWxcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU2hhcnAgVHVybic6ICc1MDZEJywgLy8gc2hhcnAgdHVybiBkYXNoXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFN0YW5kYXJkIFN1cmZhY2UgTWlzc2lsZSAxJzogJzRGQjEnLCAvLyBMZXRoYWwgUmV2b2x1dGlvbiBjaXJjbGVzXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFN0YW5kYXJkIFN1cmZhY2UgTWlzc2lsZSAyJzogJzRGQjInLCAvLyBMZXRoYWwgUmV2b2x1dGlvbiBjaXJjbGVzXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFN0YW5kYXJkIFN1cmZhY2UgTWlzc2lsZSAzJzogJzRGQjMnLCAvLyBMZXRoYWwgUmV2b2x1dGlvbiBjaXJjbGVzXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNsaWRpbmcgU3dpcGUgMSc6ICc1MDZGJywgLy8gcmlnaHQtaGFuZGVkIHNsaWRpbmcgc3dpcGVcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgU2xpZGluZyBTd2lwZSAyJzogJzUwNzAnLCAvLyBsZWZ0LWhhbmRlZCBzbGlkaW5nIHN3aXBlXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIEd1aWRlZCBNaXNzaWxlJzogJzRGQjgnLCAvLyBncm91bmQgYW9lIGR1cmluZyBBcmVhIEJvbWJhcmRtZW50XHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIEhpZ2gtT3JkZXIgRXhwbG9zaXZlIEJsYXN0IDEnOiAnNEZDMCcsIC8vIHN0YXIgYW9lXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIEhpZ2gtT3JkZXIgRXhwbG9zaXZlIEJsYXN0IDInOiAnNEZDMScsIC8vIHN0YXIgYW9lXHJcbiAgICAnUHVwcGV0IEhlYXZ5IEVuZXJneSBCb21iYXJkbWVudCc6ICc0RkZDJywgLy8gY29sb3JlZCBtYWdpYyBoYW1tZXIteSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEhlYXZ5IFJldm9sdmluZyBMYXNlcic6ICc1MDAwJywgLy8gZ2V0IHVuZGVyIGxhc2VyXHJcbiAgICAnUHVwcGV0IEhlYXZ5IEVuZXJneSBCb21iJzogJzRGRkEnLCAvLyBnZXR0aW5nIGhpdCBieSBiYWxsIGR1cmluZyBBY3RpdmUgU3VwcHJlc3NpdmUgVW5pdFxyXG4gICAgJ1B1cHBldCBIZWF2eSBSMDEwIExhc2VyJzogJzRGRjAnLCAvLyBsYXNlciBwb2RcclxuICAgICdQdXBwZXQgSGVhdnkgUjAzMCBIYW1tZXInOiAnNEZGMScsIC8vIGNpcmNsZSBhb2UgcG9kXHJcbiAgICAnUHVwcGV0IEhhbGx3YXkgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzUwQjEnLCAvLyBsb25nIGFvZSBpbiB0aGUgaGFsbHdheSBzZWN0aW9uXHJcbiAgICAnUHVwcGV0IEhhbGx3YXkgRW5lcmd5IEJvbWInOiAnNTBCMicsIC8vIHJ1bm5pbmcgaW50byBhIGZsb2F0aW5nIG9yYlxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBNZWNoYW5pY2FsIERpc3NlY3Rpb24nOiAnNTFCMycsIC8vIHNwaW5uaW5nIHZlcnRpY2FsIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2hhbmljYWwgRGVjYXBpdGF0aW9uJzogJzUxQjQnLCAvLyBnZXQgdW5kZXIgbGFzZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaG5pY2FsIENvbnR1c2lvbiBVbnRhcmdldGVkJzogJzUxQjcnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUmVsZW50bGVzcyBTcGlyYWwgMSc6ICc1MUFBJywgLy8gdHJpcGxlIHVudGFyZ2V0ZWQgZ3JvdW5kIGFvZXNcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUmVsZW50bGVzcyBTcGlyYWwgMic6ICc1MUNCJywgLy8gdHJpcGxlIHVudGFyZ2V0ZWQgZ3JvdW5kIGFvZXNcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgT3V0IDEnOiAnNTQxRicsIC8vIDJQIHByaW1lIGJsYWRlIGdldCBvdXRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgT3V0IDInOiAnNTE5OCcsIC8vIDJQL3B1cHBldCB0ZWxlcG9ydGluZy9yZXByb2R1Y2UgcHJpbWUgYmxhZGUgZ2V0IG91dFxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBCZWhpbmQgMSc6ICc1NDIwJywgLy8gMlAgcHJpbWUgYmxhZGUgZ2V0IGJlaGluZFxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBCZWhpbmQgMic6ICc1MTk5JywgLy8gMlAgdGVsZXBvcnRpbmcgcHJpbWUgYmxhZGUgZ2V0IGJlaGluZFxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBQcmltZSBCbGFkZSBJbiAxJzogJzU0MjEnLCAvLyAyUCBwcmltZSBibGFkZSBnZXQgaW5cclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgSW4gMic6ICc1MTlBJywgLy8gMlAvcHVwcGV0IHRlbGVwb3J0aW5nL3JlcHJvZHVjZSBwcmltZSBibGFkZSBnZXQgaW5cclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBHcm91bmQnOiAnNTFBRScsIC8vIHVudGFyZ2V0ZWQgZ3JvdW5kIGNpcmNsZVxyXG4gICAgLy8gVGhpcyBpcy4uLiB0b28gbm9pc3kuXHJcbiAgICAvLyAnUHVwcGV0IENvbXBvdW5kIDJQIEZvdXIgUGFydHMgUmVzb2x2ZSAxJzogJzUxQTAnLCAvLyBmb3VyIHBhcnRzIHJlc29sdmUganVtcFxyXG4gICAgLy8gJ1B1cHBldCBDb21wb3VuZCAyUCBGb3VyIFBhcnRzIFJlc29sdmUgMic6ICc1MTlGJywgLy8gZm91ciBwYXJ0cyByZXNvbHZlIGNsZWF2ZVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1B1cHBldCBIZWF2eSBVcHBlciBMYXNlciAxJzogJzUwODcnLCAvLyB1cHBlciBsYXNlciBpbml0aWFsXHJcbiAgICAnUHVwcGV0IEhlYXZ5IFVwcGVyIExhc2VyIDInOiAnNEZGNycsIC8vIHVwcGVyIGxhc2VyIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgMSc6ICc1MDg2JywgLy8gbG93ZXIgbGFzZXIgZmlyc3Qgc2VjdGlvbiBpbml0aWFsXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDInOiAnNEZGNicsIC8vIGxvd2VyIGxhc2VyIGZpcnN0IHNlY3Rpb24gY29udGludW91c1xyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciAzJzogJzUwODgnLCAvLyBsb3dlciBsYXNlciBzZWNvbmQgc2VjdGlvbiBpbml0aWFsXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDQnOiAnNEZGOCcsIC8vIGxvd2VyIGxhc2VyIHNlY29uZCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgNSc6ICc1MDg5JywgLy8gbG93ZXIgbGFzZXIgdGhpcmQgc2VjdGlvbiBpbml0aWFsXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDYnOiAnNEZGOScsIC8vIGxvd2VyIGxhc2VyIHRoaXJkIHNlY3Rpb24gY29udGludW91c1xyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBJbmNvbmdydW91cyBTcGluJzogJzUxQjInLCAvLyBmaW5kIHRoZSBzYWZlIHNwb3QgZG91YmxlIGRhc2hcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1B1cHBldCBCdXJucyc6ICcxMEInLCAvLyBzdGFuZGluZyBpbiBtYW55IHZhcmlvdXMgZmlyZSBhb2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIFRoaXMgaXMgcHJldHR5IGxhcmdlIGFuZCBnZXR0aW5nIGhpdCBieSBpbml0aWFsIHdpdGhvdXQgYnVybnMgc2VlbXMgZmluZS5cclxuICAgIC8vICdQdXBwZXQgTGlnaHQgSG9taW5nIE1pc3NpbGUgSW1wYWN0JzogJzUyMTAnLCAvLyB0YXJnZXRlZCBmaXJlIGFvZSBmcm9tIE5vIFJlc3RyaWN0aW9uc1xyXG4gICAgJ1B1cHBldCBIZWF2eSBVbmNvbnZlbnRpb25hbCBWb2x0YWdlJzogJzUwMDQnLFxyXG4gICAgLy8gUHJldHR5IG5vaXN5LlxyXG4gICAgJ1B1cHBldCBNYW5ldXZlciBIaWdoLVBvd2VyZWQgTGFzZXInOiAnNTAwMicsIC8vIHRhbmsgbGFzZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaG5pY2FsIENvbnR1c2lvbiBUYXJnZXRlZCc6ICc1MUI2JywgLy8gdGFyZ2V0ZWQgc3ByZWFkIG1hcmtlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCAyUCBSMDEyIExhc2VyIFRhbmsnOiAnNTFBRScsIC8vIHRhcmdldGVkIHNwcmVhZCBwb2QgbGFzZXIgb24gbm9uLXRhbmtcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1B1cHBldCBBZWdpcyBBbnRpLVBlcnNvbm5lbCBMYXNlcic6ICc1MDkwJywgLy8gdGFuayBidXN0ZXIgbWFya2VyXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFByZWNpc2lvbi1HdWlkZWQgTWlzc2lsZSc6ICc0RkM1JyxcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBUYW5rJzogJzUxQUQnLCAvLyB0YXJnZXRlZCBwb2QgbGFzZXIgb24gdGFua1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IG1pc3NpbmcgU2hvY2sgQmxhY2sgMj9cclxuLy8gVE9ETzogV2hpdGUvQmxhY2sgRGlzc29uYW5jZSBkYW1hZ2UgaXMgbWF5YmUgd2hlbiBmbGFncyBlbmQgaW4gMDM/XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlVG93ZXJBdFBhcmFkaWdtc0JyZWFjaCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IENlbnRlciAxJzogJzVFQTcnLCAvLyBDZW50ZXIgYW9lIGZyb20gS25hdmUgYW5kIGNsb25lc1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBDZW50ZXIgMic6ICc2MEM4JywgLy8gQ2VudGVyIGFvZSBmcm9tIEtuYXZlIGR1cmluZyBsdW5nZVxyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDEnOiAnNUVBNScsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGFuZCBjbG9uZXNcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSAyJzogJzVFQTYnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBhbmQgY2xvbmVzXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgMyc6ICc2MEM2JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgZHVyaW5nIGx1bmdlXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgNCc6ICc2MEM3JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgZHVyaW5nIGx1bmdlXHJcbiAgICAnVG93ZXIgS25hdmUgQnVyc3QnOiAnNUVENCcsIC8vIFNwaGVyb2lkIEtuYXZpc2ggQnVsbGV0cyBjb2xsaXNpb25cclxuICAgICdUb3dlciBLbmF2ZSBNYWdpYyBCYXJyYWdlJzogJzVFQUMnLCAvLyBTcGhlcm9pZCBsaW5lIGFvZXNcclxuICAgICdUb3dlciBIYW5zZWwgUmVwYXknOiAnNUM3MCcsIC8vIFNoaWVsZCBkYW1hZ2VcclxuICAgICdUb3dlciBIYW5zZWwgRXhwbG9zaW9uJzogJzVDNjcnLCAvLyBCZWluZyBoaXQgYnkgTWFnaWMgQnVsbGV0IGR1cmluZyBQYXNzaW5nIExhbmNlXHJcbiAgICAnVG93ZXIgSGFuc2VsIEltcGFjdCc6ICc1QzVDJywgLy8gQmVpbmcgaGl0IGJ5IE1hZ2ljYWwgQ29uZmx1ZW5jZSBkdXJpbmcgV2FuZGVyaW5nIFRyYWlsXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCAxJzogJzVDNkMnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aG91dCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDInOiAnNUM2RCcsIC8vIER1YWwgY2xlYXZlcyB3aXRob3V0IHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgMyc6ICc1QzZFJywgLy8gRHVhbCBjbGVhdmVzIHdpdGggdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCA0JzogJzVDNkYnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgUGFzc2luZyBMYW5jZSc6ICc1QzY2JywgLy8gVGhlIFBhc3NpbmcgTGFuY2UgY2hhcmdlIGl0c2VsZlxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCcmVhdGh0aHJvdWdoIDEnOiAnNTVCMycsIC8vIGhhbGYgcm9vbSBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCcmVhdGh0aHJvdWdoIDInOiAnNUM1RCcsIC8vIGhhbGYgcm9vbSBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCcmVhdGh0aHJvdWdoIDMnOiAnNUM1RScsIC8vIGhhbGYgcm9vbSBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBIdW5ncnkgTGFuY2UgMSc6ICc1QzcxJywgLy8gMnhsYXJnZSBjb25hbCBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBIdW5ncnkgTGFuY2UgMic6ICc1QzcyJywgLy8gMnhsYXJnZSBjb25hbCBjbGVhdmUgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEZsaWdodCBVbml0IExpZ2h0ZmFzdCBCbGFkZSc6ICc1QkZFJywgLy8gbGFyZ2Ugcm9vbSBjbGVhdmVcclxuICAgICdUb3dlciBGbGlnaHQgVW5pdCBTdGFuZGFyZCBMYXNlcic6ICc1QkZGJywgLy8gdHJhY2tpbmcgbGFzZXJcclxuICAgICdUb3dlciAyUCBXaGlybGluZyBBc3NhdWx0JzogJzVCRkInLCAvLyBsaW5lIGFvZSBmcm9tIDJQIGNsb25lc1xyXG4gICAgJ1Rvd2VyIDJQIEJhbGFuY2VkIEVkZ2UnOiAnNUJGQScsIC8vIGNpcmN1bGFyIGFvZSBvbiAyUCBjbG9uZXNcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDEnOiAnNjAwNicsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDInOiAnNjAwNycsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDMnOiAnNjAwOCcsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDQnOiAnNjAwOScsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDUnOiAnNjMxMCcsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDYnOiAnNjMxMScsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDcnOiAnNjMxMicsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBHZW5lcmF0ZSBCYXJyaWVyIDgnOiAnNjMxMycsIC8vIGJlaW5nIGhpdCBieSBiYXJyaWVycyBhcHBlYXJpbmdcclxuICAgICdUb3dlciBSZWQgR2lybCBTaG9jayBXaGl0ZSAxJzogJzYwMEYnLCAvLyB3aGl0ZSBzaG9ja3dhdmUgY2lyY2xlIG5vdCBkcm9wcGVkIG9uIGJsYWNrXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgU2hvY2sgV2hpdGUgMic6ICc2MDEwJywgLy8gd2hpdGUgc2hvY2t3YXZlIGNpcmNsZSBub3QgZHJvcHBlZCBvbiBibGFja1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFNob2NrIEJsYWNrIDEnOiAnNjAxMScsIC8vIGJsYWNrIHNob2Nrd2F2ZSBjaXJjbGUgbm90IGRyb3BwZWQgb24gd2hpdGVcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBXaGl0ZSAxJzogJzYwMUYnLCAvLyBiZWluZyBoaXQgYnkgYSB3aGl0ZSBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IFdoaXRlIDInOiAnNjAyMScsIC8vIGJlaW5nIGhpdCBieSBhIHdoaXRlIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgQmxhY2sgMSc6ICc2MDIwJywgLy8gYmVpbmcgaGl0IGJ5IGEgYmxhY2sgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBCbGFjayAyJzogJzYwMjInLCAvLyBiZWluZyBoaXQgYnkgYSBibGFjayBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFdpcGUgV2hpdGUnOiAnNjAwQycsIC8vIG5vdCBsaW5lIG9mIHNpZ2h0aW5nIHRoZSB3aGl0ZSBtZXRlb3JcclxuICAgICdUb3dlciBSZWQgR2lybCBXaXBlIEJsYWNrJzogJzYwMEQnLCAvLyBub3QgbGluZSBvZiBzaWdodGluZyB0aGUgYmxhY2sgbWV0ZW9yXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgRGlmZnVzZSBFbmVyZ3knOiAnNjA1NicsIC8vIHJvdGF0aW5nIGNsb25lIGJ1YmJsZSBjbGVhdmVzXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUHlsb24gQmlnIEV4cGxvc2lvbic6ICc2MDI3JywgLy8gbm90IGtpbGxpbmcgYSBweWxvbiBkdXJpbmcgaGFja2luZyBwaGFzZVxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFB5bG9uIEV4cGxvc2lvbic6ICc2MDI2JywgLy8gcHlsb24gZHVyaW5nIENoaWxkJ3MgcGxheVxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgTWlkZGxlJzogJzVDMDInLCAvLyBtaWRkbGUgbGFzZXJcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIFNpZGVzJzogJzVDMDUnLCAvLyBzaWRlcyBsYXNlclxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIERlcGxveSBBcm1hbWVudHMgMyc6ICc2MDc4JywgLy8gZ29lcyB3aXRoIDVDMDFcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIDQnOiAnNjA3OScsIC8vIGdvZXMgd2l0aCA1QzA0XHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRW5lcmd5IEJvbWInOiAnNUMwNScsIC8vIHBpbmsgYnViYmxlXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBNYWRlIE1hZ2ljIFJpZ2h0JzogJzVCRDcnLCAvLyByb3RhdGluZyB3aGVlbCBnb2luZyByaWdodFxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTWFkZSBNYWdpYyBMZWZ0JzogJzVCRDYnLCAvLyByb3RhdGluZyB3aGVlbCBnb2luZyBsZWZ0XHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBMaWdodGVyIE5vdGUnOiAnNUJEQScsIC8vIGxpZ2h0ZXIgbm90ZSBtb3ZpbmcgYW9lc1xyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTWFnaWNhbCBJbnRlcmZlcmVuY2UnOiAnNUJENScsIC8vIGxhc2VycyBkdXJpbmcgUmh5dGhtIFJpbmdzXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBTY2F0dGVyZWQgTWFnaWMnOiAnNUJERicsIC8vIGNpcmNsZSBhb2VzIGZyb20gU2VlZCBPZiBNYWdpY1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIFVuZXZlbiBGb3R0aW5nJzogJzVCRTInLCAvLyBidWlsZGluZyBmcm9tIFJlY3JlYXRlIFN0cnVjdHVyZVxyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIENyYXNoJzogJzVCRTUnLCAvLyB0cmFpbnMgZnJvbSBNaXhlZCBTaWduYWxzXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgSGVhdnkgQXJtcyAxJzogJzVCRUQnLCAvLyBoZWF2eSBhcm1zIGZyb250L2JhY2sgYXR0YWNrXHJcbiAgICAnVG93ZXIgSGVyIEluZmxvcmVzY2VuY2UgSGVhdnkgQXJtcyAyJzogJzVCRUYnLCAvLyBoZWF2eSBhcm1zIHNpZGVzIGF0dGFja1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIEVuZXJneSBTY2F0dGVyZWQgTWFnaWMnOiAnNUJFOCcsIC8vIG9yYnMgZnJvbSBSZWQgR2lybCBieSB0cmFpblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIFBsYWNlIE9mIFBvd2VyJzogJzVDMEQnLCAvLyBpbnN0YWRlYXRoIG1pZGRsZSBjaXJjbGUgYmVmb3JlIGJsYWNrL3doaXRlIHJpbmdzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUb3dlciBLbmF2ZSBNYWdpYyBBcnRpbGxlcnkgQWxwaGEnOiAnNUVBQicsIC8vIFNwcmVhZFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBTZWVkIE9mIE1hZ2ljIEFscGhhJzogJzVDNjEnLCAvLyBTcHJlYWRcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1Rvd2VyIEtuYXZlIE1hZ2ljIEFydGlsbGVyeSBCZXRhJzogJzVFQjMnLCAvLyBUYW5rYnVzdGVyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgTWFuaXB1bGF0ZSBFbmVyZ3knOiAnNjAxQScsIC8vIFRhbmtidXN0ZXJcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIERhcmtlciBOb3RlJzogJzVCREMnLCAvLyBUYW5rYnVzdGVyXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1Rvd2VyIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyA1RUIxID0gS25hdmUgTHVuZ2VcclxuICAgICAgLy8gNUJGMiA9IEhlciBJbmZsb3Jlc2VuY2UgU2hvY2t3YXZlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogWyc1RUIxJywgJzVCRjInXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFrYWRhZW1pYUFueWRlcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQW55ZGVyIEFjcmlkIFN0cmVhbSc6ICc0MzA0JyxcclxuICAgICdBbnlkZXIgV2F0ZXJzcG91dCc6ICc0MzA2JyxcclxuICAgICdBbnlkZXIgUmFnaW5nIFdhdGVycyc6ICc0MzAyJyxcclxuICAgICdBbnlkZXIgVmlvbGVudCBCcmVhY2gnOiAnNDMwNScsXHJcbiAgICAnQW55ZGVyIFRpZGFsIEd1aWxsb3RpbmUgMSc6ICczRTA4JyxcclxuICAgICdBbnlkZXIgVGlkYWwgR3VpbGxvdGluZSAyJzogJzNFMEEnLFxyXG4gICAgJ0FueWRlciBQZWxhZ2ljIENsZWF2ZXIgMSc6ICczRTA5JyxcclxuICAgICdBbnlkZXIgUGVsYWdpYyBDbGVhdmVyIDInOiAnM0UwQicsXHJcbiAgICAnQW55ZGVyIEFxdWF0aWMgTGFuY2UnOiAnM0UwNScsXHJcbiAgICAnQW55ZGVyIFN5cnVwIFNwb3V0JzogJzQzMDgnLFxyXG4gICAgJ0FueWRlciBOZWVkbGUgU3Rvcm0nOiAnNDMwOScsXHJcbiAgICAnQW55ZGVyIEV4dGVuc2libGUgVGVuZHJpbHMgMSc6ICczRTEwJyxcclxuICAgICdBbnlkZXIgRXh0ZW5zaWJsZSBUZW5kcmlscyAyJzogJzNFMTEnLFxyXG4gICAgJ0FueWRlciBQdXRyaWQgQnJlYXRoJzogJzNFMTInLFxyXG4gICAgJ0FueWRlciBEZXRvbmF0b3InOiAnNDMwRicsXHJcbiAgICAnQW55ZGVyIERvbWluaW9uIFNsYXNoJzogJzQzMEQnLFxyXG4gICAgJ0FueWRlciBRdWFzYXInOiAnNDMwQicsXHJcbiAgICAnQW55ZGVyIERhcmsgQXJyaXZpc21lJzogJzQzMEUnLFxyXG4gICAgJ0FueWRlciBUaHVuZGVyc3Rvcm0nOiAnM0UxQycsXHJcbiAgICAnQW55ZGVyIFdpbmRpbmcgQ3VycmVudCc6ICczRTFGJyxcclxuICAgIC8vIDNFMjAgaXMgYmVpbmcgaGl0IGJ5IHRoZSBncm93aW5nIG9yYnMsIG1heWJlP1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQW1hdXJvdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQW1hdXJvdCBCdXJuaW5nIFNreSc6ICczNTRBJyxcclxuICAgICdBbWF1cm90IFdoYWNrJzogJzM1M0MnLFxyXG4gICAgJ0FtYXVyb3QgQWV0aGVyc3Bpa2UnOiAnMzUzQicsXHJcbiAgICAnQW1hdXJvdCBWZW5lbW91cyBCcmVhdGgnOiAnM0NDRScsXHJcbiAgICAnQW1hdXJvdCBDb3NtaWMgU2hyYXBuZWwnOiAnNEQyNicsXHJcbiAgICAnQW1hdXJvdCBFYXJ0aHF1YWtlJzogJzNDQ0QnLFxyXG4gICAgJ0FtYXVyb3QgTWV0ZW9yIFJhaW4nOiAnM0NDNicsXHJcbiAgICAnQW1hdXJvdCBGaW5hbCBTa3knOiAnM0NDQicsXHJcbiAgICAnQW1hdXJvdCBNYWxldm9sZW5jZSc6ICczNTQxJyxcclxuICAgICdBbWF1cm90IFR1cm5hYm91dCc6ICczNTQyJyxcclxuICAgICdBbWF1cm90IFNpY2tseSBJbmZlcm5vJzogJzNERTMnLFxyXG4gICAgJ0FtYXVyb3QgRGlzcXVpZXRpbmcgR2xlYW0nOiAnMzU0NicsXHJcbiAgICAnQW1hdXJvdCBCbGFjayBEZWF0aCc6ICczNTQzJyxcclxuICAgICdBbWF1cm90IEZvcmNlIG9mIExvYXRoaW5nJzogJzM1NDQnLFxyXG4gICAgJ0FtYXVyb3QgRGFtbmluZyBSYXkgMSc6ICczRTAwJyxcclxuICAgICdBbWF1cm90IERhbW5pbmcgUmF5IDInOiAnM0UwMScsXHJcbiAgICAnQW1hdXJvdCBEZWFkbHkgVGVudGFjbGVzJzogJzM1NDcnLFxyXG4gICAgJ0FtYXVyb3QgTWlzZm9ydHVuZSc6ICczQ0UyJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdBbWF1cm90IEFwb2thbHlwc2lzJzogJzNDRDcnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQW5hbW5lc2lzQW55ZGVyLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFBodWFibyBTcGluZSBMYXNoJzogJzREMUEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBBbmVtb25lIEZhbGxpbmcgUm9jayc6ICc0RTM3JywgLy8gZ3JvdW5kIGNpcmNsZSBhb2UgZnJvbSBUcmVuY2ggQW5lbW9uZSBzaG93aW5nIHVwXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBEYWdvbml0ZSBTZXdlciBXYXRlcic6ICc0RDFDJywgLy8gZnJvbnRhbCBjb25hbCBmcm9tIFRyZW5jaCBBbmVtb25lICg/ISlcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFlvdnJhIFJvY2sgSGFyZCc6ICc0RDIxJywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWW92cmEgVG9ycmVudGlhbCBUb3JtZW50JzogJzREMjEnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gTHVtaW5vdXMgUmF5JzogJzRFMjcnLCAvLyBVbmtub3duIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gU2luc3RlciBCdWJibGUgRXhwbG9zaW9uJzogJzRCNkUnLCAvLyBVbmtub3duIGV4cGxvc2lvbnMgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gUmVmbGVjdGlvbic6ICc0QjZGJywgLy8gVW5rbm93biBjb25hbCBhdHRhY2sgZHVyaW5nIFNjcnV0aW55XHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gQ2xlYXJvdXQgMSc6ICc0Qjc0JywgLy8gVW5rbm93biBmcm9udGFsIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBDbGVhcm91dCAyJzogJzRCNkInLCAvLyBVbmtub3duIGZyb250YWwgY29uZVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFNldGJhY2sgMSc6ICc0Qjc1JywgLy8gVW5rbm93biByZWFyIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBTZXRiYWNrIDInOiAnNUI2QycsIC8vIFVua25vd24gcmVhciBjb25lXHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBDbGlvbmlkIEFjcmlkIFN0cmVhbSc6ICc0RDI0JywgLy8gdGFyZ2V0ZWQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgRGl2aW5lciBEcmVhZHN0b3JtJzogJzREMjgnLCAvLyBncm91bmQgY2lyY2xlIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIDIwMDAtTWluYSBTd2luZyc6ICc0QjU1JywgLy8gS3lrbG9wcyBnZXQgb3V0IG1lY2hhbmljXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgSGFtbWVyJzogJzRCNUQnLCAvLyBLeWtsb3BzIEhhbW1lci9CbGFkZSBhbHRlcm5hdGluZyBzcXVhcmVzXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgVGVycmlibGUgQmxhZGUnOiAnNEI1RScsIC8vIEt5a2xvcHMgSGFtbWVyL0JsYWRlIGFsdGVybmF0aW5nIHNxdWFyZXNcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBSYWdpbmcgR2xvd2VyJzogJzRCNTYnLCAvLyBLeWtsb3BzIGxpbmUgYW9lXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgRXllIE9mIFRoZSBDeWNsb25lJzogJzRCNTcnLCAvLyBLeWtsb3BzIGRvbnV0XHJcbiAgICAnQW5hbW5lc2lzIEFueWRlciBIYXJwb29uZXIgSHlkcm9iYWxsJzogJzREMjYnLCAvLyBmcm9udGFsIGNvbmFsXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBTd2lmdCBTaGlmdCc6ICc0QjgzJywgLy8gUnVrc2hzIERlZW0gdGVsZXBvcnQgTi9TXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBEZXB0aCBHcmlwIFdhdmVicmVha2VyJzogJzMzRDQnLCAvLyBSdWtzaHMgRGVlbSBoYW5kIGF0dGFja3NcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIFJpc2luZyBUaWRlJzogJzRCOEInLCAvLyBSdWtzaHMgRGVlbSBjcm9zcyBhb2VcclxuICAgICdBbmFtbmVzaXMgUnVrc2hzIENvbW1hbmQgQ3VycmVudCc6ICc0QjgyJywgLy8gUnVrc2hzIERlZW0gcHJvdGVhbi1pc2ggZ3JvdW5kIGFvZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggWHpvbWl0IE1hbnRsZSBEcmlsbCc6ICc0RDE5JywgLy8gY2hhcmdlIGF0dGFja1xyXG4gICAgJ0FuYW1uZXNpcyBJbyBPdXNpYSBCYXJyZWxpbmcgU21hc2gnOiAnNEUyNCcsIC8vIGNoYXJnZSBhdHRhY2tcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyBXYW5kZXJlclxcJ3MgUHlyZSc6ICc0QjVGJywgLy8gS3lrbG9wcyBzcHJlYWQgYXR0YWNrXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogTWlzc2luZyBHcm93aW5nIHRldGhlcnMgb24gYm9zcyAyLlxyXG4vLyAoTWF5YmUgZ2F0aGVyIHBhcnR5IG1lbWJlciBuYW1lcyBvbiB0aGUgcHJldmlvdXMgVElJSUlNQkVFRUVFRVIgY2FzdCBmb3IgY29tcGFyaXNvbj8pXHJcbi8vIFRPRE86IEZhaWxpbmcgdG8gaW50ZXJydXB0IERvaG5mYXVzdCBGdWF0aCBvbiBXYXRlcmluZyBXaGVlbCBjYXN0cz9cclxuLy8gKDE1Oi4uLi4uLi4uOkRvaG5mYXN0IEZ1YXRoOjNEQUE6V2F0ZXJpbmcgV2hlZWw6Li4uLi4uLi46KFxceXtOYW1lfSk6KVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRvaG5NaGVnLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEb2huIE1oZWcgR2V5c2VyJzogJzIyNjAnLCAvLyBXYXRlciBlcnVwdGlvbnMsIGJvc3MgMVxyXG4gICAgJ0RvaG4gTWhlZyBIeWRyb2ZhbGwnOiAnMjJCRCcsIC8vIEdyb3VuZCBBb0UgbWFya2VyLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgTGF1Z2hpbmcgTGVhcCc6ICcyMjk0JywgLy8gR3JvdW5kIEFvRSBtYXJrZXIsIGJvc3MgMVxyXG4gICAgJ0RvaG4gTWhlZyBTd2luZ2UnOiAnMjJDQScsIC8vIEZyb250YWwgY29uZSwgYm9zcyAyXHJcbiAgICAnRG9obiBNaGVnIENhbm9weSc6ICczREIwJywgLy8gRnJvbnRhbCBjb25lLCBEb2huZmF1c3QgUm93YW5zIHRocm91Z2hvdXQgaW5zdGFuY2VcclxuICAgICdEb2huIE1oZWcgUGluZWNvbmUgQm9tYic6ICczREIxJywgLy8gQ2lyY3VsYXIgZ3JvdW5kIEFvRSBtYXJrZXIsIERvaG5mYXVzdCBSb3dhbnMgdGhyb3VnaG91dCBpbnN0YW5jZVxyXG4gICAgJ0RvaG4gTWhlZyBCaWxlIEJvbWJhcmRtZW50JzogJzM0RUUnLCAvLyBHcm91bmQgQW9FIG1hcmtlciwgYm9zcyAzXHJcbiAgICAnRG9obiBNaGVnIENvcnJvc2l2ZSBCaWxlJzogJzM0RUMnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgM1xyXG4gICAgJ0RvaG4gTWhlZyBGbGFpbGluZyBUZW50YWNsZXMnOiAnMzY4MScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0RvaG4gTWhlZyBJbXAgQ2hvaXInLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0RvaG4gTWhlZyBUb2FkIENob2lyJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFCNycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdEb2huIE1oZWcgRm9vbFxcJ3MgVHVtYmxlJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzE4MycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBCZXJzZXJrZXIgMm5kLzNyZCB3aWxkIGFuZ3Vpc2ggc2hvdWxkIGJlIHNoYXJlZCB3aXRoIGp1c3QgYSByb2NrXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlSGVyb2VzR2F1bnRsZXQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RIRyBCbGFkZVxcJ3MgQmVuaXNvbic6ICc1MjI4JywgLy8gcGxkIGNvbmFsXHJcbiAgICAnVEhHIEFic29sdXRlIEhvbHknOiAnNTI0QicsIC8vIHdobSB2ZXJ5IGxhcmdlIGFvZVxyXG4gICAgJ1RIRyBIaXNzYXRzdTogR29rYSc6ICc1MjNEJywgLy8gc2FtIGxpbmUgYW9lXHJcbiAgICAnVEhHIFdob2xlIFNlbGYnOiAnNTIyRCcsIC8vIG1uayB3aWRlIGxpbmUgYW9lXHJcbiAgICAnVEhHIFJhbmRncml0aCc6ICc1MjMyJywgLy8gZHJnIHZlcnkgYmlnIGxpbmUgYW9lXHJcbiAgICAnVEhHIFZhY3V1bSBCbGFkZSAxJzogJzUwNjEnLCAvLyBTcGVjdHJhbCBUaGllZiBjaXJjdWxhciBncm91bmQgYW9lIGZyb20gbWFya2VyXHJcbiAgICAnVEhHIFZhY3V1bSBCbGFkZSAyJzogJzUwNjInLCAvLyBTcGVjdHJhbCBUaGllZiBjaXJjdWxhciBncm91bmQgYW9lIGZyb20gbWFya2VyXHJcbiAgICAnVEhHIENvd2FyZFxcJ3MgQ3VubmluZyc6ICc0RkQ3JywgLy8gU3BlY3RyYWwgVGhpZWYgQ2hpY2tlbiBLbmlmZSBsYXNlclxyXG4gICAgJ1RIRyBQYXBlcmN1dHRlciAxJzogJzRGRDEnLCAvLyBTcGVjdHJhbCBUaGllZiBsaW5lIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBQYXBlcmN1dHRlciAyJzogJzRGRDInLCAvLyBTcGVjdHJhbCBUaGllZiBsaW5lIGFvZSBmcm9tIG1hcmtlclxyXG4gICAgJ1RIRyBSaW5nIG9mIERlYXRoJzogJzUyMzYnLCAvLyBkcmcgY2lyY3VsYXIgYW9lXHJcbiAgICAnVEhHIEx1bmFyIEVjbGlwc2UnOiAnNTIyNycsIC8vIHBsZCBjaXJjdWxhciBhb2VcclxuICAgICdUSEcgQWJzb2x1dGUgR3Jhdml0eSc6ICc1MjQ4JywgLy8gaW5rIG1hZ2UgY2lyY3VsYXJcclxuICAgICdUSEcgUmFpbiBvZiBMaWdodCc6ICc1MjQyJywgLy8gYmFyZCBsYXJnZSBjaXJjdWxlIGFvZVxyXG4gICAgJ1RIRyBEb29taW5nIEZvcmNlJzogJzUyMzknLCAvLyBkcmcgbGluZSBhb2VcclxuICAgICdUSEcgQWJzb2x1dGUgRGFyayBJSSc6ICc0RjYxJywgLy8gTmVjcm9tYW5jZXIgMTIwIGRlZ3JlZSBjb25hbFxyXG4gICAgJ1RIRyBCdXJzdCc6ICc1M0I3JywgLy8gTmVjcm9tYW5jZXIgbmVjcm9idXJzdCBzbWFsbCB6b21iaWUgZXhwbG9zaW9uXHJcbiAgICAnVEhHIFBhaW4gTWlyZSc6ICc0RkE0JywgLy8gTmVjcm9tYW5jZXIgdmVyeSBsYXJnZSBncmVlbiBibGVlZCBwdWRkbGVcclxuICAgICdUSEcgRGFyayBEZWx1Z2UnOiAnNEY1RCcsIC8vIE5lY3JvbWFuY2VyIGdyb3VuZCBhb2VcclxuICAgICdUSEcgVGVra2EgR29qaW4nOiAnNTIzRScsIC8vIHNhbSA5MCBkZWdyZWUgY29uYWxcclxuICAgICdUSEcgUmFnaW5nIFNsaWNlIDEnOiAnNTIwQScsIC8vIEJlcnNlcmtlciBsaW5lIGNsZWF2ZVxyXG4gICAgJ1RIRyBSYWdpbmcgU2xpY2UgMic6ICc1MjBCJywgLy8gQmVyc2Vya2VyIGxpbmUgY2xlYXZlXHJcbiAgICAnVEhHIFdpbGQgUmFnZSc6ICc1MjAzJywgLy8gQmVyc2Vya2VyIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1RIRyBCbGVlZGluZyc6ICc4MjgnLCAvLyBTdGFuZGluZyBpbiB0aGUgTmVjcm9tYW5jZXIgcHVkZGxlIG9yIG91dHNpZGUgdGhlIEJlcnNlcmtlciBhcmVuYVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnVEhHIFRydWx5IEJlcnNlcmsnOiAnOTA2JywgLy8gU3RhbmRpbmcgaW4gdGhlIGNyYXRlciB0b28gbG9uZ1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVEhHIEFic29sdXRlIFRodW5kZXIgSVYnOiAnNTI0NScsIC8vIGhlYWRtYXJrZXIgYW9lIGZyb20gYmxtXHJcbiAgICAnVEhHIE1vb25kaXZlcic6ICc1MjMzJywgLy8gaGVhZG1hcmtlciBhb2UgZnJvbSBkcmdcclxuICAgICdUSEcgU3BlY3RyYWwgR3VzdCc6ICc1M0NGJywgLy8gU3BlY3RyYWwgVGhpZWYgaGVhZG1hcmtlciBhb2VcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RIRyBGYWxsaW5nIFJvY2snOiAnNTIwNScsIC8vIEJlcnNlcmtlciBoZWFkbWFya2VyIGFvZSB0aGF0IGNyZWF0ZXMgcnViYmxlXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgLy8gVGhpcyBzaG91bGQgYWx3YXlzIGJlIHNoYXJlZC4gIE9uIGFsbCB0aW1lcyBidXQgdGhlIDJuZCBhbmQgM3JkLCBpdCdzIGEgcGFydHkgc2hhcmUuXHJcbiAgICAvLyBUT0RPOiBvbiB0aGUgMm5kIGFuZCAzcmQgdGltZSB0aGlzIHNob3VsZCBvbmx5IGJlIHNoYXJlZCB3aXRoIGEgcm9jay5cclxuICAgIC8vIFRPRE86IGFsdGVybmF0aXZlbHkgd2FybiBvbiB0YWtpbmcgb25lIG9mIHRoZXNlIHdpdGggYSA0NzIgTWFnaWMgVnVsbmVyYWJpbGl0eSBVcCBlZmZlY3RcclxuICAgICdUSEcgV2lsZCBBbmd1aXNoJzogJzUyMDknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUSEcgV2lsZCBSYW1wYWdlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNTIwNycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gVGhpcyBpcyB6ZXJvIGRhbWFnZSBpZiB5b3UgYXJlIGluIHRoZSBjcmF0ZXIuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuSG9sbWluc3RlclN3aXRjaCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSG9sbWluc3RlciBUaHVtYnNjcmV3JzogJzNEQzYnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgV29vZGVuIGhvcnNlJzogJzNEQzcnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgTGlnaHQgU2hvdCc6ICczREM4JyxcclxuICAgICdIb2xtaW5zdGVyIEhlcmV0aWNcXCdzIEZvcmsnOiAnM0RDRScsXHJcbiAgICAnSG9sbWluc3RlciBIb2x5IFdhdGVyJzogJzNERDQnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgRmllcmNlIEJlYXRpbmcgMSc6ICczREREJyxcclxuICAgICdIb2xtaW5zdGVyIEZpZXJjZSBCZWF0aW5nIDInOiAnM0RERScsXHJcbiAgICAnSG9sbWluc3RlciBGaWVyY2UgQmVhdGluZyAzJzogJzNEREYnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgQ2F0IE9cXCcgTmluZSBUYWlscyc6ICczREUxJyxcclxuICAgICdIb2xtaW5zdGVyIFJpZ2h0IEtub3V0JzogJzNERTYnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgTGVmdCBLbm91dCc6ICczREU3JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdIb2xtaW5zdGVyIEFldGhlcnN1cCc6ICczREU5JyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgRmxhZ2VsbGF0aW9uJzogJzNERDYnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnSG9sbWluc3RlciBUYXBoZXBob2JpYSc6ICc0MTgxJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hbGlrYWhzV2VsbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTWFsaWthaCBGYWxsaW5nIFJvY2snOiAnM0NFQScsXHJcbiAgICAnTWFsaWthaCBXZWxsYm9yZSc6ICczQ0VEJyxcclxuICAgICdNYWxpa2FoIEdleXNlciBFcnVwdGlvbic6ICczQ0VFJyxcclxuICAgICdNYWxpa2FoIFN3aWZ0IFNwaWxsJzogJzNDRjAnLFxyXG4gICAgJ01hbGlrYWggQnJlYWtpbmcgV2hlZWwgMSc6ICczQ0Y1JyxcclxuICAgICdNYWxpa2FoIENyeXN0YWwgTmFpbCc6ICczQ0Y3JyxcclxuICAgICdNYWxpa2FoIEhlcmV0aWNcXCdzIEZvcmsgMSc6ICczQ0Y5JyxcclxuICAgICdNYWxpa2FoIEJyZWFraW5nIFdoZWVsIDInOiAnM0NGQScsXHJcbiAgICAnTWFsaWthaCBIZXJldGljXFwncyBGb3JrIDInOiAnM0UwRScsXHJcbiAgICAnTWFsaWthaCBFYXJ0aHNoYWtlJzogJzNFMzknLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBjb3VsZCBpbmNsdWRlIDU0ODQgTXVkbWFuIFJvY2t5IFJvbGwgYXMgYSBzaGFyZVdhcm4sIGJ1dCBpdCdzIGxvdyBkYW1hZ2UgYW5kIGNvbW1vbi5cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NYXRveWFzUmVsaWN0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdNYXRveWEgUmVsaWN0IFdlcmV3b29kIE92YXRpb24nOiAnNTUxOCcsIC8vIGxpbmUgYW9lXHJcbiAgICAnTWF0b3lhIENhdmUgVGFyYW50dWxhIEhhd2sgQXBpdG94aW4nOiAnNTUxOScsIC8vIGJpZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFNwcmlnZ2FuIFN0b25lYmVhcmVyIFJvbXAnOiAnNTUxQScsIC8vIGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBTb25ueSBPZiBaaWdneSBKaXR0ZXJpbmcgR2xhcmUnOiAnNTUxQycsIC8vIGxvbmcgbmFycm93IGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gUXVhZ21pcmUnOiAnNTQ4MScsIC8vIE11ZG1hbiBhb2UgcHVkZGxlc1xyXG4gICAgJ01hdG95YSBNdWRtYW4gQnJpdHRsZSBCcmVjY2lhIDEnOiAnNTQ4RScsIC8vIGV4cGFuZGluZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBCcml0dGxlIEJyZWNjaWEgMic6ICc1NDhGJywgLy8gZXhwYW5kaW5nIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIEJyaXR0bGUgQnJlY2NpYSAzJzogJzU0OTAnLCAvLyBleHBhbmRpbmcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gTXVkIEJ1YmJsZSc6ICc1NDg3JywgLy8gc3RhbmRpbmcgaW4gbXVkIHB1ZGRsZT9cclxuICAgICdNYXRveWEgQ2F2ZSBQdWdpbCBTY3Jld2RyaXZlcic6ICc1NTFFJywgLy8gY29uYWwgYW9lXHJcbiAgICAnTWF0b3lhIE5peGllIEd1cmdsZSc6ICc1OTkyJywgLy8gTml4aWUgd2FsbCBmbHVzaFxyXG4gICAgJ01hdG95YSBSZWxpY3QgTW9sdGVuIFBob2ViYWQgUHlyb2NsYXN0aWMgU2hvdCc6ICc1N0VCJywgLy8gdGhlIGxpbmUgYW9lcyBhcyB5b3UgcnVuIHRvIHRyYXNoXHJcbiAgICAnTWF0b3lhIFJlbGljdCBGbGFuIEZsb29kJzogJzU1MjMnLCAvLyBiaWcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBQeXJvZHVjdCBFbGR0aHVycyBNYXNoJzogJzU1MjcnLCAvLyBsaW5lIGFvZVxyXG4gICAgJ01hdHlvYSBQeXJvZHVjdCBFbGR0aHVycyBTcGluJzogJzU1MjgnLCAvLyB2ZXJ5IGxhcmdlIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IEJhdmFyb2lzIFRodW5kZXIgSUlJJzogJzU1MjUnLCAvLyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBNYXJzaG1hbGxvdyBBbmNpZW50IEFlcm8nOiAnNTUyNCcsIC8vIHZlcnkgbGFyZ2UgbGluZSBncm9hb2VcclxuICAgICdNYXRveWEgUmVsaWN0IFB1ZGRpbmcgRmlyZSBJSSc6ICc1NTIyJywgLy8gY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgTW9sdGVuIFBob2ViYWQgSG90IExhdmEnOiAnNTdFOScsIC8vIGNvbmFsIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgTW9sdGVuIFBob2ViYWQgVm9sY2FuaWMgRHJvcCc6ICc1N0U4JywgLy8gY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIE1lZGl1bSBSZWFyJzogJzU5MUQnLCAvLyBrbm9ja2JhY2sgaW50byBzYWZlIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBCYXJiZXF1ZSBMaW5lJzogJzU5MTcnLCAvLyBsaW5lIGFvZSBkdXJpbmcgYmJxXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgQmFyYmVxdWUgQ2lyY2xlJzogJzU5MTgnLCAvLyBjaXJjbGUgYW9lIGR1cmluZyBiYnFcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBUbyBBIENyaXNwJzogJzU5MjUnLCAvLyBnZXR0aW5nIHRvIGNsb3NlIHRvIGJvc3MgZHVyaW5nIGJicVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUHJveGllIEJ1ZmZldCc6ICc1OTI2JywgLy8gQWVvbGlhbiBDYXZlIFNwcml0ZSBsaW5lIGFvZSAoaXMgdGhpcyBhIHB1bj8pXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTWF0b3lhIE5peGllIFNlYSBTaGFudHknOiAnNTk4QycsIC8vIE5vdCB0YWtpbmcgdGhlIHB1ZGRsZSB1cCB0byB0aGUgdG9wPyBGYWlsaW5nIGFkZCBlbnJhZ2U/XHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdNYXRveWEgTml4aWUgQ3JhY2snOiAnNTk5MCcsIC8vIE5peGllIENyYXNoLVNtYXNoIHRhbmsgdGV0aGVyc1xyXG4gICAgJ01hdG95YSBOaXhpZSBTcHV0dGVyJzogJzU5OTMnLCAvLyBOaXhpZSBzcHJlYWQgbWFya2VyXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5NdEd1bGcsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0d1bGcgSW1tb2xhdGlvbic6ICc0MUFBJyxcclxuICAgICdHdWxnIFRhaWwgU21hc2gnOiAnNDFBQicsXHJcbiAgICAnR3VsZyBIZWF2ZW5zbGFzaCc6ICc0MUE5JyxcclxuICAgICdHdWxnIFR5cGhvb24gV2luZyAxJzogJzNEMDAnLFxyXG4gICAgJ0d1bGcgVHlwaG9vbiBXaW5nIDInOiAnM0QwMScsXHJcbiAgICAnR3VsZyBIdXJyaWNhbmUgV2luZyc6ICczRDAzJyxcclxuICAgICdHdWxnIEVhcnRoIFNoYWtlcic6ICczN0Y1JyxcclxuICAgICdHdWxnIFNhbmN0aWZpY2F0aW9uJzogJzQxQUUnLFxyXG4gICAgJ0d1bGcgRXhlZ2VzaXMnOiAnM0QwNycsXHJcbiAgICAnR3VsZyBQZXJmZWN0IENvbnRyaXRpb24nOiAnM0QwRScsXHJcbiAgICAnR3VsZyBTYW5jdGlmaWVkIEFlcm8nOiAnNDFBRCcsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyAxJzogJzNEMTYnLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gMic6ICczRDE4JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDMnOiAnNDY2OScsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyA0JzogJzNEMTknLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gNSc6ICczRDIxJyxcclxuICAgICdHdWxnIENvbnZpY3Rpb24gTWFyY2F0byAxJzogJzNEMUEnLFxyXG4gICAgJ0d1bGcgQ29udmljdGlvbiBNYXJjYXRvIDInOiAnM0QxQicsXHJcbiAgICAnR3VsZyBDb252aWN0aW9uIE1hcmNhdG8gMyc6ICczRDIwJyxcclxuICAgICdHdWxnIFZlbmEgQW1vcmlzJzogJzNEMjcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0d1bGcgTHVtZW4gSW5maW5pdHVtJzogJzQxQjInLFxyXG4gICAgJ0d1bGcgUmlnaHQgUGFsbSc6ICczN0Y4JyxcclxuICAgICdHdWxnIExlZnQgUGFsbSc6ICczN0ZBJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogV2hhdCB0byBkbyBhYm91dCBLYWhuIFJhaSA1QjUwP1xyXG4vLyBJdCBzZWVtcyBpbXBvc3NpYmxlIGZvciB0aGUgbWFya2VkIHBlcnNvbiB0byBhdm9pZCBlbnRpcmVseS5cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5QYWdsdGhhbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUGFnbHRoYW4gVGVsb3ZvdWl2cmUgUGxhZ3VlIFN3aXBlJzogJzYwRkMnLCAvLyBmcm9udGFsIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIExlc3NlciBUZWxvZHJhZ29uIEVuZ3VsZmluZyBGbGFtZXMnOiAnNjBGNScsIC8vIGZyb250YWwgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBMaWdodG5pbmcgQm9sdCc6ICc1QzRDJywgLy8gY2lyY3VsYXIgbGlnaHRuaW5nIGFvZSAob24gc2VsZiBvciBwb3N0KVxyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgQmFsbCBPZiBMZXZpbiBTaG9jayc6ICc1QzUyJywgLy8gcHVsc2luZyBzbWFsbCBjaXJjdWxhciBhb2VzXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBTdXBlcmNoYXJnZWQgQmFsbCBPZiBMZXZpbiBTaG9jayc6ICc1QzUzJywgLy8gcHVsc2luZyBsYXJnZSBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIFdpZGUgQmxhc3Rlcic6ICc2MEM1JywgLy8gcmVhciBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBUZWxvYnJvYmlueWFrIEZhbGwgT2YgTWFuJzogJzYxNDgnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvdGVrIFJlYXBlciBNYWdpdGVrIENhbm5vbic6ICc2MTIxJywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb2RyYWdvbiBTaGVldCBvZiBJY2UnOiAnNjBGOCcsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9kcmFnb24gRnJvc3QgQnJlYXRoJzogJzYwRjcnLCAvLyB2ZXJ5IGxhcmdlIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIE1hZ2l0ZWsgQ29yZSBTdGFibGUgQ2Fubm9uJzogJzVDOTQnLCAvLyBsYXJnZSBsaW5lIGFvZXNcclxuICAgICdQYWdsdGhhbiBNYWdpdGVrIENvcmUgMi1Ub256ZSBNYWdpdGVrIE1pc3NpbGUnOiAnNUM5NScsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG90ZWsgU2t5IEFybW9yIEFldGhlcnNob3QnOiAnNUM5QycsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIE1hcmsgSUkgVGVsb3RlayBDb2xvc3N1cyBFeGhhdXN0JzogJzVDOTknLCAvLyBsYXJnZSBsaW5lIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIE1hZ2l0ZWsgTWlzc2lsZSBFeHBsb3NpdmUgRm9yY2UnOiAnNUM5OCcsIC8vIHNsb3cgbW92aW5nIGhvcml6b250YWwgbWlzc2lsZXNcclxuICAgICdQYWdsdGhhbiBUaWFtYXQgRmxhbWlzcGhlcmUnOiAnNjEwRicsIC8vIHZlcnkgbG9uZyBsaW5lIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIEFybW9yZWQgVGVsb2RyYWdvbiBUb3J0b2lzZSBTdG9tcCc6ICc2MTRCJywgLy8gbGFyZ2UgY2lyY3VsYXIgYW9lIGZyb20gdHVydGxlXHJcbiAgICAnUGFnbHRoYW4gVGVsb2RyYWdvbiBUaHVuZGVyb3VzIEJyZWF0aCc6ICc2MTQ5JywgLy8gbGFyZ2UgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBMdW5hciBOYWlsIFVwYnVyc3QnOiAnNjA1QicsIC8vIHNtYWxsIGFvZXMgYmVmb3JlIEJpZyBCdXJzdFxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTHVuYXIgTmFpbCBCaWcgQnVyc3QnOiAnNUI0OCcsIC8vIGxhcmdlIGNpcmN1bGFyIGFvZXMgZnJvbSBuYWlsc1xyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgUGVyaWdlYW4gQnJlYXRoJzogJzVCNTknLCAvLyBsYXJnZSBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSc6ICc1QjRFJywgLy8gbWVnYWZsYXJlIHBlcHBlcm9uaVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTWVnYWZsYXJlIERpdmUnOiAnNUI1MicsIC8vIG1lZ2FmbGFyZSBsaW5lIGFvZSBhY3Jvc3MgdGhlIGFyZW5hXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBMdW5hciBGbGFyZSc6ICc1QjRBJywgLy8gbGFyZ2UgcHVycGxlIHNocmlua2luZyBjaXJjbGVzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IE1lZ2FmbGFyZSc6ICc1QjREJywgLy8gbWVnYWZsYXJlIHNwcmVhZCBtYXJrZXJzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVRaXRhbmFSYXZlbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUWl0YW5hIFN1biBUb3NzJzogJzNDOEEnLCAvLyBHcm91bmQgQW9FLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBSb25rYW4gTGlnaHQgMSc6ICczQzhDJywgLy8gU3RhdHVlIGF0dGFjaywgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgTG96YXRsXFwncyBGdXJ5IDEnOiAnM0M4RicsIC8vIFNlbWljaXJjbGUgY2xlYXZlLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBMb3phdGxcXCdzIEZ1cnkgMic6ICczQzkwJywgLy8gU2VtaWNpcmNsZSBjbGVhdmUsIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIEZhbGxpbmcgUm9jayc6ICczQzk2JywgLy8gU21hbGwgZ3JvdW5kIEFvRSwgYm9zcyB0d29cclxuICAgICdRaXRhbmEgRmFsbGluZyBCb3VsZGVyJzogJzNDOTcnLCAvLyBMYXJnZSBncm91bmQgQW9FLCBib3NzIHR3b1xyXG4gICAgJ1FpdGFuYSBUb3dlcmZhbGwnOiAnM0M5OCcsIC8vIFBpbGxhciBjb2xsYXBzZSwgYm9zcyB0d29cclxuICAgICdRaXRhbmEgVmlwZXIgUG9pc29uIDInOiAnM0M5RScsIC8vIFN0YXRpb25hcnkgcG9pc29uIHB1ZGRsZXMsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCAxJzogJzNDQTInLCAvLyBEYW5nZXJvdXMgbWlkZGxlIGR1cmluZyBzcHJlYWQgY2lyY2xlcywgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDMnOiAnM0NBNicsIC8vIERhbmdlcm91cyBzaWRlcyBkdXJpbmcgc3RhY2sgbWFya2VyLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggNCc6ICczQ0E3JywgLy8gRGFuZ2Vyb3VzIHNpZGVzIGR1cmluZyBzdGFjayBtYXJrZXIsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgUm9ua2FuIExpZ2h0IDInOiAnM0Q2RCcsIC8vIFN0YXR1ZSBhdHRhY2ssIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIFdyYXRoIG9mIHRoZSBSb25rYSc6ICczRTJDJywgLy8gU3RhdHVlIGxpbmUgYXR0YWNrIGZyb20gbWluaS1ib3NzZXMgYmVmb3JlIGZpcnN0IGJvc3NcclxuICAgICdRaXRhbmEgU2luc3BpdHRlcic6ICczRTM2JywgLy8gR29yaWxsYSBib3VsZGVyIHRvc3MgQW9FIGJlZm9yZSB0aGlyZCBib3NzXHJcbiAgICAnUWl0YW5hIEhvdW5kIG91dCBvZiBIZWF2ZW4nOiAnNDJCOCcsIC8vIFRldGhlciBleHRlbnNpb24gZmFpbHVyZSwgYm9zcyB0aHJlZTsgNDJCNyBpcyBjb3JyZWN0IGV4ZWN1dGlvblxyXG4gICAgJ1FpdGFuYSBSb25rYW4gQWJ5c3MnOiAnNDNFQicsIC8vIEdyb3VuZCBBb0UgZnJvbSBtaW5pLWJvc3NlcyBiZWZvcmUgZmlyc3QgYm9zc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUWl0YW5hIFZpcGVyIFBvaXNvbiAxJzogJzNDOUQnLCAvLyBBb0UgZnJvbSB0aGUgMDBBQiBwb2lzb24gaGVhZCBtYXJrZXIsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCAyJzogJzNDQTMnLCAvLyBPdmVybGFwcGVkIGNpcmNsZXMgZmFpbHVyZSBvbiB0aGUgc3ByZWFkIGNpcmNsZXMgdmVyc2lvbiBvZiB0aGUgbWVjaGFuaWNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVGhlIEdyYW5kIENvc21vc1xyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlR3JhbmRDb3Ntb3MsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0Nvc21vcyBJcm9uIEp1c3RpY2UnOiAnNDkxRicsXHJcbiAgICAnQ29zbW9zIFNtaXRlIE9mIFJhZ2UnOiAnNDkyMScsXHJcblxyXG4gICAgJ0Nvc21vcyBUcmlidWxhdGlvbic6ICc0OUE0JyxcclxuICAgICdDb3Ntb3MgRGFyayBTaG9jayc6ICc0NzZGJyxcclxuICAgICdDb3Ntb3MgU3dlZXAnOiAnNDc3MCcsXHJcbiAgICAnQ29zbW9zIERlZXAgQ2xlYW4nOiAnNDc3MScsXHJcblxyXG4gICAgJ0Nvc21vcyBTaGFkb3cgQnVyc3QnOiAnNDkyNCcsXHJcbiAgICAnQ29zbW9zIEJsb29keSBDYXJlc3MnOiAnNDkyNycsXHJcbiAgICAnQ29zbW9zIE5lcGVudGhpYyBQbHVuZ2UnOiAnNDkyOCcsXHJcbiAgICAnQ29zbW9zIEJyZXdpbmcgU3Rvcm0nOiAnNDkyOScsXHJcblxyXG4gICAgJ0Nvc21vcyBPZGUgVG8gRmFsbGVuIFBldGFscyc6ICc0OTUwJyxcclxuICAgICdDb3Ntb3MgRmFyIFdpbmQgR3JvdW5kJzogJzQyNzMnLFxyXG5cclxuICAgICdDb3Ntb3MgRmlyZSBCcmVhdGgnOiAnNDkyQicsXHJcbiAgICAnQ29zbW9zIFJvbmthbiBGcmVlemUnOiAnNDkyRScsXHJcbiAgICAnQ29zbW9zIE92ZXJwb3dlcic6ICc0OTJEJyxcclxuXHJcbiAgICAnQ29zbW9zIFNjb3JjaGluZyBMZWZ0JzogJzQ3NjMnLFxyXG4gICAgJ0Nvc21vcyBTY29yY2hpbmcgUmlnaHQnOiAnNDc2MicsXHJcbiAgICAnQ29zbW9zIE90aGVyd29yZGx5IEhlYXQnOiAnNDc1QycsXHJcbiAgICAnQ29zbW9zIEZpcmVcXCdzIElyZSc6ICc0NzYxJyxcclxuICAgICdDb3Ntb3MgUGx1bW1ldCc6ICc0NzY3JyxcclxuXHJcbiAgICAnQ29zbW9zIEZpcmVcXCdzIERvbWFpbiBUZXRoZXInOiAnNDc1RicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdDb3Ntb3MgRGFyayBXZWxsJzogJzQ3NkQnLFxyXG4gICAgJ0Nvc21vcyBGYXIgV2luZCBTcHJlYWQnOiAnNDcyNCcsXHJcbiAgICAnQ29zbW9zIEJsYWNrIEZsYW1lJzogJzQ3NUQnLFxyXG4gICAgJ0Nvc21vcyBGaXJlXFwncyBEb21haW4nOiAnNDc2MCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVUd2lubmluZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVHdpbm5pbmcgQXV0byBDYW5ub25zJzogJzQzQTknLFxyXG4gICAgJ1R3aW5uaW5nIEhlYXZlJzogJzNEQjknLFxyXG4gICAgJ1R3aW5uaW5nIDMyIFRvbnplIFN3aXBlJzogJzNEQkInLFxyXG4gICAgJ1R3aW5uaW5nIFNpZGVzd2lwZSc6ICczREJGJyxcclxuICAgICdUd2lubmluZyBXaW5kIFNwb3V0JzogJzNEQkUnLFxyXG4gICAgJ1R3aW5uaW5nIFNob2NrJzogJzNERjEnLFxyXG4gICAgJ1R3aW5uaW5nIExhc2VyYmxhZGUnOiAnM0RFQycsXHJcbiAgICAnVHdpbm5pbmcgVm9ycGFsIEJsYWRlJzogJzNEQzInLFxyXG4gICAgJ1R3aW5uaW5nIFRocm93biBGbGFtZXMnOiAnM0RDMycsXHJcbiAgICAnVHdpbm5pbmcgTWFnaXRlayBSYXknOiAnM0RGMycsXHJcbiAgICAnVHdpbm5pbmcgSGlnaCBHcmF2aXR5JzogJzNERkEnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1R3aW5uaW5nIDEyOCBUb256ZSBTd2lwZSc6ICczREJBJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBEZWFkIElyb24gNUFCMCAoZWFydGhzaGFrZXJzLCBidXQgb25seSBpZiB5b3UgdGFrZSB0d28/KVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHVicnVtUmVnaW5hZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmN5IEZvdXJmb2xkJzogJzVCMzQnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgQmFsZWZ1bCBTd2F0aGUnOiAnNUFCNCcsIC8vIEdyb3VuZCBhb2UgdG8gZWl0aGVyIHNpZGUgb2YgYm9zc1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBCYWxlZnVsIEJsYWRlJzogJzVCMjgnLCAvLyBIaWRlIGJlaGluZCBwaWxsYXJzIGF0dGFja1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMSc6ICc1QUE0JywgLy8gQmx1ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMic6ICc1QUE1JywgLy8gQmx1ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMyc6ICc1QUE2JywgLy8gQmx1ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDEnOiAnNUFBNycsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMic6ICc1QUE4JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAzJzogJzVBQTknLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBTY29yY2hpbmcgU2hhY2tsZSc6ICc1QUFFJywgLy8gQ2hhaW4gZGFtYWdlXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmNpZnVsIEJyZWV6ZSc6ICc1QUFCJywgLy8gV2FmZmxlIGNyaXNzLWNyb3NzIGZsb29yIG1hcmtlcnNcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY2lmdWwgQmxvb21zJzogJzVBQUQnLCAvLyBQdXJwbGUgZ3Jvd2luZyBjaXJjbGVcclxuICAgICdEZWx1YnJ1bSBEYWh1IFJpZ2h0LVNpZGVkIFNob2Nrd2F2ZSc6ICc1NzYxJywgLy8gUmlnaHQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gRGFodSBMZWZ0LVNpZGVkIFNob2Nrd2F2ZSc6ICc1NzYyJywgLy8gTGVmdCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBEYWh1IEZpcmVicmVhdGhlJzogJzU3NjUnLCAvLyBDb25hbCBicmVhdGhcclxuICAgICdEZWx1YnJ1bSBEYWh1IEZpcmVicmVhdGhlIFJvdGF0aW5nJzogJzU3NUEnLCAvLyBDb25hbCBicmVhdGgsIHJvdGF0aW5nXHJcbiAgICAnRGVsdWJydW0gRGFodSBIZWFkIERvd24nOiAnNTc1NicsIC8vIGxpbmUgYW9lIGNoYXJnZSBmcm9tIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW0gRGFodSBIdW50ZXJcXCdzIENsYXcnOiAnNTc1NycsIC8vIGNpcmN1bGFyIGdyb3VuZCBhb2UgY2VudGVyZWQgb24gTWFyY2hvc2lhcyBhZGRcclxuICAgICdEZWx1YnJ1bSBEYWh1IEZhbGxpbmcgUm9jayc6ICc1NzVDJywgLy8gZ3JvdW5kIGFvZSBmcm9tIFJldmVyYmVyYXRpbmcgUm9hclxyXG4gICAgJ0RlbHVicnVtIERhaHUgSG90IENoYXJnZSc6ICc1NzY0JywgLy8gZG91YmxlIGNoYXJnZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgUmlwcGVyIENsYXcnOiAnNTc1RCcsIC8vIGZyb250YWwgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gRGFodSBUYWlsIFN3aW5nJzogJzU3NUYnLCAvLyB0YWlsIHN3aW5nIDspXHJcbiAgICAnRGVsdWJydW0gR3VhcmQgUGF3biBPZmYnOiAnNTgwNicsIC8vIFF1ZWVuJ3MgU29sZGllciBTZWNyZXRzIFJldmVhbGVkIHRldGhlcmVkIGNsb25lIGFvZVxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFR1cnJldFxcJ3MgVG91ciAxJzogJzU4MEQnLCAvLyBRdWVlbidzIEd1bm5lciByZWZsZWN0aXZlIHR1cnJldCBzaG90XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgVHVycmV0XFwncyBUb3VyIDInOiAnNTgwRScsIC8vIFF1ZWVuJ3MgR3VubmVyIHJlZmxlY3RpdmUgdHVycmV0IHNob3RcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgMyc6ICc1ODBGJywgLy8gUXVlZW4ncyBHdW5uZXIgcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIE9wdGltYWwgUGxheSBTaGllbGQnOiAnNTdGMycsIC8vIFF1ZWVuJ3MgS25pZ2h0IHNoaWVsZCBnZXQgdW5kZXJcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTdGMicsIC8vIFF1ZWVuJ3MgS25pZ2h0IHN3b3JkIGdldCBvdXRcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBDb3VudGVycGxheSc6ICc1N0Y2JywgLy8gSGl0dGluZyBhZXRoZXJpYWwgd2FyZCBkaXJlY3Rpb25hbCBiYXJyaWVyXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBTd2lybGluZyBNaWFzbWEgMSc6ICc1N0E5JywgLy8gSW5pdGlhbCBwaGFudG9tIGRvbnV0IGFvZSBmcm9tIGNpcmNsZVxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDInOiAnNTdBQScsIC8vIE1vdmluZyBwaGFudG9tIGRvbnV0IGFvZXMgZnJvbSBjaXJjbGVcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIENyZWVwaW5nIE1pYXNtYSc6ICc1N0E1JywgLy8gcGhhbnRvbSBsaW5lIGFvZSBmcm9tIHNxdWFyZVxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gVmlsZSBXYXZlJzogJzU3QjEnLCAvLyBwaGFudG9tIGNvbmFsIGFvZVxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBGdXJ5IE9mIEJvemphJzogJzU5NzMnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcIm91dFwiXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEZsYXNodmFuZSc6ICc1OTcyJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgYmVoaW5kXCJcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgSW5mZXJuYWwgU2xhc2gnOiAnNTk3MScsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGZyb250XCJcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgRmxhbWVzIE9mIEJvemphJzogJzU5NjgnLCAvLyA4MCUgZmxvb3IgYW9lIGJlZm9yZSBzaGltbWVyaW5nIHNob3Qgc3dvcmRzXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEdsZWFtaW5nIEFycm93JzogJzU5NzQnLCAvLyBUcmluaXR5IEF2YXRhciBsaW5lIGFvZXMgZnJvbSBvdXRzaWRlXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIE1lYW5zIDEnOiAnNTlCQicsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBNZWFucyAyJzogJzU5QkQnLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgRW5kIDEnOiAnNTlCQScsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIEVuZCAyJzogJzU5QkMnLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIE5vcnRoc3dhaW5cXCdzIEdsb3cnOiAnNTlDNCcsIC8vIGV4cGFuZGluZyBsaW5lcyB3aXRoIGV4cGxvc2lvbiBpbnRlcnNlY3Rpb25zXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gSnVkZ21lbnQgQmxhZGUgTGVmdCc6ICc1QjgzJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIGxlZnQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gSnVkZ21lbnQgQmxhZGUgUmlnaHQnOiAnNUI4MycsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBRdWVlblxcJ3MgSnVzdGljZSc6ICc1OUJGJywgLy8gZmFpbGluZyB0byB3YWxrIHRoZSByaWdodCBudW1iZXIgb2Ygc3F1YXJlc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFR1cnJldFxcJ3MgVG91ciAxJzogJzU5RTAnLCAvLyByZWZsZWN0aXZlIHR1cnJldCBzaG90IGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFR1cnJldFxcJ3MgVG91ciAyJzogJzU5RTEnLCAvLyByZWZsZWN0aXZlIHR1cnJldCBzaG90IGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFR1cnJldFxcJ3MgVG91ciAzJzogJzU5RTInLCAvLyByZWZsZWN0aXZlIHR1cnJldCBzaG90IGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFBhd24gT2ZmJzogJzU5REEnLCAvLyBTZWNyZXRzIFJldmVhbGVkIHRldGhlcmVkIGNsb25lIGFvZSBkdXJpbmcgUXVlZW5cclxuICAgICdEZWx1YnJ1bSBRdWVlbiBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzU5Q0UnLCAvLyBRdWVlbidzIEtuaWdodCBzaGllbGQgZ2V0IHVuZGVyIGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIE9wdGltYWwgUGxheSBTd29yZCc6ICc1OUNDJywgLy8gUXVlZW4ncyBLbmlnaHQgc3dvcmQgZ2V0IG91dCBkdXJpbmcgUXVlZW5cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEZWx1YnJ1bSBIaWRkZW4gVHJhcCBNYXNzaXZlIEV4cGxvc2lvbic6ICc1QTZFJywgLy8gZXhwbG9zaW9uIHRyYXBcclxuICAgICdEZWx1YnJ1bSBIaWRkZW4gVHJhcCBQb2lzb24gVHJhcCc6ICc1QTZGJywgLy8gcG9pc29uIHRyYXBcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgSGVhdCBTaG9jayc6ICc1OTVFJywgLy8gdG9vIG11Y2ggaGVhdCBvciBmYWlsaW5nIHRvIHJlZ3VsYXRlIHRlbXBlcmF0dXJlXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIENvbGQgU2hvY2snOiAnNTk1RicsIC8vIHRvbyBtdWNoIGNvbGQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIE1lcmNpZnVsIE1vb24nOiAnMjYyJywgLy8gXCJQZXRyaWZpY2F0aW9uXCIgZnJvbSBBZXRoZXJpYWwgT3JiIGxvb2thd2F5XHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdEZWx1YnJ1bSBEYWh1IEhlYXQgQnJlYXRoJzogJzU3NjYnLCAvLyB0YW5rIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBXcmF0aCBPZiBCb3pqYSc6ICc1OTc1JywgLy8gdGFuayBjbGVhdmVcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEF0IGxlYXN0IGR1cmluZyBUaGUgUXVlZW4sIHRoZXNlIGFiaWxpdHkgaWRzIGNhbiBiZSBvcmRlcmVkIGRpZmZlcmVudGx5LFxyXG4gICAgICAvLyBhbmQgdGhlIGZpcnN0IGV4cGxvc2lvbiBcImhpdHNcIiBldmVyeW9uZSwgYWx0aG91Z2ggd2l0aCBcIjFCXCIgZmxhZ3MuXHJcbiAgICAgIGlkOiAnRGVsdWJydW0gTG90cyBDYXN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzU2NUEnLCAnNTY1QicsICc1N0ZEJywgJzU3RkUnLCAnNUI4NicsICc1Qjg3JywgJzU5RDInLCAnNUQ5MyddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLmZsYWdzLnNsaWNlKC0yKSA9PT0gJzAzJyxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBEYWh1IDU3NzYgU3BpdCBGbGFtZSBzaG91bGQgYWx3YXlzIGhpdCBhIE1hcmNob3NpYXNcclxuLy8gVE9ETzogaGl0dGluZyBwaGFudG9tIHdpdGggaWNlIHNwaWtlcyB3aXRoIGFueXRoaW5nIGJ1dCBkaXNwZWw/XHJcbi8vIFRPRE86IGZhaWxpbmcgaWN5L2ZpZXJ5IHBvcnRlbnQgKGd1YXJkIGFuZCBxdWVlbilcclxuLy8gICAgICAgYDE4OlB5cmV0aWMgRG9UIFRpY2sgb24gJHtuYW1lfSBmb3IgJHtkYW1hZ2V9IGRhbWFnZS5gXHJcbi8vIFRPRE86IFdpbmRzIE9mIEZhdGUgLyBXZWlnaHQgT2YgRm9ydHVuZT9cclxuLy8gVE9ETzogVHVycmV0J3MgVG91cj9cclxuLy8gZ2VuZXJhbCB0cmFwczogZXhwbG9zaW9uOiA1QTcxLCBwb2lzb24gdHJhcDogNUE3MiwgbWluaTogNUE3M1xyXG4vLyBkdWVsIHRyYXBzOiBtaW5pOiA1N0ExLCBpY2U6IDU3OUYsIHRvYWQ6IDU3QTBcclxuLy8gVE9ETzogdGFraW5nIG1hbmEgZmxhbWUgd2l0aG91dCByZWZsZWN0XHJcbi8vIFRPRE86IHRha2luZyBNYWVsc3Ryb20ncyBCb2x0IHdpdGhvdXQgbGlnaHRuaW5nIGJ1ZmZcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx1YnJ1bVJlZ2luYWVTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBTbGltZXMgSGVsbGlzaCBTbGFzaCc6ICc1N0VBJywgLy8gQm96amFuIFNvbGRpZXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIFNsaW1lcyBWaXNjb3VzIFJ1cHR1cmUnOiAnNTAxNicsIC8vIEZ1bGx5IG1lcmdlZCB2aXNjb3VzIHNsaW1lIGFvZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgR29sZW1zIERlbW9saXNoJzogJzU4ODAnLCAvLyBpbnRlcnJ1cHRpYmxlIFJ1aW5zIEdvbGVtIGNhc3RcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgU3dhdGhlJzogJzVBRDEnLCAvLyBHcm91bmQgYW9lIHRvIGVpdGhlciBzaWRlIG9mIGJvc3NcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBCbGFkZSc6ICc1QjJBJywgLy8gSGlkZSBiZWhpbmQgcGlsbGFycyBhdHRhY2tcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgU2NvcmNoaW5nIFNoYWNrbGUnOiAnNUFDQicsIC8vIENoYWluc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCAxJzogJzVCOTQnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgMic6ICc1QUI5JywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDMnOiAnNUFCQScsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCA0JzogJzVBQkInLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgNSc6ICc1QUJDJywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmNpZnVsIEJyZWV6ZSc6ICc1QUM4JywgLy8gV2FmZmxlIGNyaXNzLWNyb3NzIGZsb29yIG1hcmtlcnNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBDb21ldCc6ICc1QUQ3JywgLy8gQ2xvbmUgbWV0ZW9yIGRyb3BwaW5nIGJlZm9yZSBjaGFyZ2VzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIEJhbGVmdWwgRmlyZXN0b3JtJzogJzVBRDgnLCAvLyBDbG9uZSBjaGFyZ2UgYWZ0ZXIgQmFsZWZ1bCBDb21ldFxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFJvc2UnOiAnNUFEOScsIC8vIENsb25lIGxpbmUgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMSc6ICc1QUMxJywgLy8gQmx1ZSByaW4gZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDInOiAnNUFDMicsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBCbHVlIDMnOiAnNUFDMycsIC8vIEJsdWUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAxJzogJzVBQzQnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDInOiAnNUFDNScsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMyc6ICc1QUM2JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQWN0IE9mIE1lcmN5JzogJzVBQ0YnLCAvLyBjcm9zcy1zaGFwZWQgbGluZSBhb2VzXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlIDEnOiAnNTc3MCcsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlIDInOiAnNTc3MicsIC8vIFJpZ2h0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgTGVmdC1TaWRlZCBTaG9ja3dhdmUgMSc6ICc1NzZGJywgLy8gTGVmdCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlIDInOiAnNTc3MScsIC8vIExlZnQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGaXJlYnJlYXRoZSc6ICc1Nzc0JywgLy8gQ29uYWwgYnJlYXRoXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGaXJlYnJlYXRoZSBSb3RhdGluZyc6ICc1NzZDJywgLy8gQ29uYWwgYnJlYXRoLCByb3RhdGluZ1xyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgSGVhZCBEb3duJzogJzU3NjgnLCAvLyBsaW5lIGFvZSBjaGFyZ2UgZnJvbSBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgSHVudGVyXFwncyBDbGF3JzogJzU3NjknLCAvLyBjaXJjdWxhciBncm91bmQgYW9lIGNlbnRlcmVkIG9uIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBGYWxsaW5nIFJvY2snOiAnNTc2RScsIC8vIGdyb3VuZCBhb2UgZnJvbSBSZXZlcmJlcmF0aW5nIFJvYXJcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEhvdCBDaGFyZ2UnOiAnNTc3MycsIC8vIGRvdWJsZSBjaGFyZ2VcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBNYXNzaXZlIEV4cGxvc2lvbic6ICc1NzlFJywgLy8gYm9tYnMgYmVpbmcgY2xlYXJlZFxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgVmljaW91cyBTd2lwZSc6ICc1Nzk3JywgLy8gY2lyY3VsYXIgYW9lIGFyb3VuZCBib3NzXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGb2N1c2VkIFRyZW1vciAxJzogJzU3OEYnLCAvLyBzcXVhcmUgZmxvb3IgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRm9jdXNlZCBUcmVtb3IgMic6ICc1NzkxJywgLy8gc3F1YXJlIGZsb29yIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIERldm91cic6ICc1Nzg5JywgLy8gY29uYWwgYW9lIGFmdGVyIHdpdGhlcmluZyBjdXJzZVxyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRmxhaWxpbmcgU3RyaWtlIDEnOiAnNTc4QycsIC8vIGluaXRpYWwgcm90YXRpbmcgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGbGFpbGluZyBTdHJpa2UgMic6ICc1NzhEJywgLy8gcm90YXRpbmcgY2xlYXZlc1xyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIE9mZmVuc2l2ZSBTd29yZCc6ICc1ODE5JywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgT2ZmZW5zaXZlIFNoaWVsZCc6ICc1ODFBJywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgUGxheSBTd29yZCc6ICc1ODE2JywgLy8gT3B0aW1hbCBQbGF5IFN3b3JkIFwiZ2V0IG91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1ODE3JywgLy8gT3B0aW1hbCBwbGF5IHNoaWVsZCBcImdldCBpblwiXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBQbGF5IENsZWF2ZSc6ICc1ODE4JywgLy8gT3B0aW1hbCBQbGF5IGNsZWF2ZXMgZm9yIHN3b3JkL3NoaWVsZFxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFVubHVja3kgTG90JzogJzU4MUQnLCAvLyBRdWVlbidzIEtuaWdodCBvcmIgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgQnVybiAxJzogJzU4M0QnLCAvLyBzbWFsbCBmaXJlIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBCdXJuIDInOiAnNTgzRScsIC8vIGxhcmdlIGZpcmUgYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFBhd24gT2ZmJzogJzU4M0EnLCAvLyBRdWVlbidzIFNvbGRpZXIgU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDEnOiAnNTg0NycsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDFcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDInOiAnNTg0OCcsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDJcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDMnOiAnNTg0OScsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBzZWNvbmQgbGluZXNcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBDb3VudGVycGxheSc6ICc1OEY1JywgLy8gSGl0dGluZyBhZXRoZXJpYWwgd2FyZCBkaXJlY3Rpb25hbCBiYXJyaWVyXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDEnOiAnNTdCOCcsIC8vIEluaXRpYWwgcGhhbnRvbSBkb251dCBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAyJzogJzU3QjknLCAvLyBNb3ZpbmcgcGhhbnRvbSBkb251dCBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEgMSc6ICc1N0I0JywgLy8gSW5pdGlhbCBwaGFudG9tIGxpbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBDcmVlcGluZyBNaWFzbWEgMic6ICc1N0I1JywgLy8gTGF0ZXIgcGhhbnRvbSBsaW5lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gTGluZ2VyaW5nIE1pYXNtYSAxJzogJzU3QjYnLCAvLyBJbml0aWFsIHBoYW50b20gY2lyY2xlIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gTGluZ2VyaW5nIE1pYXNtYSAyJzogJzU3QjcnLCAvLyBNb3ZpbmcgcGhhbnRvbSBjaXJjbGUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBWaWxlIFdhdmUnOiAnNTdCRicsIC8vIHBoYW50b20gY29uYWwgYW9lXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBGdXJ5IE9mIEJvemphJzogJzU5NEMnLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcIm91dFwiXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEZsYXNodmFuZSc6ICc1OTRCJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgYmVoaW5kXCJcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgSW5mZXJuYWwgU2xhc2gnOiAnNTk0QScsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwiZ2V0IGZyb250XCJcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgRmxhbWVzIE9mIEJvemphJzogJzU5MzknLCAvLyA4MCUgZmxvb3IgYW9lIGJlZm9yZSBzaGltbWVyaW5nIHNob3Qgc3dvcmRzXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEdsZWFtaW5nIEFycm93JzogJzU5NEQnLCAvLyBUcmluaXR5IEF2YXRhciBsaW5lIGFvZXMgZnJvbSBvdXRzaWRlXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgV2hhY2snOiAnNTdEMCcsIC8vIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRGV2YXN0YXRpbmcgQm9sdCAxJzogJzU3QzUnLCAvLyBsaWdodG5pbmcgcmluZ3NcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIERldmFzdGF0aW5nIEJvbHQgMic6ICc1N0M2JywgLy8gbGlnaHRuaW5nIHJpbmdzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBFbGVjdHJvY3V0aW9uJzogJzU3Q0MnLCAvLyByYW5kb20gY2lyY2xlIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIFJhcGlkIEJvbHRzJzogJzU3QzMnLCAvLyBkcm9wcGVkIGxpZ2h0bmluZyBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCAxMTExLVRvbnplIFN3aW5nJzogJzU3RDgnLCAvLyB2ZXJ5IGxhcmdlIFwiZ2V0IG91dFwiIHN3aW5nXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBNb25rIEF0dGFjayc6ICc1NUE2JywgLy8gTW9uayBhZGQgYXV0by1hdHRhY2tcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gTm9ydGhzd2FpblxcJ3MgR2xvdyc6ICc1OUY0JywgLy8gZXhwYW5kaW5nIGxpbmVzIHdpdGggZXhwbG9zaW9uIGludGVyc2VjdGlvbnNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgTWVhbnMgMSc6ICc1OUU3JywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIE1lYW5zIDInOiAnNTlFQScsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFRoZSBFbmQgMSc6ICc1OUU4JywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgRW5kIDInOiAnNTlFOScsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBPZmZlbnNpdmUgU3dvcmQnOiAnNUEwMicsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIE9mZmVuc2l2ZSBTaGllbGQnOiAnNUEwMycsIC8vIG1pZGRsZSBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0IDEnOiAnNTlGMicsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCBsZWZ0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIExlZnQgMic6ICc1Qjg1JywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIGxlZnQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gSnVkZ21lbnQgQmxhZGUgUmlnaHQgMSc6ICc1OUYxJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIHJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIFJpZ2h0IDInOiAnNUI4NCcsIC8vIGRhc2ggYWNyb3NzIHJvb20gd2l0aCByaWdodCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBQYXduIE9mZic6ICc1QTFEJywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU5RkYnLCAvLyBPcHRpbWFsIFBsYXkgU3dvcmQgXCJnZXQgb3V0XCJcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzVBMDAnLCAvLyBPcHRpbWFsIHBsYXkgc2hpZWxkIFwiZ2V0IGluXCJcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIFBsYXkgQ2xlYXZlJzogJzVBMDEnLCAvLyBPcHRpbWFsIFBsYXkgY2xlYXZlcyBmb3Igc3dvcmQvc2hpZWxkXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAxJzogJzVBMjgnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAxXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAyJzogJzVBMkEnLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgaW5pdGlhbCBsaW5lcyAyXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVHVycmV0XFwncyBUb3VyIE5vcm1hbCAzJzogJzVBMjknLCAvLyBcIm5vcm1hbCBtb2RlXCIgdHVycmV0cywgc2Vjb25kIGxpbmVzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEhlYXQgU2hvY2snOiAnNTkyNycsIC8vIHRvbyBtdWNoIGhlYXQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBDb2xkIFNob2NrJzogJzU5MjgnLCAvLyB0b28gbXVjaCBjb2xkIG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBRdWVlblxcJ3MgSnVzdGljZSc6ICc1OUVCJywgLy8gZmFpbGluZyB0byB3YWxrIHRoZSByaWdodCBudW1iZXIgb2Ygc3F1YXJlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEd1bm5oaWxkclxcJ3MgQmxhZGVzJzogJzVCMjInLCAvLyBub3QgYmVpbmcgaW4gdGhlIGNoZXNzIGJsdWUgc2FmZSBzcXVhcmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBVbmx1Y2t5IExvdCc6ICc1NUI2JywgLy8gbGlnaHRuaW5nIG9yYiBhdHRhY2tcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjaWZ1bCBNb29uJzogJzI2MicsIC8vIFwiUGV0cmlmaWNhdGlvblwiIGZyb20gQWV0aGVyaWFsIE9yYiBsb29rYXdheVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIFBoYW50b20gQmFsZWZ1bCBPbnNsYXVnaHQnOiAnNUFENicsIC8vIHNvbG8gdGFuayBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIEZvZSBTcGxpdHRlcic6ICc1N0Q3JywgLy8gdGFuayBjbGVhdmVcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXNlIGFiaWxpdHkgaWRzIGNhbiBiZSBvcmRlcmVkIGRpZmZlcmVudGx5IGFuZCBcImhpdFwiIHBlb3BsZSB3aGVuIGxldml0YXRpbmcuXHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgR3VhcmQgTG90cyBDYXN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzU4MjcnLCAnNTgyOCcsICc1QjZDJywgJzVCNkQnLCAnNUJCNicsICc1QkI3JywgJzVCODgnLCAnNUI4OSddLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLmZsYWdzLnNsaWNlKC0yKSA9PT0gJzAzJyxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdEZWx1YnJ1bVNhdiBHb2xlbSBDb21wYWN0aW9uJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1NzQ2JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCB0ZXh0OiBgJHttYXRjaGVzLnNvdXJjZX06ICR7bWF0Y2hlcy5hYmlsaXR5fWAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRGVsdWJydW1TYXYgU2xpbWUgU2FuZ3VpbmUgRnVzaW9uJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1NTREJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCB0ZXh0OiBgJHttYXRjaGVzLnNvdXJjZX06ICR7bWF0Y2hlcy5hYmlsaXR5fWAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVSZXN1cnJlY3Rpb24sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UxTiBFZGVuXFwncyBUaHVuZGVyIElJSSc6ICc0NEVEJyxcclxuICAgICdFMU4gRWRlblxcJ3MgQmxpenphcmQgSUlJJzogJzQ0RUMnLFxyXG4gICAgJ0UxTiBQdXJlIEJlYW0nOiAnM0Q5RScsXHJcbiAgICAnRTFOIFBhcmFkaXNlIExvc3QnOiAnM0RBMCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTFOIEVkZW5cXCdzIEZsYXJlJzogJzNEOTcnLFxyXG4gICAgJ0UxTiBQdXJlIExpZ2h0JzogJzNEQTMnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTFOIEZpcmUgSUlJJzogJzQ0RUInLFxyXG4gICAgJ0UxTiBWaWNlIE9mIFZhbml0eSc6ICc0NEU3JywgLy8gdGFuayBsYXNlcnNcclxuICAgICdFMU4gVmljZSBPZiBBcGF0aHknOiAnNDRFOCcsIC8vIGRwcyBwdWRkbGVzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IGZhaWxpbmcgdG8gaW50ZXJydXB0IE1hbmEgQm9vc3QgKDNEOEQpXHJcbi8vIFRPRE86IGZhaWxpbmcgdG8gcGFzcyBoZWFsZXIgZGVidWZmP1xyXG4vLyBUT0RPOiB3aGF0IGhhcHBlbnMgaWYgeW91IGRvbid0IGtpbGwgYSBtZXRlb3IgZHVyaW5nIGZvdXIgb3Jicz9cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVJlc3VycmVjdGlvblNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTFTIEVkZW5cXCdzIFRodW5kZXIgSUlJJzogJzQ0RjcnLFxyXG4gICAgJ0UxUyBFZGVuXFwncyBCbGl6emFyZCBJSUknOiAnNDRGNicsXHJcbiAgICAnRTFTIEVkZW5cXCdzIFJlZ2FpbmVkIEJsaXp6YXJkIElJSSc6ICc0NEZBJyxcclxuICAgICdFMVMgUHVyZSBCZWFtIFRyaWRlbnQgMSc6ICczRDgzJyxcclxuICAgICdFMVMgUHVyZSBCZWFtIFRyaWRlbnQgMic6ICczRDg0JyxcclxuICAgICdFMVMgUGFyYWRpc2UgTG9zdCc6ICczRDg3JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMVMgRWRlblxcJ3MgRmxhcmUnOiAnM0Q3MycsXHJcbiAgICAnRTFTIFB1cmUgTGlnaHQnOiAnM0Q4QScsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMVMgRmlyZS9UaHVuZGVyIElJSSc6ICc0NEZCJyxcclxuICAgICdFMVMgUHVyZSBCZWFtIFNpbmdsZSc6ICczRDgxJyxcclxuICAgICdFMVMgVmljZSBPZiBWYW5pdHknOiAnNDRGMScsIC8vIHRhbmsgbGFzZXJzXHJcbiAgICAnRTFTIFZpY2Ugb2YgQXBhdGh5JzogJzQ0RjInLCAvLyBkcHMgcHVkZGxlc1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IHNoYWRvd2V5ZSBmYWlsdXJlICh0b3AgbGluZSBmYWlsLCBib3R0b20gbGluZSBzdWNjZXNzLCBlZmZlY3QgdGhlcmUgdG9vKVxyXG4vLyBbMTY6MTc6MzUuOTY2XSAxNjo0MDAxMTBGRTpWb2lkd2Fsa2VyOjQwQjc6U2hhZG93ZXllOjEwNjEyMzQ1OlRpbmkgUG91dGluaTpGOjEwMDAwOjEwMDE5MEY6XHJcbi8vIFsxNjoxNzozNS45NjZdIDE2OjQwMDExMEZFOlZvaWR3YWxrZXI6NDBCNzpTaGFkb3dleWU6MTA2Nzg5MEE6UG90YXRvIENoaXBweToxOjA6MUM6ODAwMDpcclxuLy8gZ2FpbnMgdGhlIGVmZmVjdCBvZiBQZXRyaWZpY2F0aW9uIGZyb20gVm9pZHdhbGtlciBmb3IgMTAuMDAgU2Vjb25kcy5cclxuLy8gVE9ETzogcHVkZGxlIGZhaWx1cmU/XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlRGVzY2VudCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTJOIERvb212b2lkIFNsaWNlcic6ICczRTNDJyxcclxuICAgICdFMk4gRG9vbXZvaWQgR3VpbGxvdGluZSc6ICczRTNCJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTJOIE55eCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzNFM0QnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnQm9vcGVkJyxcclxuICAgICAgICAgICAgZGU6ICdOeXggYmVyw7xocnQnLFxyXG4gICAgICAgICAgICBmcjogJ01hbHVzIGRlIGTDqWfDonRzJyxcclxuICAgICAgICAgICAgamE6IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAgY246IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAga286ICfri4nsiqQnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBzaGFkb3dleWUgZmFpbHVyZVxyXG4vLyBUT0RPOiBFbXB0eSBIYXRlICgzRTU5LzNFNUEpIGhpdHMgZXZlcnlib2R5LCBzbyBoYXJkIHRvIHRlbGwgYWJvdXQga25vY2tiYWNrXHJcbi8vIFRPRE86IG1heWJlIG1hcmsgaGVsbCB3aW5kIHBlb3BsZSB3aG8gZ290IGNsaXBwZWQgYnkgc3RhY2s/XHJcbi8vIFRPRE86IG1pc3NpbmcgcHVkZGxlcz9cclxuLy8gVE9ETzogbWlzc2luZyBsaWdodC9kYXJrIGNpcmNsZSBzdGFja1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZURlc2NlbnRTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UyUyBEb29tdm9pZCBTbGljZXInOiAnM0U1MCcsXHJcbiAgICAnRTNTIEVtcHR5IFJhZ2UnOiAnM0U2QycsXHJcbiAgICAnRTNTIERvb212b2lkIEd1aWxsb3RpbmUnOiAnM0U0RicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMlMgRG9vbXZvaWQgQ2xlYXZlcic6ICczRTY0JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTJTIFNoYWRvd2V5ZScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFN0b25lIEN1cnNlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1ODknIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTJTIE55eCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzNFNTEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnQm9vcGVkJyxcclxuICAgICAgICAgICAgZGU6ICdOeXggYmVyw7xocnQnLFxyXG4gICAgICAgICAgICBmcjogJ01hbHVzIGRlIGTDqWfDonRzJyxcclxuICAgICAgICAgICAgamE6IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAgY246IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAga286ICfri4nsiqQnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZUludW5kYXRpb24sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0UzTiBNb25zdGVyIFdhdmUgMSc6ICczRkNBJyxcclxuICAgICdFM04gTW9uc3RlciBXYXZlIDInOiAnM0ZFOScsXHJcbiAgICAnRTNOIE1hZWxzdHJvbSc6ICczRkQ5JyxcclxuICAgICdFM04gU3dpcmxpbmcgVHN1bmFtaSc6ICczRkQ1JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFM04gVGVtcG9yYXJ5IEN1cnJlbnQgMSc6ICczRkNFJyxcclxuICAgICdFM04gVGVtcG9yYXJ5IEN1cnJlbnQgMic6ICczRkNEJyxcclxuICAgICdFM04gU3Bpbm5pbmcgRGl2ZSc6ICczRkRCJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UzTiBSaXAgQ3VycmVudCc6ICczRkM3JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogU2NvdXJpbmcgVHN1bmFtaSAoM0NFMCkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXRcclxuLy8gVE9ETzogU3dlZXBpbmcgVHN1bmFtaSAoM0ZGNSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YW5rc1xyXG4vLyBUT0RPOiBSaXAgQ3VycmVudCAoM0ZFMCwgM0ZFMSkgb24gc29tZWJvZHkgb3RoZXIgdGhhbiB0YXJnZXQvdGFua3NcclxuLy8gVE9ETzogQm9pbGVkIEFsaXZlICg0MDA2KSBpcyBmYWlsaW5nIHB1ZGRsZXM/Pz9cclxuLy8gVE9ETzogZmFpbGluZyB0byBjbGVhbnNlIFNwbGFzaGluZyBXYXRlcnNcclxuLy8gVE9ETzogZG9lcyBnZXR0aW5nIGhpdCBieSB1bmRlcnNlYSBxdWFrZSBjYXVzZSBhbiBhYmlsaXR5P1xyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlSW51bmRhdGlvblNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTNTIE1vbnN0ZXIgV2F2ZSAxJzogJzNGRTUnLFxyXG4gICAgJ0UzUyBNb25zdGVyIFdhdmUgMic6ICczRkU5JyxcclxuICAgICdFM1MgTWFlbHN0cm9tJzogJzNGRkInLFxyXG4gICAgJ0UzUyBTd2lybGluZyBUc3VuYW1pJzogJzNGRjQnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAxJzogJzNGRUEnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAyJzogJzNGRUInLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCAzJzogJzNGRUMnLFxyXG4gICAgJ0UzUyBUZW1wb3JhcnkgQ3VycmVudCA0JzogJzNGRUQnLFxyXG4gICAgJ0UzUyBTcGlubmluZyBEaXZlJzogJzNGRkQnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlU2VwdWx0dXJlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNE4gV2VpZ2h0IG9mIHRoZSBMYW5kJzogJzQwRUInLFxyXG4gICAgJ0U0TiBFdmlsIEVhcnRoJzogJzQwRUYnLFxyXG4gICAgJ0U0TiBBZnRlcnNob2NrIDEnOiAnNDFCNCcsXHJcbiAgICAnRTROIEFmdGVyc2hvY2sgMic6ICc0MEYwJyxcclxuICAgICdFNE4gRXhwbG9zaW9uIDEnOiAnNDBFRCcsXHJcbiAgICAnRTROIEV4cGxvc2lvbiAyJzogJzQwRjUnLFxyXG4gICAgJ0U0TiBMYW5kc2xpZGUnOiAnNDExQicsXHJcbiAgICAnRTROIFJpZ2h0d2FyZCBMYW5kc2xpZGUnOiAnNDEwMCcsXHJcbiAgICAnRTROIExlZnR3YXJkIExhbmRzbGlkZSc6ICc0MEZGJyxcclxuICAgICdFNE4gTWFzc2l2ZSBMYW5kc2xpZGUnOiAnNDBGQycsXHJcbiAgICAnRTROIFNlaXNtaWMgV2F2ZSc6ICc0MEYzJyxcclxuICAgICdFNE4gRmF1bHQgTGluZSc6ICc0MTAxJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgZmF1bHRMaW5lVGFyZ2V0Pzogc3RyaW5nO1xyXG59XHJcblxyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBwZW9wbGUgZ2V0IGhpdHRpbmcgYnkgbWFya2VycyB0aGV5IHNob3VsZG4ndFxyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBub24tdGFua3MgZ2V0dGluZyBoaXQgYnkgdGFua2J1c3RlcnMsIG1lZ2FsaXRoc1xyXG4vLyBUT0RPOiBjb3VsZCB0cmFjayBub24tdGFyZ2V0IGdldHRpbmcgaGl0IGJ5IHRhbmtidXN0ZXJcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVTZXB1bHR1cmVTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U0UyBXZWlnaHQgb2YgdGhlIExhbmQnOiAnNDEwOCcsXHJcbiAgICAnRTRTIEV2aWwgRWFydGgnOiAnNDEwQycsXHJcbiAgICAnRTRTIEFmdGVyc2hvY2sgMSc6ICc0MUI1JyxcclxuICAgICdFNFMgQWZ0ZXJzaG9jayAyJzogJzQxMEQnLFxyXG4gICAgJ0U0UyBFeHBsb3Npb24nOiAnNDEwQScsXHJcbiAgICAnRTRTIExhbmRzbGlkZSc6ICc0MTFCJyxcclxuICAgICdFNFMgUmlnaHR3YXJkIExhbmRzbGlkZSc6ICc0MTFEJyxcclxuICAgICdFNFMgTGVmdHdhcmQgTGFuZHNsaWRlJzogJzQxMUMnLFxyXG4gICAgJ0U0UyBNYXNzaXZlIExhbmRzbGlkZSAxJzogJzQxMTgnLFxyXG4gICAgJ0U0UyBNYXNzaXZlIExhbmRzbGlkZSAyJzogJzQxMTknLFxyXG4gICAgJ0U0UyBTZWlzbWljIFdhdmUnOiAnNDExMCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTRTIER1YWwgRWFydGhlbiBGaXN0cyAxJzogJzQxMzUnLFxyXG4gICAgJ0U0UyBEdWFsIEVhcnRoZW4gRmlzdHMgMic6ICc0Njg3JyxcclxuICAgICdFNFMgUGxhdGUgRnJhY3R1cmUnOiAnNDNFQScsXHJcbiAgICAnRTRTIEVhcnRoZW4gRmlzdCAxJzogJzQzQ0EnLFxyXG4gICAgJ0U0UyBFYXJ0aGVuIEZpc3QgMic6ICc0M0M5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTRTIEZhdWx0IExpbmUgQ29sbGVjdCcsXHJcbiAgICAgIHR5cGU6ICdTdGFydHNVc2luZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAnVGl0YW4nIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAnVGl0YW4nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAnVGl0YW4nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAn44K/44Kk44K/44OzJyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ+azsOWdpicgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICftg4DsnbTtg4QnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5mYXVsdExpbmVUYXJnZXQgPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTRTIEZhdWx0IExpbmUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0MTFFJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLmZhdWx0TGluZVRhcmdldCAhPT0gbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUnVuIE92ZXInLFxyXG4gICAgICAgICAgICBkZTogJ1d1cmRlIMO8YmVyZmFocmVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIMOpY3Jhc8OpKGUpJyxcclxuICAgICAgICAgICAgamE6IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAgY246IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgICAga286IG1hdGNoZXMuYWJpbGl0eSwgLy8gRklYTUVcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc09yYj86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBjbG91ZE1hcmtlcnM/OiBzdHJpbmdbXTtcclxufVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VGdWxtaW5hdGlvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTVOIEltcGFjdCc6ICc0RTNBJywgLy8gU3RyYXRvc3BlYXIgbGFuZGluZyBBb0VcclxuICAgICdFNU4gTGlnaHRuaW5nIEJvbHQnOiAnNEI5QycsIC8vIFN0b3JtY2xvdWQgc3RhbmRhcmQgYXR0YWNrXHJcbiAgICAnRTVOIEdhbGxvcCc6ICc0Qjk3JywgLy8gU2lkZXdheXMgYWRkIGNoYXJnZVxyXG4gICAgJ0U1TiBTaG9jayBTdHJpa2UnOiAnNEJBMScsIC8vIFNtYWxsIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNU4gVm9sdCBTdHJpa2UnOiAnNENGMicsIC8vIExhcmdlIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFNU4gSnVkZ21lbnQgSm9sdCc6ICc0QjhGJywgLy8gU3RyYXRvc3BlYXIgZXhwbG9zaW9uc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gVGhpcyBoYXBwZW5zIHdoZW4gYSBwbGF5ZXIgZ2V0cyA0KyBzdGFja3Mgb2Ygb3Jicy4gRG9uJ3QgYmUgZ3JlZWR5IVxyXG4gICAgICBpZDogJ0U1TiBTdGF0aWMgQ29uZGVuc2F0aW9uJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCNScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSGVscGVyIGZvciBvcmIgcGlja3VwIGZhaWx1cmVzXHJcbiAgICAgIGlkOiAnRTVOIE9yYiBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzhCNCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc09yYiA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIE9yYiBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCNCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc09yYiA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBEaXZpbmUgSnVkZ2VtZW50IFZvbHRzJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEI5QScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEuaGFzT3JiIHx8ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChubyBvcmIpYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKGtlaW4gT3JiKWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChwYXMgZCdvcmJlKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7fnjonnhKHjgZcpYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOayoeWQg+eQgylgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gU3Rvcm1jbG91ZCBUYXJnZXQgVHJhY2tpbmcnLFxyXG4gICAgICB0eXBlOiAnSGVhZE1hcmtlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMgPz89IFtdO1xyXG4gICAgICAgIGRhdGEuY2xvdWRNYXJrZXJzLnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhpcyBhYmlsaXR5IGlzIHNlZW4gb25seSBpZiBwbGF5ZXJzIHN0YWNrZWQgdGhlIGNsb3VkcyBpbnN0ZWFkIG9mIHNwcmVhZGluZyB0aGVtLlxyXG4gICAgICBpZDogJ0U1TiBUaGUgUGFydGluZyBDbG91ZHMnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QjlEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBzdXBwcmVzc1NlY29uZHM6IDMwLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBkYXRhLmNsb3VkTWFya2VycyA/PyBbXSkge1xyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgICBibGFtZTogbmFtZSxcclxuICAgICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChjbG91ZHMgdG9vIGNsb3NlKWAsXHJcbiAgICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKFdvbGtlbiB6dSBuYWhlKWAsXHJcbiAgICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKG51YWdlcyB0cm9wIHByb2NoZXMpYCxcclxuICAgICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zuy6L+R44GZ44GOKWAsXHJcbiAgICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbt+S6kemHjeWPoClgLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBTdG9ybWNsb3VkIGNsZWFudXAnLFxyXG4gICAgICB0eXBlOiAnSGVhZE1hcmtlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoeyBpZDogJzAwNkUnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IDMwLCAvLyBTdG9ybWNsb3VkcyByZXNvbHZlIHdlbGwgYmVmb3JlIHRoaXMuXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkZWxldGUgZGF0YS5jbG91ZE1hcmtlcnM7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNPcmI/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgaGF0ZWQ/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgY2xvdWRNYXJrZXJzPzogc3RyaW5nW107XHJcbn1cclxuXHJcbi8vIFRPRE86IGlzIHRoZXJlIGEgZGlmZmVyZW50IGFiaWxpdHkgaWYgdGhlIHNoaWVsZCBkdXR5IGFjdGlvbiBpc24ndCB1c2VkIHByb3Blcmx5P1xyXG4vLyBUT0RPOiBpcyB0aGVyZSBhbiBhYmlsaXR5IGZyb20gUmFpZGVuICh0aGUgYmlyZCkgaWYgeW91IGdldCBlYXRlbj9cclxuLy8gVE9ETzogbWF5YmUgY2hhaW4gbGlnaHRuaW5nIHdhcm5pbmcgaWYgeW91IGdldCBoaXQgd2hpbGUgeW91IGhhdmUgc3lzdGVtIHNob2NrICg4QjgpXHJcblxyXG5jb25zdCBub09yYiA9IChzdHI6IHN0cmluZykgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAobm8gb3JiKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBPcmIpJyxcclxuICAgIGZyOiBzdHIgKyAnIChwYXMgZFxcJ29yYmUpJyxcclxuICAgIGphOiBzdHIgKyAnICjpm7fnjonnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHlkIPnkIMpJyxcclxuICAgIGtvOiBzdHIgKyAnICjqtazsiqwg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVsbWluYXRpb25TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U1UyBJbXBhY3QnOiAnNEUzQicsIC8vIFN0cmF0b3NwZWFyIGxhbmRpbmcgQW9FXHJcbiAgICAnRTVTIEdhbGxvcCc6ICc0QkI0JywgLy8gU2lkZXdheXMgYWRkIGNoYXJnZVxyXG4gICAgJ0U1UyBTaG9jayBTdHJpa2UnOiAnNEJDMScsIC8vIFNtYWxsIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgU3RlcHBlZCBMZWFkZXIgVHdpc3Rlcic6ICc0QkM3JywgLy8gVHdpc3RlciBzdGVwcGVkIGxlYWRlclxyXG4gICAgJ0U1UyBTdGVwcGVkIExlYWRlciBEb251dCc6ICc0QkM4JywgLy8gRG9udXQgc3RlcHBlZCBsZWFkZXJcclxuICAgICdFNVMgU2hvY2snOiAnNEUzRCcsIC8vIEhhdGVkIG9mIExldmluIFN0b3JtY2xvdWQtY2xlYW5zYWJsZSBleHBsb2RpbmcgZGVidWZmXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTVTIEp1ZGdtZW50IEpvbHQnOiAnNEJBNycsIC8vIFN0cmF0b3NwZWFyIGV4cGxvc2lvbnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U1UyBWb2x0IFN0cmlrZSBEb3VibGUnOiAnNEJDMycsIC8vIExhcmdlIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgQ3JpcHBsaW5nIEJsb3cnOiAnNEJDQScsXHJcbiAgICAnRTVTIENoYWluIExpZ2h0bmluZyBEb3VibGUnOiAnNEJDNScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIG9yYiBwaWNrdXAgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdFNVMgT3JiIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgT3JiIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIERpdmluZSBKdWRnZW1lbnQgVm9sdHMnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QkI3JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiAhZGF0YS5oYXNPcmIgfHwgIWRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vT3JiKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIFZvbHQgU3RyaWtlIE9yYicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQzMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9PcmIobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgRGVhZGx5IERpc2NoYXJnZSBCaWcgS25vY2tiYWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJCMicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEuaGFzT3JiIHx8ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub09yYihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBMaWdodG5pbmcgQm9sdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQjknLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBIYXZpbmcgYSBub24taWRlbXBvdGVudCBjb25kaXRpb24gZnVuY3Rpb24gaXMgYSBiaXQgPF88XHJcbiAgICAgICAgLy8gT25seSBjb25zaWRlciBsaWdodG5pbmcgYm9sdCBkYW1hZ2UgaWYgeW91IGhhdmUgYSBkZWJ1ZmYgdG8gY2xlYXIuXHJcbiAgICAgICAgaWYgKCFkYXRhLmhhdGVkIHx8ICFkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICBkZWxldGUgZGF0YS5oYXRlZFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBIYXRlZCBvZiBMZXZpbicsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDBEMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhdGVkID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIFRhcmdldCBUcmFja2luZycsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2VycyA/Pz0gW107XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgaXMgc2VlbiBvbmx5IGlmIHBsYXllcnMgc3RhY2tlZCB0aGUgY2xvdWRzIGluc3RlYWQgb2Ygc3ByZWFkaW5nIHRoZW0uXHJcbiAgICAgIGlkOiAnRTVTIFRoZSBQYXJ0aW5nIENsb3VkcycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQkEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMzAsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGRhdGEuY2xvdWRNYXJrZXJzID8/IFtdKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGNsb3VkcyB0b28gY2xvc2UpYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoV29sa2VuIHp1IG5haGUpYCxcclxuICAgICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAobnVhZ2VzIHRyb3AgcHJvY2hlcylgLFxyXG4gICAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7Lov5HjgZnjgY4pYCxcclxuICAgICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zu35LqR6YeN5Y+gKWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIFN0b3JtY2xvdWQgY2xlYW51cCcsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIC8vIFN0b3JtY2xvdWRzIHJlc29sdmUgd2VsbCBiZWZvcmUgdGhpcy5cclxuICAgICAgZGVsYXlTZWNvbmRzOiAzMCxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmNsb3VkTWFya2VycztcclxuICAgICAgICBkZWxldGUgZGF0YS5oYXRlZDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVyb3IsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U2TiBUaG9ybnMnOiAnNEJEQScsIC8vIEFvRSBtYXJrZXJzIGFmdGVyIEVudW1lcmF0aW9uXHJcbiAgICAnRTZOIEZlcm9zdG9ybSAxJzogJzRCREQnLFxyXG4gICAgJ0U2TiBGZXJvc3Rvcm0gMic6ICc0QkU1JyxcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAxJzogJzRCRTAnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1HYXJ1ZGFcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAyJzogJzRCRTYnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1SYWt0YXBha3NhXHJcbiAgICAnRTZOIEV4cGxvc2lvbic6ICc0QkUyJywgLy8gQW9FIGNpcmNsZXMsIEdhcnVkYSBvcmJzXHJcbiAgICAnRTZOIEhlYXQgQnVyc3QnOiAnNEJFQycsXHJcbiAgICAnRTZOIENvbmZsYWcgU3RyaWtlJzogJzRCRUUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FXHJcbiAgICAnRTZOIFNwaWtlIE9mIEZsYW1lJzogJzRCRjAnLCAvLyBPcmIgZXhwbG9zaW9ucyBhZnRlciBTdHJpa2UgU3BhcmtcclxuICAgICdFNk4gUmFkaWFudCBQbHVtZSc6ICc0QkYyJyxcclxuICAgICdFNk4gRXJ1cHRpb24nOiAnNEJGNCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTZOIFZhY3V1bSBTbGljZSc6ICc0QkQ1JywgLy8gRGFyayBsaW5lIEFvRSBmcm9tIEdhcnVkYVxyXG4gICAgJ0U2TiBEb3duYnVyc3QnOiAnNEJEQicsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZS4gQWN0dWFsIGtub2NrYmFjayBpcyB1bmtub3duIGFiaWxpdHkgNEMyMFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBLaWxscyBub24tdGFua3Mgd2hvIGdldCBoaXQgYnkgaXQuXHJcbiAgICAnRTZOIEluc3RhbnQgSW5jaW5lcmF0aW9uJzogJzRCRUQnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgU2ltcGxlT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuLy8gVE9ETzogY2hlY2sgdGV0aGVycyBiZWluZyBjdXQgKHdoZW4gdGhleSBzaG91bGRuJ3QpXHJcbi8vIFRPRE86IGNoZWNrIGZvciBjb25jdXNzZWQgZGVidWZmXHJcbi8vIFRPRE86IGNoZWNrIGZvciB0YWtpbmcgdGFua2J1c3RlciB3aXRoIGxpZ2h0aGVhZGVkXHJcbi8vIFRPRE86IGNoZWNrIGZvciBvbmUgcGVyc29uIHRha2luZyBtdWx0aXBsZSBTdG9ybSBPZiBGdXJ5IFRldGhlcnMgKDRDMDEvNEMwOClcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IFNpbXBsZU9vcHN5VHJpZ2dlclNldCA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVyb3JTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gSXQncyBjb21tb24gdG8ganVzdCBpZ25vcmUgZnV0Ym9sIG1lY2hhbmljcywgc28gZG9uJ3Qgd2FybiBvbiBTdHJpa2UgU3BhcmsuXHJcbiAgICAvLyAnU3Bpa2UgT2YgRmxhbWUnOiAnNEMxMycsIC8vIE9yYiBleHBsb3Npb25zIGFmdGVyIFN0cmlrZSBTcGFya1xyXG5cclxuICAgICdFNlMgVGhvcm5zJzogJzRCRkEnLCAvLyBBb0UgbWFya2VycyBhZnRlciBFbnVtZXJhdGlvblxyXG4gICAgJ0U2UyBGZXJvc3Rvcm0gMSc6ICc0QkZEJyxcclxuICAgICdFNlMgRmVyb3N0b3JtIDInOiAnNEMwNicsXHJcbiAgICAnRTZTIFN0b3JtIE9mIEZ1cnkgMSc6ICc0QzAwJywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tR2FydWRhXHJcbiAgICAnRTZTIFN0b3JtIE9mIEZ1cnkgMic6ICc0QzA3JywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tUmFrdGFwYWtzYVxyXG4gICAgJ0U2UyBFeHBsb3Npb24nOiAnNEMwMycsIC8vIEFvRSBjaXJjbGVzLCBHYXJ1ZGEgb3Jic1xyXG4gICAgJ0U2UyBIZWF0IEJ1cnN0JzogJzRDMUYnLFxyXG4gICAgJ0U2UyBDb25mbGFnIFN0cmlrZSc6ICc0QzEwJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRVxyXG4gICAgJ0U2UyBSYWRpYW50IFBsdW1lJzogJzRDMTUnLFxyXG4gICAgJ0U2UyBFcnVwdGlvbic6ICc0QzE3JyxcclxuICAgICdFNlMgV2luZCBDdXR0ZXInOiAnNEMwMicsIC8vIFRldGhlci1jdXR0aW5nIGxpbmUgYW9lXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTZTIFZhY3V1bSBTbGljZSc6ICc0QkY1JywgLy8gRGFyayBsaW5lIEFvRSBmcm9tIEdhcnVkYVxyXG4gICAgJ0U2UyBEb3duYnVyc3QgMSc6ICc0QkZCJywgLy8gQmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChHYXJ1ZGEpLlxyXG4gICAgJ0U2UyBEb3duYnVyc3QgMic6ICc0QkZDJywgLy8gQmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChSYWt0YXBha3NhKS5cclxuICAgICdFNlMgTWV0ZW9yIFN0cmlrZSc6ICc0QzBGJywgLy8gRnJvbnRhbCBhdm9pZGFibGUgdGFuayBidXN0ZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U2UyBIYW5kcyBvZiBIZWxsJzogJzRDMFtCQ10nLCAvLyBUZXRoZXIgY2hhcmdlXHJcbiAgICAnRTZTIEhhbmRzIG9mIEZsYW1lJzogJzRDMEEnLCAvLyBGaXJzdCBUYW5rYnVzdGVyXHJcbiAgICAnRTZTIEluc3RhbnQgSW5jaW5lcmF0aW9uJzogJzRDMEUnLCAvLyBTZWNvbmQgVGFua2J1c3RlclxyXG4gICAgJ0U2UyBCbGF6ZSc6ICc0QzFCJywgLy8gRmxhbWUgVG9ybmFkbyBDbGVhdmVcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnRTZTIEFpciBCdW1wJzogJzRCRjknLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNBc3RyYWw/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgaGFzVW1icmFsPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG5jb25zdCB3cm9uZ0J1ZmYgPSAoc3RyOiBzdHJpbmcpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKHdyb25nIGJ1ZmYpJyxcclxuICAgIGRlOiBzdHIgKyAnIChmYWxzY2hlciBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAobWF1dmFpcyBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo5LiN6YGp5YiH44Gq44OQ44OVKScsXHJcbiAgICBjbjogc3RyICsgJyAoQnVmZumUmeS6hiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDti4DrprwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuY29uc3Qgbm9CdWZmID0gKHN0cjogc3RyaW5nKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyjrsoTtlIQg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlSWNvbm9jbGFzbSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTdOIFN0eWdpYW4gU3dvcmQnOiAnNEM1NScsIC8vIENpcmNsZSBncm91bmQgQW9FcyBhZnRlciBGYWxzZSBUd2lsaWdodFxyXG4gICAgJ0U3TiBTdHJlbmd0aCBJbiBOdW1iZXJzIERvbnV0JzogJzRDNEMnLCAvLyBMYXJnZSBkb251dCBncm91bmQgQW9FcywgaW50ZXJtaXNzaW9uXHJcbiAgICAnRTdOIFN0cmVuZ3RoIEluIE51bWJlcnMgMic6ICc0QzREJywgLy8gTGFyZ2UgY2lyY2xlIGdyb3VuZCBBb0VzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U3TiBTdHlnaWFuIFN0YWtlJzogJzRDMzMnLCAvLyBMYXNlciB0YW5rIGJ1c3Rlciwgb3V0c2lkZSBpbnRlcm1pc3Npb24gcGhhc2VcclxuICAgICdFNU4gU2lsdmVyIFNob3QnOiAnNEU3RCcsIC8vIFNwcmVhZCBtYXJrZXJzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIEFzdHJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBBc3RyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIFVtYnJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIExpZ2h0XFwncyBDb3Vyc2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEMzRScsICc0QzQwJywgJzRDMjInLCAnNEMzQycsICc0RTYzJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNVbWJyYWwgfHwgIWRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNBc3RyYWwgJiYgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBEYXJrc1xcJ3MgQ291cnNlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzRDM0QnLCAnNEMyMycsICc0QzQxJywgJzRDNDMnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc0FzdHJhbCB8fCAhZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc1VtYnJhbCAmJiBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICAvLyBUaGlzIGNhc2UgaXMgcHJvYmFibHkgaW1wb3NzaWJsZSwgYXMgdGhlIGRlYnVmZiB0aWNrcyBhZnRlciBkZWF0aCxcclxuICAgICAgICAvLyBidXQgbGVhdmluZyBpdCBoZXJlIGluIGNhc2UgdGhlcmUncyBzb21lIHJleiBvciBkaXNjb25uZWN0IHRpbWluZ1xyXG4gICAgICAgIC8vIHRoYXQgY291bGQgbGVhZCB0byB0aGlzLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IG1pc3NpbmcgYW4gb3JiIGR1cmluZyB0b3JuYWRvIHBoYXNlXHJcbi8vIFRPRE86IGp1bXBpbmcgaW4gdGhlIHRvcm5hZG8gZGFtYWdlPz9cclxuLy8gVE9ETzogdGFraW5nIHN1bmdyYWNlKDRDODApIG9yIG1vb25ncmFjZSg0QzgyKSB3aXRoIHdyb25nIGRlYnVmZlxyXG4vLyBUT0RPOiBzdHlnaWFuIHNwZWFyL3NpbHZlciBzcGVhciB3aXRoIHRoZSB3cm9uZyBkZWJ1ZmZcclxuLy8gVE9ETzogdGFraW5nIGV4cGxvc2lvbiBmcm9tIHRoZSB3cm9uZyBDaGlhcm8vU2N1cm8gb3JiXHJcbi8vIFRPRE86IGhhbmRsZSA0Qzg5IFNpbHZlciBTdGFrZSB0YW5rYnVzdGVyIDJuZCBoaXQsIGFzIGl0J3Mgb2sgdG8gaGF2ZSB0d28gaW4uXHJcblxyXG5jb25zdCB3cm9uZ0J1ZmYgPSAoc3RyOiBzdHJpbmcpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKHdyb25nIGJ1ZmYpJyxcclxuICAgIGRlOiBzdHIgKyAnIChmYWxzY2hlciBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAobWF1dmFpcyBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo5LiN6YGp5YiH44Gq44OQ44OVKScsXHJcbiAgICBjbjogc3RyICsgJyAoQnVmZumUmeS6hiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDti4DrprwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuY29uc3Qgbm9CdWZmID0gKHN0cjogc3RyaW5nKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIOyXhuydjCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc0FzdHJhbD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBoYXNVbWJyYWw/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlSWNvbm9jbGFzbVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTdTIFNpbHZlciBTd29yZCc6ICc0QzhFJywgLy8gZ3JvdW5kIGFvZVxyXG4gICAgJ0U3UyBPdmVyd2hlbG1pbmcgRm9yY2UnOiAnNEM3MycsIC8vIGFkZCBwaGFzZSBncm91bmQgYW9lXHJcbiAgICAnRTdTIFN0cmVuZ3RoIGluIE51bWJlcnMgMSc6ICc0QzcwJywgLy8gYWRkIGdldCB1bmRlclxyXG4gICAgJ0U3UyBTdHJlbmd0aCBpbiBOdW1iZXJzIDInOiAnNEM3MScsIC8vIGFkZCBnZXQgb3V0XHJcbiAgICAnRTdTIFBhcGVyIEN1dCc6ICc0QzdEJywgLy8gdG9ybmFkbyBncm91bmQgYW9lc1xyXG4gICAgJ0U3UyBCdWZmZXQnOiAnNEM3NycsIC8vIHRvcm5hZG8gZ3JvdW5kIGFvZXMgYWxzbz8/XHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTdTIEJldHdpeHQgV29ybGRzJzogJzRDNkInLCAvLyBwdXJwbGUgZ3JvdW5kIGxpbmUgYW9lc1xyXG4gICAgJ0U3UyBDcnVzYWRlJzogJzRDNTgnLCAvLyBibHVlIGtub2NrYmFjayBjaXJjbGUgKHN0YW5kaW5nIGluIGl0KVxyXG4gICAgJ0U3UyBFeHBsb3Npb24nOiAnNEM2RicsIC8vIGRpZG4ndCBraWxsIGFuIGFkZFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTdTIFN0eWdpYW4gU3Rha2UnOiAnNEMzNCcsIC8vIExhc2VyIHRhbmsgYnVzdGVyIDFcclxuICAgICdFN1MgU2lsdmVyIFNob3QnOiAnNEM5MicsIC8vIFNwcmVhZCBtYXJrZXJzXHJcbiAgICAnRTdTIFNpbHZlciBTY291cmdlJzogJzRDOTMnLCAvLyBJY2UgbWFya2Vyc1xyXG4gICAgJ0U3UyBDaGlhcm8gU2N1cm8gRXhwbG9zaW9uIDEnOiAnNEQxNCcsIC8vIG9yYiBleHBsb3Npb25cclxuICAgICdFN1MgQ2hpYXJvIFNjdXJvIEV4cGxvc2lvbiAyJzogJzREMTUnLCAvLyBvcmIgZXhwbG9zaW9uXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBJbnRlcnJ1cHRcclxuICAgICAgaWQ6ICdFN1MgQWR2ZW50IE9mIExpZ2h0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0QzZFJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVE9ETzogaXMgdGhpcyBibGFtZSBjb3JyZWN0PyBkb2VzIHRoaXMgaGF2ZSBhIHRhcmdldD9cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBBc3RyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIEFzdHJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPSBkYXRhLmhhc0FzdHJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIFVtYnJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPSBkYXRhLmhhc1VtYnJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgVW1icmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgTGlnaHRcXCdzIENvdXJzZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc0QzYyJywgJzRDNjMnLCAnNEM2NCcsICc0QzVCJywgJzRDNUYnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc1VtYnJhbCB8fCAhZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc0FzdHJhbCAmJiBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIERhcmtzXFwncyBDb3Vyc2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEM2NScsICc0QzY2JywgJzRDNjcnLCAnNEM1QScsICc0QzYwJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNBc3RyYWwgfHwgIWRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNVbWJyYWwgJiYgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgLy8gVGhpcyBjYXNlIGlzIHByb2JhYmx5IGltcG9zc2libGUsIGFzIHRoZSBkZWJ1ZmYgdGlja3MgYWZ0ZXIgZGVhdGgsXHJcbiAgICAgICAgLy8gYnV0IGxlYXZpbmcgaXQgaGVyZSBpbiBjYXNlIHRoZXJlJ3Mgc29tZSByZXogb3IgZGlzY29ubmVjdCB0aW1pbmdcclxuICAgICAgICAvLyB0aGF0IGNvdWxkIGxlYWQgdG8gdGhpcy5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIENydXNhZGUgS25vY2tiYWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyA0Qzc2IGlzIHRoZSBrbm9ja2JhY2sgZGFtYWdlLCA0QzU4IGlzIHRoZSBkYW1hZ2UgZm9yIHN0YW5kaW5nIG9uIHRoZSBwdWNrLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEM3NicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VSZWZ1bGdlbmNlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOE4gQml0aW5nIEZyb3N0JzogJzREREInLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBEcml2aW5nIEZyb3N0JzogJzREREMnLCAvLyBSZWFyIGNvbmUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBGcmlnaWQgU3RvbmUnOiAnNEU2NicsIC8vIFNtYWxsIHNwcmVhZCBjaXJjbGVzLCBwaGFzZSAxXHJcbiAgICAnRThOIFJlZmxlY3RlZCBBeGUgS2ljayc6ICc0RTAwJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgU2N5dGhlIEtpY2snOiAnNEUwMScsIC8vIERvbnV0IEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4TiBGcmlnaWQgRXJ1cHRpb24nOiAnNEUwOScsIC8vIFNtYWxsIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4TiBJY2ljbGUgSW1wYWN0JzogJzRFMEEnLCAvLyBMYXJnZSBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOE4gQXhlIEtpY2snOiAnNERFMicsIC8vIExhcmdlIGNpcmNsZSBBb0UsIFNoaXZhXHJcbiAgICAnRThOIFNjeXRoZSBLaWNrJzogJzRERTMnLCAvLyBEb251dCBBb0UsIFNoaXZhXHJcbiAgICAnRThOIFJlZmxlY3RlZCBCaXRpbmcgRnJvc3QnOiAnNERGRScsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOE4gUmVmbGVjdGVkIERyaXZpbmcgRnJvc3QnOiAnNERGRicsIC8vIENvbmUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7fSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBTaGluaW5nIEFybW9yJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzk1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBIZWF2ZW5seSBTdHJpa2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0REQ4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1B1c2hlZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VzdG/Dn2VuIScsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBwb3Vzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLHrkKghJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThOIEZyb3N0IEFybW9yJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gVGhpbiBJY2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzM4RicgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnU2xpZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdydW50ZXJnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5ruR44Gj44GfJyxcclxuICAgICAgICAgICAgY246ICfmu5HokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uvuOuBhOufrOynkCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBydXNoIGhpdHRpbmcgdGhlIGNyeXN0YWxcclxuLy8gVE9ETzogYWRkcyBub3QgYmVpbmcga2lsbGVkXHJcbi8vIFRPRE86IHRha2luZyB0aGUgcnVzaCB0d2ljZSAod2hlbiB5b3UgaGF2ZSBkZWJ1ZmYpXHJcbi8vIFRPRE86IG5vdCBoaXR0aW5nIHRoZSBkcmFnb24gZm91ciB0aW1lcyBkdXJpbmcgd3lybSdzIGxhbWVudFxyXG4vLyBUT0RPOiBkZWF0aCByZWFzb25zIGZvciBub3QgcGlja2luZyB1cCBwdWRkbGVcclxuLy8gVE9ETzogbm90IGJlaW5nIGluIHRoZSB0b3dlciB3aGVuIHlvdSBzaG91bGRcclxuLy8gVE9ETzogcGlja2luZyB1cCB0b28gbWFueSBzdGFja3NcclxuXHJcbi8vIE5vdGU6IEJhbmlzaCBJSUkgKDREQTgpIGFuZCBCYW5pc2ggSWlpIERpdmlkZWQgKDREQTkpIGJvdGggYXJlIHR5cGU9MHgxNiBsaW5lcy5cclxuLy8gVGhlIHNhbWUgaXMgdHJ1ZSBmb3IgQmFuaXNoICg0REE2KSBhbmQgQmFuaXNoIERpdmlkZWQgKDREQTcpLlxyXG4vLyBJJ20gbm90IHN1cmUgdGhpcyBtYWtlcyBhbnkgc2Vuc2U/IEJ1dCBjYW4ndCB0ZWxsIGlmIHRoZSBzcHJlYWQgd2FzIGEgbWlzdGFrZSBvciBub3QuXHJcbi8vIE1heWJlIHdlIGNvdWxkIGNoZWNrIGZvciBcIk1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXBcIj9cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlUmVmdWxnZW5jZVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRThTIEJpdGluZyBGcm9zdCc6ICc0RDY2JywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgU2hpdmFcclxuICAgICdFOFMgRHJpdmluZyBGcm9zdCc6ICc0RDY3JywgLy8gUmVhciBjb25lIEFvRSwgU2hpdmFcclxuICAgICdFOFMgQXhlIEtpY2snOiAnNEQ2RCcsIC8vIExhcmdlIGNpcmNsZSBBb0UsIFNoaXZhXHJcbiAgICAnRThTIFNjeXRoZSBLaWNrJzogJzRENkUnLCAvLyBEb251dCBBb0UsIFNoaXZhXHJcbiAgICAnRThTIFJlZmxlY3RlZCBBeGUgS2ljayc6ICc0REI5JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgU2N5dGhlIEtpY2snOiAnNERCQScsIC8vIERvbnV0IEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBGcmlnaWQgRXJ1cHRpb24nOiAnNEQ5RicsIC8vIFNtYWxsIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4UyBGcmlnaWQgTmVlZGxlJzogJzREOUQnLCAvLyA4LXdheSBcImZsb3dlclwiIGV4cGxvc2lvblxyXG4gICAgJ0U4UyBJY2ljbGUgSW1wYWN0JzogJzREQTAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOFMgUmVmbGVjdGVkIEJpdGluZyBGcm9zdCAxJzogJzREQjcnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBCaXRpbmcgRnJvc3QgMic6ICc0REMzJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCAxJzogJzREQjgnLCAvLyBDb25lIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCAyJzogJzREQzQnLCAvLyBDb25lIEFvRSwgRnJvemVuIE1pcnJvclxyXG5cclxuICAgICdFOFMgSGFsbG93ZWQgV2luZ3MgMSc6ICc0RDc1JywgLy8gTGVmdCBjbGVhdmVcclxuICAgICdFOFMgSGFsbG93ZWQgV2luZ3MgMic6ICc0RDc2JywgLy8gUmlnaHQgY2xlYXZlXHJcbiAgICAnRThTIEhhbGxvd2VkIFdpbmdzIDMnOiAnNEQ3NycsIC8vIEtub2NrYmFjayBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMSc6ICc0RDkwJywgLy8gUmVmbGVjdGVkIGxlZnQgMlxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMic6ICc0REJCJywgLy8gUmVmbGVjdGVkIGxlZnQgMVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMyc6ICc0REM3JywgLy8gUmVmbGVjdGVkIHJpZ2h0IDJcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDQnOiAnNEQ5MScsIC8vIFJlZmxlY3RlZCByaWdodCAxXHJcbiAgICAnRThTIFR3aW4gU3RpbGxuZXNzIDEnOiAnNEQ2OCcsXHJcbiAgICAnRThTIFR3aW4gU3RpbGxuZXNzIDInOiAnNEQ2QicsXHJcbiAgICAnRThTIFR3aW4gU2lsZW5jZSAxJzogJzRENjknLFxyXG4gICAgJ0U4UyBUd2luIFNpbGVuY2UgMic6ICc0RDZBJyxcclxuICAgICdFOFMgQWtoIFJoYWknOiAnNEQ5OScsXHJcbiAgICAnRThTIEVtYml0dGVyZWQgRGFuY2UgMSc6ICc0RDcwJyxcclxuICAgICdFOFMgRW1iaXR0ZXJlZCBEYW5jZSAyJzogJzRENzEnLFxyXG4gICAgJ0U4UyBTcGl0ZWZ1bCBEYW5jZSAxJzogJzRENkYnLFxyXG4gICAgJ0U4UyBTcGl0ZWZ1bCBEYW5jZSAyJzogJzRENzInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gQnJva2VuIHRldGhlci5cclxuICAgICdFOFMgUmVmdWxnZW50IEZhdGUnOiAnNERBNCcsXHJcbiAgICAvLyBTaGFyZWQgb3JiLCBjb3JyZWN0IGlzIEJyaWdodCBQdWxzZSAoNEQ5NSlcclxuICAgICdFOFMgQmxpbmRpbmcgUHVsc2UnOiAnNEQ5NicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFOFMgUGF0aCBvZiBMaWdodCc6ICc0REExJywgLy8gUHJvdGVhblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOFMgU2hpbmluZyBBcm1vcicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFN0dW5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzk1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBJbnRlcnJ1cHRcclxuICAgICAgaWQ6ICdFOFMgU3RvbmVza2luJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RDg1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZVVtYnJhLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOU4gVGhlIEFydCBPZiBEYXJrbmVzcyAxJzogJzUyMjMnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5TiBUaGUgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTIyNCcsIC8vIGxlZnQtcmlnaHQgY2xlYXZlXHJcbiAgICAnRTlOIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1QUZGJywgLy8gZnJvbnRhbCBjbGVhdmUgdHV0b3JpYWwgbWVjaGFuaWNcclxuICAgICdFOU4gV2lkZS1BbmdsZSBQaGFzZXInOiAnNTVFMScsIC8vIHdpZGUtYW5nbGUgXCJzaWRlc1wiXHJcbiAgICAnRTlOIEJhZCBWaWJyYXRpb25zJzogJzU1RTYnLCAvLyB0ZXRoZXJlZCBvdXRzaWRlIGdpYW50IHRyZWUgZ3JvdW5kIGFvZXNcclxuICAgICdFOU4gRWFydGgtU2hhdHRlcmluZyBQYXJ0aWNsZSBCZWFtJzogJzUyMjUnLCAvLyBtaXNzaW5nIHRvd2Vycz9cclxuICAgICdFOU4gQW50aS1BaXIgUGFydGljbGUgQmVhbSc6ICc1NURDJywgLy8gXCJnZXQgb3V0XCIgZHVyaW5nIHBhbmVsc1xyXG4gICAgJ0U5TiBaZXJvLUZvcm0gUGFydGljbGUgQmVhbSAyJzogJzU1REInLCAvLyBDbG9uZSBsaW5lIGFvZXMgdy8gQW50aS1BaXIgUGFydGljbGUgQmVhbVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U5TiBXaXRoZHJhdyc6ICc1NTM0JywgLy8gU2xvdyB0byBicmVhayBzZWVkIGNoYWluLCBnZXQgc3Vja2VkIGJhY2sgaW4geWlrZXNcclxuICAgICdFOU4gQWV0aGVyb3N5bnRoZXNpcyc6ICc1NTM1JywgLy8gU3RhbmRpbmcgb24gc2VlZHMgZHVyaW5nIGV4cGxvc2lvbiAocG9zc2libHkgdmlhIFdpdGhkcmF3KVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTlOIFplcm8tRm9ybSBQYXJ0aWNsZSBCZWFtIDEnOiAnNTVFQicsIC8vIHRhbmsgbGFzZXIgd2l0aCBtYXJrZXJcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiA1NjFEIEV2aWwgU2VlZCBoaXRzIGV2ZXJ5b25lLCBoYXJkIHRvIGtub3cgaWYgdGhlcmUncyBhIGRvdWJsZSB0YXBcclxuLy8gVE9ETzogZmFsbGluZyB0aHJvdWdoIHBhbmVsIGp1c3QgZG9lcyBkYW1hZ2Ugd2l0aCBubyBhYmlsaXR5IG5hbWUsIGxpa2UgYSBkZWF0aCB3YWxsXHJcbi8vIFRPRE86IHdoYXQgaGFwcGVucyBpZiB5b3UganVtcCBpbiBzZWVkIHRob3Jucz9cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VVbWJyYVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTlTIEJhZCBWaWJyYXRpb25zJzogJzU2MUMnLCAvLyB0ZXRoZXJlZCBvdXRzaWRlIGdpYW50IHRyZWUgZ3JvdW5kIGFvZXNcclxuICAgICdFOVMgV2lkZS1BbmdsZSBQYXJ0aWNsZSBCZWFtJzogJzVCMDAnLCAvLyBhbnRpLWFpciBcInNpZGVzXCJcclxuICAgICdFOVMgV2lkZS1BbmdsZSBQaGFzZXIgVW5saW1pdGVkJzogJzU2MEUnLCAvLyB3aWRlLWFuZ2xlIFwic2lkZXNcIlxyXG4gICAgJ0U5UyBBbnRpLUFpciBQYXJ0aWNsZSBCZWFtJzogJzVCMDEnLCAvLyB3aWRlLWFuZ2xlIFwib3V0XCJcclxuICAgICdFOVMgVGhlIFNlY29uZCBBcnQgT2YgRGFya25lc3MgMSc6ICc1NjAxJywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOVMgVGhlIFNlY29uZCBBcnQgT2YgRGFya25lc3MgMic6ICc1NjAyJywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyAxJzogJzVBOTUnLCAvLyBib3NzIGxlZnQtcmlnaHQgc3VtbW9uL3BhbmVsIGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIDInOiAnNUE5NicsIC8vIGJvc3MgbGVmdC1yaWdodCBzdW1tb24vcGFuZWwgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgQ2xvbmUgMSc6ICc1NjFFJywgLy8gY2xvbmUgbGVmdC1yaWdodCBzdW1tb24gY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgQ2xvbmUgMic6ICc1NjFGJywgLy8gY2xvbmUgbGVmdC1yaWdodCBzdW1tb24gY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBUaGlyZCBBcnQgT2YgRGFya25lc3MgMSc6ICc1NjAzJywgLy8gdGhpcmQgYXJ0IGxlZnQtcmlnaHQgY2xlYXZlIGluaXRpYWxcclxuICAgICdFOVMgVGhlIFRoaXJkIEFydCBPZiBEYXJrbmVzcyAyJzogJzU2MDQnLCAvLyB0aGlyZCBhcnQgbGVmdC1yaWdodCBjbGVhdmUgaW5pdGlhbFxyXG4gICAgJ0U5UyBBcnQgT2YgRGFya25lc3MnOiAnNTYwNicsIC8vIHRoaXJkIGFydCBsZWZ0LXJpZ2h0IGNsZWF2ZSBmaW5hbFxyXG4gICAgJ0U5UyBGdWxsLVBlcmltaXRlciBQYXJ0aWNsZSBCZWFtJzogJzU2MjknLCAvLyBwYW5lbCBcImdldCBpblwiXHJcbiAgICAnRTlTIERhcmsgQ2hhaW5zJzogJzVGQUMnLCAvLyBTbG93IHRvIGJyZWFrIHBhcnRuZXIgY2hhaW5zXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTlTIFdpdGhkcmF3JzogJzU2MUEnLCAvLyBTbG93IHRvIGJyZWFrIHNlZWQgY2hhaW4sIGdldCBzdWNrZWQgYmFjayBpbiB5aWtlc1xyXG4gICAgJ0U5UyBBZXRoZXJvc3ludGhlc2lzJzogJzU2MUInLCAvLyBTdGFuZGluZyBvbiBzZWVkcyBkdXJpbmcgZXhwbG9zaW9uIChwb3NzaWJseSB2aWEgV2l0aGRyYXcpXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdFOVMgU3R5Z2lhbiBUZW5kcmlscyc6ICc5NTInLCAvLyBzdGFuZGluZyBpbiB0aGUgYnJhbWJsZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U5UyBIeXBlci1Gb2N1c2VkIFBhcnRpY2xlIEJlYW0nOiAnNTVGRCcsIC8vIEFydCBPZiBEYXJrbmVzcyBwcm90ZWFuXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFOVMgQ29uZGVuc2VkIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1NjEwJywgLy8gd2lkZS1hbmdsZSBcInRhbmsgbGFzZXJcIlxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgICdFOVMgTXVsdGktUHJvbmdlZCBQYXJ0aWNsZSBCZWFtJzogJzU2MDAnLCAvLyBBcnQgT2YgRGFya25lc3MgUGFydG5lciBTdGFja1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gQW50aS1haXIgXCJ0YW5rIHNwcmVhZFwiLiAgVGhpcyBjYW4gYmUgc3RhY2tlZCBieSB0d28gdGFua3MgaW52dWxuaW5nLlxyXG4gICAgICAvLyBOb3RlOiB0aGlzIHdpbGwgc3RpbGwgc2hvdyBzb21ldGhpbmcgZm9yIGhvbG1nYW5nL2xpdmluZywgYnV0XHJcbiAgICAgIC8vIGFyZ3VhYmx5IGEgaGVhbGVyIG1pZ2h0IG5lZWQgdG8gZG8gc29tZXRoaW5nIGFib3V0IHRoYXQsIHNvIG1heWJlXHJcbiAgICAgIC8vIGl0J3Mgb2sgdG8gc3RpbGwgc2hvdyBhcyBhIHdhcm5pbmc/P1xyXG4gICAgICBpZDogJ0U5UyBDb25kZW5zZWQgQW50aS1BaXIgUGFydGljbGUgQmVhbScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyB0eXBlOiAnMjInLCBpZDogJzU2MTUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBBbnRpLWFpciBcIm91dFwiLiAgVGhpcyBjYW4gYmUgaW52dWxuZWQgYnkgYSB0YW5rIGFsb25nIHdpdGggdGhlIHNwcmVhZCBhYm92ZS5cclxuICAgICAgaWQ6ICdFOVMgQW50aS1BaXIgUGhhc2VyIFVubGltaXRlZCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzU2MTInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlTGl0YW55LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTBOIEZvcndhcmQgSW1wbG9zaW9uJzogJzU2QjQnLCAvLyBob3dsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBGb3J3YXJkIFNoYWRvdyBJbXBsb3Npb24nOiAnNTZCNScsIC8vIGhvd2wgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxME4gQmFja3dhcmQgSW1wbG9zaW9uJzogJzU2QjcnLCAvLyB0YWlsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBCYWNrd2FyZCBTaGFkb3cgSW1wbG9zaW9uJzogJzU2QjgnLCAvLyB0YWlsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBOIEJhcmJzIE9mIEFnb255IDEnOiAnNTZEOScsIC8vIFNoYWRvdyBXYXJyaW9yIDMgZG9nIHJvb20gY2xlYXZlXHJcbiAgICAnRTEwTiBCYXJicyBPZiBBZ29ueSAyJzogJzVCMjYnLCAvLyBTaGFkb3cgV2FycmlvciAzIGRvZyByb29tIGNsZWF2ZVxyXG4gICAgJ0UxME4gQ2xvYWsgT2YgU2hhZG93cyc6ICc1QjExJywgLy8gbm9uLXNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxME4gVGhyb25lIE9mIFNoYWRvdyc6ICc1NkM3JywgLy8gc3RhbmRpbmcgdXAgZ2V0IG91dFxyXG4gICAgJ0UxME4gUmlnaHQgR2lnYSBTbGFzaCc6ICc1NkFFJywgLy8gYm9zcyByaWdodCBnaWdhIHNsYXNoXHJcbiAgICAnRTEwTiBSaWdodCBTaGFkb3cgU2xhc2gnOiAnNTZBRicsIC8vIGdpZ2Egc2xhc2ggZnJvbSBzaGFkb3dcclxuICAgICdFMTBOIExlZnQgR2lnYSBTbGFzaCc6ICc1NkIxJywgLy8gYm9zcyBsZWZ0IGdpZ2Egc2xhc2hcclxuICAgICdFMTBOIExlZnQgU2hhZG93IFNsYXNoJzogJzU2QkQnLCAvLyBnaWdhIHNsYXNoIGZyb20gc2hhZG93XHJcbiAgICAnRTEwTiBTaGFkb3d5IEVydXB0aW9uJzogJzU2RTEnLCAvLyBiYWl0ZWQgZ3JvdW5kIGFvZSBtYXJrZXJzIHBhaXJlZCB3aXRoIGJhcmJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTBOIFNoYWRvd1xcJ3MgRWRnZSc6ICc1NkRCJywgLy8gVGFua2J1c3RlciBzaW5nbGUgdGFyZ2V0IGZvbGxvd3VwXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogaGl0dGluZyBzaGFkb3cgb2YgdGhlIGhlcm8gd2l0aCBhYmlsaXRpZXMgY2FuIGNhdXNlIHlvdSB0byB0YWtlIGRhbWFnZSwgbGlzdCB0aG9zZT9cclxuLy8gICAgICAgZS5nLiBwaWNraW5nIHVwIHlvdXIgZmlyc3QgcGl0Y2ggYm9nIHB1ZGRsZSB3aWxsIGNhdXNlIHlvdSB0byBkaWUgdG8gdGhlIGRhbWFnZVxyXG4vLyAgICAgICB5b3VyIHNoYWRvdyB0YWtlcyBmcm9tIERlZXBzaGFkb3cgTm92YSBvciBEaXN0YW50IFNjcmVhbS5cclxuLy8gVE9ETzogNTczQiBCbGlnaHRpbmcgQmxpdHogaXNzdWVzIGR1cmluZyBsaW1pdCBjdXQgbnVtYmVyc1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUxpdGFueVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEwUyBJbXBsb3Npb24gU2luZ2xlIDEnOiAnNTZGMicsIC8vIHNpbmdsZSB0YWlsIHVwIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBTIEltcGxvc2lvbiBTaW5nbGUgMic6ICc1NkVGJywgLy8gc2luZ2xlIGhvd2wgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFF1YWRydXBsZSAxJzogJzU2RUYnLCAvLyBxdWFkcnVwbGUgc2V0IG9mIHNoYWRvdyBpbXBsb3Npb25zXHJcbiAgICAnRTEwUyBJbXBsb3Npb24gUXVhZHJ1cGxlIDInOiAnNTZGMicsIC8vIHF1YWRydXBsZSBzZXQgb2Ygc2hhZG93IGltcGxvc2lvbnNcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggU2luZ2xlIDEnOiAnNTZFQycsIC8vIEdpZ2Egc2xhc2ggc2luZ2xlIGZyb20gc2hhZG93XHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFNpbmdsZSAyJzogJzU2RUQnLCAvLyBHaWdhIHNsYXNoIHNpbmdsZSBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBCb3ggMSc6ICc1NzA5JywgLy8gR2lnYSBzbGFzaCBib3ggZnJvbSBmb3VyIGdyb3VuZCBzaGFkb3dzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIEJveCAyJzogJzU3MEQnLCAvLyBHaWdhIHNsYXNoIGJveCBmcm9tIGZvdXIgZ3JvdW5kIHNoYWRvd3NcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggUXVhZHJ1cGxlIDEnOiAnNTZFQycsIC8vIHF1YWRydXBsZSBzZXQgb2YgZ2lnYSBzbGFzaCBjbGVhdmVzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFF1YWRydXBsZSAyJzogJzU2RTknLCAvLyBxdWFkcnVwbGUgc2V0IG9mIGdpZ2Egc2xhc2ggY2xlYXZlc1xyXG4gICAgJ0UxMFMgQ2xvYWsgT2YgU2hhZG93cyAxJzogJzVCMTMnLCAvLyBpbml0aWFsIG5vbi1zcXVpZ2dseSBsaW5lIGV4cGxvc2lvbnNcclxuICAgICdFMTBTIENsb2FrIE9mIFNoYWRvd3MgMic6ICc1QjE0JywgLy8gc2Vjb25kIHNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxMFMgVGhyb25lIE9mIFNoYWRvdyc6ICc1NzE3JywgLy8gc3RhbmRpbmcgdXAgZ2V0IG91dFxyXG4gICAgJ0UxMFMgU2hhZG93eSBFcnVwdGlvbic6ICc1NzM4JywgLy8gYmFpdGVkIGdyb3VuZCBhb2UgZHVyaW5nIGFtcGxpZmllclxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMFMgU3dhdGggT2YgU2lsZW5jZSAxJzogJzU3MUEnLCAvLyBTaGFkb3cgY2xvbmUgY2xlYXZlICh0b28gY2xvc2UpXHJcbiAgICAnRTEwUyBTd2F0aCBPZiBTaWxlbmNlIDInOiAnNUJCRicsIC8vIFNoYWRvdyBjbG9uZSBjbGVhdmUgKHRpbWVkKVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEwUyBTaGFkZWZpcmUnOiAnNTczMicsIC8vIHB1cnBsZSB0YW5rIHVtYnJhbCBvcmJzXHJcbiAgICAnRTEwUyBQaXRjaCBCb2cnOiAnNTcyMicsIC8vIG1hcmtlciBzcHJlYWQgdGhhdCBkcm9wcyBhIHNoYWRvdyBwdWRkbGVcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMFMgU2hhZG93XFwncyBFZGdlJzogJzU3MjUnLCAvLyBUYW5rYnVzdGVyIHNpbmdsZSB0YXJnZXQgZm9sbG93dXBcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEwUyBEYW1hZ2UgRG93biBPcmJzJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdGbGFtZXNoYWRvdycsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NjaGF0dGVuZmxhbW1lJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnRmxhbW1lIG9tYnJhbGUnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICfjgrfjg6Pjg4njgqbjg5Xjg6zjgqTjg6AnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdkYW1hZ2UnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IGAke21hdGNoZXMuZWZmZWN0fSAocGFydGlhbCBzdGFjaylgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMFMgRGFtYWdlIERvd24gQm9zcycsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFNoYWNrbGVzIGJlaW5nIG1lc3NlZCB1cCBhcHBlYXIgdG8ganVzdCBnaXZlIHRoZSBEYW1hZ2UgRG93biwgd2l0aCBub3RoaW5nIGVsc2UuXHJcbiAgICAgIC8vIE1lc3NpbmcgdXAgdG93ZXJzIGlzIHRoZSBUaHJpY2UtQ29tZSBSdWluIGVmZmVjdCAoOUUyKSwgYnV0IGFsc28gRGFtYWdlIERvd24uXHJcbiAgICAgIC8vIFRPRE86IHNvbWUgb2YgdGhlc2Ugd2lsbCBiZSBkdXBsaWNhdGVkIHdpdGggb3RoZXJzLCBsaWtlIGBFMTBTIFRocm9uZSBPZiBTaGFkb3dgLlxyXG4gICAgICAvLyBNYXliZSBpdCdkIGJlIG5pY2UgdG8gZmlndXJlIG91dCBob3cgdG8gcHV0IHRoZSBkYW1hZ2UgbWFya2VyIG9uIHRoYXQ/XHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnU2hhZG93a2VlcGVyJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnU2NoYXR0ZW5rw7ZuaWcnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdSb2kgRGUgTFxcJ09tYnJlJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAn5b2x44Gu546LJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZGFtYWdlJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBgJHttYXRjaGVzLmVmZmVjdH1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBTaGFkb3cgV2FycmlvciA0IGRvZyByb29tIGNsZWF2ZVxyXG4gICAgICAvLyBUaGlzIGNhbiBiZSBtaXRpZ2F0ZWQgYnkgdGhlIHdob2xlIGdyb3VwLCBzbyBhZGQgYSBkYW1hZ2UgY29uZGl0aW9uLlxyXG4gICAgICBpZDogJ0UxMFMgQmFyYnMgT2YgQWdvbnknLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNTcyQScsICc1QjI3J10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUFuYW1vcnBob3NpcyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgTGlnaHRuaW5nJzogJzU2MkUnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gQnVybnQgU3RyaWtlIEZpcmUnOiAnNTYyQycsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgSG9seSc6ICc1NjMwJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFOIEJ1cm5vdXQnOiAnNTYyRicsIC8vIEJ1cm50IFN0cmlrZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExTiBTaGluaW5nIEJsYWRlJzogJzU2MzEnLCAvLyBCYWl0ZWQgZXhwbG9zaW9uXHJcbiAgICAnRTExTiBIYWxvIE9mIEZsYW1lIEJyaWdodGZpcmUnOiAnNTYzQicsIC8vIFJlZCBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMU4gSGFsbyBPZiBMZXZpbiBCcmlnaHRmaXJlJzogJzU2M0MnLCAvLyBCbHVlIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExTiBSZXNvdW5kaW5nIENyYWNrJzogJzU2NEQnLCAvLyBEZW1pLUd1a3VtYXR6IDI3MCBkZWdyZWUgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY0NScsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjQzJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm5vdXQnOiAnNTY0NicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTFOIEJsYXN0aW5nIFpvbmUnOiAnNTYzRScsIC8vIFByaXNtYXRpYyBEZWNlcHRpb24gY2hhcmdlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTExTiBCdXJuIE1hcmsnOiAnNTY0RicsIC8vIFBvd2RlciBNYXJrIGRlYnVmZiBleHBsb3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTExTiBCbGFzdGJ1cm4gS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIC8vIDU2MkQgPSBCdXJudCBTdHJpa2UgZmlyZSBmb2xsb3d1cCBkdXJpbmcgbW9zdCBvZiB0aGUgZmlnaHRcclxuICAgICAgLy8gNTY0NCA9IHNhbWUgdGhpbmcsIGJ1dCBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU2MkQnLCAnNTY0NCddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIDU2NUEvNTY4RCBTaW5zbW9rZSBCb3VuZCBPZiBGYWl0aCBzaGFyZVxyXG4vLyA1NjVFLzU2OTkgQm93c2hvY2sgaGl0cyB0YXJnZXQgb2YgNTY1RCAodHdpY2UpIGFuZCB0d28gb3RoZXJzXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlQW5hbW9ycGhvc2lzU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2NTInLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjU0JywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBIb2x5JzogJzU2NTYnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMVMgU2hpbmluZyBCbGFkZSc6ICc1NjU3JywgLy8gQmFpdGVkIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIEZpcmUnOiAnNTY4RScsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIExpZ2h0bmluZyc6ICc1Njk1JywgLy8gTGluZSBjbGVhdmUgZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgQ3ljbGUgSG9seSc6ICc1NjlEJywgLy8gTGluZSBjbGVhdmUgZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBTaGluaW5nIEJsYWRlIEN5Y2xlJzogJzU2OUUnLCAvLyBCYWl0ZWQgZXhwbG9zaW9uIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgSGFsbyBPZiBGbGFtZSBCcmlnaHRmaXJlJzogJzU2NkQnLCAvLyBSZWQgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIEhhbG8gT2YgTGV2aW4gQnJpZ2h0ZmlyZSc6ICc1NjZDJywgLy8gQmx1ZSBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgUG9ydGFsIE9mIEZsYW1lIEJyaWdodCBQdWxzZSc6ICc1NjcxJywgLy8gUmVkIGNhcmQgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgUG9ydGFsIE9mIExldmluIEJyaWdodCBQdWxzZSc6ICc1NjcwJywgLy8gQmx1ZSBjYXJkIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFJlc29uYW50IFdpbmRzJzogJzU2ODknLCAvLyBEZW1pLUd1a3VtYXR6IFwiZ2V0IGluXCJcclxuICAgICdFMTFTIFJlc291bmRpbmcgQ3JhY2snOiAnNTY4OCcsIC8vIERlbWktR3VrdW1hdHogMjcwIGRlZ3JlZSBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0UxMVMgSW1hZ2UgQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjdCJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm5vdXQnOiAnNTY3QycsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2NzknLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybnQgU3RyaWtlIEhvbHknOiAnNTY3QicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBTaGluaW5nIEJsYWRlJzogJzU2N0UnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBiYWl0ZWQgZXhwbG9zaW9uXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTExUyBCdXJub3V0JzogJzU2NTUnLCAvLyBCdXJudCBTdHJpa2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gICAgJ0UxMVMgQnVybm91dCBDeWNsZSc6ICc1Njk2JywgLy8gQnVybnQgU3RyaWtlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFTIEJsYXN0aW5nIFpvbmUnOiAnNTY3NCcsIC8vIFByaXNtYXRpYyBEZWNlcHRpb24gY2hhcmdlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTExUyBFbGVtZW50YWwgQnJlYWsnOiAnNTY2NCcsIC8vIEVsZW1lbnRhbCBCcmVhayBwcm90ZWFuXHJcbiAgICAnRTExUyBFbGVtZW50YWwgQnJlYWsgQ3ljbGUnOiAnNTY4QycsIC8vIEVsZW1lbnRhbCBCcmVhayBwcm90ZWFuIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgU2luc21pdGUnOiAnNTY2NycsIC8vIExpZ2h0bmluZyBFbGVtZW50YWwgQnJlYWsgc3ByZWFkXHJcbiAgICAnRTExUyBTaW5zbWl0ZSBDeWNsZSc6ICc1Njk0JywgLy8gTGlnaHRuaW5nIEVsZW1lbnRhbCBCcmVhayBzcHJlYWQgZHVyaW5nIEN5Y2xlXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMTFTIEJ1cm4gTWFyayc6ICc1NkEzJywgLy8gUG93ZGVyIE1hcmsgZGVidWZmIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgU2luc2lnaHQgMSc6ICc1NjYxJywgLy8gSG9seSBCb3VuZCBPZiBGYWl0aCB0ZXRoZXJcclxuICAgICdFMTFTIFNpbnNpZ2h0IDInOiAnNUJDNycsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyIGZyb20gRmF0ZWJyZWFrZXIncyBJbWFnZVxyXG4gICAgJ0UxMVMgU2luc2lnaHQgMyc6ICc1NkEwJywgLy8gSG9seSBCb3VuZCBPZiBGYWl0aCB0ZXRoZXIgZHVyaW5nIEN5Y2xlXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgJ0UxMVMgSG9seSBTaW5zaWdodCBHcm91cCBTaGFyZSc6ICc1NjY5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTExUyBCbGFzdGJ1cm4gS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIC8vIDU2NTMgPSBCdXJudCBTdHJpa2UgZmlyZSBmb2xsb3d1cCBkdXJpbmcgbW9zdCBvZiB0aGUgZmlnaHRcclxuICAgICAgLy8gNTY3QSA9IHNhbWUgdGhpbmcsIGJ1dCBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICAgLy8gNTY4RiA9IHNhbWUgdGhpbmcsIGJ1dCBkdXJpbmcgQ3ljbGUgb2YgRmFpdGhcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU2NTMnLCAnNTY3QScsICc1NjhGJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VFdGVybml0eSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEyTiBKdWRnbWVudCBKb2x0IFNpbmdsZSc6ICc1ODVGJywgLy8gUmFtdWggZ2V0IG91dCBjYXN0XHJcbiAgICAnRTEyTiBKdWRnbWVudCBKb2x0JzogJzRFMzAnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3RcclxuICAgICdFMTJOIFRlbXBvcmFyeSBDdXJyZW50IFNpbmdsZSc6ICc1ODVDJywgLy8gTGV2aSBnZXQgdW5kZXIgY2FzdFxyXG4gICAgJ0UxMk4gVGVtcG9yYXJ5IEN1cnJlbnQnOiAnNEUyRCcsIC8vIExldmkgZ2V0IHVuZGVyIGNhc3RcclxuICAgICdFMTJOIENvbmZsYWcgU3RyaWtlIFNpbmdsZSc6ICc1ODVEJywgLy8gSWZyaXQgZ2V0IHNpZGVzIGNhc3RcclxuICAgICdFMTJOIENvbmZsYWcgU3RyaWtlJzogJzRFMkUnLCAvLyBJZnJpdCBnZXQgc2lkZXMgY2FzdFxyXG4gICAgJ0UxMk4gRmVyb3N0b3JtIFNpbmdsZSc6ICc1ODVFJywgLy8gR2FydWRhIGdldCBpbnRlcmNhcmRpbmFscyBjYXN0XHJcbiAgICAnRTEyTiBGZXJvc3Rvcm0nOiAnNEUyRicsIC8vIEdhcnVkYSBnZXQgaW50ZXJjYXJkaW5hbHMgY2FzdFxyXG4gICAgJ0UxMk4gUmFwdHVyb3VzIFJlYWNoIDEnOiAnNTg3OCcsIC8vIEhhaXJjdXRcclxuICAgICdFMTJOIFJhcHR1cm91cyBSZWFjaCAyJzogJzU4NzcnLCAvLyBIYWlyY3V0XHJcbiAgICAnRTEyTiBCb21iIEV4cGxvc2lvbic6ICc1ODZEJywgLy8gU21hbGwgYm9tYiBleHBsb3Npb25cclxuICAgICdFMTJOIFRpdGFuaWMgQm9tYiBFeHBsb3Npb24nOiAnNTg2RicsIC8vIExhcmdlIGJvbWIgZXhwbG9zaW9uXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTJOIEVhcnRoc2hha2VyJzogJzU4ODUnLCAvLyBFYXJ0aHNoYWtlciBvbiBmaXJzdCBwbGF0Zm9ybVxyXG4gICAgJ0UxMk4gUHJvbWlzZSBGcmlnaWQgU3RvbmUgMSc6ICc1ODY3JywgLy8gU2hpdmEgc3ByZWFkIHdpdGggc2xpZGluZ1xyXG4gICAgJ0UxMk4gUHJvbWlzZSBGcmlnaWQgU3RvbmUgMic6ICc1ODY5JywgLy8gU2hpdmEgc3ByZWFkIHdpdGggUmFwdHVyb3VzIFJlYWNoXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCB7IExhbmcgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbGFuZ3VhZ2VzJztcclxuaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgeyBVbnJlYWNoYWJsZUNvZGUgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbm90X3JlYWNoZWQnO1xyXG5pbXBvcnQgT3V0cHV0cyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvb3V0cHV0cyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgTmV0TWF0Y2hlcyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL25ldF9tYXRjaGVzJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBMb2NhbGVUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvdHJpZ2dlcic7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGRlY09mZnNldD86IG51bWJlcjtcclxuICBsYXNlck5hbWVUb051bT86IHsgW25hbWU6IHN0cmluZ106IG51bWJlciB9O1xyXG4gIHNjdWxwdHVyZVRldGhlck5hbWVUb0lkPzogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH07XHJcbiAgc2N1bHB0dXJlWVBvc2l0aW9ucz86IHsgW3NjdWxwdHVyZUlkOiBzdHJpbmddOiBudW1iZXIgfTtcclxuICBibGFkZU9mRmxhbWVDb3VudD86IG51bWJlcjtcclxuICBwaWxsYXJJZFRvT3duZXI/OiB7IFtwaWxsYXJJZDogc3RyaW5nXTogc3RyaW5nIH07XHJcbiAgc21hbGxMaW9uSWRUb093bmVyPzogeyBbcGlsbGFySWQ6IHN0cmluZ106IHN0cmluZyB9O1xyXG4gIHNtYWxsTGlvbk93bmVycz86IHN0cmluZ1tdO1xyXG4gIG5vcnRoQmlnTGlvbj86IHN0cmluZztcclxuICBmaXJlPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG4vLyBUT0RPOiBhZGQgc2VwYXJhdGUgZGFtYWdlV2Fybi1lc3F1ZSBpY29uIGZvciBkYW1hZ2UgZG93bnM/XHJcbi8vIFRPRE86IDU4QTYgVW5kZXIgVGhlIFdlaWdodCAvIDU4QjIgQ2xhc3NpY2FsIFNjdWxwdHVyZSBtaXNzaW5nIHNvbWVib2R5IGluIHBhcnR5IHdhcm5pbmc/XHJcbi8vIFRPRE86IDU4Q0EgRGFyayBXYXRlciBJSUkgLyA1OEM1IFNoZWxsIENydXNoZXIgc2hvdWxkIGhpdCBldmVyeW9uZSBpbiBwYXJ0eVxyXG4vLyBUT0RPOiBEYXJrIEFlcm8gSUlJIDU4RDQgc2hvdWxkIG5vdCBiZSBhIHNoYXJlIGV4Y2VwdCBvbiBhZHZhbmNlZCByZWxhdGl2aXR5IGZvciBkb3VibGUgYWVyby5cclxuLy8gKGZvciBnYWlucyBlZmZlY3QsIHNpbmdsZSBhZXJvID0gfjIzIHNlY29uZHMsIGRvdWJsZSBhZXJvID0gfjMxIHNlY29uZHMgZHVyYXRpb24pXHJcblxyXG4vLyBEdWUgdG8gY2hhbmdlcyBpbnRyb2R1Y2VkIGluIHBhdGNoIDUuMiwgb3ZlcmhlYWQgbWFya2VycyBub3cgaGF2ZSBhIHJhbmRvbSBvZmZzZXRcclxuLy8gYWRkZWQgdG8gdGhlaXIgSUQuIFRoaXMgb2Zmc2V0IGN1cnJlbnRseSBhcHBlYXJzIHRvIGJlIHNldCBwZXIgaW5zdGFuY2UsIHNvXHJcbi8vIHdlIGNhbiBkZXRlcm1pbmUgd2hhdCBpdCBpcyBmcm9tIHRoZSBmaXJzdCBvdmVyaGVhZCBtYXJrZXIgd2Ugc2VlLlxyXG4vLyBUaGUgZmlyc3QgMUIgbWFya2VyIGluIHRoZSBlbmNvdW50ZXIgaXMgdGhlIGZvcm1sZXNzIHRhbmtidXN0ZXIsIElEIDAwNEYuXHJcbmNvbnN0IGZpcnN0SGVhZG1hcmtlciA9IHBhcnNlSW50KCcwMERBJywgMTYpO1xyXG5jb25zdCBnZXRIZWFkbWFya2VySWQgPSAoZGF0YTogRGF0YSwgbWF0Y2hlczogTmV0TWF0Y2hlc1snSGVhZE1hcmtlciddKSA9PiB7XHJcbiAgLy8gSWYgd2UgbmFpdmVseSBqdXN0IGNoZWNrICFkYXRhLmRlY09mZnNldCBhbmQgbGVhdmUgaXQsIGl0IGJyZWFrcyBpZiB0aGUgZmlyc3QgbWFya2VyIGlzIDAwREEuXHJcbiAgLy8gKFRoaXMgbWFrZXMgdGhlIG9mZnNldCAwLCBhbmQgITAgaXMgdHJ1ZS4pXHJcbiAgaWYgKHR5cGVvZiBkYXRhLmRlY09mZnNldCA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBkYXRhLmRlY09mZnNldCA9IHBhcnNlSW50KG1hdGNoZXMuaWQsIDE2KSAtIGZpcnN0SGVhZG1hcmtlcjtcclxuICAvLyBUaGUgbGVhZGluZyB6ZXJvZXMgYXJlIHN0cmlwcGVkIHdoZW4gY29udmVydGluZyBiYWNrIHRvIHN0cmluZywgc28gd2UgcmUtYWRkIHRoZW0gaGVyZS5cclxuICAvLyBGb3J0dW5hdGVseSwgd2UgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCB3aGV0aGVyIG9yIG5vdCB0aGlzIGlzIHJvYnVzdCxcclxuICAvLyBzaW5jZSB3ZSBrbm93IGFsbCB0aGUgSURzIHRoYXQgd2lsbCBiZSBwcmVzZW50IGluIHRoZSBlbmNvdW50ZXIuXHJcbiAgcmV0dXJuIChwYXJzZUludChtYXRjaGVzLmlkLCAxNikgLSBkYXRhLmRlY09mZnNldCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkucGFkU3RhcnQoNCwgJzAnKTtcclxufTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VFdGVybml0eVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIFJhcHR1cm91cyBSZWFjaCBMZWZ0JzogJzU4QUQnLCAvLyBIYWlyY3V0IHdpdGggbGVmdCBzYWZlIHNpZGVcclxuICAgICdFMTJTIFByb21pc2UgUmFwdHVyb3VzIFJlYWNoIFJpZ2h0JzogJzU4QUUnLCAvLyBIYWlyY3V0IHdpdGggcmlnaHQgc2FmZSBzaWRlXHJcbiAgICAnRTEyUyBQcm9taXNlIFRlbXBvcmFyeSBDdXJyZW50JzogJzRFNDQnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgQ29uZmxhZyBTdHJpa2UnOiAnNEU0NScsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgRmVyb3N0b3JtJzogJzRFNDYnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBKdWRnbWVudCBKb2x0JzogJzRFNDcnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBTaGF0dGVyJzogJzU4OUMnLCAvLyBJY2UgUGlsbGFyIGV4cGxvc2lvbiBpZiB0ZXRoZXIgbm90IGdvdHRlblxyXG4gICAgJ0UxMlMgUHJvbWlzZSBJbXBhY3QnOiAnNThBMScsIC8vIFRpdGFuIGJvbWIgZHJvcFxyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgQmxpenphcmQgSUlJJzogJzU4RDMnLCAvLyBSZWxhdGl2aXR5IGRvbnV0IG1lY2hhbmljXHJcbiAgICAnRTEyUyBPcmFjbGUgQXBvY2FseXBzZSc6ICc1OEU2JywgLy8gTGlnaHQgdXAgY2lyY2xlIGV4cGxvc2lvbnMgKGRhbWFnZSBkb3duKVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMlMgT3JhY2xlIE1hZWxzdHJvbSc6ICc1OERBJywgLy8gQWR2YW5jZWQgUmVsYXRpdml0eSB0cmFmZmljIGxpZ2h0IGFvZVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnRTEyUyBPcmFjbGUgRG9vbSc6ICc5RDQnLCAvLyBSZWxhdGl2aXR5IHB1bmlzaG1lbnQgZm9yIG11bHRpcGxlIG1pc3Rha2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTJTIFByb21pc2UgRnJpZ2lkIFN0b25lJzogJzU4OUUnLCAvLyBTaGl2YSBzcHJlYWRcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrZXN0IERhbmNlJzogJzRFMzMnLCAvLyBGYXJ0aGVzdCB0YXJnZXQgYmFpdCArIGp1bXAgYmVmb3JlIGtub2NrYmFja1xyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgQ3VycmVudCc6ICc1OEQ4JywgLy8gQmFpdGVkIHRyYWZmaWMgbGlnaHQgbGFzZXJzXHJcbiAgICAnRTEyUyBPcmFjbGUgU3Bpcml0IFRha2VyJzogJzU4QzYnLCAvLyBSYW5kb20ganVtcCBzcHJlYWQgbWVjaGFuaWMgYWZ0ZXIgU2hlbGwgQ3J1c2hlclxyXG4gICAgJ0UxMlMgT3JhY2xlIFNvbWJlciBEYW5jZSAxJzogJzU4QkYnLCAvLyBGYXJ0aGVzdCB0YXJnZXQgYmFpdCBmb3IgRHVhbCBBcG9jYWx5cHNlXHJcbiAgICAnRTEyUyBPcmFjbGUgU29tYmVyIERhbmNlIDInOiAnNThDMCcsIC8vIFNlY29uZCBzb21iZXIgZGFuY2UganVtcFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIFdlaWdodCBPZiBUaGUgV29ybGQnOiAnNThBNScsIC8vIFRpdGFuIGJvbWIgYmx1ZSBtYXJrZXJcclxuICAgICdFMTJTIFByb21pc2UgUHVsc2UgT2YgVGhlIExhbmQnOiAnNThBMycsIC8vIFRpdGFuIGJvbWIgeWVsbG93IG1hcmtlclxyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgRXJ1cHRpb24gMSc6ICc1OENFJywgLy8gSW5pdGlhbCB3YXJtdXAgc3ByZWFkIG1lY2hhbmljXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFyayBFcnVwdGlvbiAyJzogJzU4Q0QnLCAvLyBSZWxhdGl2aXR5IHNwcmVhZCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIEJsYWNrIEhhbG8nOiAnNThDNycsIC8vIFRhbmtidXN0ZXIgY2xlYXZlXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBGb3JjZSBPZiBUaGUgTGFuZCc6ICc1OEE0JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEJpZyBjaXJjbGUgZ3JvdW5kIGFvZXMgZHVyaW5nIFNoaXZhIGp1bmN0aW9uLlxyXG4gICAgICAvLyBUaGlzIGNhbiBiZSBzaGllbGRlZCB0aHJvdWdoIGFzIGxvbmcgYXMgdGhhdCBwZXJzb24gZG9lc24ndCBzdGFjay5cclxuICAgICAgaWQ6ICdFMTJTIEljaWNsZSBJbXBhY3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0RTVBJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIEhlYWRtYXJrZXInLFxyXG4gICAgICB0eXBlOiAnSGVhZE1hcmtlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoe30pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBnZXRIZWFkbWFya2VySWQoZGF0YSwgbWF0Y2hlcyk7XHJcbiAgICAgICAgY29uc3QgZmlyc3RMYXNlck1hcmtlciA9ICcwMDkxJztcclxuICAgICAgICBjb25zdCBsYXN0TGFzZXJNYXJrZXIgPSAnMDA5OCc7XHJcbiAgICAgICAgaWYgKGlkID49IGZpcnN0TGFzZXJNYXJrZXIgJiYgaWQgPD0gbGFzdExhc2VyTWFya2VyKSB7XHJcbiAgICAgICAgICAvLyBpZHMgYXJlIHNlcXVlbnRpYWw6ICMxIHNxdWFyZSwgIzIgc3F1YXJlLCAjMyBzcXVhcmUsICM0IHNxdWFyZSwgIzEgdHJpYW5nbGUgZXRjXHJcbiAgICAgICAgICBjb25zdCBkZWNPZmZzZXQgPSBwYXJzZUludChpZCwgMTYpIC0gcGFyc2VJbnQoZmlyc3RMYXNlck1hcmtlciwgMTYpO1xyXG5cclxuICAgICAgICAgIC8vIGRlY09mZnNldCBpcyAwLTcsIHNvIG1hcCAwLTMgdG8gMS00IGFuZCA0LTcgdG8gMS00LlxyXG4gICAgICAgICAgZGF0YS5sYXNlck5hbWVUb051bSA/Pz0ge307XHJcbiAgICAgICAgICBkYXRhLmxhc2VyTmFtZVRvTnVtW21hdGNoZXMudGFyZ2V0XSA9IGRlY09mZnNldCAlIDQgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXNlIHNjdWxwdHVyZXMgYXJlIGFkZGVkIGF0IHRoZSBzdGFydCBvZiB0aGUgZmlnaHQsIHNvIHdlIG5lZWQgdG8gY2hlY2sgd2hlcmUgdGhleVxyXG4gICAgICAvLyB1c2UgdGhlIFwiQ2xhc3NpY2FsIFNjdWxwdHVyZVwiIGFiaWxpdHkgYW5kIGVuZCB1cCBvbiB0aGUgYXJlbmEgZm9yIHJlYWwuXHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIENoaXNlbGVkIFNjdWxwdHVyZSBDbGFzc2ljYWwgU2N1bHB0dXJlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnNThCMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBUaGlzIHdpbGwgcnVuIHBlciBwZXJzb24gdGhhdCBnZXRzIGhpdCBieSB0aGUgc2FtZSBzY3VscHR1cmUsIGJ1dCB0aGF0J3MgZmluZS5cclxuICAgICAgICAvLyBSZWNvcmQgdGhlIHkgcG9zaXRpb24gb2YgZWFjaCBzY3VscHR1cmUgc28gd2UgY2FuIHVzZSBpdCBmb3IgYmV0dGVyIHRleHQgbGF0ZXIuXHJcbiAgICAgICAgZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zID8/PSB7fTtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnNbbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpXSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZSBzb3VyY2Ugb2YgdGhlIHRldGhlciBpcyB0aGUgcGxheWVyLCB0aGUgdGFyZ2V0IGlzIHRoZSBzY3VscHR1cmUuXHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIENoaXNlbGVkIFNjdWxwdHVyZSBUZXRoZXInLFxyXG4gICAgICB0eXBlOiAnVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgdGFyZ2V0OiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWRbbWF0Y2hlcy5zb3VyY2VdID0gbWF0Y2hlcy50YXJnZXRJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmxhZGUgT2YgRmxhbWUgQ291bnRlcicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnNThCMycgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5ibGFkZU9mRmxhbWVDb3VudCA9IGRhdGEuYmxhZGVPZkZsYW1lQ291bnQgfHwgMDtcclxuICAgICAgICBkYXRhLmJsYWRlT2ZGbGFtZUNvdW50Kys7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGlzIHRoZSBDaGlzZWxlZCBTY3VscHR1cmUgbGFzZXIgd2l0aCB0aGUgbGltaXQgY3V0IGRvdHMuXHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEJsYWRlIE9mIEZsYW1lJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgdHlwZTogJzIyJywgc291cmNlOiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICc1OEIzJyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEubGFzZXJOYW1lVG9OdW0gfHwgIWRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQgfHwgIWRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucylcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gRmluZCB0aGUgcGVyc29uIHdobyBoYXMgdGhpcyBsYXNlciBudW1iZXIgYW5kIGlzIHRldGhlcmVkIHRvIHRoaXMgc3RhdHVlLlxyXG4gICAgICAgIGNvbnN0IG51bWJlciA9IChkYXRhLmJsYWRlT2ZGbGFtZUNvdW50IHx8IDApICsgMTtcclxuICAgICAgICBjb25zdCBzb3VyY2VJZCA9IG1hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBuYW1lcyA9IE9iamVjdC5rZXlzKGRhdGEubGFzZXJOYW1lVG9OdW0pO1xyXG4gICAgICAgIGNvbnN0IHdpdGhOdW0gPSBuYW1lcy5maWx0ZXIoKG5hbWUpID0+IGRhdGEubGFzZXJOYW1lVG9OdW0/LltuYW1lXSA9PT0gbnVtYmVyKTtcclxuICAgICAgICBjb25zdCBvd25lcnMgPSB3aXRoTnVtLmZpbHRlcigobmFtZSkgPT4gZGF0YS5zY3VscHR1cmVUZXRoZXJOYW1lVG9JZD8uW25hbWVdID09PSBzb3VyY2VJZCk7XHJcblxyXG4gICAgICAgIC8vIGlmIHNvbWUgbG9naWMgZXJyb3IsIGp1c3QgYWJvcnQuXHJcbiAgICAgICAgaWYgKG93bmVycy5sZW5ndGggIT09IDEpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFRoZSBvd25lciBoaXR0aW5nIHRoZW1zZWx2ZXMgaXNuJ3QgYSBtaXN0YWtlLi4udGVjaG5pY2FsbHkuXHJcbiAgICAgICAgaWYgKG93bmVyc1swXSA9PT0gbWF0Y2hlcy50YXJnZXQpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIE5vdyB0cnkgdG8gZmlndXJlIG91dCB3aGljaCBzdGF0dWUgaXMgd2hpY2guXHJcbiAgICAgICAgLy8gUGVvcGxlIGNhbiBwdXQgdGhlc2Ugd2hlcmV2ZXIuICBUaGV5IGNvdWxkIGdvIHNpZGV3YXlzLCBvciBkaWFnb25hbCwgb3Igd2hhdGV2ZXIuXHJcbiAgICAgICAgLy8gSXQgc2VlbXMgbW9vb29vc3QgcGVvcGxlIHB1dCB0aGVzZSBub3J0aCAvIHNvdXRoIChvbiB0aGUgc291dGggZWRnZSBvZiB0aGUgYXJlbmEpLlxyXG4gICAgICAgIC8vIExldCdzIHNheSBhIG1pbmltdW0gb2YgMiB5YWxtcyBhcGFydCBpbiB0aGUgeSBkaXJlY3Rpb24gdG8gY29uc2lkZXIgdGhlbSBcIm5vcnRoL3NvdXRoXCIuXHJcbiAgICAgICAgY29uc3QgbWluaW11bVlhbG1zRm9yU3RhdHVlcyA9IDI7XHJcblxyXG4gICAgICAgIGxldCBpc1N0YXR1ZVBvc2l0aW9uS25vd24gPSBmYWxzZTtcclxuICAgICAgICBsZXQgaXNTdGF0dWVOb3J0aCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHNjdWxwdHVyZUlkcyA9IE9iamVjdC5rZXlzKGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucyk7XHJcbiAgICAgICAgaWYgKHNjdWxwdHVyZUlkcy5sZW5ndGggPT09IDIgJiYgc2N1bHB0dXJlSWRzLmluY2x1ZGVzKHNvdXJjZUlkKSkge1xyXG4gICAgICAgICAgY29uc3Qgb3RoZXJJZCA9IHNjdWxwdHVyZUlkc1swXSA9PT0gc291cmNlSWQgPyBzY3VscHR1cmVJZHNbMV0gOiBzY3VscHR1cmVJZHNbMF07XHJcbiAgICAgICAgICBjb25zdCBzb3VyY2VZID0gZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zW3NvdXJjZUlkXTtcclxuICAgICAgICAgIGNvbnN0IG90aGVyWSA9IGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9uc1tvdGhlcklkID8/ICcnXTtcclxuICAgICAgICAgIGlmIChzb3VyY2VZID09PSB1bmRlZmluZWQgfHwgb3RoZXJZID09PSB1bmRlZmluZWQgfHwgb3RoZXJJZCA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVW5yZWFjaGFibGVDb2RlKCk7XHJcbiAgICAgICAgICBjb25zdCB5RGlmZiA9IE1hdGguYWJzKHNvdXJjZVkgLSBvdGhlclkpO1xyXG4gICAgICAgICAgaWYgKHlEaWZmID4gbWluaW11bVlhbG1zRm9yU3RhdHVlcykge1xyXG4gICAgICAgICAgICBpc1N0YXR1ZVBvc2l0aW9uS25vd24gPSB0cnVlO1xyXG4gICAgICAgICAgICBpc1N0YXR1ZU5vcnRoID0gc291cmNlWSA8IG90aGVyWTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG93bmVyID0gb3duZXJzWzBdO1xyXG4gICAgICAgIGNvbnN0IG93bmVyTmljayA9IGRhdGEuU2hvcnROYW1lKG93bmVyKTtcclxuICAgICAgICBsZXQgdGV4dCA9IHtcclxuICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke293bmVyTmlja30sICMke251bWJlcn0pYCxcclxuICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke293bmVyTmlja33jgYvjgonjgIEjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6IeqJHtvd25lck5pY2t977yMIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogpYCxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChpc1N0YXR1ZVBvc2l0aW9uS25vd24gJiYgaXNTdGF0dWVOb3J0aCkge1xyXG4gICAgICAgICAgdGV4dCA9IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9IG5vcnRoKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9IG5vcmRlbilgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5YyX44GuJHtvd25lck5pY2t944GL44KJ44CBIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6Ieq5YyX5pa5JHtvd25lck5pY2t977yMIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtvd25lck5pY2t9XCIsICR7bnVtYmVyfeuyiCDrtoHsqr0pYCxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc1N0YXR1ZVBvc2l0aW9uS25vd24gJiYgIWlzU3RhdHVlTm9ydGgpIHtcclxuICAgICAgICAgIHRleHQgPSB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBzb3V0aClgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBTw7xkZW4pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOWNl+OBriR7b3duZXJOaWNrfeOBi+OCieOAgSMke251bWJlcn0pYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHquWNl+aWuSR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogg64Ko7Kq9KWAsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgYmxhbWU6IG93bmVyLFxyXG4gICAgICAgICAgdGV4dDogdGV4dCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgSWNlIFBpbGxhciBUcmFja2VyJyxcclxuICAgICAgdHlwZTogJ1RldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0ljZSBQaWxsYXInLCBpZDogWycwMDAxJywgJzAwMzknXSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEucGlsbGFySWRUb093bmVyID8/PSB7fTtcclxuICAgICAgICBkYXRhLnBpbGxhcklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkXSA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgSWNlIFBpbGxhciBNaXN0YWtlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnSWNlIFBpbGxhcicsIGlkOiAnNTg5QicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEucGlsbGFySWRUb093bmVyKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBtYXRjaGVzLnRhcmdldCAhPT0gZGF0YS5waWxsYXJJZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZF07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcGlsbGFyT3duZXIgPSBkYXRhLlNob3J0TmFtZShkYXRhLnBpbGxhcklkVG9Pd25lcj8uW21hdGNoZXMuc291cmNlSWRdKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChkZSAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtwaWxsYXJPd25lcn3jgYvjgokpYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke3BpbGxhck93bmVyfVwiKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBHYWluIEZpcmUgUmVzaXN0YW5jZSBEb3duIElJJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gVGhlIEJlYXN0bHkgU2N1bHB0dXJlIGdpdmVzIGEgMyBzZWNvbmQgZGVidWZmLCB0aGUgUmVnYWwgU2N1bHB0dXJlIGdpdmVzIGEgMTRzIG9uZS5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzgzMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZpcmUgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgTG9zZSBGaXJlIFJlc2lzdGFuY2UgRG93biBJSScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4MzInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5maXJlID8/PSB7fTtcclxuICAgICAgICBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBTbWFsbCBMaW9uIFRldGhlcicsXHJcbiAgICAgIHR5cGU6ICdUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdCZWFzdGx5IFNjdWxwdHVyZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQWJiaWxkIEVpbmVzIEzDtndlbicsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQ3LDqWF0aW9uIEzDqW9uaW5lJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICflibXjgonjgozjgZ/njYXlrZAnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25JZFRvT3duZXIgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uSWRUb093bmVyW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbk93bmVycyA/Pz0gW107XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25Pd25lcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBTbWFsbCBMaW9uIExpb25zYmxhemUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQmVhc3RseSBTY3VscHR1cmUnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQWJiaWxkIEVpbmVzIEzDtndlbicsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdDcsOpYXRpb24gTMOpb25pbmUnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAn5Ym144KJ44KM44Gf542F5a2QJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBGb2xrcyBiYWl0aW5nIHRoZSBiaWcgbGlvbiBzZWNvbmQgY2FuIHRha2UgdGhlIGZpcnN0IHNtYWxsIGxpb24gaGl0LFxyXG4gICAgICAgIC8vIHNvIGl0J3Mgbm90IHN1ZmZpY2llbnQgdG8gY2hlY2sgb25seSB0aGUgb3duZXIuXHJcbiAgICAgICAgaWYgKCFkYXRhLnNtYWxsTGlvbk93bmVycylcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zdCBvd25lciA9IGRhdGEuc21hbGxMaW9uSWRUb093bmVyPy5bbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpXTtcclxuICAgICAgICBpZiAoIW93bmVyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmIChtYXRjaGVzLnRhcmdldCA9PT0gb3duZXIpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB0YXJnZXQgYWxzbyBoYXMgYSBzbWFsbCBsaW9uIHRldGhlciwgdGhhdCBpcyBhbHdheXMgYSBtaXN0YWtlLlxyXG4gICAgICAgIC8vIE90aGVyd2lzZSwgaXQncyBvbmx5IGEgbWlzdGFrZSBpZiB0aGUgdGFyZ2V0IGhhcyBhIGZpcmUgZGVidWZmLlxyXG4gICAgICAgIGNvbnN0IGhhc1NtYWxsTGlvbiA9IGRhdGEuc21hbGxMaW9uT3duZXJzLmluY2x1ZGVzKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgICBjb25zdCBoYXNGaXJlRGVidWZmID0gZGF0YS5maXJlICYmIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF07XHJcblxyXG4gICAgICAgIGlmIChoYXNTbWFsbExpb24gfHwgaGFzRmlyZURlYnVmZikge1xyXG4gICAgICAgICAgY29uc3Qgb3duZXJOaWNrID0gZGF0YS5TaG9ydE5hbWUob3duZXIpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGNlbnRlclkgPSAtNzU7XHJcbiAgICAgICAgICBjb25zdCB4ID0gcGFyc2VGbG9hdChtYXRjaGVzLngpO1xyXG4gICAgICAgICAgY29uc3QgeSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgICAgIGxldCBkaXJPYmogPSBudWxsO1xyXG4gICAgICAgICAgaWYgKHkgPCBjZW50ZXJZKSB7XHJcbiAgICAgICAgICAgIGlmICh4ID4gMClcclxuICAgICAgICAgICAgICBkaXJPYmogPSBPdXRwdXRzLmRpck5FO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJOVztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh4ID4gMClcclxuICAgICAgICAgICAgICBkaXJPYmogPSBPdXRwdXRzLmRpclNFO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJTVztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBvd25lcixcclxuICAgICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICR7ZGlyT2JqWydlbiddfSlgLFxyXG4gICAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAke2Rpck9ialsnZGUnXX0pYCxcclxuICAgICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZGUgJHtvd25lck5pY2t9LCAke2Rpck9ialsnZnInXX0pYCxcclxuICAgICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtvd25lck5pY2t944GL44KJLCAke2Rpck9ialsnamEnXX0pYCxcclxuICAgICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6IeqJHtvd25lck5pY2t9LCAke2Rpck9ialsnY24nXX1gLFxyXG4gICAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtkaXJPYmpbJ2tvJ119KWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIE5vcnRoIEJpZyBMaW9uJyxcclxuICAgICAgdHlwZTogJ0FkZGVkQ29tYmF0YW50JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWRkZWRDb21iYXRhbnRGdWxsKHsgbmFtZTogJ1JlZ2FsIFNjdWxwdHVyZScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCB5ID0gcGFyc2VGbG9hdChtYXRjaGVzLnkpO1xyXG4gICAgICAgIGNvbnN0IGNlbnRlclkgPSAtNzU7XHJcbiAgICAgICAgaWYgKHkgPCBjZW50ZXJZKVxyXG4gICAgICAgICAgZGF0YS5ub3J0aEJpZ0xpb24gPSBtYXRjaGVzLmlkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBCaWcgTGlvbiBLaW5nc2JsYXplJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnUmVnYWwgU2N1bHB0dXJlJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnQWJiaWxkIGVpbmVzIGdyb8OfZW4gTMO2d2VuJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnY3LDqWF0aW9uIGzDqW9uaW5lIHJveWFsZScsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ+WJteOCieOCjOOBn+eNheWtkOeOiycsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2luZ2xlVGFyZ2V0ID0gbWF0Y2hlcy50eXBlID09PSAnMjEnO1xyXG4gICAgICAgIGNvbnN0IGhhc0ZpcmVEZWJ1ZmYgPSBkYXRhLmZpcmUgJiYgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XTtcclxuXHJcbiAgICAgICAgLy8gU3VjY2VzcyBpZiBvbmx5IG9uZSBwZXJzb24gdGFrZXMgaXQgYW5kIHRoZXkgaGF2ZSBubyBmaXJlIGRlYnVmZi5cclxuICAgICAgICBpZiAoc2luZ2xlVGFyZ2V0ICYmICFoYXNGaXJlRGVidWZmKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBub3J0aEJpZ0xpb246IExvY2FsZVRleHQgPSB7XHJcbiAgICAgICAgICBlbjogJ25vcnRoIGJpZyBsaW9uJyxcclxuICAgICAgICAgIGRlOiAnTm9yZGVtLCBncm/Dn2VyIEzDtndlJyxcclxuICAgICAgICAgIGphOiAn5aSn44Op44Kk44Kq44OzKOWMlyknLFxyXG4gICAgICAgICAgY246ICfljJfmlrnlpKfni67lrZAnLFxyXG4gICAgICAgICAga286ICfrtoHsqr0g7YGwIOyCrOyekCcsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzb3V0aEJpZ0xpb246IExvY2FsZVRleHQgPSB7XHJcbiAgICAgICAgICBlbjogJ3NvdXRoIGJpZyBsaW9uJyxcclxuICAgICAgICAgIGRlOiAnU8O8ZGVuLCBncm/Dn2VyIEzDtndlJyxcclxuICAgICAgICAgIGphOiAn5aSn44Op44Kk44Kq44OzKOWNlyknLFxyXG4gICAgICAgICAgY246ICfljZfmlrnlpKfni67lrZAnLFxyXG4gICAgICAgICAga286ICfrgqjsqr0g7YGwIOyCrOyekCcsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzaGFyZWQ6IExvY2FsZVRleHQgPSB7XHJcbiAgICAgICAgICBlbjogJ3NoYXJlZCcsXHJcbiAgICAgICAgICBkZTogJ2dldGVpbHQnLFxyXG4gICAgICAgICAgamE6ICfph43jga3jgZ8nLFxyXG4gICAgICAgICAgY246ICfph43lj6AnLFxyXG4gICAgICAgICAga286ICfqsJnsnbQg66ee7J2MJyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGZpcmVEZWJ1ZmY6IExvY2FsZVRleHQgPSB7XHJcbiAgICAgICAgICBlbjogJ2hhZCBmaXJlJyxcclxuICAgICAgICAgIGRlOiAnaGF0dGUgRmV1ZXInLFxyXG4gICAgICAgICAgamE6ICfngo7ku5jjgY0nLFxyXG4gICAgICAgICAgY246ICfngatEZWJ1ZmYnLFxyXG4gICAgICAgICAga286ICftmZTsl7wg65SU67KE7ZSEIOuwm+ydjCcsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgbGFiZWxzID0gW107XHJcbiAgICAgICAgY29uc3QgbGFuZzogTGFuZyA9IGRhdGEub3B0aW9ucy5QYXJzZXJMYW5ndWFnZTtcclxuXHJcbiAgICAgICAgaWYgKGRhdGEubm9ydGhCaWdMaW9uKSB7XHJcbiAgICAgICAgICBpZiAoZGF0YS5ub3J0aEJpZ0xpb24gPT09IG1hdGNoZXMuc291cmNlSWQpXHJcbiAgICAgICAgICAgIGxhYmVscy5wdXNoKG5vcnRoQmlnTGlvbltsYW5nXSA/PyBub3J0aEJpZ0xpb25bJ2VuJ10pO1xyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBsYWJlbHMucHVzaChzb3V0aEJpZ0xpb25bbGFuZ10gPz8gc291dGhCaWdMaW9uWydlbiddKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzaW5nbGVUYXJnZXQpXHJcbiAgICAgICAgICBsYWJlbHMucHVzaChzaGFyZWRbbGFuZ10gPz8gc2hhcmVkWydlbiddKTtcclxuICAgICAgICBpZiAoaGFzRmlyZURlYnVmZilcclxuICAgICAgICAgIGxhYmVscy5wdXNoKGZpcmVEZWJ1ZmZbbGFuZ10gPz8gZmlyZURlYnVmZlsnZW4nXSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7bGFiZWxzLmpvaW4oJywgJyl9KWAsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gNTg5QSA9IEljZSBQaWxsYXIgKHByb21pc2Ugc2hpdmEgcGhhc2UpXHJcbiAgICAgIC8vIDU4QjYgPSBQYWxtIE9mIFRlbXBlcmFuY2UgKHByb21pc2Ugc3RhdHVlIGhhbmQpXHJcbiAgICAgIC8vIDU4QjcgPSBMYXNlciBFeWUgKHByb21pc2UgbGlvbiBwaGFzZSlcclxuICAgICAgLy8gNThDMSA9IERhcmtlc3QgRGFuY2UgKG9yYWNsZSB0YW5rIGp1bXAgKyBrbm9ja2JhY2sgaW4gYmVnaW5uaW5nIGFuZCB0cmlwbGUgYXBvYylcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU4OUEnLCAnNThCNicsICc1OEI3JywgJzU4QzEnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIE9yYWNsZSBTaGFkb3dleWUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc1OEQyJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiB3YXJuaW5nIGZvciB0YWtpbmcgRGlhbW9uZCBGbGFzaCAoNUZBMSkgc3RhY2sgb24geW91ciBvd24/XHJcblxyXG4vLyBEaWFtb25kIFdlYXBvbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDbG91ZERlY2tFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDEnOiAnNUZBRicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgMic6ICc1RkIyJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyAzJzogJzVGQ0QnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDQnOiAnNUZDRScsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNSc6ICc1RkNGJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA2JzogJzVGRjgnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDcnOiAnNjE1OScsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBcnRpY3VsYXRlZCBCaXQgQWV0aGVyaWFsIEJ1bGxldCc6ICc1RkFCJywgLy8gYml0IGxhc2VycyBkdXJpbmcgYWxsIHBoYXNlc1xyXG4gICAgJ0RpYW1vbmRFeCBEaWFtb25kIFNocmFwbmVsIDEnOiAnNUZDQicsIC8vIGNoYXNpbmcgY2lyY2xlc1xyXG4gICAgJ0RpYW1vbmRFeCBEaWFtb25kIFNocmFwbmVsIDInOiAnNUZDQycsIC8vIGNoYXNpbmcgY2lyY2xlc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RpYW1vbmRFeCBDbGF3IFN3aXBlIExlZnQnOiAnNUZDMicsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZEV4IENsYXcgU3dpcGUgUmlnaHQnOiAnNUZDMycsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQ3ljbG9uZSAxJzogJzVGRDEnLCAvLyBzdGFuZGluZyBvbiB0aGUgYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEN5Y2xvbmUgMic6ICc1RkQyJywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kRXggQWlyc2hpcFxcJ3MgQmFuZSAxJzogJzVGRkUnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gICAgJ0RpYW1vbmRFeCBBaXJzaGlwXFwncyBCYW5lIDInOiAnNUZEMycsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdEaWFtb25kRXggVGFuayBMYXNlcnMnOiAnNUZDOCcsIC8vIGNsZWF2aW5nIHllbGxvdyBsYXNlcnMgb24gdG9wIHR3byBlbm1pdHlcclxuICAgICdEaWFtb25kRXggSG9taW5nIExhc2VyJzogJzVGQzQnLCAvLyBBZGFtYW50ZSBQdXJnZSBzcHJlYWRcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0RpYW1vbmRFeCBGbG9vZCBSYXknOiAnNUZDNycsIC8vIFwibGltaXQgY3V0XCIgY2xlYXZlc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEaWFtb25kRXggVmVydGljYWwgQ2xlYXZlIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1RkQwJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBEaWFtb25kIFdlYXBvbiBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNsb3VkRGVjayxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBBcnRzJzogJzVGRTMnLCAvLyBBdXJpIEFydHMgZGFzaGVzXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBJbml0aWFsJzogJzVGRTEnLCAvLyBpbml0aWFsIGNpcmNsZSBvZiBEaWFtb25kIFNocmFwbmVsXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBDaGFzaW5nJzogJzVGRTInLCAvLyBmb2xsb3d1cCBjaXJjbGVzIGZyb20gRGlhbW9uZCBTaHJhcG5lbFxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEFldGhlcmlhbCBCdWxsZXQnOiAnNUZENScsIC8vIGJpdCBsYXNlcnNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEaWFtb25kIFdlYXBvbiBDbGF3IFN3aXBlIExlZnQnOiAnNUZEOScsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQ2xhdyBTd2lwZSBSaWdodCc6ICc1RkRBJywgLy8gQWRhbWFudCBQdXJnZSBwbGF0Zm9ybSBjbGVhdmVcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMSc6ICc1RkU2JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMic6ICc1RkU3JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBaXJzaGlwXFwncyBCYW5lIDEnOiAnNUZFOCcsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQWlyc2hpcFxcJ3MgQmFuZSAyJzogJzVGRkUnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gSG9taW5nIExhc2VyJzogJzVGREInLCAvLyBzcHJlYWQgbWFya2Vyc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEaWFtb25kIFdlYXBvbiBWZXJ0aWNhbCBDbGVhdmUgS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzVGRTUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2FzdHJ1bU1hcmludW1FeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFbWVyYWxkRXggSGVhdCBSYXknOiAnNUJEMycsIC8vIEVtZXJhbGQgQmVhbSBpbml0aWFsIGNvbmFsXHJcbiAgICAnRW1lcmFsZEV4IFBob3RvbiBMYXNlciAxJzogJzU1N0InLCAvLyBFbWVyYWxkIEJlYW0gaW5zaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGRFeCBQaG90b24gTGFzZXIgMic6ICc1NTdEJywgLy8gRW1lcmFsZCBCZWFtIG91dHNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZEV4IEhlYXQgUmF5IDEnOiAnNTU3QScsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZEV4IEhlYXQgUmF5IDInOiAnNTU3OScsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZEV4IEV4cGxvc2lvbic6ICc1NTk2JywgLy8gTWFnaXRlayBNaW5lIGV4cGxvc2lvblxyXG4gICAgJ0VtZXJhbGRFeCBUZXJ0aXVzIFRlcm1pbnVzIEVzdCBJbml0aWFsJzogJzU1Q0QnLCAvLyBzd29yZCBpbml0aWFsIHB1ZGRsZXNcclxuICAgICdFbWVyYWxkRXggVGVydGl1cyBUZXJtaW51cyBFc3QgRXhwbG9zaW9uJzogJzU1Q0UnLCAvLyBzd29yZCBleHBsb3Npb25zXHJcbiAgICAnRW1lcmFsZEV4IEFpcmJvcm5lIEV4cGxvc2lvbic6ICc1NUJEJywgLy8gZXhhZmxhcmVcclxuICAgICdFbWVyYWxkRXggU2lkZXNjYXRoZSAxJzogJzU1RDQnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGRFeCBTaWRlc2NhdGhlIDInOiAnNTVENScsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZEV4IFNob3RzIEZpcmVkJzogJzU1QjcnLCAvLyByYW5rIGFuZCBmaWxlIHNvbGRpZXJzXHJcbiAgICAnRW1lcmFsZEV4IFNlY3VuZHVzIFRlcm1pbnVzIEVzdCc6ICc1NUNCJywgLy8gZHJvcHBlZCArIGFuZCB4IGhlYWRtYXJrZXJzXHJcbiAgICAnRW1lcmFsZEV4IEV4cGlyZSc6ICc1NUQxJywgLy8gZ3JvdW5kIGFvZSBvbiBib3NzIFwiZ2V0IG91dFwiXHJcbiAgICAnRW1lcmFsZEV4IEFpcmUgVGFtIFN0b3JtJzogJzU1RDAnLCAvLyBleHBhbmRpbmcgcmVkIGFuZCBibGFjayBncm91bmQgYW9lXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFbWVyYWxkRXggRGl2aWRlIEV0IEltcGVyYSc6ICc1NUQ5JywgLy8gbm9uLXRhbmsgcHJvdGVhbiBzcHJlYWRcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAxJzogJzU1QzQnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAyJzogJzU1QzUnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAzJzogJzU1QzYnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCA0JzogJzU1QzcnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2FzdHJ1bU1hcmludW0sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEhlYXQgUmF5JzogJzRGOUQnLCAvLyBFbWVyYWxkIEJlYW0gaW5pdGlhbCBjb25hbFxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAxJzogJzU1MzQnLCAvLyBFbWVyYWxkIEJlYW0gaW5zaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAyJzogJzU1MzYnLCAvLyBFbWVyYWxkIEJlYW0gbWlkZGxlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAzJzogJzU1MzgnLCAvLyBFbWVyYWxkIEJlYW0gb3V0c2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBIZWF0IFJheSAxJzogJzU1MzInLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEhlYXQgUmF5IDInOiAnNTUzMycsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gTWFnbmV0aWMgTWluZSBFeHBsb3Npb24nOiAnNUIwNCcsIC8vIHJlcHVsc2luZyBtaW5lIGV4cGxvc2lvbnNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDEnOiAnNTUzRicsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSAyJzogJzU1NDAnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgMyc6ICc1NTQxJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDQnOiAnNTU0MicsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gQml0IFN0b3JtJzogJzU1NEEnLCAvLyBcImdldCBpblwiXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRW1lcmFsZCBDcnVzaGVyJzogJzU1M0MnLCAvLyBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUHVsc2UgTGFzZXInOiAnNTU0OCcsIC8vIGxpbmUgYW9lXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRW5lcmd5IEFldGhlcm9wbGFzbSc6ICc1NTUxJywgLy8gaGl0dGluZyBhIGdsb3d5IG9yYlxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIERpdmlkZSBFdCBJbXBlcmEgR3JvdW5kJzogJzU1NkYnLCAvLyBwYXJ0eSB0YXJnZXRlZCBncm91bmQgY29uZXNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQcmltdXMgVGVybWludXMgRXN0JzogJzRCM0UnLCAvLyBncm91bmQgY2lyY2xlIGR1cmluZyBhcnJvdyBoZWFkbWFya2Vyc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNlY3VuZHVzIFRlcm1pbnVzIEVzdCc6ICc1NTZBJywgLy8gWCAvICsgaGVhZG1hcmtlcnNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBUZXJ0aXVzIFRlcm1pbnVzIEVzdCc6ICc1NTZEJywgLy8gdHJpcGxlIHN3b3Jkc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNob3RzIEZpcmVkJzogJzU1NUYnLCAvLyBsaW5lIGFvZXMgZnJvbSBzb2xkaWVyc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRGl2aWRlIEV0IEltcGVyYSBQMSc6ICc1NTRFJywgLy8gdGFua2J1c3RlciwgcHJvYmFibHkgY2xlYXZlcywgcGhhc2UgMVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIERpdmlkZSBFdCBJbXBlcmEgUDInOiAnNTU3MCcsIC8vIHRhbmtidXN0ZXIsIHByb2JhYmx5IGNsZWF2ZXMsIHBoYXNlIDJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRW1lcmFsZCBXZWFwb24gRW1lcmFsZCBDcnVzaGVyIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1NTNFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gR2V0dGluZyBrbm9ja2VkIGludG8gYSB3YWxsIGZyb20gdGhlIGFycm93IGhlYWRtYXJrZXIuXHJcbiAgICAgIGlkOiAnRW1lcmFsZCBXZWFwb24gUHJpbXVzIFRlcm1pbnVzIEVzdCBXYWxsJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTU2MycsICc1NTY0J10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIGludG8gd2FsbCcsXHJcbiAgICAgICAgICAgIGRlOiAnUsO8Y2tzdG/DnyBpbiBkaWUgV2FuZCcsXHJcbiAgICAgICAgICAgIGphOiAn5aOB44G444OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDoh7PlopknLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNEYXJrPzogc3RyaW5nW107XHJcbiAgaGFzQmV5b25kRGVhdGg/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgaGFzRG9vbT86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuLy8gSGFkZXMgRXhcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU1pbnN0cmVsc0JhbGxhZEhhZGVzc0VsZWd5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTcHJlYWQgMic6ICc0N0FBJyxcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTcHJlYWQgMyc6ICc0N0U0JyxcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTcHJlYWQgNCc6ICc0N0U1JyxcclxuICAgIC8vIEV2ZXJ5Ym9keSBzdGFja3MgaW4gZ29vZCBmYWl0aCBmb3IgQmFkIEZhaXRoLCBzbyBkb24ndCBjYWxsIGl0IGEgbWlzdGFrZS5cclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCAxJzogJzQ3QUQnLFxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDInOiAnNDdCMCcsXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggMyc6ICc0N0FFJyxcclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCA0JzogJzQ3QUYnLFxyXG4gICAgJ0hhZGVzRXggQnJva2VuIEZhaXRoJzogJzQ3QjInLFxyXG4gICAgJ0hhZGVzRXggTWFnaWMgU3BlYXInOiAnNDdCNicsXHJcbiAgICAnSGFkZXNFeCBNYWdpYyBDaGFrcmFtJzogJzQ3QjUnLFxyXG4gICAgJ0hhZGVzRXggRm9ya2VkIExpZ2h0bmluZyc6ICc0N0M5JyxcclxuICAgICdIYWRlc0V4IERhcmsgQ3VycmVudCAxJzogJzQ3RjEnLFxyXG4gICAgJ0hhZGVzRXggRGFyayBDdXJyZW50IDInOiAnNDdGMicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnSGFkZXNFeCBDb21ldCc6ICc0N0I5JywgLy8gbWlzc2VkIHRvd2VyXHJcbiAgICAnSGFkZXNFeCBBbmNpZW50IEVydXB0aW9uJzogJzQ3RDMnLFxyXG4gICAgJ0hhZGVzRXggUHVyZ2F0aW9uIDEnOiAnNDdFQycsXHJcbiAgICAnSGFkZXNFeCBQdXJnYXRpb24gMic6ICc0N0VEJyxcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTdHJlYW0nOiAnNDdFQScsXHJcbiAgICAnSGFkZXNFeCBEZWFkIFNwYWNlJzogJzQ3RUUnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3ByZWFkIEluaXRpYWwnOiAnNDdBOScsXHJcbiAgICAnSGFkZXNFeCBSYXZlbm91cyBBc3NhdWx0JzogJyg/OjQ3QTZ8NDdBNyknLFxyXG4gICAgJ0hhZGVzRXggRGFyayBGbGFtZSAxJzogJzQ3QzYnLFxyXG4gICAgJ0hhZGVzRXggRGFyayBGcmVlemUgMSc6ICc0N0M0JyxcclxuICAgICdIYWRlc0V4IERhcmsgRnJlZXplIDInOiAnNDdERicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRGFyayBJSSBUZXRoZXInLFxyXG4gICAgICB0eXBlOiAnVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnU2hhZG93IG9mIHRoZSBBbmNpZW50cycsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0RhcmsgPz89IFtdO1xyXG4gICAgICAgIGRhdGEuaGFzRGFyay5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEYXJrIElJJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHR5cGU6ICcyMicsIGlkOiAnNDdCQScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gRG9uJ3QgYmxhbWUgcGVvcGxlIHdobyBkb24ndCBoYXZlIHRldGhlcnMuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuaGFzRGFyayAmJiBkYXRhLmhhc0RhcmsuaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQm9zcyBUZXRoZXInLFxyXG4gICAgICB0eXBlOiAnVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiBbJ0lnZXlvcmhtXFwncyBTaGFkZScsICdMYWhhYnJlYVxcJ3MgU2hhZGUnXSwgaWQ6ICcwMDBFJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG1pc3Rha2U6IHtcclxuICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgZW46ICdCb3NzZXMgVG9vIENsb3NlJyxcclxuICAgICAgICAgIGRlOiAnQm9zc2VzIHp1IE5haGUnLFxyXG4gICAgICAgICAgZnI6ICdCb3NzIHRyb3AgcHJvY2hlcycsXHJcbiAgICAgICAgICBqYTogJ+ODnOOCuei/keOBmeOBjuOCiycsXHJcbiAgICAgICAgICBjbjogJ0JPU1PpnaDlpKrov5HkuoYnLFxyXG4gICAgICAgICAga286ICfsq4Trk6TsnbQg64SI66y0IOqwgOq5jOybgCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEZWF0aCBTaHJpZWsnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0N0NCJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQmV5b25kIERlYXRoIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQmV5b25kIERlYXRoJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGgpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20gR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc2RTknIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEb29tIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNkU5JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNkU5JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNEb29tKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSGFkZXMgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEeWluZ0dhc3AsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hhZGVzIEJhZCBGYWl0aCAxJzogJzQxNEInLFxyXG4gICAgJ0hhZGVzIEJhZCBGYWl0aCAyJzogJzQxNEMnLFxyXG4gICAgJ0hhZGVzIERhcmsgRXJ1cHRpb24nOiAnNDE1MicsXHJcbiAgICAnSGFkZXMgU2hhZG93IFNwcmVhZCAxJzogJzQxNTYnLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTcHJlYWQgMic6ICc0MTU3JyxcclxuICAgICdIYWRlcyBCcm9rZW4gRmFpdGgnOiAnNDE0RScsXHJcbiAgICAnSGFkZXMgSGVsbGJvcm4gWWF3cCc6ICc0MTZGJyxcclxuICAgICdIYWRlcyBQdXJnYXRpb24nOiAnNDE3MicsXHJcbiAgICAnSGFkZXMgU2hhZG93IFN0cmVhbSc6ICc0MTVDJyxcclxuICAgICdIYWRlcyBBZXJvJzogJzQ1OTUnLFxyXG4gICAgJ0hhZGVzIEVjaG8gMSc6ICc0MTYzJyxcclxuICAgICdIYWRlcyBFY2hvIDInOiAnNDE2NCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdIYWRlcyBOZXRoZXIgQmxhc3QnOiAnNDE2MycsXHJcbiAgICAnSGFkZXMgUmF2ZW5vdXMgQXNzYXVsdCc6ICc0MTU4JyxcclxuICAgICdIYWRlcyBBbmNpZW50IERhcmtuZXNzJzogJzQ1OTMnLFxyXG4gICAgJ0hhZGVzIER1YWwgU3RyaWtlJzogJzQxNjInLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBJbm5vY2VuY2UgRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ3Jvd25PZlRoZUltbWFjdWxhdGVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdJbm5vRXggRHVlbCBEZXNjZW50JzogJzNFRDInLFxyXG4gICAgJ0lubm9FeCBSZXByb2JhdGlvbiAxJzogJzNFRTAnLFxyXG4gICAgJ0lubm9FeCBSZXByb2JhdGlvbiAyJzogJzNFQ0MnLFxyXG4gICAgJ0lubm9FeCBTd29yZCBvZiBDb25kZW1uYXRpb24gMSc6ICczRURFJyxcclxuICAgICdJbm5vRXggU3dvcmQgb2YgQ29uZGVtbmF0aW9uIDInOiAnM0VERicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDEnOiAnM0VEMycsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDInOiAnM0VENCcsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDMnOiAnM0VENScsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDQnOiAnM0VENicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDUnOiAnM0VGQicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDYnOiAnM0VGQycsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDcnOiAnM0VGRCcsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDgnOiAnM0VGRScsXHJcbiAgICAnSW5ub0V4IEhvbHkgVHJpbml0eSc6ICczRURCJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSAxJzogJzNFRDcnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDInOiAnM0VEOCcsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgMyc6ICczRUQ5JyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA0JzogJzNFREEnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDUnOiAnM0VGRicsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNic6ICczRjAwJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA3JzogJzNGMDEnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDgnOiAnM0YwMicsXHJcbiAgICAnSW5ub0V4IEdvZCBSYXkgMSc6ICczRUU2JyxcclxuICAgICdJbm5vRXggR29kIFJheSAyJzogJzNFRTcnLFxyXG4gICAgJ0lubm9FeCBHb2QgUmF5IDMnOiAnM0VFOCcsXHJcbiAgICAnSW5ub0V4IEV4cGxvc2lvbic6ICczRUYwJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSW5ub2NlbmNlIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ3Jvd25PZlRoZUltbWFjdWxhdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lubm8gRGF5YnJlYWsnOiAnM0U5RCcsXHJcbiAgICAnSW5ubyBIb2x5IFRyaW5pdHknOiAnM0VCMycsXHJcblxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gMSc6ICczRUI2JyxcclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDInOiAnM0VCOCcsXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiAzJzogJzNFQ0InLFxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gNCc6ICczRUI3JyxcclxuXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDEnOiAnM0VCMScsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDInOiAnM0VCMicsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDMnOiAnM0VGOScsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDQnOiAnM0VGQScsXHJcblxyXG4gICAgJ0lubm8gR29kIFJheSAxJzogJzNFQkQnLFxyXG4gICAgJ0lubm8gR29kIFJheSAyJzogJzNFQkUnLFxyXG4gICAgJ0lubm8gR29kIFJheSAzJzogJzNFQkYnLFxyXG4gICAgJ0lubm8gR29kIFJheSA0JzogJzNFQzAnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIEl0J3MgaGFyZCB0byBjYXB0dXJlIHRoZSByZWZsZWN0aW9uIGFiaWxpdGllcyBmcm9tIExldmlhdGhhbidzIEhlYWQgYW5kIFRhaWwgaWYgeW91IHVzZVxyXG4vLyByYW5nZWQgcGh5c2ljYWwgYXR0YWNrcyAvIG1hZ2ljIGF0dGFja3MgcmVzcGVjdGl2ZWx5LCBhcyB0aGUgYWJpbGl0eSBuYW1lcyBhcmUgdGhlXHJcbi8vIGFiaWxpdHkgeW91IHVzZWQgYW5kIGRvbid0IGFwcGVhciB0byBzaG93IHVwIGluIHRoZSBsb2cgYXMgbm9ybWFsIFwiYWJpbGl0eVwiIGxpbmVzLlxyXG4vLyBUaGF0IHNhaWQsIGRvdHMgc3RpbGwgdGljayBpbmRlcGVuZGVudGx5IG9uIGJvdGggc28gaXQncyBsaWtlbHkgdGhhdCBwZW9wbGUgd2lsbCBhdGFja1xyXG4vLyB0aGVtIGFueXdheS5cclxuXHJcbi8vIFRPRE86IEZpZ3VyZSBvdXQgd2h5IERyZWFkIFRpZGUgLyBXYXRlcnNwb3V0IGFwcGVhciBsaWtlIHNoYXJlcyAoaS5lLiAweDE2IGlkKS5cclxuLy8gRHJlYWQgVGlkZSA9IDVDQ0EvNUNDQi81Q0NDLCBXYXRlcnNwb3V0ID0gNUNEMVxyXG5cclxuLy8gTGV2aWF0aGFuIFVucmVhbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlV2hvcmxlYXRlclVucmVhbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTGV2aVVuIEdyYW5kIEZhbGwnOiAnNUNERicsIC8vIHZlcnkgbGFyZ2UgY2lyY3VsYXIgYW9lIGJlZm9yZSBzcGlubnkgZGl2ZXMsIGFwcGxpZXMgaGVhdnlcclxuICAgICdMZXZpVW4gSHlkcm9zaG90JzogJzVDRDUnLCAvLyBXYXZlc3BpbmUgU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBEcm9wc3kgZWZmZWN0XHJcbiAgICAnTGV2aVVuIERyZWFkc3Rvcm0nOiAnNUNENicsIC8vIFdhdmV0b290aCBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIEh5c3RlcmlhIGVmZmVjdFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0xldmlVbiBCb2R5IFNsYW0nOiAnNUNEMicsIC8vIGxldmkgc2xhbSB0aGF0IHRpbHRzIHRoZSBib2F0XHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgMSc6ICc1Q0RCJywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDInOiAnNUNFMycsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpVW4gU3Bpbm5pbmcgRGl2ZSAzJzogJzVDRTgnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgNCc6ICc1Q0U5JywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnTGV2aVVuIERyb3BzeSc6ICcxMTAnLCAvLyBzdGFuZGluZyBpbiB0aGUgaHlkcm8gc2hvdCBmcm9tIHRoZSBXYXZlc3BpbmUgU2FoYWdpblxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnTGV2aVVuIEh5c3RlcmlhJzogJzEyOCcsIC8vIHN0YW5kaW5nIGluIHRoZSBkcmVhZHN0b3JtIGZyb20gdGhlIFdhdmV0b290aCBTYWhhZ2luXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0xldmlVbiBCb2R5IFNsYW0gS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzVDRDInIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IHRha2luZyB0d28gZGlmZmVyZW50IEhpZ2gtUG93ZXJlZCBIb21pbmcgTGFzZXJzICg0QUQ4KVxyXG4vLyBUT0RPOiBjb3VsZCBibGFtZSB0aGUgdGV0aGVyZWQgcGxheWVyIGZvciBXaGl0ZSBBZ29ueSAvIFdoaXRlIEZ1cnkgZmFpbHVyZXM/XHJcblxyXG4vLyBSdWJ5IFdlYXBvbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DaW5kZXJEcmlmdEV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1J1YnlFeCBSdWJ5IEJpdCBNYWdpdGVrIFJheSc6ICc0QUQyJywgLy8gbGluZSBhb2VzIGR1cmluZyBoZWxpY29jbGF3XHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDEnOiAnNEFEMycsIC8vIGluaXRpYWwgZXhwbG9zaW9uIGR1cmluZyBoZWxpY29jbGF3XHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDInOiAnNEIyRicsIC8vIGZvbGxvd3VwIGhlbGljb2NsYXcgZXhwbG9zaW9uc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSAzJzogJzREMDQnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDQnOiAnNEQwNScsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgNSc6ICc0QUNEJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSA2JzogJzRBQ0UnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFVuZGVybWluZSc6ICc0QUQwJywgLy8gZ3JvdW5kIGFvZXMgdW5kZXIgdGhlIHJhdmVuc2NsYXcgcGF0Y2hlc1xyXG4gICAgJ1J1YnlFeCBSdWJ5IFJheSc6ICc0QjAyJywgLy8gZnJvbnRhbCBsYXNlclxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMSc6ICc0QUQ5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyJzogJzRBREEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDMnOiAnNEFERCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNCc6ICc0QURFJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA1JzogJzRBREYnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDYnOiAnNEFFMCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNyc6ICc0QUUxJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA4JzogJzRBRTInLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDknOiAnNEFFMycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTAnOiAnNEFFNCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTEnOiAnNEFFNScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTInOiAnNEFFNicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTMnOiAnNEFFNycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTQnOiAnNEFFOCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTUnOiAnNEFFOScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTYnOiAnNEFFQScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTcnOiAnNEU2QicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTgnOiAnNEU2QycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTknOiAnNEU2RCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjAnOiAnNEU2RScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjEnOiAnNEU2RicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjInOiAnNEU3MCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biAxJzogJzRCMDUnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDInOiAnNEIwNicsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gMyc6ICc0QjA3JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biA0JzogJzRCMDgnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDUnOiAnNERPRCcsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggTWV0ZW9yIEJ1cnN0JzogJzRBRjInLCAvLyBtZXRlb3IgZXhwbG9kaW5nXHJcbiAgICAnUnVieUV4IEJyYWRhbWFudGUnOiAnNEUzOCcsIC8vIGhlYWRtYXJrZXJzIHdpdGggbGluZSBhb2VzXHJcbiAgICAnUnVieUV4IENvbWV0IEhlYXZ5IEltcGFjdCc6ICc0QUY2JywgLy8gbGV0dGluZyBhIHRhbmsgY29tZXQgbGFuZFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1J1YnlFeCBSdWJ5IFNwaGVyZSBCdXJzdCc6ICc0QUNCJywgLy8gZXhwbG9kaW5nIHRoZSByZWQgbWluZVxyXG4gICAgJ1J1YnlFeCBMdW5hciBEeW5hbW8nOiAnNEVCMCcsIC8vIFwiZ2V0IGluXCIgZnJvbSBSYXZlbidzIEltYWdlXHJcbiAgICAnUnVieUV4IElyb24gQ2hhcmlvdCc6ICc0RUIxJywgLy8gXCJnZXQgb3V0XCIgZnJvbSBSYXZlbidzIEltYWdlXHJcbiAgICAnUnVieUV4IEhlYXJ0IEluIFRoZSBNYWNoaW5lJzogJzRBRkEnLCAvLyBXaGl0ZSBBZ29ueS9GdXJ5IHNrdWxsIGhpdHRpbmcgcGxheWVyc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnUnVieUV4IEh5c3RlcmlhJzogJzEyOCcsIC8vIE5lZ2F0aXZlIEF1cmEgbG9va2F3YXkgZmFpbHVyZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUnVieUV4IEhvbWluZyBMYXNlcnMnOiAnNEFENicsIC8vIHNwcmVhZCBtYXJrZXJzIGR1cmluZyBjdXQgYW5kIHJ1blxyXG4gICAgJ1J1YnlFeCBNZXRlb3IgU3RyZWFtJzogJzRFNjgnLCAvLyBzcHJlYWQgbWFya2VycyBkdXJpbmcgUDJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnUnVieUV4IFNjcmVlY2gnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRBRUUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgaW50byB3YWxsJyxcclxuICAgICAgICAgICAgZGU6ICdSw7xja3N0b8OfIGluIGRpZSBXYW5kJyxcclxuICAgICAgICAgICAgamE6ICflo4Hjgbjjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOiHs+WimScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFJ1YnkgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DaW5kZXJEcmlmdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUnVieSBSYXZlbnNjbGF3JzogJzRBOTMnLCAvLyBjZW50ZXJlZCBjaXJjbGUgYW9lIGZvciByYXZlbnNjbGF3XHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSAxJzogJzRBOUEnLCAvLyBpbml0aWFsIGV4cGxvc2lvbiBkdXJpbmcgaGVsaWNvY2xhd1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMic6ICc0QjJFJywgLy8gZm9sbG93dXAgaGVsaWNvY2xhdyBleHBsb3Npb25zXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSAzJzogJzRBOTQnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA0JzogJzRBOTUnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA1JzogJzREMDInLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA2JzogJzREMDMnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBSdWJ5IFJheSc6ICc0QUM2JywgLy8gZnJvbnRhbCBsYXNlclxyXG4gICAgJ1J1YnkgVW5kZXJtaW5lJzogJzRBOTcnLCAvLyBncm91bmQgYW9lcyB1bmRlciB0aGUgcmF2ZW5zY2xhdyBwYXRjaGVzXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMSc6ICc0RTY5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMic6ICc0RTZBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMyc6ICc0QUExJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNCc6ICc0QUEyJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNSc6ICc0QUEzJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNic6ICc0QUE0JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNyc6ICc0QUE1JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgOCc6ICc0QUE2JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgOSc6ICc0QUE3JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMTAnOiAnNEMyMScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDExJzogJzRDMkEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IENvbWV0IEJ1cnN0JzogJzRBQjQnLCAvLyBtZXRlb3IgZXhwbG9kaW5nXHJcbiAgICAnUnVieSBCcmFkYW1hbnRlJzogJzRBQkMnLCAvLyBoZWFkbWFya2VycyB3aXRoIGxpbmUgYW9lc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUnVieSBIb21pbmcgTGFzZXInOiAnNEFDNScsIC8vIHNwcmVhZCBtYXJrZXJzIGluIFAxXHJcbiAgICAnUnVieSBNZXRlb3IgU3RyZWFtJzogJzRFNjcnLCAvLyBzcHJlYWQgbWFya2VycyBpbiBQMlxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFNoaXZhIFVucmVhbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZVVucmVhbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBMYXJnZSB3aGl0ZSBjaXJjbGVzLlxyXG4gICAgJ1NoaXZhRXggSWNpY2xlIEltcGFjdCc6ICc1MzdCJyxcclxuICAgIC8vIFwiZ2V0IGluXCIgYW9lXHJcbiAgICAnU2hpdmFFeCBXaGl0ZW91dCc6ICc1Mzc2JyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFFeCBHbGFjaWVyIEJhc2gnOiAnNTM3NScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyAyNzAgZGVncmVlIGF0dGFjay5cclxuICAgICdTaGl2YUV4IEdsYXNzIERhbmNlJzogJzUzNzgnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUV4IEhhaWxzdG9ybSc6ICc1MzZGJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gTGFzZXIuICBUT0RPOiBtYXliZSBibGFtZSB0aGUgcGVyc29uIGl0J3Mgb24/P1xyXG4gICAgJ1NoaXZhRXggQXZhbGFuY2hlJzogJzUzNzknLFxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFBhcnR5IHNoYXJlZCB0YW5rIGJ1c3Rlci5cclxuICAgICdTaGl2YUV4IEljZWJyYW5kJzogJzUzNzMnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGl2YUV4IERlZXAgRnJlZXplJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gU2hpdmEgYWxzbyB1c2VzIGFiaWxpdHkgNTM3QSBvbiB5b3UsIGJ1dCBpdCBoYXMgYW4gdW5rbm93biBuYW1lLlxyXG4gICAgICAvLyBTbywgdXNlIHRoZSBlZmZlY3QgaW5zdGVhZCBmb3IgZnJlZSB0cmFuc2xhdGlvbi5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFFNycgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVGhlIGludGVybWlzc2lvbiBhbHNvIGdldHMgdGhpcyBlZmZlY3QsIGJ1dCBmb3IgYSBzaG9ydGVyIGR1cmF0aW9uLlxyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pID4gMjA7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZURhbmNpbmdQbGFndWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuaWEgV29vZFxcJ3MgRW1icmFjZSc6ICczRDUwJyxcclxuICAgIC8vICdUaXRhbmlhIEZyb3N0IFJ1bmUnOiAnM0Q0RScsXHJcbiAgICAnVGl0YW5pYSBHZW50bGUgQnJlZXplJzogJzNGODMnLFxyXG4gICAgJ1RpdGFuaWEgTGVhZnN0b3JtIDEnOiAnM0Q1NScsXHJcbiAgICAnVGl0YW5pYSBQdWNrXFwncyBSZWJ1a2UnOiAnM0Q1OCcsXHJcbiAgICAnVGl0YW5pYSBMZWFmc3Rvcm0gMic6ICczRTAzJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbmlhIFBoYW50b20gUnVuZSAxJzogJzNENUQnLFxyXG4gICAgJ1RpdGFuaWEgUGhhbnRvbSBSdW5lIDInOiAnM0Q1RScsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhbmlhIERpdmluYXRpb24gUnVuZSc6ICczRDVCJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZURhbmNpbmdQbGFndWVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbmlhRXggV29vZFxcJ3MgRW1icmFjZSc6ICczRDJGJyxcclxuICAgIC8vICdUaXRhbmlhRXggRnJvc3QgUnVuZSc6ICczRDJCJyxcclxuICAgICdUaXRhbmlhRXggR2VudGxlIEJyZWV6ZSc6ICczRjgyJyxcclxuICAgICdUaXRhbmlhRXggTGVhZnN0b3JtIDEnOiAnM0QzOScsXHJcbiAgICAnVGl0YW5pYUV4IFB1Y2tcXCdzIFJlYnVrZSc6ICczRDQzJyxcclxuICAgICdUaXRhbmlhRXggV2FsbG9wJzogJzNEM0InLFxyXG4gICAgJ1RpdGFuaWFFeCBMZWFmc3Rvcm0gMic6ICczRDQ5JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbmlhRXggUGhhbnRvbSBSdW5lIDEnOiAnM0Q0QycsXHJcbiAgICAnVGl0YW5pYUV4IFBoYW50b20gUnVuZSAyJzogJzNENEQnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBUT0RPOiBUaGlzIGNvdWxkIG1heWJlIGJsYW1lIHRoZSBwZXJzb24gd2l0aCB0aGUgdGV0aGVyP1xyXG4gICAgJ1RpdGFuaWFFeCBUaHVuZGVyIFJ1bmUnOiAnM0QyOScsXHJcbiAgICAnVGl0YW5pYUV4IERpdmluYXRpb24gUnVuZSc6ICczRDRBJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVGl0YW4gVW5yZWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbFVucmVhbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5VbiBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNThGRScsXHJcbiAgICAnVGl0YW5VbiBCdXJzdCc6ICc1QURGJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhblVuIExhbmRzbGlkZSc6ICc1QURDJyxcclxuICAgICdUaXRhblVuIEdhb2xlciBMYW5kc2xpZGUnOiAnNTkwMicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhblVuIFJvY2sgQnVzdGVyJzogJzU4RjYnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVGl0YW5VbiBNb3VudGFpbiBCdXN0ZXInOiAnNThGNycsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1lbW9yaWFNaXNlcmFFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDEnOiAnNENEMicsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCAyJzogJzRDRDMnLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgMyc6ICc0Q0Q0JyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDQnOiAnNENENScsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCA1JzogJzRDRDYnLFxyXG4gICAgJ1ZhcmlzRXggSWduaXMgRXN0IDEnOiAnNENCNScsXHJcbiAgICAnVmFyaXNFeCBJZ25pcyBFc3QgMic6ICc0Q0M1JyxcclxuICAgICdWYXJpc0V4IFZlbnR1cyBFc3QgMSc6ICc0Q0M3JyxcclxuICAgICdWYXJpc0V4IFZlbnR1cyBFc3QgMic6ICc0Q0M4JyxcclxuICAgICdWYXJpc0V4IEFzc2F1bHQgQ2Fubm9uJzogJzRDRTUnLFxyXG4gICAgJ1ZhcmlzRXggRm9ydGl1cyBSb3RhdGluZyc6ICc0Q0U5JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIERvbid0IGhpdCB0aGUgc2hpZWxkcyFcclxuICAgICdWYXJpc0V4IFJlcGF5JzogJzRDREQnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBUaGlzIGlzIHRoZSBcInByb3RlYW5cIiBmb3J0aXVzLlxyXG4gICAgJ1ZhcmlzRXggRm9ydGl1cyBQcm90ZWFuJzogJzRDRTcnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVmFyaXNFeCBNYWdpdGVrIEJ1cnN0JzogJzRDREYnLFxyXG4gICAgJ1ZhcmlzRXggQWV0aGVyb2NoZW1pY2FsIEdyZW5hZG8nOiAnNENFRCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1ZhcmlzRXggVGVybWludXMgRXN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNENCNCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IFJhZGlhbnQgQnJhdmVyIGlzIDRGMTYvNEYxNyh4MiksIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgRGVzcGVyYWRvIGlzIDRGMTgvNEYxOSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBNZXRlb3IgaXMgNEYxQSwgYW5kIHNob3VsZG4ndCBnZXQgaGl0IGJ5IG1vcmUgdGhhbiAxP1xyXG4vLyBUT0RPOiBtaXNzaW5nIGEgdG93ZXI/XHJcblxyXG4vLyBOb3RlOiBEZWxpYmVyYXRlbHkgbm90IGluY2x1ZGluZyBweXJldGljIGRhbWFnZSBhcyBhbiBlcnJvci5cclxuLy8gTm90ZTogSXQgZG9lc24ndCBhcHBlYXIgdGhhdCB0aGVyZSdzIGFueSB3YXkgdG8gdGVsbCB3aG8gZmFpbGVkIHRoZSBjdXRzY2VuZS5cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVTZWF0T2ZTYWNyaWZpY2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dPTCBTb2xlbW4gQ29uZml0ZW9yJzogJzRGMkEnLCAvLyBncm91bmQgcHVkZGxlc1xyXG4gICAgJ1dPTCBDb3J1c2NhbnQgU2FiZXIgSW4nOiAnNEYxMCcsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MIENvcnVzY2FudCBTYWJlciBPdXQnOiAnNEYxMScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTCBJbWJ1ZWQgQ29ydXNhbmNlIE91dCc6ICc0RjRCJywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MIEltYnVlZCBDb3J1c2FuY2UgSW4nOiAnNEY0QycsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MIFNoaW5pbmcgV2F2ZSc6ICc0RjI2JywgLy8gc3dvcmQgdHJpYW5nbGVcclxuICAgICdXT0wgQ2F1dGVyaXplJzogJzRGMjUnLFxyXG4gICAgJ1dPTCBCcmltc3RvbmUgRWFydGggMSc6ICc0RjFFJywgLy8gY29ybmVyIGdyb3dpbmcgY2lyY2xlcywgaW5pdGlhbFxyXG4gICAgJ1dPTCBCcmltc3RvbmUgRWFydGggMic6ICc0RjFGJywgLy8gY29ybmVyIGdyb3dpbmcgY2lyY2xlcywgZ3Jvd2luZ1xyXG4gICAgJ1dPTCBGbGFyZSBCcmVhdGgnOiAnNEYyNCcsXHJcbiAgICAnV09MIERlY2ltYXRpb24nOiAnNEYyMycsXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdXT0wgRGVlcCBGcmVlemUnOiAnNEU2JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MIFRydWUgV2Fsa2luZyBEZWFkJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzM4RScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBuYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogUmFkaWFudCBCcmF2ZXIgaXMgNEVGNy80RUY4KHgyKSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBEZXNwZXJhZG8gaXMgNEVGOS80RUZBLCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IE1ldGVvciBpcyA0RUZDLCBhbmQgc2hvdWxkbid0IGdldCBoaXQgYnkgbW9yZSB0aGFuIDE/XHJcbi8vIFRPRE86IEFic29sdXRlIEhvbHkgc2hvdWxkIGJlIHNoYXJlZD9cclxuLy8gVE9ETzogaW50ZXJzZWN0aW5nIGJyaW1zdG9uZXM/XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlU2VhdE9mU2FjcmlmaWNlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnV09MRXggU29sZW1uIENvbmZpdGVvcic6ICc0RjBDJywgLy8gZ3JvdW5kIHB1ZGRsZXNcclxuICAgICdXT0xFeCBDb3J1c2NhbnQgU2FiZXIgSW4nOiAnNEVGMicsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MRXggQ29ydXNjYW50IFNhYmVyIE91dCc6ICc0RUYxJywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MRXggSW1idWVkIENvcnVzYW5jZSBPdXQnOiAnNEY0OScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTEV4IEltYnVlZCBDb3J1c2FuY2UgSW4nOiAnNEY0QScsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MRXggU2hpbmluZyBXYXZlJzogJzRGMDgnLCAvLyBzd29yZCB0cmlhbmdsZVxyXG4gICAgJ1dPTEV4IENhdXRlcml6ZSc6ICc0RjA3JyxcclxuICAgICdXT0xFeCBCcmltc3RvbmUgRWFydGgnOiAnNEYwMCcsIC8vIGNvcm5lciBncm93aW5nIGNpcmNsZXMsIGdyb3dpbmdcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1dPTEV4IERlZXAgRnJlZXplJzogJzRFNicsIC8vIGZhaWxpbmcgQWJzb2x1dGUgQmxpenphcmQgSUlJXHJcbiAgICAnV09MRXggRGFtYWdlIERvd24nOiAnMjc0JywgLy8gZmFpbGluZyBBYnNvbHV0ZSBGbGFzaFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnV09MRXggQWJzb2x1dGUgU3RvbmUgSUlJJzogJzRFRUInLCAvLyBwcm90ZWFuIHdhdmUgaW1idWVkIG1hZ2ljXHJcbiAgICAnV09MRXggRmxhcmUgQnJlYXRoJzogJzRGMDYnLCAvLyB0ZXRoZXIgZnJvbSBzdW1tb25lZCBiYWhhbXV0c1xyXG4gICAgJ1dPTEV4IFBlcmZlY3QgRGVjaW1hdGlvbic6ICc0RjA1JywgLy8gc21uL3dhciBwaGFzZSBtYXJrZXJcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAnV29sRXggS2F0b24gU2FuIFNoYXJlJzogJzRFRkUnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0xFeCBUcnVlIFdhbGtpbmcgRGVhZCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4RkYnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTEV4IFRvd2VyJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RjA0JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG1pc3Rha2U6IHtcclxuICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgZW46ICdNaXNzZWQgVG93ZXInLFxyXG4gICAgICAgICAgZGU6ICdUdXJtIHZlcnBhc3N0JyxcclxuICAgICAgICAgIGZyOiAnVG91ciBtYW5xdcOpZScsXHJcbiAgICAgICAgICBqYTogJ+WhlOOCkui4j+OBvuOBquOBi+OBo+OBnycsXHJcbiAgICAgICAgICBjbjogJ+ayoei4qeWhlCcsXHJcbiAgICAgICAgICBrbzogJ+yepe2MkCDsi6TsiJgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTEV4IFRydWUgSGFsbG93ZWQgR3JvdW5kJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RjQ0JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEZvciBCZXJzZXJrIGFuZCBEZWVwIERhcmtzaWRlXHJcbiAgICAgIGlkOiAnV09MRXggTWlzc2VkIEludGVycnVwdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzUxNTYnLCAnNTE1OCddIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaGFzVGhyb3R0bGU/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgamFnZFRldGhlcj86IHsgW3NvdXJjZUlkOiBzdHJpbmddOiBzdHJpbmcgfTtcclxufVxyXG5cclxuLy8gVE9ETzogRklYIGx1bWlub3VzIGFldGhlcm9wbGFzbSB3YXJuaW5nIG5vdCB3b3JraW5nXHJcbi8vIFRPRE86IEZJWCBkb2xsIGRlYXRoIG5vdCB3b3JraW5nXHJcbi8vIFRPRE86IGZhaWxpbmcgaGFuZCBvZiBwYWluL3BhcnRpbmcgKGNoZWNrIGZvciBoaWdoIGRhbWFnZT8pXHJcbi8vIFRPRE86IG1ha2Ugc3VyZSBldmVyeWJvZHkgdGFrZXMgZXhhY3RseSBvbmUgcHJvdGVhbiAocmF0aGVyIHRoYW4gd2F0Y2hpbmcgZG91YmxlIGhpdHMpXHJcbi8vIFRPRE86IHRodW5kZXIgbm90IGhpdHRpbmcgZXhhY3RseSAyP1xyXG4vLyBUT0RPOiBwZXJzb24gd2l0aCB3YXRlci90aHVuZGVyIGRlYnVmZiBkeWluZ1xyXG4vLyBUT0RPOiBiYWQgbmlzaSBwYXNzXHJcbi8vIFRPRE86IGZhaWxlZCBnYXZlbCBtZWNoYW5pY1xyXG4vLyBUT0RPOiBkb3VibGUgcm9ja2V0IHB1bmNoIG5vdCBoaXR0aW5nIGV4YWN0bHkgMj8gKG9yIHRhbmtzKVxyXG4vLyBUT0RPOiBzdGFuZGluZyBpbiBzbHVkZ2UgcHVkZGxlcyBiZWZvcmUgaGlkZGVuIG1pbmU/XHJcbi8vIFRPRE86IGhpZGRlbiBtaW5lIGZhaWx1cmU/XHJcbi8vIFRPRE86IGZhaWx1cmVzIG9mIG9yZGFpbmVkIG1vdGlvbiAvIHN0aWxsbmVzc1xyXG4vLyBUT0RPOiBmYWlsdXJlcyBvZiBwbGFpbnQgb2Ygc2V2ZXJpdHkgKHRldGhlcnMpXHJcbi8vIFRPRE86IGZhaWx1cmVzIG9mIHBsYWludCBvZiBzb2xpZGFyaXR5IChzaGFyZWQgc2VudGVuY2UpXHJcbi8vIFRPRE86IG9yZGFpbmVkIGNhcGl0YWwgcHVuaXNobWVudCBoaXR0aW5nIG5vbi10YW5rc1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUVwaWNPZkFsZXhhbmRlclVsdGltYXRlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdURUEgU2x1aWNlJzogJzQ5QjEnLFxyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgMSc6ICc0ODI0JyxcclxuICAgICdURUEgUHJvdGVhbiBXYXZlIDInOiAnNDlCNScsXHJcbiAgICAnVEVBIFNwaW4gQ3J1c2hlcic6ICc0QTcyJyxcclxuICAgICdURUEgU2FjcmFtZW50JzogJzQ4NUYnLFxyXG4gICAgJ1RFQSBSYWRpYW50IFNhY3JhbWVudCc6ICc0ODg2JyxcclxuICAgICdURUEgQWxtaWdodHkgSnVkZ21lbnQnOiAnNDg5MCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVEVBIEhhd2sgQmxhc3Rlcic6ICc0ODMwJyxcclxuICAgICdURUEgQ2hha3JhbSc6ICc0ODU1JyxcclxuICAgICdURUEgRW51bWVyYXRpb24nOiAnNDg1MCcsXHJcbiAgICAnVEVBIEFwb2NhbHlwdGljIFJheSc6ICc0ODRDJyxcclxuICAgICdURUEgUHJvcGVsbGVyIFdpbmQnOiAnNDgzMicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdURUEgUHJvdGVhbiBXYXZlIERvdWJsZSAxJzogJzQ5QjYnLFxyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgRG91YmxlIDInOiAnNDgyNScsXHJcbiAgICAnVEVBIEZsdWlkIFN3aW5nJzogJzQ5QjAnLFxyXG4gICAgJ1RFQSBGbHVpZCBTdHJpa2UnOiAnNDlCNycsXHJcbiAgICAnVEVBIEhpZGRlbiBNaW5lJzogJzQ4NTInLFxyXG4gICAgJ1RFQSBBbHBoYSBTd29yZCc6ICc0ODZCJyxcclxuICAgICdURUEgRmxhcmV0aHJvd2VyJzogJzQ4NkInLFxyXG4gICAgJ1RFQSBDaGFzdGVuaW5nIEhlYXQnOiAnNEE4MCcsXHJcbiAgICAnVEVBIERpdmluZSBTcGVhcic6ICc0QTgyJyxcclxuICAgICdURUEgT3JkYWluZWQgUHVuaXNobWVudCc6ICc0ODkxJyxcclxuICAgIC8vIE9wdGljYWwgU3ByZWFkXHJcbiAgICAnVEVBIEluZGl2aWR1YWwgUmVwcm9iYXRpb24nOiAnNDg4QycsXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgLy8gT3B0aWNhbCBTdGFja1xyXG4gICAgJ1RFQSBDb2xsZWN0aXZlIFJlcHJvYmF0aW9uJzogJzQ4OEQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gXCJ0b28gbXVjaCBsdW1pbm91cyBhZXRoZXJvcGxhc21cIlxyXG4gICAgICAvLyBXaGVuIHRoaXMgaGFwcGVucywgdGhlIHRhcmdldCBleHBsb2RlcywgaGl0dGluZyBuZWFyYnkgcGVvcGxlXHJcbiAgICAgIC8vIGJ1dCBhbHNvIHRoZW1zZWx2ZXMuXHJcbiAgICAgIGlkOiAnVEVBIEV4aGF1c3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0ODFGJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy50YXJnZXQgPT09IG1hdGNoZXMuc291cmNlLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2x1bWlub3VzIGFldGhlcm9wbGFzbScsXHJcbiAgICAgICAgICAgIGRlOiAnTHVtaW5pc3plbnRlcyDDhHRoZXJvcGxhc21hJyxcclxuICAgICAgICAgICAgZnI6ICfDiXRow6lyb3BsYXNtYSBsdW1pbmV1eCcsXHJcbiAgICAgICAgICAgIGphOiAn5YWJ5oCn54iG6Zu3JyxcclxuICAgICAgICAgICAgY246ICflhYnmgKfniIbpm7cnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgRHJvcHN5JyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzEyMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGV0aGVyIFRyYWNraW5nJyxcclxuICAgICAgdHlwZTogJ1RldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0phZ2QgRG9sbCcsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmphZ2RUZXRoZXIgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuamFnZFRldGhlclttYXRjaGVzLnNvdXJjZUlkXSA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgUmVkdWNpYmxlIENvbXBsZXhpdHknLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0ODIxJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAvLyBUaGlzIG1heSBiZSB1bmRlZmluZWQsIHdoaWNoIGlzIGZpbmUuXHJcbiAgICAgICAgICBuYW1lOiBkYXRhLmphZ2RUZXRoZXIgPyBkYXRhLmphZ2RUZXRoZXJbbWF0Y2hlcy5zb3VyY2VJZF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnRG9sbCBEZWF0aCcsXHJcbiAgICAgICAgICAgIGRlOiAnUHVwcGUgVG90JyxcclxuICAgICAgICAgICAgZnI6ICdQb3Vww6llIG1vcnRlJyxcclxuICAgICAgICAgICAgamE6ICfjg4njg7zjg6vjgYzmrbvjgpPjgaAnLFxyXG4gICAgICAgICAgICBjbjogJ+a1ruWjq+W+t+atu+S6oScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBEcmFpbmFnZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ4MjcnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLnBhcnR5LmlzVGFuayhtYXRjaGVzLnRhcmdldCksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFRocm90dGxlJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzJCQycgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzVGhyb3R0bGUpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc1Rocm90dGxlW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gQmFsbG9vbiBQb3BwaW5nLiAgSXQgc2VlbXMgbGlrZSB0aGUgcGVyc29uIHdobyBwb3BzIGl0IGlzIHRoZVxyXG4gICAgICAvLyBmaXJzdCBwZXJzb24gbGlzdGVkIGRhbWFnZS13aXNlLCBzbyB0aGV5IGFyZSBsaWtlbHkgdGhlIGN1bHByaXQuXHJcbiAgICAgIGlkOiAnVEVBIE91dGJ1cnN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDgyQScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5zb3VyY2UgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBmaWxlMCBmcm9tICcuLzAwLW1pc2MvZ2VuZXJhbC50cyc7XG5pbXBvcnQgZmlsZTEgZnJvbSAnLi8wMC1taXNjL3Rlc3QudHMnO1xuaW1wb3J0IGZpbGUyIGZyb20gJy4vMDItYXJyL3RyaWFsL2lmcml0LW5tLnRzJztcbmltcG9ydCBmaWxlMyBmcm9tICcuLzAyLWFyci90cmlhbC90aXRhbi1ubS50cyc7XG5pbXBvcnQgZmlsZTQgZnJvbSAnLi8wMi1hcnIvdHJpYWwvbGV2aS1leC50cyc7XG5pbXBvcnQgZmlsZTUgZnJvbSAnLi8wMi1hcnIvdHJpYWwvc2hpdmEtaG0udHMnO1xuaW1wb3J0IGZpbGU2IGZyb20gJy4vMDItYXJyL3RyaWFsL3NoaXZhLWV4LnRzJztcbmltcG9ydCBmaWxlNyBmcm9tICcuLzAyLWFyci90cmlhbC90aXRhbi1obS50cyc7XG5pbXBvcnQgZmlsZTggZnJvbSAnLi8wMi1hcnIvdHJpYWwvdGl0YW4tZXgudHMnO1xuaW1wb3J0IGZpbGU5IGZyb20gJy4vMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LnRzJztcbmltcG9ydCBmaWxlMTAgZnJvbSAnLi8wMy1ody9kdW5nZW9uL2FldGhlcm9jaGVtaWNhbF9yZXNlYXJjaF9mYWNpbGl0eS50cyc7XG5pbXBvcnQgZmlsZTExIGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9mcmFjdGFsX2NvbnRpbnV1bS50cyc7XG5pbXBvcnQgZmlsZTEyIGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQudHMnO1xuaW1wb3J0IGZpbGUxMyBmcm9tICcuLzAzLWh3L2R1bmdlb24vc29obV9hbF9oYXJkLnRzJztcbmltcG9ydCBmaWxlMTQgZnJvbSAnLi8wMy1ody9yYWlkL2E2bi50cyc7XG5pbXBvcnQgZmlsZTE1IGZyb20gJy4vMDMtaHcvcmFpZC9hMTJuLnRzJztcbmltcG9ydCBmaWxlMTYgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL2FsYV9taGlnby50cyc7XG5pbXBvcnQgZmlsZTE3IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9iYXJkYW1zX21ldHRsZS50cyc7XG5pbXBvcnQgZmlsZTE4IGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9kcm93bmVkX2NpdHlfb2Zfc2thbGxhLnRzJztcbmltcG9ydCBmaWxlMTkgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL2t1Z2FuZV9jYXN0bGUudHMnO1xuaW1wb3J0IGZpbGUyMCBmcm9tICcuLzA0LXNiL2R1bmdlb24vc2lyZW5zb25nX3NlYS50cyc7XG5pbXBvcnQgZmlsZTIxIGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9zdF9tb2NpYW5uZV9oYXJkLnRzJztcbmltcG9ydCBmaWxlMjIgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MudHMnO1xuaW1wb3J0IGZpbGUyMyBmcm9tICcuLzA0LXNiL2R1bmdlb24vdGVtcGxlX29mX3RoZV9maXN0LnRzJztcbmltcG9ydCBmaWxlMjQgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3RoZV9idXJuLnRzJztcbmltcG9ydCBmaWxlMjUgZnJvbSAnLi8wNC1zYi9yYWlkL28xbi50cyc7XG5pbXBvcnQgZmlsZTI2IGZyb20gJy4vMDQtc2IvcmFpZC9vMXMudHMnO1xuaW1wb3J0IGZpbGUyNyBmcm9tICcuLzA0LXNiL3JhaWQvbzJuLnRzJztcbmltcG9ydCBmaWxlMjggZnJvbSAnLi8wNC1zYi9yYWlkL28ycy50cyc7XG5pbXBvcnQgZmlsZTI5IGZyb20gJy4vMDQtc2IvcmFpZC9vM24udHMnO1xuaW1wb3J0IGZpbGUzMCBmcm9tICcuLzA0LXNiL3JhaWQvbzNzLnRzJztcbmltcG9ydCBmaWxlMzEgZnJvbSAnLi8wNC1zYi9yYWlkL280bi50cyc7XG5pbXBvcnQgZmlsZTMyIGZyb20gJy4vMDQtc2IvcmFpZC9vNHMudHMnO1xuaW1wb3J0IGZpbGUzMyBmcm9tICcuLzA0LXNiL3JhaWQvbzdzLnRzJztcbmltcG9ydCBmaWxlMzQgZnJvbSAnLi8wNC1zYi9yYWlkL285bi50cyc7XG5pbXBvcnQgZmlsZTM1IGZyb20gJy4vMDQtc2IvcmFpZC9vMTBuLnRzJztcbmltcG9ydCBmaWxlMzYgZnJvbSAnLi8wNC1zYi9yYWlkL28xMW4udHMnO1xuaW1wb3J0IGZpbGUzNyBmcm9tICcuLzA0LXNiL3JhaWQvbzEybi50cyc7XG5pbXBvcnQgZmlsZTM4IGZyb20gJy4vMDQtc2IvcmFpZC9vMTJzLnRzJztcbmltcG9ydCBmaWxlMzkgZnJvbSAnLi8wNC1zYi90cmlhbC9ieWFra28tZXgudHMnO1xuaW1wb3J0IGZpbGU0MCBmcm9tICcuLzA0LXNiL3RyaWFsL3NoaW5yeXUudHMnO1xuaW1wb3J0IGZpbGU0MSBmcm9tICcuLzA0LXNiL3RyaWFsL3N1c2Fuby1leC50cyc7XG5pbXBvcnQgZmlsZTQyIGZyb20gJy4vMDQtc2IvdHJpYWwvc3V6YWt1LnRzJztcbmltcG9ydCBmaWxlNDMgZnJvbSAnLi8wNC1zYi91bHRpbWF0ZS91bHRpbWFfd2VhcG9uX3VsdGltYXRlLnRzJztcbmltcG9ydCBmaWxlNDQgZnJvbSAnLi8wNC1zYi91bHRpbWF0ZS91bmVuZGluZ19jb2lsX3VsdGltYXRlLnRzJztcbmltcG9ydCBmaWxlNDUgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LnRzJztcbmltcG9ydCBmaWxlNDYgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX3B1cHBldHNfYnVua2VyLnRzJztcbmltcG9ydCBmaWxlNDcgZnJvbSAnLi8wNS1zaGIvYWxsaWFuY2UvdGhlX3Rvd2VyX2F0X3BhcmFkaWdtc19icmVhY2gudHMnO1xuaW1wb3J0IGZpbGU0OCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIudHMnO1xuaW1wb3J0IGZpbGU0OSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FtYXVyb3QudHMnO1xuaW1wb3J0IGZpbGU1MCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2FuYW1uZXNpc19hbnlkZXIudHMnO1xuaW1wb3J0IGZpbGU1MSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy50cyc7XG5pbXBvcnQgZmlsZTUyIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vaGVyb2VzX2dhdW50bGV0LnRzJztcbmltcG9ydCBmaWxlNTMgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9ob2xtaW5zdGVyX3N3aXRjaC50cyc7XG5pbXBvcnQgZmlsZTU0IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC50cyc7XG5pbXBvcnQgZmlsZTU1IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbWF0b3lhc19yZWxpY3QudHMnO1xuaW1wb3J0IGZpbGU1NiBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL210X2d1bGcudHMnO1xuaW1wb3J0IGZpbGU1NyBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLnRzJztcbmltcG9ydCBmaWxlNTggZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9xaXRhbmFfcmF2ZWwudHMnO1xuaW1wb3J0IGZpbGU1OSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3RoZV9ncmFuZF9jb3Ntb3MudHMnO1xuaW1wb3J0IGZpbGU2MCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLnRzJztcbmltcG9ydCBmaWxlNjEgZnJvbSAnLi8wNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWUudHMnO1xuaW1wb3J0IGZpbGU2MiBmcm9tICcuLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZV9zYXZhZ2UudHMnO1xuaW1wb3J0IGZpbGU2MyBmcm9tICcuLzA1LXNoYi9yYWlkL2Uxbi50cyc7XG5pbXBvcnQgZmlsZTY0IGZyb20gJy4vMDUtc2hiL3JhaWQvZTFzLnRzJztcbmltcG9ydCBmaWxlNjUgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMm4udHMnO1xuaW1wb3J0IGZpbGU2NiBmcm9tICcuLzA1LXNoYi9yYWlkL2Uycy50cyc7XG5pbXBvcnQgZmlsZTY3IGZyb20gJy4vMDUtc2hiL3JhaWQvZTNuLnRzJztcbmltcG9ydCBmaWxlNjggZnJvbSAnLi8wNS1zaGIvcmFpZC9lM3MudHMnO1xuaW1wb3J0IGZpbGU2OSBmcm9tICcuLzA1LXNoYi9yYWlkL2U0bi50cyc7XG5pbXBvcnQgZmlsZTcwIGZyb20gJy4vMDUtc2hiL3JhaWQvZTRzLnRzJztcbmltcG9ydCBmaWxlNzEgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNW4udHMnO1xuaW1wb3J0IGZpbGU3MiBmcm9tICcuLzA1LXNoYi9yYWlkL2U1cy50cyc7XG5pbXBvcnQgZmlsZTczIGZyb20gJy4vMDUtc2hiL3JhaWQvZTZuLnRzJztcbmltcG9ydCBmaWxlNzQgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNnMudHMnO1xuaW1wb3J0IGZpbGU3NSBmcm9tICcuLzA1LXNoYi9yYWlkL2U3bi50cyc7XG5pbXBvcnQgZmlsZTc2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTdzLnRzJztcbmltcG9ydCBmaWxlNzcgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOG4udHMnO1xuaW1wb3J0IGZpbGU3OCBmcm9tICcuLzA1LXNoYi9yYWlkL2U4cy50cyc7XG5pbXBvcnQgZmlsZTc5IGZyb20gJy4vMDUtc2hiL3JhaWQvZTluLnRzJztcbmltcG9ydCBmaWxlODAgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOXMudHMnO1xuaW1wb3J0IGZpbGU4MSBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMG4udHMnO1xuaW1wb3J0IGZpbGU4MiBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMHMudHMnO1xuaW1wb3J0IGZpbGU4MyBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMW4udHMnO1xuaW1wb3J0IGZpbGU4NCBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMXMudHMnO1xuaW1wb3J0IGZpbGU4NSBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMm4udHMnO1xuaW1wb3J0IGZpbGU4NiBmcm9tICcuLzA1LXNoYi9yYWlkL2UxMnMudHMnO1xuaW1wb3J0IGZpbGU4NyBmcm9tICcuLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC50cyc7XG5pbXBvcnQgZmlsZTg4IGZyb20gJy4vMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLnRzJztcbmltcG9ydCBmaWxlODkgZnJvbSAnLi8wNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24tZXgudHMnO1xuaW1wb3J0IGZpbGU5MCBmcm9tICcuLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi50cyc7XG5pbXBvcnQgZmlsZTkxIGZyb20gJy4vMDUtc2hiL3RyaWFsL2hhZGVzLWV4LnRzJztcbmltcG9ydCBmaWxlOTIgZnJvbSAnLi8wNS1zaGIvdHJpYWwvaGFkZXMudHMnO1xuaW1wb3J0IGZpbGU5MyBmcm9tICcuLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXgudHMnO1xuaW1wb3J0IGZpbGU5NCBmcm9tICcuLzA1LXNoYi90cmlhbC9pbm5vY2VuY2UudHMnO1xuaW1wb3J0IGZpbGU5NSBmcm9tICcuLzA1LXNoYi90cmlhbC9sZXZpLXVuLnRzJztcbmltcG9ydCBmaWxlOTYgZnJvbSAnLi8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXgudHMnO1xuaW1wb3J0IGZpbGU5NyBmcm9tICcuLzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi50cyc7XG5pbXBvcnQgZmlsZTk4IGZyb20gJy4vMDUtc2hiL3RyaWFsL3NoaXZhLXVuLnRzJztcbmltcG9ydCBmaWxlOTkgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdGl0YW5pYS50cyc7XG5pbXBvcnQgZmlsZTEwMCBmcm9tICcuLzA1LXNoYi90cmlhbC90aXRhbmlhLWV4LnRzJztcbmltcG9ydCBmaWxlMTAxIGZyb20gJy4vMDUtc2hiL3RyaWFsL3RpdGFuLXVuLnRzJztcbmltcG9ydCBmaWxlMTAyIGZyb20gJy4vMDUtc2hiL3RyaWFsL3ZhcmlzLWV4LnRzJztcbmltcG9ydCBmaWxlMTAzIGZyb20gJy4vMDUtc2hiL3RyaWFsL3dvbC50cyc7XG5pbXBvcnQgZmlsZTEwNCBmcm9tICcuLzA1LXNoYi90cmlhbC93b2wtZXgudHMnO1xuaW1wb3J0IGZpbGUxMDUgZnJvbSAnLi8wNS1zaGIvdWx0aW1hdGUvdGhlX2VwaWNfb2ZfYWxleGFuZGVyLnRzJztcblxuZXhwb3J0IGRlZmF1bHQgeycwMC1taXNjL2dlbmVyYWwudHMnOiBmaWxlMCwnMDAtbWlzYy90ZXN0LnRzJzogZmlsZTEsJzAyLWFyci90cmlhbC9pZnJpdC1ubS50cyc6IGZpbGUyLCcwMi1hcnIvdHJpYWwvdGl0YW4tbm0udHMnOiBmaWxlMywnMDItYXJyL3RyaWFsL2xldmktZXgudHMnOiBmaWxlNCwnMDItYXJyL3RyaWFsL3NoaXZhLWhtLnRzJzogZmlsZTUsJzAyLWFyci90cmlhbC9zaGl2YS1leC50cyc6IGZpbGU2LCcwMi1hcnIvdHJpYWwvdGl0YW4taG0udHMnOiBmaWxlNywnMDItYXJyL3RyaWFsL3RpdGFuLWV4LnRzJzogZmlsZTgsJzAzLWh3L2FsbGlhbmNlL3dlZXBpbmdfY2l0eS50cyc6IGZpbGU5LCcwMy1ody9kdW5nZW9uL2FldGhlcm9jaGVtaWNhbF9yZXNlYXJjaF9mYWNpbGl0eS50cyc6IGZpbGUxMCwnMDMtaHcvZHVuZ2Vvbi9mcmFjdGFsX2NvbnRpbnV1bS50cyc6IGZpbGUxMSwnMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQudHMnOiBmaWxlMTIsJzAzLWh3L2R1bmdlb24vc29obV9hbF9oYXJkLnRzJzogZmlsZTEzLCcwMy1ody9yYWlkL2E2bi50cyc6IGZpbGUxNCwnMDMtaHcvcmFpZC9hMTJuLnRzJzogZmlsZTE1LCcwNC1zYi9kdW5nZW9uL2FsYV9taGlnby50cyc6IGZpbGUxNiwnMDQtc2IvZHVuZ2Vvbi9iYXJkYW1zX21ldHRsZS50cyc6IGZpbGUxNywnMDQtc2IvZHVuZ2Vvbi9kcm93bmVkX2NpdHlfb2Zfc2thbGxhLnRzJzogZmlsZTE4LCcwNC1zYi9kdW5nZW9uL2t1Z2FuZV9jYXN0bGUudHMnOiBmaWxlMTksJzA0LXNiL2R1bmdlb24vc2lyZW5zb25nX3NlYS50cyc6IGZpbGUyMCwnMDQtc2IvZHVuZ2Vvbi9zdF9tb2NpYW5uZV9oYXJkLnRzJzogZmlsZTIxLCcwNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MudHMnOiBmaWxlMjIsJzA0LXNiL2R1bmdlb24vdGVtcGxlX29mX3RoZV9maXN0LnRzJzogZmlsZTIzLCcwNC1zYi9kdW5nZW9uL3RoZV9idXJuLnRzJzogZmlsZTI0LCcwNC1zYi9yYWlkL28xbi50cyc6IGZpbGUyNSwnMDQtc2IvcmFpZC9vMXMudHMnOiBmaWxlMjYsJzA0LXNiL3JhaWQvbzJuLnRzJzogZmlsZTI3LCcwNC1zYi9yYWlkL28ycy50cyc6IGZpbGUyOCwnMDQtc2IvcmFpZC9vM24udHMnOiBmaWxlMjksJzA0LXNiL3JhaWQvbzNzLnRzJzogZmlsZTMwLCcwNC1zYi9yYWlkL280bi50cyc6IGZpbGUzMSwnMDQtc2IvcmFpZC9vNHMudHMnOiBmaWxlMzIsJzA0LXNiL3JhaWQvbzdzLnRzJzogZmlsZTMzLCcwNC1zYi9yYWlkL285bi50cyc6IGZpbGUzNCwnMDQtc2IvcmFpZC9vMTBuLnRzJzogZmlsZTM1LCcwNC1zYi9yYWlkL28xMW4udHMnOiBmaWxlMzYsJzA0LXNiL3JhaWQvbzEybi50cyc6IGZpbGUzNywnMDQtc2IvcmFpZC9vMTJzLnRzJzogZmlsZTM4LCcwNC1zYi90cmlhbC9ieWFra28tZXgudHMnOiBmaWxlMzksJzA0LXNiL3RyaWFsL3NoaW5yeXUudHMnOiBmaWxlNDAsJzA0LXNiL3RyaWFsL3N1c2Fuby1leC50cyc6IGZpbGU0MSwnMDQtc2IvdHJpYWwvc3V6YWt1LnRzJzogZmlsZTQyLCcwNC1zYi91bHRpbWF0ZS91bHRpbWFfd2VhcG9uX3VsdGltYXRlLnRzJzogZmlsZTQzLCcwNC1zYi91bHRpbWF0ZS91bmVuZGluZ19jb2lsX3VsdGltYXRlLnRzJzogZmlsZTQ0LCcwNS1zaGIvYWxsaWFuY2UvdGhlX2NvcGllZF9mYWN0b3J5LnRzJzogZmlsZTQ1LCcwNS1zaGIvYWxsaWFuY2UvdGhlX3B1cHBldHNfYnVua2VyLnRzJzogZmlsZTQ2LCcwNS1zaGIvYWxsaWFuY2UvdGhlX3Rvd2VyX2F0X3BhcmFkaWdtc19icmVhY2gudHMnOiBmaWxlNDcsJzA1LXNoYi9kdW5nZW9uL2FrYWRhZW1pYV9hbnlkZXIudHMnOiBmaWxlNDgsJzA1LXNoYi9kdW5nZW9uL2FtYXVyb3QudHMnOiBmaWxlNDksJzA1LXNoYi9kdW5nZW9uL2FuYW1uZXNpc19hbnlkZXIudHMnOiBmaWxlNTAsJzA1LXNoYi9kdW5nZW9uL2RvaG5fbWhlZy50cyc6IGZpbGU1MSwnMDUtc2hiL2R1bmdlb24vaGVyb2VzX2dhdW50bGV0LnRzJzogZmlsZTUyLCcwNS1zaGIvZHVuZ2Vvbi9ob2xtaW5zdGVyX3N3aXRjaC50cyc6IGZpbGU1MywnMDUtc2hiL2R1bmdlb24vbWFsaWthaHNfd2VsbC50cyc6IGZpbGU1NCwnMDUtc2hiL2R1bmdlb24vbWF0b3lhc19yZWxpY3QudHMnOiBmaWxlNTUsJzA1LXNoYi9kdW5nZW9uL210X2d1bGcudHMnOiBmaWxlNTYsJzA1LXNoYi9kdW5nZW9uL3BhZ2x0aGFuLnRzJzogZmlsZTU3LCcwNS1zaGIvZHVuZ2Vvbi9xaXRhbmFfcmF2ZWwudHMnOiBmaWxlNTgsJzA1LXNoYi9kdW5nZW9uL3RoZV9ncmFuZF9jb3Ntb3MudHMnOiBmaWxlNTksJzA1LXNoYi9kdW5nZW9uL3R3aW5uaW5nLnRzJzogZmlsZTYwLCcwNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWUudHMnOiBmaWxlNjEsJzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZV9zYXZhZ2UudHMnOiBmaWxlNjIsJzA1LXNoYi9yYWlkL2Uxbi50cyc6IGZpbGU2MywnMDUtc2hiL3JhaWQvZTFzLnRzJzogZmlsZTY0LCcwNS1zaGIvcmFpZC9lMm4udHMnOiBmaWxlNjUsJzA1LXNoYi9yYWlkL2Uycy50cyc6IGZpbGU2NiwnMDUtc2hiL3JhaWQvZTNuLnRzJzogZmlsZTY3LCcwNS1zaGIvcmFpZC9lM3MudHMnOiBmaWxlNjgsJzA1LXNoYi9yYWlkL2U0bi50cyc6IGZpbGU2OSwnMDUtc2hiL3JhaWQvZTRzLnRzJzogZmlsZTcwLCcwNS1zaGIvcmFpZC9lNW4udHMnOiBmaWxlNzEsJzA1LXNoYi9yYWlkL2U1cy50cyc6IGZpbGU3MiwnMDUtc2hiL3JhaWQvZTZuLnRzJzogZmlsZTczLCcwNS1zaGIvcmFpZC9lNnMudHMnOiBmaWxlNzQsJzA1LXNoYi9yYWlkL2U3bi50cyc6IGZpbGU3NSwnMDUtc2hiL3JhaWQvZTdzLnRzJzogZmlsZTc2LCcwNS1zaGIvcmFpZC9lOG4udHMnOiBmaWxlNzcsJzA1LXNoYi9yYWlkL2U4cy50cyc6IGZpbGU3OCwnMDUtc2hiL3JhaWQvZTluLnRzJzogZmlsZTc5LCcwNS1zaGIvcmFpZC9lOXMudHMnOiBmaWxlODAsJzA1LXNoYi9yYWlkL2UxMG4udHMnOiBmaWxlODEsJzA1LXNoYi9yYWlkL2UxMHMudHMnOiBmaWxlODIsJzA1LXNoYi9yYWlkL2UxMW4udHMnOiBmaWxlODMsJzA1LXNoYi9yYWlkL2UxMXMudHMnOiBmaWxlODQsJzA1LXNoYi9yYWlkL2UxMm4udHMnOiBmaWxlODUsJzA1LXNoYi9yYWlkL2UxMnMudHMnOiBmaWxlODYsJzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi1leC50cyc6IGZpbGU4NywnMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLnRzJzogZmlsZTg4LCcwNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24tZXgudHMnOiBmaWxlODksJzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi50cyc6IGZpbGU5MCwnMDUtc2hiL3RyaWFsL2hhZGVzLWV4LnRzJzogZmlsZTkxLCcwNS1zaGIvdHJpYWwvaGFkZXMudHMnOiBmaWxlOTIsJzA1LXNoYi90cmlhbC9pbm5vY2VuY2UtZXgudHMnOiBmaWxlOTMsJzA1LXNoYi90cmlhbC9pbm5vY2VuY2UudHMnOiBmaWxlOTQsJzA1LXNoYi90cmlhbC9sZXZpLXVuLnRzJzogZmlsZTk1LCcwNS1zaGIvdHJpYWwvcnVieV93ZWFwb24tZXgudHMnOiBmaWxlOTYsJzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi50cyc6IGZpbGU5NywnMDUtc2hiL3RyaWFsL3NoaXZhLXVuLnRzJzogZmlsZTk4LCcwNS1zaGIvdHJpYWwvdGl0YW5pYS50cyc6IGZpbGU5OSwnMDUtc2hiL3RyaWFsL3RpdGFuaWEtZXgudHMnOiBmaWxlMTAwLCcwNS1zaGIvdHJpYWwvdGl0YW4tdW4udHMnOiBmaWxlMTAxLCcwNS1zaGIvdHJpYWwvdmFyaXMtZXgudHMnOiBmaWxlMTAyLCcwNS1zaGIvdHJpYWwvd29sLnRzJzogZmlsZTEwMywnMDUtc2hiL3RyaWFsL3dvbC1leC50cyc6IGZpbGUxMDQsJzA1LXNoYi91bHRpbWF0ZS90aGVfZXBpY19vZl9hbGV4YW5kZXIudHMnOiBmaWxlMTA1LH07Il0sInNvdXJjZVJvb3QiOiIifQ==