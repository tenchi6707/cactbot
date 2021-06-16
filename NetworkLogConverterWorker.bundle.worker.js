/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./resources/regexes.ts
const startsUsingParams = ['timestamp', 'source', 'id', 'ability', 'target', 'capture'];
const abilityParams = ['timestamp', 'source', 'sourceId', 'id', 'ability', 'targetId', 'target', 'capture'];
const abilityFullParams = [
    'timestamp',
    'sourceId',
    'source',
    'id',
    'ability',
    'targetId',
    'target',
    'flags',
    'flag0',
    'flag1',
    'flag2',
    'flag3',
    'flag4',
    'flag5',
    'flag6',
    'flag7',
    'flag8',
    'flag9',
    'flag10',
    'flag11',
    'flag12',
    'flag13',
    'flag14',
    'targetHp',
    'targetMaxHp',
    'targetMp',
    'targetMaxMp',
    'targetX',
    'targetY',
    'targetZ',
    'targetHeading',
    'hp',
    'maxHp',
    'mp',
    'maxMp',
    'x',
    'y',
    'z',
    'heading',
    'capture',
];
const headMarkerParams = ['timestamp', 'targetId', 'target', 'id', 'capture'];
const addedCombatantParams = ['timestamp', 'name', 'capture'];
const addedCombatantFullParams = [
    'timestamp',
    'id',
    'name',
    'job',
    'level',
    'hp',
    'x',
    'y',
    'z',
    'npcId',
    'capture',
];
const removingCombatantParams = [
    'timestamp',
    'id',
    'name',
    'hp',
    'x',
    'y',
    'z',
    'capture',
];
const gainsEffectParams = ['timestamp', 'targetId', 'target', 'effect', 'source', 'duration', 'capture'];
const statusEffectExplicitParams = [
    'timestamp',
    'targetId',
    'target',
    'job',
    'hp',
    'maxHp',
    'mp',
    'maxMp',
    'x',
    'y',
    'z',
    'heading',
    'data0',
    'data1',
    'data2',
    'data3',
    'data4',
    'capture',
];
const losesEffectParams = ['timestamp', 'targetId', 'target', 'effect', 'source', 'capture'];
const statChangeParams = [
    'timestamp',
    'job',
    'strength',
    'dexterity',
    'vitality',
    'intelligence',
    'mind',
    'piety',
    'attackPower',
    'directHit',
    'criticalHit',
    'attackMagicPotency',
    'healMagicPotency',
    'determination',
    'skillSpeed',
    'spellSpeed',
    'tenacity',
    'capture',
];
const tetherParams = ['timestamp', 'source', 'sourceId', 'target', 'targetId', 'id', 'capture'];
const wasDefeatedParams = ['timestamp', 'target', 'source', 'capture'];
const hasHPParams = ['timestamp', 'name', 'hp', 'capture'];
const echoParams = ['timestamp', 'code', 'line', 'capture'];
const dialogParams = ['timestamp', 'code', 'line', 'name', 'capture'];
const messageParams = ['timestamp', 'code', 'line', 'capture'];
const gameLogParams = ['timestamp', 'code', 'line', 'capture'];
const gameNameLogParams = ['timestamp', 'code', 'name', 'line', 'capture'];
const changeZoneParams = ['timestamp', 'name', 'capture'];
const network6dParams = ['timestamp', 'instance', 'command', 'data0', 'data1', 'data2', 'data3', 'capture'];
class Regexes {
    /**
     * fields: source, id, ability, target, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#14-networkstartscasting
     */
    static startsUsing(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'startsUsing', startsUsingParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        let str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 14:' +
            Regexes.maybeCapture(capture, 'id', f.id, '\\y{AbilityCode}') + ':';
        if (f.source || f.id || f.target || capture)
            str += Regexes.maybeCapture(capture, 'source', f.source, '.*?') + ' starts using ';
        if (f.ability || f.target || capture)
            str += Regexes.maybeCapture(capture, 'ability', f.ability, '.*?') + ' on ';
        if (f.target || capture)
            str += Regexes.maybeCapture(capture, 'target', f.target, '.*?') + '\\.';
        return Regexes.parse(str);
    }
    /**
     * fields: sourceId, source, id, ability, targetId, target, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#15-networkability
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#16-networkaoeability
     */
    static ability(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'ability', abilityParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        let str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 1[56]:' + Regexes.maybeCapture(capture, 'sourceId', '\\y{ObjectId}') + ':' +
            Regexes.maybeCapture(capture, 'source', f.source, '[^:]*?') + ':';
        if (f.id || f.ability || f.target || f.targetId || capture)
            str += Regexes.maybeCapture(capture, 'id', f.id, '\\y{AbilityCode}') + ':';
        if (f.ability || f.target || f.targetId || capture)
            str += Regexes.maybeCapture(capture, 'ability', f.ability, '[^:]*?') + ':';
        if (f.target || f.targetId || capture)
            str += Regexes.maybeCapture(capture, 'targetId', '\\y{ObjectId}') + ':';
        if (f.target || capture)
            str += Regexes.maybeCapture(capture, 'target', f.target, '[^:]*?') + ':';
        return Regexes.parse(str);
    }
    /**
     * fields: sourceId, source, id, ability, targetId, target, flags, x, y, z, heading, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#15-networkability
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#16-networkaoeability
     */
    static abilityFull(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'abilityFull', abilityFullParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 1[56]:' +
            Regexes.maybeCapture(capture, 'sourceId', f.sourceId, '\\y{ObjectId}') + ':' +
            Regexes.maybeCapture(capture, 'source', f.source, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'id', f.id, '\\y{AbilityCode}') + ':' +
            Regexes.maybeCapture(capture, 'ability', f.ability, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'targetId', f.targetId, '\\y{ObjectId}') + ':' +
            Regexes.maybeCapture(capture, 'target', f.target, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flags', f.flags, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag0', f.flag0, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag1', f.flag1, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag2', f.flag2, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag3', f.flag3, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag4', f.flag4, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag5', f.flag5, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag6', f.flag6, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag7', f.flag7, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag8', f.flag8, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag9', f.flag9, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag10', f.flag10, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag11', f.flag11, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag12', f.flag12, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag13', f.flag13, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'flag14', f.flag13, '[^:]*?') + ':' +
            Regexes.optional(Regexes.maybeCapture(capture, 'targetHp', f.targetHp, '\\y{Float}')) + ':' +
            Regexes.optional(Regexes.maybeCapture(capture, 'targetMaxHp', f.targetMaxHp, '\\y{Float}')) + ':' +
            Regexes.optional(Regexes.maybeCapture(capture, 'targetMp', f.targetMp, '\\y{Float}')) + ':' +
            Regexes.optional(Regexes.maybeCapture(capture, 'targetMaxMp', f.targetMaxMp, '\\y{Float}')) + ':' +
            Regexes.optional('\\y{Float}') + ':' + // Target TP
            Regexes.optional('\\y{Float}') + ':' + // Target Max TP
            Regexes.optional(Regexes.maybeCapture(capture, 'targetX', f.targetX, '\\y{Float}')) + ':' +
            Regexes.optional(Regexes.maybeCapture(capture, 'targetY', f.targetY, '\\y{Float}')) + ':' +
            Regexes.optional(Regexes.maybeCapture(capture, 'targetZ', f.targetZ, '\\y{Float}')) + ':' +
            Regexes.optional(Regexes.maybeCapture(capture, 'targetHeading', f.targetHeading, '\\y{Float}')) + ':' +
            Regexes.maybeCapture(capture, 'hp', f.hp, '\\y{Float}') + ':' +
            Regexes.maybeCapture(capture, 'maxHp', f.maxHp, '\\y{Float}') + ':' +
            Regexes.maybeCapture(capture, 'mp', f.mp, '\\y{Float}') + ':' +
            Regexes.maybeCapture(capture, 'maxMp', f.maxMp, '\\y{Float}') + ':' +
            '\\y{Float}:' + // Source TP
            '\\y{Float}:' + // Source Max TP
            Regexes.maybeCapture(capture, 'x', f.x, '\\y{Float}') + ':' +
            Regexes.maybeCapture(capture, 'y', f.y, '\\y{Float}') + ':' +
            Regexes.maybeCapture(capture, 'z', f.z, '\\y{Float}') + ':' +
            Regexes.maybeCapture(capture, 'heading', f.heading, '\\y{Float}') + ':' +
            '.*?$'; // Unknown last field
        return Regexes.parse(str);
    }
    /**
     * fields: targetId, target, id, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#1b-networktargeticon-head-markers
     */
    static headMarker(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'headMarker', headMarkerParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 1B:' +
            Regexes.maybeCapture(capture, 'targetId', f.targetId, '\\y{ObjectId}') + ':' +
            Regexes.maybeCapture(capture, 'target', f.target, '[^:]*?') + ':....:....:' +
            Regexes.maybeCapture(capture, 'id', f.id, '....') + ':';
        return Regexes.parse(str);
    }
    // fields: name, capture
    // matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#03-addcombatant
    static addedCombatant(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'addedCombatant', addedCombatantParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 03:\\y{ObjectId}:Added new combatant ' +
            Regexes.maybeCapture(capture, 'name', f.name, '.*?') + '\\.';
        return Regexes.parse(str);
    }
    /**
     * fields: id, name, hp, x, y, z, npcId, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#03-addcombatant
     */
    static addedCombatantFull(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'addedCombatantFull', addedCombatantFullParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 03:' + Regexes.maybeCapture(capture, 'id', f.id, '\\y{ObjectId}') +
            ':Added new combatant ' + Regexes.maybeCapture(capture, 'name', f.name, '[^:]*?') +
            '\\. {2}Job: ' + Regexes.maybeCapture(capture, 'job', f.job, '[^:]*?') +
            ' Level: ' + Regexes.maybeCapture(capture, 'level', f.level, '[^:]*?') +
            ' Max HP: ' + Regexes.maybeCapture(capture, 'hp', f.hp, '[0-9]+') + '\.' +
            '.*?Pos: \\(' +
            Regexes.maybeCapture(capture, 'x', f.x, '\\y{Float}') + ',' +
            Regexes.maybeCapture(capture, 'y', f.y, '\\y{Float}') + ',' +
            Regexes.maybeCapture(capture, 'z', f.z, '\\y{Float}') + '\\)' +
            '(?: \\(' + Regexes.maybeCapture(capture, 'npcId', f.npcId, '.*?') + '\\))?\\.';
        return Regexes.parse(str);
    }
    /**
     * fields: id, name, hp, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#04-removecombatant
     */
    static removingCombatant(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'removingCombatant', removingCombatantParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 04:' + Regexes.maybeCapture(capture, 'id', '\\y{ObjectId}') +
            ':Removing combatant ' +
            Regexes.maybeCapture(capture, 'name', f.name, '.*?') + '\\.' +
            '.*?Max HP: ' + Regexes.maybeCapture(capture, 'hp', f.hp, '[0-9]+') + '\.' +
            Regexes.optional('.*?Pos: \\(' +
                Regexes.maybeCapture(capture, 'x', f.x, '\\y{Float}') + ',' +
                Regexes.maybeCapture(capture, 'y', f.y, '\\y{Float}') + ',' +
                Regexes.maybeCapture(capture, 'z', f.z, '\\y{Float}') + '\\)');
        return Regexes.parse(str);
    }
    // fields: targetId, target, effect, source, duration, capture
    // matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#1a-networkbuff
    static gainsEffect(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'gainsEffect', gainsEffectParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 1A:' +
            Regexes.maybeCapture(capture, 'targetId', f.targetId, '\\y{ObjectId}') + ':' +
            Regexes.maybeCapture(capture, 'target', f.target, '.*?') +
            ' gains the effect of ' +
            Regexes.maybeCapture(capture, 'effect', f.effect, '.*?') +
            ' from ' +
            Regexes.maybeCapture(capture, 'source', f.source, '.*?') +
            ' for ' +
            Regexes.maybeCapture(capture, 'duration', f.duration, '\\y{Float}') +
            ' Seconds\\.';
        return Regexes.parse(str);
    }
    /**
     * Prefer gainsEffect over this function unless you really need extra data.
     * fields: targetId, target, job, hp, maxHp, mp, maxMp, x, y, z, heading,
     *         data0, data1, data2, data3, data4
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#26-networkstatuseffects
     */
    static statusEffectExplicit(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'statusEffectExplicit', statusEffectExplicitParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const kField = '.*?:';
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 26:' +
            Regexes.maybeCapture(capture, 'targetId', f.targetId, '\\y{ObjectId}') + ':' +
            Regexes.maybeCapture(capture, 'target', f.target, '[^:]*?') + ':' +
            '[0-9A-F]{0,6}' + Regexes.maybeCapture(capture, 'job', f.job, '[0-9A-F]{0,2}') + ':' +
            Regexes.maybeCapture(capture, 'hp', f.hp, '\\y{Float}') + ':' +
            Regexes.maybeCapture(capture, 'maxHp', f.maxHp, '\\y{Float}') + ':' +
            Regexes.maybeCapture(capture, 'mp', f.mp, '\\y{Float}') + ':' +
            Regexes.maybeCapture(capture, 'maxMp', f.maxMp, '\\y{Float}') + ':' +
            kField + // tp lol
            kField + // max tp extra lol
            // x, y, z heading may be blank
            Regexes.optional(Regexes.maybeCapture(capture, 'x', f.x, '\\y{Float}')) + ':' +
            Regexes.optional(Regexes.maybeCapture(capture, 'y', f.y, '\\y{Float}')) + ':' +
            Regexes.optional(Regexes.maybeCapture(capture, 'z', f.z, '\\y{Float}')) + ':' +
            Regexes.optional(Regexes.maybeCapture(capture, 'heading', f.heading, '\\y{Float}')) + ':' +
            Regexes.maybeCapture(capture, 'data0', f.data0, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'data1', f.data1, '[^:]*?') + ':' +
            // data2, 3, 4 may not exist and the line may terminate.
            Regexes.optional(Regexes.maybeCapture(capture, 'data2', f.data2, '[^:]*?') + ':') +
            Regexes.optional(Regexes.maybeCapture(capture, 'data3', f.data3, '[^:]*?') + ':') +
            Regexes.optional(Regexes.maybeCapture(capture, 'data4', f.data4, '[^:]*?') + ':');
        return Regexes.parse(str);
    }
    /**
     * fields: targetId, target, effect, source, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#1e-networkbuffremove
     */
    static losesEffect(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'losesEffect', losesEffectParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 1E:' +
            Regexes.maybeCapture(capture, 'targetId', f.targetId, '\\y{ObjectId}') + ':' +
            Regexes.maybeCapture(capture, 'target', f.target, '.*?') +
            ' loses the effect of ' +
            Regexes.maybeCapture(capture, 'effect', f.effect, '.*?') +
            ' from ' +
            Regexes.maybeCapture(capture, 'source', f.source, '.*?') + '\\.';
        return Regexes.parse(str);
    }
    /**
     * fields: source, sourceId, target, targetId, id, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#23-networktether
     */
    static tether(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'tether', tetherParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 23:' +
            Regexes.maybeCapture(capture, 'sourceId', f.sourceId, '\\y{ObjectId}') + ':' +
            Regexes.maybeCapture(capture, 'source', f.source, '[^:]*?') + ':' +
            Regexes.maybeCapture(capture, 'targetId', f.targetId, '\\y{ObjectId}') + ':' +
            Regexes.maybeCapture(capture, 'target', f.target, '[^:]*?') +
            ':....:....:' +
            Regexes.maybeCapture(capture, 'id', f.id, '....') + ':';
        return Regexes.parse(str);
    }
    /**
     * 'target' was defeated by 'source'
     * fields: target, source, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#19-networkdeath
     */
    static wasDefeated(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'wasDefeated', wasDefeatedParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 19:' +
            Regexes.maybeCapture(capture, 'target', f.target, '.*?') +
            ' was defeated by ' +
            Regexes.maybeCapture(capture, 'source', f.source, '.*?') + '\\.';
        return Regexes.parse(str);
    }
    /**
     * fields: name, hp, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#0d-combatanthp
     */
    static hasHP(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'hasHP', hasHPParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 0D:' +
            Regexes.maybeCapture(capture, 'name', f.name, '.*?') +
            ' HP at ' +
            Regexes.maybeCapture(capture, 'hp', f.hp, '\\d+') + '%';
        return Regexes.parse(str);
    }
    /**
     * fields: code, line, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#00-logline
     */
    static echo(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'echo', echoParams);
        return Regexes.gameLog({
            line: f.line,
            capture: f.capture,
            code: '0038',
        });
    }
    /**
     * fields: code, line, name, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#00-logline
     */
    static dialog(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'dialog', dialogParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 00:' +
            Regexes.maybeCapture(capture, 'code', '0044') + ':' +
            Regexes.maybeCapture(capture, 'name', f.name, '.*?') + ':' +
            Regexes.maybeCapture(capture, 'line', f.line, '.*') + '$';
        return Regexes.parse(str);
    }
    /**
     * fields: code, line, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#00-logline
     */
    static message(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'message', messageParams);
        return Regexes.gameLog({
            line: f.line,
            capture: f.capture,
            code: '0839',
        });
    }
    /**
     * fields: code, line, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#00-logline
     */
    static gameLog(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'gameLog', gameLogParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 00:' +
            Regexes.maybeCapture(capture, 'code', f.code, '....') + ':' +
            Regexes.maybeCapture(capture, 'line', f.line, '.*') + '$';
        return Regexes.parse(str);
    }
    /**
     * fields: code, name, line, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#00-logline
     * Some game log lines have names in them, but not all.  All network log lines for these
     * have empty fields, but these get dropped by the ACT FFXV plugin.
     */
    static gameNameLog(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'gameNameLog', gameNameLogParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 00:' +
            Regexes.maybeCapture(capture, 'code', f.code, '....') + ':' +
            Regexes.maybeCapture(capture, 'name', f.name, '[^:]*') + ':' +
            Regexes.maybeCapture(capture, 'line', f.line, '.*') + '$';
        return Regexes.parse(str);
    }
    /**
     * fields: job, strength, dexterity, vitality, intelligence, mind, piety, attackPower,
     *         directHit, criticalHit, attackMagicPotency, healMagicPotency, determination,
     *         skillSpeed, spellSpeed, tenacity, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#0c-playerstats
     */
    static statChange(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'statChange', statChangeParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 0C:Player Stats: ' +
            Regexes.maybeCapture(capture, 'job', f.job, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'strength', f.strength, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'dexterity', f.dexterity, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'vitality', f.vitality, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'intelligence', f.intelligence, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'mind', f.mind, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'piety', f.piety, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'attackPower', f.attackPower, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'directHit', f.directHit, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'criticalHit', f.criticalHit, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'attackMagicPotency', f.attackMagicPotency, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'healMagicPotency', f.healMagicPotency, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'determination', f.determination, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'skillSpeed', f.skillSpeed, '\\d+') + ':' +
            Regexes.maybeCapture(capture, 'spellSpeed', f.spellSpeed, '\\d+') +
            ':0:' +
            Regexes.maybeCapture(capture, 'tenacity', f.tenacity, '\\d+');
        return Regexes.parse(str);
    }
    /**
     * fields: name, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#01-changezone
     */
    static changeZone(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'changeZone', changeZoneParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 01:Changed Zone to ' +
            Regexes.maybeCapture(capture, 'name', f.name, '.*?') + '\\.';
        return Regexes.parse(str);
    }
    /**
     * fields: instance, command, data0, data1, data2, data3
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#21-network6d-actor-control-lines
     */
    static network6d(f) {
        if (typeof f === 'undefined')
            f = {};
        Regexes.validateParams(f, 'network6d', network6dParams);
        const capture = Regexes.trueIfUndefined(f.capture);
        const str = Regexes.maybeCapture(capture, 'timestamp', '\\y{Timestamp}') +
            ' 21:' +
            Regexes.maybeCapture(capture, 'instance', f.instance, '.*?') + ':' +
            Regexes.maybeCapture(capture, 'command', f.command, '.*?') + ':' +
            Regexes.maybeCapture(capture, 'data0', f.data0, '.*?') + ':' +
            Regexes.maybeCapture(capture, 'data1', f.data1, '.*?') + ':' +
            Regexes.maybeCapture(capture, 'data2', f.data2, '.*?') + ':' +
            Regexes.maybeCapture(capture, 'data3', f.data3, '.*?') + '$';
        return Regexes.parse(str);
    }
    /**
     * Helper function for building named capture group
     */
    static maybeCapture(capture, name, value, defaultValue) {
        if (!value)
            value = defaultValue;
        value = Regexes.anyOf(value);
        return capture ? Regexes.namedCapture(name, value) : value;
    }
    static optional(str) {
        return `(?:${str})?`;
    }
    // Creates a named regex capture group named |name| for the match |value|.
    static namedCapture(name, value) {
        if (name.includes('>'))
            console.error('"' + name + '" contains ">".');
        if (name.includes('<'))
            console.error('"' + name + '" contains ">".');
        return '(?<' + name + '>' + value + ')';
    }
    /**
     * Convenience for turning multiple args into a unioned regular expression.
     * anyOf(x, y, z) or anyOf([x, y, z]) do the same thing, and return (?:x|y|z).
     * anyOf(x) or anyOf(x) on its own simplifies to just x.
     * args may be strings or RegExp, although any additional markers to RegExp
     * like /insensitive/i are dropped.
     */
    static anyOf(...args) {
        const anyOfArray = (array) => {
            return `(?:${array.map((elem) => elem instanceof RegExp ? elem.source : elem).join('|')})`;
        };
        let array = [];
        if (args.length === 1) {
            if (Array.isArray(args[0]))
                array = args[0];
            else if (args[0])
                array = [args[0]];
            else
                array = [];
        }
        else {
            // TODO: more accurate type instead of `as` cast
            array = args;
        }
        return anyOfArray(array);
    }
    static parse(regexpString) {
        const kCactbotCategories = {
            Timestamp: '^.{14}',
            NetTimestamp: '.{33}',
            NetField: '(?:[^|]*\\|)',
            LogType: '[0-9A-Fa-f]{2}',
            AbilityCode: '[0-9A-Fa-f]{1,8}',
            ObjectId: '[0-9A-F]{8}',
            // Matches any character name (including empty strings which the FFXIV
            // ACT plugin can generate when unknown).
            Name: '(?:[^\\s:|]+(?: [^\\s:|]+)?|)',
            // Floats can have comma as separator in FFXIV plugin output: https://github.com/ravahn/FFXIV_ACT_Plugin/issues/137
            Float: '-?[0-9]+(?:[.,][0-9]+)?(?:E-?[0-9]+)?',
        };
        // All regexes in cactbot are case insensitive.
        // This avoids headaches as things like `Vice and Vanity` turns into
        // `Vice And Vanity`, especially for French and German.  It appears to
        // have a ~20% regex parsing overhead, but at least they work.
        let modifiers = 'i';
        if (regexpString instanceof RegExp) {
            modifiers += (regexpString.global ? 'g' : '') +
                (regexpString.multiline ? 'm' : '');
            regexpString = regexpString.source;
        }
        regexpString = regexpString.replace(/\\y\{(.*?)\}/g, (match, group) => {
            return kCactbotCategories[group] || match;
        });
        return new RegExp(regexpString, modifiers);
    }
    // Like Regex.Regexes.parse, but force global flag.
    static parseGlobal(regexpString) {
        const regex = Regexes.parse(regexpString);
        let modifiers = 'gi';
        if (regexpString instanceof RegExp)
            modifiers += (regexpString.multiline ? 'm' : '');
        return new RegExp(regex.source, modifiers);
    }
    static trueIfUndefined(value) {
        if (typeof (value) === 'undefined')
            return true;
        return !!value;
    }
    static validateParams(f, funcName, params) {
        if (f === null)
            return;
        if (typeof f !== 'object')
            return;
        const keys = Object.keys(f);
        for (let k = 0; k < keys.length; ++k) {
            const key = keys[k];
            if (key && !params.includes(key)) {
                throw new Error(`${funcName}: invalid parameter '${key}'.  ` +
                    `Valid params: ${JSON.stringify(params)}`);
            }
        }
    }
}

;// CONCATENATED MODULE: ./resources/netregexes.ts

// Differences from Regexes:
// * may have more fields
// * AddedCombatant npc id is broken up into npcNameId and npcBaseId
// * gameLog always splits name into its own field (but previously wouldn't)
const separator = '\\|';
const matchDefault = '[^|]*';
const netregexes_startsUsingParams = (/* unused pure expression or super */ null && (['timestamp', 'sourceId', 'source', 'id', 'ability', 'targetId', 'target', 'castTime']));
const netregexes_abilityParams = (/* unused pure expression or super */ null && (['sourceId', 'source', 'id', 'ability', 'targetId', 'target']));
const netregexes_abilityFullParams = (/* unused pure expression or super */ null && (['sourceId', 'source', 'id', 'ability', 'targetId', 'target', 'flags', 'damage', 'targetCurrentHp', 'targetMaxHp', 'x', 'y', 'z', 'heading']));
const netregexes_headMarkerParams = (/* unused pure expression or super */ null && (['targetId', 'target', 'id']));
const netregexes_addedCombatantParams = (/* unused pure expression or super */ null && (['id', 'name']));
const netregexes_addedCombatantFullParams = (/* unused pure expression or super */ null && (['id', 'name', 'job', 'level', 'ownerId', 'world', 'npcNameId', 'npcBaseId', 'currentHp', 'hp', 'x', 'y', 'z', 'heading']));
const netregexes_removingCombatantParams = (/* unused pure expression or super */ null && (['id', 'name', 'hp']));
const netregexes_gainsEffectParams = (/* unused pure expression or super */ null && (['effectId', 'effect', 'duration', 'sourceId', 'source', 'targetId', 'target', 'count']));
const netregexes_statusEffectExplicitParams = (/* unused pure expression or super */ null && (['targetId', 'target', 'hp', 'maxHp', 'x', 'y', 'z', 'heading', 'data0', 'data1', 'data2', 'data3', 'data4']));
const netregexes_losesEffectParams = (/* unused pure expression or super */ null && (['effectId', 'effect', 'sourceId', 'source', 'targetId', 'target', 'count']));
const netregexes_tetherParams = (/* unused pure expression or super */ null && (['sourceId', 'source', 'targetId', 'target', 'id']));
const netregexes_wasDefeatedParams = (/* unused pure expression or super */ null && (['targetId', 'target', 'sourceId', 'source']));
const netregexes_echoParams = (/* unused pure expression or super */ null && (['code', 'name', 'line']));
const netregexes_dialogParams = (/* unused pure expression or super */ null && (['code', 'name', 'line']));
const netregexes_messageParams = (/* unused pure expression or super */ null && (['code', 'name', 'line']));
const netregexes_gameLogParams = (/* unused pure expression or super */ null && (['code', 'name', 'line']));
const netregexes_gameNameLogParams = (/* unused pure expression or super */ null && (['code', 'name', 'line']));
const netregexes_statChangeParams = (/* unused pure expression or super */ null && (['job', 'strength', 'dexterity', 'vitality', 'intelligence', 'mind', 'piety', 'attackPower', 'directHit', 'criticalHit', 'attackMagicPotency', 'healMagicPotency', 'determination', 'skillSpeed', 'spellSpeed', 'tenacity']));
const netregexes_changeZoneParams = (/* unused pure expression or super */ null && (['id', 'name']));
const netregexes_network6dParams = (/* unused pure expression or super */ null && (['instance', 'command', 'data0', 'data1', 'data2', 'data3']));
const nameToggleParams = (/* unused pure expression or super */ null && (['id', 'name', 'toggle']));
// If NetRegexes.setFlagTranslationsNeeded is set to true, then any
// regex created that requires a translation will begin with this string
// and match the magicStringRegex.  This is maybe a bit goofy, but is
// a pretty straightforward way to mark regexes for translations.
// If issue #1306 is ever resolved, we can remove this.
const magicTranslationString = `^^`;
const magicStringRegex = /^\^\^/;
const keysThatRequireTranslation = [
    'ability',
    'name',
    'source',
    'target',
    'line',
];
const parseHelper = (params, funcName, fields) => {
    var _a, _b, _c, _d, _e, _f;
    params = params !== null && params !== void 0 ? params : {};
    const validFields = [];
    for (const value of Object.values(fields)) {
        if (typeof value !== 'object')
            continue;
        validFields.push(value.field);
    }
    Regexes.validateParams(params, funcName, ['capture', ...validFields]);
    // Find the last key we care about, so we can shorten the regex if needed.
    const capture = Regexes.trueIfUndefined(params.capture);
    const fieldKeys = Object.keys(fields);
    let maxKey;
    if (capture) {
        maxKey = fieldKeys[fieldKeys.length - 1];
    }
    else {
        maxKey = 0;
        for (const key of fieldKeys) {
            const value = (_a = fields[key]) !== null && _a !== void 0 ? _a : {};
            if (typeof value !== 'object')
                continue;
            const fieldName = (_b = fields[key]) === null || _b === void 0 ? void 0 : _b.field;
            if (fieldName && fieldName in params)
                maxKey = key;
        }
    }
    // For testing, it's useful to know if this is a regex that requires
    // translation.  We test this by seeing if there are any specified
    // fields, and if so, inserting a magic string that we can detect.
    // This lets us differentiate between "regex that should be translated"
    // e.g. a regex with `target` specified, and "regex that shouldn't"
    // e.g. a gains effect with just effectId specified.
    const transParams = Object.keys(params).filter((k) => keysThatRequireTranslation.includes(k));
    const needsTranslations = NetRegexes.flagTranslationsNeeded && transParams.length > 0;
    // Build the regex from the fields.
    let str = needsTranslations ? magicTranslationString : '^';
    let lastKey = -1;
    for (const _key in fields) {
        const key = parseInt(_key);
        // Fill in blanks.
        const missingFields = key - lastKey - 1;
        if (missingFields === 1)
            str += '\\y{NetField}';
        else if (missingFields > 1)
            str += `\\y{NetField}{${missingFields}}`;
        lastKey = key;
        const value = fields[key];
        if (typeof value !== 'object')
            throw new Error(`${funcName}: invalid value: ${JSON.stringify(value)}`);
        const fieldName = (_c = fields[key]) === null || _c === void 0 ? void 0 : _c.field;
        const fieldValue = (_f = (_e = (_d = fields[key]) === null || _d === void 0 ? void 0 : _d.value) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : matchDefault;
        if (fieldName) {
            str += Regexes.maybeCapture(
            // more accurate type instead of `as` cast
            // maybe this function needs a refactoring
            capture, fieldName, params[fieldName], fieldValue) +
                separator;
        }
        else {
            str += fieldValue + separator;
        }
        // Stop if we're not capturing and don't care about future fields.
        if (key >= (maxKey !== null && maxKey !== void 0 ? maxKey : 0))
            break;
    }
    return Regexes.parse(str);
};
class NetRegexes {
    static setFlagTranslationsNeeded(value) {
        NetRegexes.flagTranslationsNeeded = value;
    }
    static doesNetRegexNeedTranslation(regex) {
        // Need to `setFlagTranslationsNeeded` before calling this function.
        console.assert(NetRegexes.flagTranslationsNeeded);
        const str = typeof regex === 'string' ? regex : regex.source;
        return !!magicStringRegex.exec(str);
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#14-networkstartscasting
     */
    static startsUsing(params) {
        return parseHelper(params, 'startsUsing', {
            0: { field: 'type', value: '20' },
            1: { field: 'timestamp' },
            2: { field: 'sourceId' },
            3: { field: 'source' },
            4: { field: 'id' },
            5: { field: 'ability' },
            6: { field: 'targetId' },
            7: { field: 'target' },
            8: { field: 'castTime' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#15-networkability
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#16-networkaoeability
     */
    static ability(params) {
        return parseHelper(params, 'ability', {
            0: { field: 'type', value: '2[12]' },
            1: { field: 'timestamp' },
            2: { field: 'sourceId' },
            3: { field: 'source' },
            4: { field: 'id' },
            5: { field: 'ability' },
            6: { field: 'targetId' },
            7: { field: 'target' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#15-networkability
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#16-networkaoeability
     */
    static abilityFull(params) {
        return parseHelper(params, 'abilityFull', {
            0: { field: 'type', value: '2[12]' },
            1: { field: 'timestamp' },
            2: { field: 'sourceId' },
            3: { field: 'source' },
            4: { field: 'id' },
            5: { field: 'ability' },
            6: { field: 'targetId' },
            7: { field: 'target' },
            8: { field: 'flags' },
            9: { field: 'damage' },
            24: { field: 'targetCurrentHp' },
            25: { field: 'targetMaxHp' },
            40: { field: 'x' },
            41: { field: 'y' },
            42: { field: 'z' },
            43: { field: 'heading' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#1b-networktargeticon-head-markers
     */
    static headMarker(params) {
        return parseHelper(params, 'headMarker', {
            0: { field: 'type', value: '27' },
            1: { field: 'timestamp' },
            2: { field: 'targetId' },
            3: { field: 'target' },
            6: { field: 'id' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#03-addcombatant
     */
    static addedCombatant(params) {
        return parseHelper(params, 'addedCombatant', {
            0: { field: 'type', value: '03' },
            1: { field: 'timestamp' },
            2: { field: 'id' },
            3: { field: 'name' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#03-addcombatant
     */
    static addedCombatantFull(params) {
        return parseHelper(params, 'addedCombatantFull', {
            0: { field: 'type', value: '03' },
            1: { field: 'timestamp' },
            2: { field: 'id' },
            3: { field: 'name' },
            4: { field: 'job' },
            5: { field: 'level' },
            6: { field: 'ownerId' },
            8: { field: 'world' },
            9: { field: 'npcNameId' },
            10: { field: 'npcBaseId' },
            11: { field: 'currentHp' },
            12: { field: 'hp' },
            17: { field: 'x' },
            18: { field: 'y' },
            19: { field: 'z' },
            20: { field: 'heading' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#04-removecombatant
     */
    static removingCombatant(params) {
        return parseHelper(params, 'removingCombatant', {
            0: { field: 'type', value: '04' },
            1: { field: 'timestamp' },
            2: { field: 'id' },
            3: { field: 'name' },
            12: { field: 'hp' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#1a-networkbuff
     */
    static gainsEffect(params) {
        return parseHelper(params, 'gainsEffect', {
            0: { field: 'type', value: '26' },
            1: { field: 'timestamp' },
            2: { field: 'effectId' },
            3: { field: 'effect' },
            4: { field: 'duration' },
            5: { field: 'sourceId' },
            6: { field: 'source' },
            7: { field: 'targetId' },
            8: { field: 'target' },
            9: { field: 'count' },
        });
    }
    /**
     * Prefer gainsEffect over this function unless you really need extra data.
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#26-networkstatuseffects
     */
    static statusEffectExplicit(params) {
        return parseHelper(params, 'statusEffectExplicit', {
            0: { field: 'type', value: '38' },
            1: { field: 'timestamp' },
            2: { field: 'targetId' },
            3: { field: 'target' },
            5: { field: 'hp' },
            6: { field: 'maxHp' },
            11: { field: 'x' },
            12: { field: 'y' },
            13: { field: 'z' },
            14: { field: 'heading' },
            15: { field: 'data0' },
            16: { field: 'data1' },
            17: { field: 'data2' },
            18: { field: 'data3' },
            19: { field: 'data4' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#1e-networkbuffremove
     */
    static losesEffect(params) {
        return parseHelper(params, 'losesEffect', {
            0: { field: 'type', value: '30' },
            1: { field: 'timestamp' },
            2: { field: 'effectId' },
            3: { field: 'effect' },
            5: { field: 'sourceId' },
            6: { field: 'source' },
            7: { field: 'targetId' },
            8: { field: 'target' },
            9: { field: 'count' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#23-networktether
     */
    static tether(params) {
        return parseHelper(params, 'tether', {
            0: { field: 'type', value: '35' },
            1: { field: 'timestamp' },
            2: { field: 'sourceId' },
            3: { field: 'source' },
            4: { field: 'targetId' },
            5: { field: 'target' },
            8: { field: 'id' },
        });
    }
    /**
     * 'target' was defeated by 'source'
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#19-networkdeath
     */
    static wasDefeated(params) {
        return parseHelper(params, 'wasDefeated', {
            0: { field: 'type', value: '25' },
            1: { field: 'timestamp' },
            2: { field: 'targetId' },
            3: { field: 'target' },
            4: { field: 'sourceId' },
            5: { field: 'source' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#00-logline
     */
    static echo(params) {
        if (typeof params === 'undefined')
            params = {};
        Regexes.validateParams(params, 'echo', ['type', 'timestamp', 'code', 'name', 'line', 'capture']);
        params.code = '0038';
        return NetRegexes.gameLog(params);
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#00-logline
     */
    static dialog(params) {
        if (typeof params === 'undefined')
            params = {};
        Regexes.validateParams(params, 'dialog', ['type', 'timestamp', 'code', 'name', 'line', 'capture']);
        params.code = '0044';
        return NetRegexes.gameLog(params);
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#00-logline
     */
    static message(params) {
        if (typeof params === 'undefined')
            params = {};
        Regexes.validateParams(params, 'message', ['type', 'timestamp', 'code', 'name', 'line', 'capture']);
        params.code = '0839';
        return NetRegexes.gameLog(params);
    }
    /**
     * fields: code, name, line, capture
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#00-logline
     */
    static gameLog(params) {
        return parseHelper(params, 'gameLog', {
            0: { field: 'type', value: '00' },
            1: { field: 'timestamp' },
            2: { field: 'code' },
            3: { field: 'name' },
            4: { field: 'line' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#00-logline
     */
    static gameNameLog(params) {
        // for compat with Regexes.
        return NetRegexes.gameLog(params);
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#0c-playerstats
     */
    static statChange(params) {
        return parseHelper(params, 'statChange', {
            0: { field: 'type', value: '12' },
            1: { field: 'timestamp' },
            2: { field: 'job' },
            3: { field: 'strength' },
            4: { field: 'dexterity' },
            5: { field: 'vitality' },
            6: { field: 'intelligence' },
            7: { field: 'mind' },
            8: { field: 'piety' },
            9: { field: 'attackPower' },
            10: { field: 'directHit' },
            11: { field: 'criticalHit' },
            12: { field: 'attackMagicPotency' },
            13: { field: 'healMagicPotency' },
            14: { field: 'determination' },
            15: { field: 'skillSpeed' },
            16: { field: 'spellSpeed' },
            18: { field: 'tenacity' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#01-changezone
     */
    static changeZone(params) {
        return parseHelper(params, 'changeZone', {
            0: { field: 'type', value: '01' },
            1: { field: 'timestamp' },
            2: { field: 'id' },
            3: { field: 'name' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#21-network6d-actor-control-lines
     */
    static network6d(params) {
        return parseHelper(params, 'network6d', {
            0: { field: 'type', value: '33' },
            1: { field: 'timestamp' },
            2: { field: 'instance' },
            3: { field: 'command' },
            4: { field: 'data0' },
            5: { field: 'data1' },
            6: { field: 'data2' },
            7: { field: 'data3' },
        });
    }
    /**
     * matches: https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md#22-networknametoggle
     */
    static nameToggle(params) {
        return parseHelper(params, 'nameToggle', {
            0: { field: 'type', value: '34' },
            1: { field: 'timestamp' },
            2: { field: 'id' },
            3: { field: 'name' },
            6: { field: 'toggle' },
        });
    }
}
NetRegexes.flagTranslationsNeeded = false;

;// CONCATENATED MODULE: ./resources/translations.ts


// Fill in LocaleRegex so that things like LocaleRegex.countdownStart.de is a valid regex.
const localeLines = {
    countdownStart: {
        en: 'Battle commencing in (?<time>\\y{Float}) seconds! \\((?<player>.*?)\\)',
        de: 'Noch (?<time>\\y{Float}) Sekunden bis Kampfbeginn! \\((?<player>.*?)\\)',
        fr: 'Début du combat dans (?<time>\\y{Float}) secondes[ ]?! \\((?<player>.*?)\\)',
        ja: '戦闘開始まで(?<time>\\y{Float})秒！ \\((?<player>.*?)\\)',
        cn: '距离战斗开始还有(?<time>\\y{Float})秒！ （(?<player>.*?)）',
        ko: '전투 시작 (?<time>\\y{Float})초 전! \\((?<player>.*?)\\)',
    },
    countdownEngage: {
        en: 'Engage!',
        de: 'Start!',
        fr: 'À l\'attaque[ ]?!',
        ja: '戦闘開始！',
        cn: '战斗开始！',
        ko: '전투 시작!',
    },
    countdownCancel: {
        en: 'Countdown canceled by (?<player>\\y{Name})',
        de: '(?<player>\\y{Name}) hat den Countdown abgebrochen',
        fr: 'Le compte à rebours a été interrompu par (?<player>\\y{Name})[ ]?\\.',
        ja: '(?<player>\\y{Name})により、戦闘開始カウントがキャンセルされました。',
        cn: '(?<player>\\y{Name})取消了战斗开始倒计时。',
        ko: '(?<player>\\y{Name}) 님이 초읽기를 취소했습니다\\.',
    },
    areaSeal: {
        en: '(?<area>.*?) will be sealed off in (?<time>\\y{Float}) seconds!',
        de: 'Noch (?<time>\\y{Float}) Sekunden, bis sich (?<area>.*?) schließt',
        fr: 'Fermeture (?<area>.*?) dans (?<time>\\y{Float}) secondes[ ]?\\.',
        ja: '(?<area>.*?)の封鎖まであと(?<time>\\y{Float})秒',
        cn: '距(?<area>.*?)被封锁还有(?<time>\\y{Float})秒',
        ko: '(?<time>\\y{Float})초 후에 (?<area>.*?)(이|가) 봉쇄됩니다\\.',
    },
    areaUnseal: {
        en: '(?<area>.*?) is no longer sealed.',
        de: '(?<area>.*?) öffnet sich erneut.',
        fr: 'Ouverture (?<area>.*?)[ ]?!',
        ja: '(?<area>.*?)の封鎖が解かれた……',
        cn: '(?<area>.*?)的封锁解除了',
        ko: '(?<area>.*?)의 봉쇄가 해제되었습니다\\.',
    },
    // Recipe name always start with \ue0bb
    // HQ icon is \ue03c
    craftingStart: {
        en: 'You begin synthesizing (?<count>(an?|\\d+) )?\ue0bb(?<recipe>.*)\\.',
        de: 'Du hast begonnen, durch Synthese (?<count>(ein(e|es|em|er)?|\\d+) )?\ue0bb(?<recipe>.*) herzustellen\\.',
        fr: 'Vous commencez à fabriquer (?<count>(une?|\\d+) )?\ue0bb(?<recipe>.*)\\.',
        ja: '(?<player>\\y{Name})は\ue0bb(?<recipe>.*)(×(?<count>\\d+))?の製作を開始した。',
        cn: '(?<player>\\y{Name})开始制作“\ue0bb(?<recipe>.*)”(×(?<count>\\d+))?。',
        ko: '\ue0bb(?<recipe>.*)(×(?<count>\\d+)개)? 제작을 시작합니다\\.',
    },
    trialCraftingStart: {
        en: 'You begin trial synthesis of \ue0bb(?<recipe>.*)\\.',
        de: 'Du hast mit der Testsynthese von \ue0bb(?<recipe>.*) begonnen\\.',
        fr: 'Vous commencez une synthèse d\'essai pour une? \ue0bb(?<recipe>.*)\\.',
        ja: '(?<player>\\y{Name})は\ue0bb(?<recipe>.*)の製作練習を開始した。',
        cn: '(?<player>\\y{Name})开始练习制作\ue0bb(?<recipe>.*)。',
        ko: '\ue0bb(?<recipe>.*) 제작 연습을 시작합니다\\.',
    },
    craftingFinish: {
        en: 'You synthesize (?<count>(an?|\\d+) )?\ue0bb(?<recipe>.*)(\ue03c)?\\.',
        de: 'Du hast erfolgreich (?<count>(ein(e|es|em|er)?|\\d+) )?(?<recipe>.*)(\ue03c)? hergestellt\\.',
        fr: 'Vous fabriquez (?<count>(une?|\\d+) )?\ue0bb(?<recipe>.*)(\ue03c)?\\.',
        ja: '(?<player>\\y{Name})は\ue0bb(?<recipe>.*)(\ue03c)?(×(?<count>\\d+))?を完成させた！',
        cn: '(?<player>\\y{Name})制作“\ue0bb(?<recipe>.*)(\ue03c)?”(×(?<count>\\d+))?成功！',
        ko: '(?<player>\\y{Name}) 님이 \ue0bb(?<recipe>.*)(\ue03c)?(×(?<count>\\d+)개)?(을|를) 완성했습니다!',
    },
    trialCraftingFinish: {
        en: 'Your trial synthesis of \ue0bb(?<recipe>.*) proved a success!',
        de: 'Die Testsynthese von \ue0bb(?<recipe>.*) war erfolgreich!',
        fr: 'Votre synthèse d\'essai pour fabriquer \ue0bb(?<recipe>.*) a été couronnée de succès!',
        ja: '(?<player>\\y{Name})は\ue0bb(?<recipe>.*)の製作練習に成功した！',
        cn: '(?<player>\\y{Name})练习制作\ue0bb(?<recipe>.*)成功了！',
        ko: '\ue0bb(?<recipe>.*) 제작 연습에 성공했습니다!',
    },
    craftingFail: {
        en: 'Your synthesis fails!',
        de: 'Deine Synthese ist fehlgeschlagen!',
        fr: 'La synthèse échoue\\.{3}',
        ja: '(?<player>\\y{Name})は製作に失敗した……',
        cn: '(?<player>\\y{Name})制作失败了……',
        ko: '제작에 실패했습니다……\\.',
    },
    trialCraftingFail: {
        en: 'Your trial synthesis of \ue0bb(?<recipe>.*) failed\\.{3}',
        de: 'Die Testsynthese von \ue0bb(?<recipe>.*) ist fehlgeschlagen\\.{3}',
        fr: 'Votre synthèse d\'essai pour fabriquer \ue0bb(?<recipe>.*) s\'est soldée par un échec\\.{3}',
        ja: '(?<player>\\y{Name})は\ue0bb(?<recipe>.*)の製作練習に失敗した……',
        cn: '(?<player>\\y{Name})练习制作\ue0bb(?<recipe>.*)失败了……',
        ko: '\ue0bb(?<recipe>.*) 제작 연습에 실패했습니다……\\.',
    },
    craftingCancel: {
        en: 'You cancel the synthesis\\.',
        de: 'Du hast die Synthese abgebrochen\\.',
        fr: 'La synthèse est annulée\\.',
        ja: '(?<player>\\y{Name})は製作を中止した。',
        cn: '(?<player>\\y{Name})中止了制作作业。',
        ko: '제작을 중지했습니다\\.',
    },
    trialCraftingCancel: {
        en: 'You abandoned trial synthesis\\.',
        de: 'Testsynthese abgebrochen\\.',
        fr: 'Vous avez interrompu la synthèse d\'essai\\.',
        ja: '(?<player>\\y{Name})は製作練習を中止した。',
        cn: '(?<player>\\y{Name})停止了练习。',
        ko: '제작 연습을 중지했습니다\\.',
    },
};
class RegexSet {
    get localeRegex() {
        if (this.regexes)
            return this.regexes;
        this.regexes = this.buildLocaleRegexes(localeLines, (s) => Regexes.gameLog({ line: s + '.*?' }));
        return this.regexes;
    }
    get localeNetRegex() {
        if (this.netRegexes)
            return this.netRegexes;
        this.netRegexes = this.buildLocaleRegexes(localeLines, (s) => NetRegexes.gameLog({ line: s + '[^|]*?' }));
        return this.netRegexes;
    }
    buildLocaleRegexes(locales, builder) {
        return Object.fromEntries(Object
            .entries(locales)
            .map(([key, lines]) => [key, this.buildLocaleRegex(lines, builder)]));
    }
    buildLocaleRegex(lines, builder) {
        const regexEn = builder(lines.en);
        return {
            en: regexEn,
            de: lines.de ? builder(lines.de) : regexEn,
            fr: lines.fr ? builder(lines.fr) : regexEn,
            ja: lines.ja ? builder(lines.ja) : regexEn,
            cn: lines.cn ? builder(lines.cn) : regexEn,
            ko: lines.ko ? builder(lines.ko) : regexEn,
        };
    }
}
const regexSet = new RegexSet();
const LocaleRegex = regexSet.localeRegex;
const LocaleNetRegex = regexSet.localeNetRegex;

;// CONCATENATED MODULE: ./ui/raidboss/emulator/EmulatorCommon.ts


class EmulatorCommon {
    static cloneData(data, exclude = ['options', 'party']) {
        const ret = {};
        // Use extra logic for top-level extend for property exclusion
        // This cut the execution time of this code from 41,000ms to 50ms when parsing a 12 minute pull
        for (const i in data) {
            if (exclude.includes(i))
                continue;
            if (typeof data[i] === 'object')
                ret[i] = EmulatorCommon._cloneData(data[i]);
            else
                // Assignment of any to any. See DataType definition above for reasoning.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                ret[i] = data[i];
        }
        return ret;
    }
    static _cloneData(data) {
        if (typeof data === 'object') {
            if (Array.isArray(data)) {
                const ret = [];
                for (let i = 0; i < data.length; ++i)
                    ret[i] = EmulatorCommon._cloneData(data[i]);
                return ret;
            }
            if (data === null)
                return null;
            if (data instanceof RegExp)
                return new RegExp(data);
            const ret = {};
            for (const i in data)
                ret[i] = EmulatorCommon._cloneData(data[i]);
            return ret;
        }
        return data;
    }
    static timeToString(time, includeMillis = true) {
        const negative = time < 0 ? '-' : '';
        time = Math.abs(time);
        const millisNum = time % 1000;
        const secsNum = ((time % (60 * 1000)) - millisNum) / 1000;
        // Milliseconds
        const millis = `00${millisNum}`.substr(-3);
        const secs = `0${secsNum}`.substr(-2);
        const mins = `0${((((time % (60 * 60 * 1000)) - millisNum) / 1000) - secsNum) / 60}`.substr(-2);
        return negative + mins + ':' + secs + (includeMillis ? '.' + millis : '');
    }
    static timeToDateString(time) {
        return this.dateObjectToDateString(new Date(time));
    }
    static dateObjectToDateString(date) {
        const year = date.getFullYear();
        const month = EmulatorCommon.zeroPad((date.getMonth() + 1).toString());
        const day = EmulatorCommon.zeroPad(date.getDate().toString());
        return `${year}-${month}-${day}`;
    }
    static timeToTimeString(time, includeMillis = false) {
        return this.dateObjectToTimeString(new Date(time), includeMillis);
    }
    static dateObjectToTimeString(date, includeMillis = false) {
        const hour = EmulatorCommon.zeroPad(date.getHours().toString());
        const minute = EmulatorCommon.zeroPad(date.getMinutes().toString());
        const second = EmulatorCommon.zeroPad(date.getSeconds().toString());
        let ret = `${hour}:${minute}:${second}`;
        if (includeMillis)
            ret = ret + `.${date.getMilliseconds()}`;
        return ret;
    }
    static msToDuration(ms) {
        const tmp = EmulatorCommon.timeToString(ms, false);
        return tmp.replace(':', 'm') + 's';
    }
    static dateTimeToString(time, includeMillis = false) {
        const date = new Date(time);
        return `${this.dateObjectToDateString(date)} ${this.dateObjectToTimeString(date, includeMillis)}`;
    }
    static zeroPad(str, len = 2) {
        return ('' + str).padStart(len, '0');
    }
    static properCase(str) {
        return str.replace(/([^\W_]+[^\s-]*) */g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
    static spacePadLeft(str, len) {
        return str.padStart(len, ' ');
    }
    static doesLineMatch(line, regexes) {
        if (regexes instanceof RegExp)
            return regexes.exec(line);
        for (const langStr in regexes) {
            const lang = langStr;
            const res = regexes[lang].exec(line);
            if (res) {
                if (res.groups)
                    res.groups.language = lang;
                return res;
            }
        }
        return null;
    }
    static matchStart(line) {
        var _a, _b, _c, _d;
        let res;
        // Currently all of these regexes have groups if they match at all,
        // but be robust to that changing in the future.
        res = EmulatorCommon.doesLineMatch(line, EmulatorCommon.countdownRegexes);
        if (res) {
            (_a = res.groups) !== null && _a !== void 0 ? _a : (res.groups = {});
            res.groups.StartIn = (parseInt((_b = res.groups.time) !== null && _b !== void 0 ? _b : '0') * 1000).toString();
            res.groups.StartType = 'Countdown';
            return res;
        }
        res = EmulatorCommon.doesLineMatch(line, EmulatorCommon.sealRegexes);
        if (res) {
            (_c = res.groups) !== null && _c !== void 0 ? _c : (res.groups = {});
            res.groups.StartIn = '0';
            res.groups.StartType = 'Seal';
            return res;
        }
        res = EmulatorCommon.doesLineMatch(line, EmulatorCommon.engageRegexes);
        if (res) {
            (_d = res.groups) !== null && _d !== void 0 ? _d : (res.groups = {});
            res.groups.StartIn = '0';
            res.groups.StartType = 'Engage';
            return res;
        }
    }
    static matchEnd(line) {
        var _a, _b, _c, _d;
        let res;
        // Currently all of these regexes have groups if they match at all,
        // but be robust to that changing in the future.
        res = EmulatorCommon.doesLineMatch(line, EmulatorCommon.winRegex);
        if (res) {
            (_a = res.groups) !== null && _a !== void 0 ? _a : (res.groups = {});
            res.groups.EndType = 'Win';
            return res;
        }
        res = EmulatorCommon.doesLineMatch(line, EmulatorCommon.wipeRegex);
        if (res) {
            (_b = res.groups) !== null && _b !== void 0 ? _b : (res.groups = {});
            res.groups.EndType = 'Wipe';
            return res;
        }
        res = EmulatorCommon.doesLineMatch(line, EmulatorCommon.cactbotWipeRegex);
        if (res) {
            (_c = res.groups) !== null && _c !== void 0 ? _c : (res.groups = {});
            res.groups.EndType = 'Cactbot Wipe';
            return res;
        }
        res = EmulatorCommon.doesLineMatch(line, EmulatorCommon.unsealRegexes);
        if (res) {
            (_d = res.groups) !== null && _d !== void 0 ? _d : (res.groups = {});
            res.groups.EndType = 'Unseal';
            return res;
        }
    }
}
EmulatorCommon.sealRegexes = LocaleNetRegex.areaSeal;
EmulatorCommon.engageRegexes = LocaleNetRegex.countdownEngage;
EmulatorCommon.countdownRegexes = LocaleNetRegex.countdownStart;
EmulatorCommon.unsealRegexes = LocaleNetRegex.areaUnseal;
EmulatorCommon.wipeRegex = NetRegexes.network6d({ command: '40000010' });
EmulatorCommon.winRegex = NetRegexes.network6d({ command: '40000003' });
EmulatorCommon.cactbotWipeRegex = NetRegexes.echo({ line: 'cactbot wipe.*?' });

;// CONCATENATED MODULE: ./resources/not_reached.ts
// Helper Error for TypeScript situations where the programmer thinks they
// know better than TypeScript that some situation will never occur.
// The intention here is that the programmer does not expect a particular
// bit of code to happen, and so has not written careful error handling.
// If it does occur, at least there will be an error and we can figure out why.
// This is preferable to casting or disabling TypeScript altogether in order to
// avoid syntax errors.
// One common example is a regex, where if the regex matches then all of the
// (non-optional) regex groups will also be valid, but TypeScript doesn't know.
class UnreachableCode extends Error {
    constructor() {
        super('This code shouldn\'t be reached');
    }
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/Combatant.ts

class Combatant {
    constructor(id, name) {
        this.name = '';
        this.server = '';
        this.states = {};
        this.significantStates = [];
        this.latestTimestamp = -1;
        this.id = id;
        this.setName(name);
    }
    setName(name) {
        var _a, _b, _c;
        // Sometimes network lines arrive after the combatant has been cleared
        // from memory in the client, so the network line will have a valid ID
        // but the name will be blank. Since we're tracking the name for the
        // entire fight and not on a state-by-state basis, we don't want to
        // blank out a name in this case.
        // If a combatant actually has a blank name, that's still allowed by
        // the constructor.
        if (name === '')
            return;
        const parts = name.split('(');
        this.name = (_a = parts[0]) !== null && _a !== void 0 ? _a : '';
        if (parts.length > 1)
            this.server = (_c = (_b = parts[1]) === null || _b === void 0 ? void 0 : _b.replace(/\)$/, '')) !== null && _c !== void 0 ? _c : '';
    }
    hasState(timestamp) {
        return this.states[timestamp] !== undefined;
    }
    pushState(timestamp, state) {
        this.states[timestamp] = state;
        this.latestTimestamp = timestamp;
        if (!this.significantStates.includes(timestamp))
            this.significantStates.push(timestamp);
    }
    nextSignificantState(timestamp) {
        var _a;
        // Shortcut out if this is significant or if there's no higher significant state
        const index = this.significantStates.indexOf(timestamp);
        const lastSignificantStateIndex = this.significantStates.length - 1;
        // If timestamp is a significant state already, and it's not the last one, return the next
        if (index >= 0 && index < lastSignificantStateIndex)
            return this.getStateByIndex(index + 1);
        // If timestamp is the last significant state or the timestamp is past the last significant
        // state, return the last significant state
        else if (index === lastSignificantStateIndex ||
            timestamp > ((_a = this.significantStates[lastSignificantStateIndex]) !== null && _a !== void 0 ? _a : 0))
            return this.getStateByIndex(lastSignificantStateIndex);
        for (let i = 0; i < this.significantStates.length; ++i) {
            const stateIndex = this.significantStates[i];
            if (stateIndex && stateIndex > timestamp)
                return this.getStateByIndex(i);
        }
        return this.getStateByIndex(this.significantStates.length - 1);
    }
    pushPartialState(timestamp, props) {
        var _a;
        if (this.states[timestamp] === undefined) {
            // Clone the last state before this timestamp
            const stateTimestamp = (_a = this.significantStates
                .filter((s) => s < timestamp)
                .sort((a, b) => b - a)[0]) !== null && _a !== void 0 ? _a : this.significantStates[0];
            if (stateTimestamp === undefined)
                throw new UnreachableCode();
            const state = this.states[stateTimestamp];
            if (!state)
                throw new UnreachableCode();
            this.states[timestamp] = state.partialClone(props);
        }
        else {
            const state = this.states[timestamp];
            if (!state)
                throw new UnreachableCode();
            this.states[timestamp] = state.partialClone(props);
        }
        this.latestTimestamp = Math.max(this.latestTimestamp, timestamp);
        const lastSignificantStateTimestamp = this.significantStates[this.significantStates.length - 1];
        if (!lastSignificantStateTimestamp)
            throw new UnreachableCode();
        const oldStateJSON = JSON.stringify(this.states[lastSignificantStateTimestamp]);
        const newStateJSON = JSON.stringify(this.states[timestamp]);
        if (lastSignificantStateTimestamp !== timestamp && newStateJSON !== oldStateJSON)
            this.significantStates.push(timestamp);
    }
    getState(timestamp) {
        const stateByTimestamp = this.states[timestamp];
        if (stateByTimestamp)
            return stateByTimestamp;
        const initialTimestamp = this.significantStates[0];
        if (initialTimestamp === undefined)
            throw new UnreachableCode();
        if (timestamp < initialTimestamp)
            return this.getStateByIndex(0);
        let i = 0;
        for (; i < this.significantStates.length; ++i) {
            const prevTimestamp = this.significantStates[i];
            if (prevTimestamp === undefined)
                throw new UnreachableCode();
            if (prevTimestamp > timestamp)
                return this.getStateByIndex(i - 1);
        }
        return this.getStateByIndex(i - 1);
    }
    // Should only be called when `index` is valid.
    getStateByIndex(index) {
        const stateIndex = this.significantStates[index];
        if (stateIndex === undefined)
            throw new UnreachableCode();
        const state = this.states[stateIndex];
        if (state === undefined)
            throw new UnreachableCode();
        return state;
    }
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/CombatantJobSearch.ts
class CombatantJobSearch {
    static getJob(abilityId) {
        var _a;
        for (const job in CombatantJobSearch.abilities) {
            if ((_a = CombatantJobSearch.abilities[job]) === null || _a === void 0 ? void 0 : _a.includes(abilityId))
                return job;
        }
    }
}
CombatantJobSearch.abilityMatchRegex = /[a-fA-F0-9]{1,4}/i;
CombatantJobSearch.abilities = {
    PLD: [
        12959, 12961, 12964, 12967, 12968, 12969, 12970, 12971, 12972, 12973, 12974, 12975,
        12976, 12978, 12980, 12981, 12982, 12983, 12984, 12985, 12986, 12987, 12988, 12989,
        12991, 12992, 12993, 12994, 12996, 13000, 13001, 13006, 14480, 16457, 16458, 16459,
        16460, 16461, 17669, 17671, 17672, 17691, 17692, 17693, 17694, 17866, 18050, 27, 29,
        30, 3538, 3539, 3540, 3541, 3542, 4284, 4285, 4286, 50207, 50209, 50246, 50260, 50261,
        50262, 50263, 50264, 7382, 7383, 7384, 7385, 8746, 8749, 8750, 8751, 8752, 8754, 8755,
        8756,
    ],
    WAR: [
        16462, 16463, 16464, 16465, 17695, 17696, 17697, 17698, 17889, 3549, 3550, 3551, 3552,
        4289, 4290, 4291, 49, 50157, 50218, 50249, 50265, 50266, 50267, 50268, 50269, 51, 52,
        7386, 7387, 7388, 7389, 8758, 8761, 8762, 8763, 8764, 8765, 8767, 8768,
    ],
    DRK: [
        16466, 16467, 16468, 16469, 16470, 16471, 16472, 17700, 17701, 17702, 3617, 3621, 3623,
        3624, 3625, 3629, 3632, 3634, 3636, 3638, 3639, 3640, 3641, 3643, 4303, 4304, 4305, 4306,
        4307, 4308, 4309, 4310, 4311, 4312, 4680, 50158, 50159, 50271, 50272, 50319, 7390, 7391,
        7392, 7393, 8769, 8772, 8773, 8775, 8776, 8777, 8778, 8779,
    ],
    GNB: [
        17703, 17704, 17705, 17706, 17707, 17708, 17709, 17710, 17711, 17712, 17713, 17714,
        17716, 17717, 17890, 17891, 16137, 50320, 16138, 16139, 16140, 16141, 16142, 16143,
        16144, 16145, 16162, 50257, 16148, 16149, 16151, 16152, 50258, 16153, 16154, 16146,
        16147, 16150, 16159, 16160, 16161, 16155, 16156, 16157, 16158, 16163, 16164, 16165,
        50259,
    ],
    WHM: [
        12958, 12962, 12965, 12997, 13002, 13003, 13004, 13005, 131, 136, 137, 139, 140, 14481,
        1584, 16531, 16532, 16533, 16534, 16535, 16536, 17688, 17689, 17690, 17789, 17790, 17791,
        17793, 17794, 17832, 3568, 3569, 3570, 3571, 4296, 4297, 50181, 50182, 50196, 50307,
        50308, 50309, 50310, 7430, 7431, 7432, 7433, 8895, 8896, 8900, 9621, 127, 133,
    ],
    SCH: [
        16537, 16538, 16539, 16540, 16541, 16542, 16543, 16544, 16545, 16546, 16547, 16548, 16550,
        16551, 166, 167, 17215, 17216, 17795, 17796, 17797, 17798, 17802, 17864, 17865, 17869,
        17870, 17990, 185, 186, 188, 189, 190, 3583, 3584, 3585, 3586, 3587, 4300, 50184, 50214,
        50311, 50312, 50313, 50324, 7434, 7435, 7436, 7437, 7438, 7869, 802, 803, 805, 8904, 8905,
        8909, 9622,
    ],
    AST: [
        10027, 10028, 10029, 16552, 16553, 16554, 16555, 16556, 16557, 16558, 16559, 17055, 17151,
        17152, 17804, 17805, 17806, 17807, 17809, 17991, 3590, 3593, 3594, 3595, 3596, 3598, 3599,
        3600, 3601, 3603, 3604, 3605, 3606, 3608, 3610, 3612, 3613, 3614, 3615, 4301, 4302, 4401,
        4402, 4403, 4404, 4405, 4406, 4677, 4678, 4679, 50122, 50124, 50125, 50186, 50187, 50188,
        50189, 50314, 50315, 50316, 7439, 7440, 7441, 7442, 7443, 7444, 7445, 7448, 8324, 8913,
        8914, 8916, 9629,
    ],
    MNK: [
        12960, 12963, 12966, 12977, 12979, 12990, 12995, 12998, 12999, 14476, 14478, 16473, 16474,
        16475, 16476, 17674, 17675, 17676, 17677, 17719, 17720, 17721, 17722, 17723, 17724, 17725,
        17726, 3543, 3545, 3546, 3547, 4262, 4287, 4288, 50160, 50161, 50245, 50273, 50274, 63, 70,
        71, 7394, 7395, 7396, 74, 8780, 8781, 8782, 8783, 8784, 8785, 8787, 8789, 8925,
    ],
    DRG: [
        16477, 16478, 16479, 16480, 17728, 17729, 3553, 3554, 3555, 3556, 3557, 4292, 4293, 50162,
        50163, 50247, 50275, 50276, 7397, 7398, 7399, 7400, 86, 8791, 8792, 8793, 8794, 8795,
        8796, 8797, 8798, 8799, 8802, 8803, 8804, 8805, 8806, 92, 94, 95, 96, 9640, 75, 78,
    ],
    NIN: [
        16488, 16489, 16491, 16492, 16493, 17413, 17414, 17415, 17416, 17417, 17418, 17419, 17420,
        17732, 17733, 17734, 17735, 17736, 17737, 17738, 17739, 2246, 2259, 2260, 2261, 2262,
        2263, 2264, 2265, 2266, 2267, 2268, 2269, 2270, 2271, 2272, 3563, 3566, 4295, 50165,
        50166, 50167, 50250, 50279, 50280, 7401, 7402, 7403, 8807, 8808, 8809, 8810, 8812, 8814,
        8815, 8816, 8820, 9461,
    ],
    SAM: [
        16481, 16482, 16483, 16484, 16485, 16486, 16487, 17740, 17741, 17742, 17743, 17744, 50208,
        50215, 50277, 50278, 7477, 7478, 7479, 7480, 7481, 7482, 7483, 7484, 7485, 7486, 7487,
        7488, 7489, 7490, 7491, 7492, 7493, 7494, 7495, 7496, 7497, 7498, 7499, 7501, 7502, 7855,
        7857, 7867, 8821, 8822, 8823, 8824, 8825, 8826, 8828, 8829, 8830, 8831, 8833,
    ],
    BRD: [
        10023, 114, 116, 117, 118, 13007, 14479, 16494, 16495, 16496, 17678, 17679, 17680, 17681,
        17682, 17745, 17747, 3558, 3559, 3560, 3561, 3562, 4294, 50168, 50169, 50282, 50283, 50284,
        50285, 50286, 50287, 7404, 7405, 7406, 7407, 7408, 7409, 8836, 8837, 8838, 8839, 8841,
        8842, 8843, 8844, 9625, 106,
    ],
    MCH: [
        16497, 16498, 16499, 16500, 16501, 16502, 16503, 16504, 16766, 16889, 17206, 17209, 17749,
        17750, 17751, 17752, 17753, 17754, 2864, 2866, 2868, 2870, 2872, 2873, 2874, 2876, 2878,
        2890, 4276, 4675, 4676, 50117, 50119, 50288, 50289, 50290, 50291, 50292, 50293, 50294,
        7410, 7411, 7412, 7413, 7414, 7415, 7416, 7418, 8848, 8849, 8850, 8851, 8853, 8855,
    ],
    DNC: [
        17756, 17757, 17758, 17759, 17760, 17761, 17762, 17763, 17764, 17765, 17766, 17767,
        17768, 17769, 17770, 17771, 17772, 17773, 17824, 17825, 17826, 17827, 17828, 17829,
        18076, 15989, 15990, 15993, 15997, 15999, 16000, 16001, 16002, 16003, 16191, 16192,
        15991, 15994, 16007, 50252, 15995, 15992, 15996, 16008, 16010, 50251, 16015, 16012,
        16006, 18073, 50253, 16011, 16009, 50254, 15998, 16004, 16193, 16194, 16195, 16196,
        16013, 16005, 50255, 50256, 16014,
    ],
    BLM: [
        14477, 153, 154, 158, 159, 162, 16505, 16506, 16507, 17683, 17684, 17685, 17686, 17687,
        17774, 17775, 3573, 3574, 3575, 3576, 3577, 4298, 50171, 50172, 50173, 50174, 50295,
        50296, 50297, 50321, 50322, 7419, 7420, 7421, 7422, 8858, 8859, 8860, 8861, 8862, 8863,
        8864, 8865, 8866, 8867, 8869, 9637, 149, 155, 141, 152,
    ],
    SMN: [
        16510, 16511, 16513, 16514, 16515, 16516, 16517, 16518, 16519, 16522, 16523, 16549,
        16795, 16796, 16797, 16798, 16799, 16800, 16801, 16802, 16803, 17777, 17778, 17779,
        17780, 17781, 17782, 17783, 17784, 17785, 180, 184, 3578, 3579, 3580, 3581, 3582, 4299,
        50176, 50177, 50178, 50213, 50217, 50298, 50299, 50300, 50301, 50302, 7423, 7424, 7425,
        7426, 7427, 7428, 7429, 7449, 7450, 787, 788, 791, 792, 794, 796, 797, 798, 800, 801,
        8872, 8873, 8874, 8877, 8878, 8879, 8880, 8881, 9014, 9432,
    ],
    RDM: [
        10025, 16524, 16525, 16526, 16527, 16528, 16529, 16530, 17786, 17787, 17788, 50195,
        50200, 50201, 50216, 50303, 50304, 50305, 50306, 7503, 7504, 7505, 7506, 7507, 7509,
        7510, 7511, 7512, 7513, 7514, 7515, 7516, 7517, 7518, 7519, 7520, 7521, 7523, 7524,
        7525, 7526, 7527, 7528, 7529, 7530, 8882, 8883, 8884, 8885, 8887, 8888, 8889, 8890,
        8891, 8892, 9433, 9434,
    ],
    BLU: [
        11715, 11383, 11384, 11385, 11386, 11387, 11388, 11389, 11390, 11391, 11392, 11393,
        11394, 11395, 11396, 11397, 11398, 11399, 11400, 11401, 11402, 11403, 11404, 11405,
        11406, 11407, 11408, 11409, 11410, 11411, 11412, 11413, 11414, 11415, 11416, 11417,
        11418, 11419, 11420, 11421, 11422, 11423, 11424, 11425, 11426, 11427, 11428, 11429,
        11430, 11431, 50219, 50220, 50221, 50222, 50223, 50224,
    ],
};

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/CombatantState.ts
class CombatantState {
    constructor(posX, posY, posZ, heading, targetable, hp, maxHp, mp, maxMp) {
        this.posX = posX;
        this.posY = posY;
        this.posZ = posZ;
        this.heading = heading;
        this.targetable = targetable;
        this.hp = hp;
        this.maxHp = maxHp;
        this.mp = mp;
        this.maxMp = maxMp;
    }
    partialClone(props) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return new CombatantState((_a = props.posX) !== null && _a !== void 0 ? _a : this.posX, (_b = props.posY) !== null && _b !== void 0 ? _b : this.posY, (_c = props.posZ) !== null && _c !== void 0 ? _c : this.posZ, (_d = props.heading) !== null && _d !== void 0 ? _d : this.heading, (_e = props.targetable) !== null && _e !== void 0 ? _e : this.targetable, (_f = props.hp) !== null && _f !== void 0 ? _f : this.hp, (_g = props.maxHp) !== null && _g !== void 0 ? _g : this.maxHp, (_h = props.mp) !== null && _h !== void 0 ? _h : this.mp, (_j = props.maxMp) !== null && _j !== void 0 ? _j : this.maxMp);
    }
    toPluginState() {
        return {
            PosX: this.posX,
            PosY: this.posY,
            PosZ: this.posZ,
            Heading: this.heading,
            CurrentHP: this.hp,
            MaxHP: this.maxHp,
            CurrentMP: this.mp,
            MaxMP: this.maxMp,
        };
    }
}

;// CONCATENATED MODULE: ./resources/pet_names.ts
// Auto-generated from gen_pet_names.py
// DO NOT EDIT THIS FILE DIRECTLY
const data = {
    'cn': [
        '绿宝石兽',
        '黄宝石兽',
        '伊弗利特之灵',
        '泰坦之灵',
        '迦楼罗之灵',
        '朝日小仙女',
        '夕月小仙女',
        '车式浮空炮塔',
        '象式浮空炮塔',
        '亚灵神巴哈姆特',
        '亚灵神不死鸟',
        '炽天使',
        '月长宝石兽',
        '英雄的掠影',
        '后式自走人偶',
        '分身',
    ],
    'de': [
        'Smaragd-Karfunkel',
        'Topas-Karfunkel',
        'Ifrit-Egi',
        'Titan-Egi',
        'Garuda-Egi',
        'Eos',
        'Selene',
        'Selbstschuss-Gyrocopter TURM',
        'Selbstschuss-Gyrocopter LÄUFER',
        'Demi-Bahamut',
        'Demi-Phönix',
        'Seraph',
        'Mondstein-Karfunkel',
        'Schattenschemen',
        'Automaton DAME',
        'Gedoppeltes Ich',
    ],
    'en': [
        'Emerald Carbuncle',
        'Topaz Carbuncle',
        'Ifrit-Egi',
        'Titan-Egi',
        'Garuda-Egi',
        'Eos',
        'Selene',
        'Rook Autoturret',
        'Bishop Autoturret',
        'Demi-Bahamut',
        'Demi-Phoenix',
        'Seraph',
        'Moonstone Carbuncle',
        'Esteem',
        'Automaton Queen',
        'Bunshin',
    ],
    'fr': [
        'Carbuncle émeraude',
        'Carbuncle topaze',
        'Ifrit-Egi',
        'Titan-Egi',
        'Garuda-Egi',
        'Eos',
        'Selene',
        'Auto-tourelle Tour',
        'Auto-tourelle Fou',
        'Demi-Bahamut',
        'Demi-Phénix',
        'Séraphin',
        'Carbuncle hécatolite',
        'Estime',
        'Automate Reine',
        'Ombre',
    ],
    'ja': [
        'カーバンクル・エメラルド',
        'カーバンクル・トパーズ',
        'イフリート・エギ',
        'タイタン・エギ',
        'ガルーダ・エギ',
        'フェアリー・エオス',
        'フェアリー・セレネ',
        'オートタレット・ルーク',
        'オートタレット・ビショップ',
        'デミ・バハムート',
        'デミ・フェニックス',
        'セラフィム',
        'カーバンクル・ムーンストーン',
        '英雄の影身',
        'オートマトン・クイーン',
        '分身',
    ],
    'ko': [
        '카벙클 에메랄드',
        '카벙클 토파즈',
        '이프리트 에기',
        '타이탄 에기',
        '가루다 에기',
        '요정 에오스',
        '요정 셀레네',
        '자동포탑 룩',
        '자동포탑 비숍',
        '데미바하무트',
        '데미피닉스',
        '세라핌',
        '카벙클 문스톤',
        '영웅의 환영',
        '자동인형 퀸',
        '분신',
    ],
};
/* harmony default export */ const pet_names = (data);

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent.ts

const fields = {
    event: 0,
    timestamp: 1,
};
/**
 * Generic class to track an FFXIV log line
 */
class LineEvent {
    constructor(repo, networkLine, parts) {
        var _a, _b, _c;
        this.networkLine = networkLine;
        this.offset = 0;
        this.invalid = false;
        this.index = 0;
        this.decEvent = parseInt((_a = parts[fields.event]) !== null && _a !== void 0 ? _a : '0');
        this.hexEvent = EmulatorCommon.zeroPad(this.decEvent.toString(16).toUpperCase());
        this.timestamp = new Date((_b = parts[fields.timestamp]) !== null && _b !== void 0 ? _b : '0').getTime();
        this.checksum = (_c = parts.slice(-1)[0]) !== null && _c !== void 0 ? _c : '';
        repo.updateTimestamp(this.timestamp);
        this.convertedLine = this.prefix() + (parts.join(':')).replace('|', ':');
    }
    prefix() {
        return '[' + EmulatorCommon.timeToTimeString(this.timestamp, true) + '] ' + this.hexEvent + ':';
    }
    static isDamageHallowed(damage) {
        return (parseInt(damage, 16) & parseInt('1000', 16)) > 0;
    }
    static isDamageBig(damage) {
        return (parseInt(damage, 16) & parseInt('4000', 16)) > 0;
    }
    static calculateDamage(damage) {
        if (LineEvent.isDamageHallowed(damage))
            return 0;
        damage = EmulatorCommon.zeroPad(damage, 8);
        const parts = [
            damage.substr(0, 2),
            damage.substr(2, 2),
            damage.substr(4, 2),
            damage.substr(6, 2),
        ];
        if (!LineEvent.isDamageBig(damage))
            return parseInt(parts.slice(0, 2).reverse().join(''), 16);
        return parseInt((parts[3] + parts[0]) +
            (parseInt(parts[1], 16) - parseInt(parts[3], 16)).toString(16), 16);
    }
}
const isLineEventSource = (line) => {
    return 'isSource' in line;
};
const isLineEventTarget = (line) => {
    return 'isTarget' in line;
};
const isLineEventJobLevel = (line) => {
    return 'isJobLevel' in line;
};
const isLineEventAbility = (line) => {
    return 'isAbility' in line;
};

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/CombatantTracker.ts





class CombatantTracker {
    constructor(logLines, language) {
        this.combatants = {};
        this.partyMembers = [];
        this.enemies = [];
        this.others = [];
        this.pets = [];
        this.initialStates = {};
        this.language = language;
        this.firstTimestamp = Number.MAX_SAFE_INTEGER;
        this.lastTimestamp = 0;
        this.initialize(logLines);
        // Clear initialStates after we initialize, we don't need it anymore
        this.initialStates = {};
    }
    initialize(logLines) {
        var _a, _b, _c, _d, _e, _f, _g;
        // First pass: Get list of combatants, figure out where they
        // start at if possible
        for (const line of logLines) {
            this.firstTimestamp = Math.min(this.firstTimestamp, line.timestamp);
            this.lastTimestamp = Math.max(this.lastTimestamp, line.timestamp);
            if (isLineEventSource(line))
                this.addCombatantFromLine(line);
            if (isLineEventTarget(line))
                this.addCombatantFromTargetLine(line);
        }
        // Between passes: Create our initial combatant states
        for (const id in this.initialStates) {
            const state = (_a = this.initialStates[id]) !== null && _a !== void 0 ? _a : {};
            (_b = this.combatants[id]) === null || _b === void 0 ? void 0 : _b.pushState(this.firstTimestamp, new CombatantState(Number(state.posX), Number(state.posY), Number(state.posZ), Number(state.heading), (_c = state.targetable) !== null && _c !== void 0 ? _c : false, Number(state.hp), Number(state.maxHp), Number(state.mp), Number(state.maxMp)));
        }
        // Second pass: Analyze combatant information for tracking
        const eventTracker = {};
        for (const line of logLines) {
            if (isLineEventSource(line)) {
                const state = this.extractStateFromLine(line);
                if (state) {
                    eventTracker[line.id] = (_d = eventTracker[line.id]) !== null && _d !== void 0 ? _d : 0;
                    ++eventTracker[line.id];
                    (_e = this.combatants[line.id]) === null || _e === void 0 ? void 0 : _e.pushPartialState(line.timestamp, state);
                }
            }
            if (isLineEventTarget(line)) {
                const state = this.extractStateFromTargetLine(line);
                if (state) {
                    eventTracker[line.targetId] = (_f = eventTracker[line.targetId]) !== null && _f !== void 0 ? _f : 0;
                    ++eventTracker[line.targetId];
                    (_g = this.combatants[line.targetId]) === null || _g === void 0 ? void 0 : _g.pushPartialState(line.timestamp, state);
                }
            }
        }
        // Figure out party/enemy/other status
        const petNames = pet_names[this.language];
        this.others = this.others.filter((ID) => {
            var _a, _b, _c, _d, _e;
            if (((_a = this.combatants[ID]) === null || _a === void 0 ? void 0 : _a.job) !== undefined &&
                ((_b = this.combatants[ID]) === null || _b === void 0 ? void 0 : _b.job) !== 'NONE' &&
                ID.startsWith('1')) {
                this.partyMembers.push(ID);
                return false;
            }
            else if (petNames.includes((_d = (_c = this.combatants[ID]) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : '')) {
                this.pets.push(ID);
                return false;
            }
            else if (((_e = eventTracker[ID]) !== null && _e !== void 0 ? _e : 0) > 0) {
                this.enemies.push(ID);
                return false;
            }
            return true;
        });
        // Main combatant is the one that took the most actions
        this.mainCombatantID = this.enemies.sort((l, r) => {
            var _a, _b;
            return ((_a = eventTracker[r]) !== null && _a !== void 0 ? _a : 0) - ((_b = eventTracker[l]) !== null && _b !== void 0 ? _b : 0);
        })[0];
    }
    addCombatantFromLine(line) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const combatant = this.initCombatant(line.id, line.name);
        const initState = (_a = this.initialStates[line.id]) !== null && _a !== void 0 ? _a : {};
        const extractedState = (_b = this.extractStateFromLine(line)) !== null && _b !== void 0 ? _b : {};
        initState.posX = (_c = initState.posX) !== null && _c !== void 0 ? _c : extractedState.posX;
        initState.posY = (_d = initState.posY) !== null && _d !== void 0 ? _d : extractedState.posY;
        initState.posZ = (_e = initState.posZ) !== null && _e !== void 0 ? _e : extractedState.posZ;
        initState.heading = (_f = initState.heading) !== null && _f !== void 0 ? _f : extractedState.heading;
        initState.targetable = (_g = initState.targetable) !== null && _g !== void 0 ? _g : extractedState.targetable;
        initState.hp = (_h = initState.hp) !== null && _h !== void 0 ? _h : extractedState.hp;
        initState.maxHp = (_j = initState.maxHp) !== null && _j !== void 0 ? _j : extractedState.maxHp;
        initState.mp = (_k = initState.mp) !== null && _k !== void 0 ? _k : extractedState.mp;
        initState.maxMp = (_l = initState.maxMp) !== null && _l !== void 0 ? _l : extractedState.maxMp;
        if (isLineEventJobLevel(line)) {
            combatant.job = (_o = (_m = this.combatants[line.id]) === null || _m === void 0 ? void 0 : _m.job) !== null && _o !== void 0 ? _o : line.job;
            combatant.level = (_q = (_p = this.combatants[line.id]) === null || _p === void 0 ? void 0 : _p.level) !== null && _q !== void 0 ? _q : line.level;
        }
        if (isLineEventAbility(line)) {
            if (!combatant.job && !line.id.startsWith('4') && line.abilityId !== undefined)
                combatant.job = CombatantJobSearch.getJob(line.abilityId);
        }
        if (combatant.job)
            combatant.job = combatant.job.toUpperCase();
    }
    addCombatantFromTargetLine(line) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        this.initCombatant(line.targetId, line.targetName);
        const initState = (_a = this.initialStates[line.targetId]) !== null && _a !== void 0 ? _a : {};
        const extractedState = (_b = this.extractStateFromTargetLine(line)) !== null && _b !== void 0 ? _b : {};
        initState.posX = (_c = initState.posX) !== null && _c !== void 0 ? _c : extractedState.posX;
        initState.posY = (_d = initState.posY) !== null && _d !== void 0 ? _d : extractedState.posY;
        initState.posZ = (_e = initState.posZ) !== null && _e !== void 0 ? _e : extractedState.posZ;
        initState.heading = (_f = initState.heading) !== null && _f !== void 0 ? _f : extractedState.heading;
        initState.hp = (_g = initState.hp) !== null && _g !== void 0 ? _g : extractedState.hp;
        initState.maxHp = (_h = initState.maxHp) !== null && _h !== void 0 ? _h : extractedState.maxHp;
        initState.mp = (_j = initState.mp) !== null && _j !== void 0 ? _j : extractedState.mp;
        initState.maxMp = (_k = initState.maxMp) !== null && _k !== void 0 ? _k : extractedState.maxMp;
    }
    extractStateFromLine(line) {
        const state = {};
        if (line.x !== undefined)
            state.posX = line.x;
        if (line.y !== undefined)
            state.posY = line.y;
        if (line.z !== undefined)
            state.posZ = line.z;
        if (line.heading !== undefined)
            state.heading = line.heading;
        if (line.targetable !== undefined)
            state.targetable = line.targetable;
        if (line.hp !== undefined)
            state.hp = line.hp;
        if (line.maxHp !== undefined)
            state.maxHp = line.maxHp;
        if (line.mp !== undefined)
            state.mp = line.mp;
        if (line.maxMp !== undefined)
            state.maxMp = line.maxMp;
        return state;
    }
    extractStateFromTargetLine(line) {
        const state = {};
        if (line.targetX !== undefined)
            state.posX = line.targetX;
        if (line.targetY !== undefined)
            state.posY = line.targetY;
        if (line.targetZ !== undefined)
            state.posZ = line.targetZ;
        if (line.targetHeading !== undefined)
            state.heading = line.targetHeading;
        if (line.targetHp !== undefined)
            state.hp = line.targetHp;
        if (line.targetMaxHp !== undefined)
            state.maxHp = line.targetMaxHp;
        if (line.targetMp !== undefined)
            state.mp = line.targetMp;
        if (line.targetMaxMp !== undefined)
            state.maxMp = line.targetMaxMp;
        return state;
    }
    initCombatant(id, name) {
        let combatant = this.combatants[id];
        if (combatant === undefined) {
            combatant = this.combatants[id] = new Combatant(id, name);
            this.others.push(id);
            this.initialStates[id] = {
                targetable: true,
            };
        }
        else if (combatant.name === '') {
            combatant.setName(name);
        }
        return combatant;
    }
    getMainCombatantName() {
        var _a, _b;
        if (this.mainCombatantID)
            return (_b = (_a = this.combatants[this.mainCombatantID]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Unknown';
        return 'Unknown';
    }
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LogRepository.ts
class LogRepository {
    constructor() {
        this.Combatants = {};
        this.firstTimestamp = Number.MAX_SAFE_INTEGER;
    }
    updateTimestamp(timestamp) {
        this.firstTimestamp = Math.min(this.firstTimestamp, timestamp);
    }
    updateCombatant(id, c) {
        id = id.toUpperCase();
        if (id && id.length) {
            let combatant = this.Combatants[id];
            if (combatant === undefined) {
                combatant = {
                    name: c.name,
                    job: c.job,
                    spawn: c.spawn,
                    despawn: c.despawn,
                };
                this.Combatants[id] = combatant;
            }
            else {
                combatant.name = c.name || combatant.name;
                combatant.job = c.job || combatant.job;
                combatant.spawn = Math.min(combatant.spawn, c.spawn);
                combatant.despawn = Math.max(combatant.despawn, c.despawn);
            }
        }
    }
    resolveName(id, name, fallbackId = null, fallbackName = null) {
        var _a, _b;
        let ret = name;
        if (fallbackId !== null) {
            if (id === 'E0000000' && ret === '') {
                if (fallbackId.startsWith('4'))
                    ret = fallbackName !== null && fallbackName !== void 0 ? fallbackName : '';
                else
                    ret = 'Unknown';
            }
        }
        if (ret === '')
            ret = (_b = (_a = this.Combatants[id]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '';
        return ret;
    }
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/EventBus.ts
/**
 * This is a base class that classes can extend to inherit event bus capabilities.
 * This allows other classes to listen for events with the `on` function.
 * The inheriting class can fire those events with the `dispatch` function.
 */
class EventBus {
    constructor() {
        this.listeners = {};
    }
    /**
     * Subscribe to an event
     *
     * @param event The event(s) to subscribe to, space separated
     * @param callback The callback to invoke
     * @param scope Optional. The scope to apply the function against
     * @returns The callbacks registered to the event(s)
     */
    on(event, callback, scope) {
        var _a, _b;
        var _c;
        const events = event.split(' ');
        const ret = [];
        scope = scope !== null && scope !== void 0 ? scope : (typeof window === 'undefined' ? {} : window);
        for (const event of events) {
            const events = (_a = (_c = this.listeners)[event]) !== null && _a !== void 0 ? _a : (_c[event] = []);
            if (callback !== undefined)
                events.push({ event: event, scope: scope, callback: callback });
            ret.push(...((_b = this.listeners[event]) !== null && _b !== void 0 ? _b : []));
        }
        return ret;
    }
    /**
     * Dispatch an event to any subscribers
     *
     * @param event The event to dispatch
     * @param eventArguments The event arguments to pass to listeners
     * @returns A promise that can be await'd or ignored
     */
    async dispatch(event, ...eventArguments) {
        var _a;
        if (this.listeners[event] === undefined)
            return;
        for (const l of (_a = this.listeners[event]) !== null && _a !== void 0 ? _a : []) {
            const res = l.callback.apply(l.scope, eventArguments);
            await Promise.resolve(res);
        }
    }
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x00.ts

const LineEvent0x00_fields = {
    type: 2,
    speaker: 3,
};
// Chat event
class LineEvent0x00 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b;
        super(repo, line, parts);
        this.type = (_a = parts[LineEvent0x00_fields.type]) !== null && _a !== void 0 ? _a : '';
        this.speaker = (_b = parts[LineEvent0x00_fields.speaker]) !== null && _b !== void 0 ? _b : '';
        this.message = parts.slice(4, -1).join('|');
        // The exact reason for this check isn't clear anymore but may be related to
        // https://github.com/ravahn/FFXIV_ACT_Plugin/issues/250
        if (this.message.split('\u001f\u001f').length > 1)
            this.invalid = true;
        this.convertedLine =
            this.prefix() + this.type + ':' +
                // If speaker is blank, it's excluded from the converted line
                (this.speaker !== '' ? this.speaker + ':' : '') +
                this.message.trim();
        this.convertedLine = LineEvent00.replaceChatSymbols(this.convertedLine);
    }
    static replaceChatSymbols(line) {
        for (const rep of LineEvent00.chatSymbolReplacements)
            line = line.replace(rep.Search, rep.Replace);
        return line;
    }
}
LineEvent0x00.chatSymbolReplacements = [
    {
        Search: /:\uE06F/g,
        Replace: ':⇒',
        Type: 'Symbol',
    },
    {
        Search: / \uE0BB\uE05C/g,
        Replace: ' ',
        Type: 'Positive Effect',
    },
    {
        Search: / \uE0BB\uE05B/g,
        Replace: ' ',
        Type: 'Negative Effect',
    },
];
class LineEvent00 extends LineEvent0x00 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x01.ts


const LineEvent0x01_fields = {
    zoneId: 2,
    zoneName: 3,
};
// Zone change event
class LineEvent0x01 extends LineEvent {
    constructor(repo, networkLine, parts) {
        var _a, _b;
        super(repo, networkLine, parts);
        this.zoneId = (_a = parts[LineEvent0x01_fields.zoneId]) !== null && _a !== void 0 ? _a : '';
        this.zoneName = (_b = parts[LineEvent0x01_fields.zoneName]) !== null && _b !== void 0 ? _b : '';
        this.zoneNameProperCase = EmulatorCommon.properCase(this.zoneName);
        this.convertedLine = this.prefix() +
            'Changed Zone to ' + this.zoneName + '.';
        this.properCaseConvertedLine = this.prefix() +
            'Changed Zone to ' + this.zoneNameProperCase + '.';
    }
}
class LineEvent01 extends LineEvent0x01 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x02.ts

const LineEvent0x02_fields = {
    id: 2,
    name: 3,
};
// Player change event
class LineEvent0x02 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c;
        super(repo, line, parts);
        this.id = (_b = (_a = parts[LineEvent0x02_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x02_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.convertedLine = this.prefix() + 'Changed primary player to ' + this.name + '.';
    }
}
class LineEvent02 extends LineEvent0x02 {
}

;// CONCATENATED MODULE: ./resources/util.ts
// TODO: it'd be nice to not repeat job names, but at least Record enforces that all are set.
const nameToJobEnum = {
    NONE: 0,
    GLA: 1,
    PGL: 2,
    MRD: 3,
    LNC: 4,
    ARC: 5,
    CNJ: 6,
    THM: 7,
    CRP: 8,
    BSM: 9,
    ARM: 10,
    GSM: 11,
    LTW: 12,
    WVR: 13,
    ALC: 14,
    CUL: 15,
    MIN: 16,
    BTN: 17,
    FSH: 18,
    PLD: 19,
    MNK: 20,
    WAR: 21,
    DRG: 22,
    BRD: 23,
    WHM: 24,
    BLM: 25,
    ACN: 26,
    SMN: 27,
    SCH: 28,
    ROG: 29,
    NIN: 30,
    MCH: 31,
    DRK: 32,
    AST: 33,
    SAM: 34,
    RDM: 35,
    BLU: 36,
    GNB: 37,
    DNC: 38,
};
const allJobs = Object.keys(nameToJobEnum);
const allRoles = ['tank', 'healer', 'dps', 'crafter', 'gatherer', 'none'];
const tankJobs = ['GLA', 'PLD', 'MRD', 'WAR', 'DRK', 'GNB'];
const healerJobs = ['CNJ', 'WHM', 'SCH', 'AST'];
const meleeDpsJobs = ['PGL', 'MNK', 'LNC', 'DRG', 'ROG', 'NIN', 'SAM'];
const rangedDpsJobs = ['ARC', 'BRD', 'DNC', 'MCH'];
const casterDpsJobs = ['BLU', 'RDM', 'BLM', 'SMN', 'ACN', 'THM'];
const dpsJobs = [...meleeDpsJobs, ...rangedDpsJobs, ...casterDpsJobs];
const craftingJobs = ['CRP', 'BSM', 'ARM', 'GSM', 'LTW', 'WVR', 'ALC', 'CUL'];
const gatheringJobs = ['MIN', 'BTN', 'FSH'];
const stunJobs = ['BLU', ...tankJobs, ...meleeDpsJobs];
const silenceJobs = ['BLU', ...tankJobs, ...rangedDpsJobs];
const sleepJobs = ['BLM', 'BLU', ...healerJobs];
const feintJobs = [...meleeDpsJobs];
const addleJobs = [...casterDpsJobs];
const cleanseJobs = ['BLU', 'BRD', ...healerJobs];
const jobToRoleMap = (() => {
    const addToMap = (map, jobs, role) => {
        jobs.forEach((job) => map.set(job, role));
    };
    const map = new Map([['NONE', 'none']]);
    addToMap(map, tankJobs, 'tank');
    addToMap(map, healerJobs, 'healer');
    addToMap(map, dpsJobs, 'dps');
    addToMap(map, craftingJobs, 'crafter');
    addToMap(map, gatheringJobs, 'gatherer');
    return map;
})();
const Util = {
    jobEnumToJob: (id) => {
        const job = allJobs.find((job) => nameToJobEnum[job] === id);
        return job !== null && job !== void 0 ? job : 'NONE';
    },
    jobToJobEnum: (job) => nameToJobEnum[job],
    jobToRole: (job) => {
        const role = jobToRoleMap.get(job);
        return role !== null && role !== void 0 ? role : 'none';
    },
    getAllRoles: () => allRoles,
    isTankJob: (job) => tankJobs.includes(job),
    isHealerJob: (job) => healerJobs.includes(job),
    isMeleeDpsJob: (job) => meleeDpsJobs.includes(job),
    isRangedDpsJob: (job) => rangedDpsJobs.includes(job),
    isCasterDpsJob: (job) => casterDpsJobs.includes(job),
    isDpsJob: (job) => dpsJobs.includes(job),
    isCraftingJob: (job) => craftingJobs.includes(job),
    isGatheringJob: (job) => gatheringJobs.includes(job),
    isCombatJob: (job) => {
        return !craftingJobs.includes(job) && !gatheringJobs.includes(job);
    },
    canStun: (job) => stunJobs.includes(job),
    canSilence: (job) => silenceJobs.includes(job),
    canSleep: (job) => sleepJobs.includes(job),
    canCleanse: (job) => cleanseJobs.includes(job),
    canFeint: (job) => feintJobs.includes(job),
    canAddle: (job) => addleJobs.includes(job),
};
/* harmony default export */ const util = (Util);

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x03.ts



const LineEvent0x03_fields = {
    id: 2,
    name: 3,
    jobIdHex: 4,
    levelString: 5,
    ownerId: 6,
    worldId: 7,
    worldName: 8,
    npcNameId: 9,
    npcBaseId: 10,
    currentHp: 11,
    maxHpString: 14,
    currentMp: 13,
    maxMpString: 14,
    currentTp: 15,
    maxTp: 16,
    xString: 17,
    yString: 18,
    zString: 19,
    heading: 20,
};
// Added combatant event
class LineEvent0x03 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        super(repo, line, parts);
        this.isSource = true;
        this.isJobLevel = true;
        this.id = (_b = (_a = parts[LineEvent0x03_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x03_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.jobIdHex = (_e = (_d = parts[LineEvent0x03_fields.jobIdHex]) === null || _d === void 0 ? void 0 : _d.toUpperCase()) !== null && _e !== void 0 ? _e : '';
        this.jobId = parseInt(this.jobIdHex, 16);
        this.job = util.jobEnumToJob(this.jobId);
        this.levelString = (_f = parts[LineEvent0x03_fields.levelString]) !== null && _f !== void 0 ? _f : '';
        this.level = parseFloat(this.levelString);
        this.ownerId = (_h = (_g = parts[LineEvent0x03_fields.ownerId]) === null || _g === void 0 ? void 0 : _g.toUpperCase()) !== null && _h !== void 0 ? _h : '';
        this.worldId = (_j = parts[LineEvent0x03_fields.worldId]) !== null && _j !== void 0 ? _j : '';
        this.worldName = (_k = parts[LineEvent0x03_fields.worldName]) !== null && _k !== void 0 ? _k : '';
        this.npcNameId = (_l = parts[LineEvent0x03_fields.npcNameId]) !== null && _l !== void 0 ? _l : '';
        this.npcBaseId = (_m = parts[LineEvent0x03_fields.npcBaseId]) !== null && _m !== void 0 ? _m : '';
        this.hp = parseFloat((_o = parts[LineEvent0x03_fields.currentHp]) !== null && _o !== void 0 ? _o : '');
        this.maxHpString = (_p = parts[LineEvent0x03_fields.maxHpString]) !== null && _p !== void 0 ? _p : '';
        this.maxHp = parseFloat(this.maxHpString);
        this.mp = parseFloat((_q = parts[LineEvent0x03_fields.currentMp]) !== null && _q !== void 0 ? _q : '');
        this.maxMpString = (_r = parts[LineEvent0x03_fields.maxMpString]) !== null && _r !== void 0 ? _r : '';
        this.maxMp = parseFloat(this.maxMpString);
        this.tp = parseFloat((_s = parts[LineEvent0x03_fields.currentTp]) !== null && _s !== void 0 ? _s : '');
        this.maxTp = parseFloat((_t = parts[LineEvent0x03_fields.maxTp]) !== null && _t !== void 0 ? _t : '');
        this.xString = (_u = parts[LineEvent0x03_fields.xString]) !== null && _u !== void 0 ? _u : '';
        this.x = parseFloat(this.xString);
        this.yString = (_v = parts[LineEvent0x03_fields.yString]) !== null && _v !== void 0 ? _v : '';
        this.y = parseFloat(this.yString);
        this.zString = (_w = parts[LineEvent0x03_fields.zString]) !== null && _w !== void 0 ? _w : '';
        this.z = parseFloat(this.zString);
        this.heading = parseFloat((_x = parts[LineEvent0x03_fields.heading]) !== null && _x !== void 0 ? _x : '');
        repo.updateCombatant(this.id, {
            name: this.name,
            spawn: this.timestamp,
            despawn: this.timestamp,
            job: this.jobIdHex,
        });
        let combatantName = this.name;
        if (this.worldName !== '')
            combatantName = combatantName + '(' + this.worldName + ')';
        this.convertedLine = this.prefix() + this.id.toUpperCase() +
            ':Added new combatant ' + combatantName +
            '.  Job: ' + this.job +
            ' Level: ' + this.levelString +
            ' Max HP: ' + this.maxHpString +
            ' Max MP: ' + this.maxMpString +
            ' Pos: (' + this.xString + ',' + this.yString + ',' + this.zString + ')';
        // This last part is guesswork for the area between 9 and 10.
        const unknownValue = this.npcNameId +
            EmulatorCommon.zeroPad(this.npcBaseId, 8 + Math.max(0, 6 - this.npcNameId.length));
        if (unknownValue !== '00000000000000')
            this.convertedLine += ' (' + unknownValue + ')';
        this.convertedLine += '.';
    }
}
class LineEvent03 extends LineEvent0x03 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x04.ts

// Removed combatant event
// Extend the add combatant event to reduce duplicate code since they're
// the same from a data perspective
class LineEvent0x04 extends LineEvent0x03 {
    constructor(repo, line, parts) {
        super(repo, line, parts);
        this.convertedLine = this.prefix() + this.id.toUpperCase() +
            ':Removing combatant ' + this.name +
            '. Max MP: ' + this.maxMpString +
            '. Pos: (' + this.xString + ',' + this.yString + ',' + this.zString + ')';
    }
}
class LineEvent04 extends LineEvent0x04 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x0C.ts

const LineEvent0x0C_fields = {
    class: 2,
    strength: 3,
    dexterity: 4,
    vitality: 5,
    intelligence: 6,
    mind: 7,
    piety: 8,
    attackPower: 9,
    directHit: 10,
    criticalHit: 11,
    attackMagicPotency: 12,
    healMagicPotency: 13,
    determination: 14,
    skillSpeed: 15,
    spellSpeed: 16,
    tenacity: 18,
};
// Player stats event
class LineEvent0x0C extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        super(repo, line, parts);
        this.class = (_a = parts[LineEvent0x0C_fields.class]) !== null && _a !== void 0 ? _a : '';
        this.strength = (_b = parts[LineEvent0x0C_fields.strength]) !== null && _b !== void 0 ? _b : '';
        this.dexterity = (_c = parts[LineEvent0x0C_fields.dexterity]) !== null && _c !== void 0 ? _c : '';
        this.vitality = (_d = parts[LineEvent0x0C_fields.vitality]) !== null && _d !== void 0 ? _d : '';
        this.intelligence = (_e = parts[LineEvent0x0C_fields.intelligence]) !== null && _e !== void 0 ? _e : '';
        this.mind = (_f = parts[LineEvent0x0C_fields.mind]) !== null && _f !== void 0 ? _f : '';
        this.piety = (_g = parts[LineEvent0x0C_fields.piety]) !== null && _g !== void 0 ? _g : '';
        this.attackPower = (_h = parts[LineEvent0x0C_fields.attackPower]) !== null && _h !== void 0 ? _h : '';
        this.directHit = (_j = parts[LineEvent0x0C_fields.directHit]) !== null && _j !== void 0 ? _j : '';
        this.criticalHit = (_k = parts[LineEvent0x0C_fields.criticalHit]) !== null && _k !== void 0 ? _k : '';
        this.attackMagicPotency = (_l = parts[LineEvent0x0C_fields.attackMagicPotency]) !== null && _l !== void 0 ? _l : '';
        this.healMagicPotency = (_m = parts[LineEvent0x0C_fields.healMagicPotency]) !== null && _m !== void 0 ? _m : '';
        this.determination = (_o = parts[LineEvent0x0C_fields.determination]) !== null && _o !== void 0 ? _o : '';
        this.skillSpeed = (_p = parts[LineEvent0x0C_fields.skillSpeed]) !== null && _p !== void 0 ? _p : '';
        this.spellSpeed = (_q = parts[LineEvent0x0C_fields.spellSpeed]) !== null && _q !== void 0 ? _q : '';
        this.tenacity = (_r = parts[LineEvent0x0C_fields.tenacity]) !== null && _r !== void 0 ? _r : '';
        this.convertedLine = this.prefix() +
            'Player Stats: ' + parts.slice(2, parts.length - 1).join(':').replace(/\|/g, ':');
    }
}
class LineEvent12 extends LineEvent0x0C {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x14.ts


const LineEvent0x14_fields = {
    id: 2,
    name: 3,
    abilityId: 4,
    abilityName: 5,
    targetId: 6,
    targetName: 7,
    duration: 8,
};
// Ability use event
class LineEvent0x14 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        super(repo, line, parts);
        this.isSource = true;
        this.isTarget = true;
        this.isAbility = true;
        this.id = (_b = (_a = parts[LineEvent0x14_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x14_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.abilityIdHex = (_e = (_d = parts[LineEvent0x14_fields.abilityId]) === null || _d === void 0 ? void 0 : _d.toUpperCase()) !== null && _e !== void 0 ? _e : '';
        this.abilityId = parseInt(this.abilityIdHex);
        this.abilityName = (_f = parts[LineEvent0x14_fields.abilityName]) !== null && _f !== void 0 ? _f : '';
        this.targetId = (_h = (_g = parts[LineEvent0x14_fields.targetId]) === null || _g === void 0 ? void 0 : _g.toUpperCase()) !== null && _h !== void 0 ? _h : '';
        this.targetName = (_j = parts[LineEvent0x14_fields.targetName]) !== null && _j !== void 0 ? _j : '';
        this.duration = (_k = parts[LineEvent0x14_fields.duration]) !== null && _k !== void 0 ? _k : '';
        repo.updateCombatant(this.id, {
            job: undefined,
            name: this.name,
            spawn: this.timestamp,
            despawn: this.timestamp,
        });
        repo.updateCombatant(this.targetId, {
            job: undefined,
            name: this.targetName,
            spawn: this.timestamp,
            despawn: this.timestamp,
        });
        const target = this.targetName.length === 0 ? 'Unknown' : this.targetName;
        this.convertedLine = this.prefix() + this.abilityIdHex +
            ':' + this.name +
            ' starts using ' + this.abilityName +
            ' on ' + target + '.';
        this.properCaseConvertedLine = this.prefix() + this.abilityIdHex +
            ':' + EmulatorCommon.properCase(this.name) +
            ' starts using ' + this.abilityName +
            ' on ' + EmulatorCommon.properCase(target) + '.';
    }
}
class LineEvent20 extends LineEvent0x14 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x15.ts

const LineEvent0x15_fields = {
    id: 2,
    name: 3,
    flags: 8,
    damage: 9,
    abilityId: 4,
    abilityName: 5,
    targetId: 6,
    targetName: 7,
    targetHp: 24,
    targetMaxHp: 25,
    targetMp: 26,
    targetMaxMp: 27,
    targetX: 30,
    targetY: 31,
    targetZ: 32,
    targetHeading: 33,
    sourceHp: 34,
    sourceMaxHp: 35,
    sourceMp: 36,
    sourceMaxMp: 37,
    x: 40,
    y: 41,
    z: 42,
    heading: 43,
};
// Ability hit single target event
class LineEvent0x15 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
        super(repo, line, parts);
        this.isSource = true;
        this.isTarget = true;
        this.isAbility = true;
        this.id = (_b = (_a = parts[LineEvent0x15_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x15_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.flags = (_d = parts[LineEvent0x15_fields.flags]) !== null && _d !== void 0 ? _d : '';
        const fieldOffset = this.flags === '3F' ? 2 : 0;
        this.damage = LineEvent.calculateDamage((_e = parts[LineEvent0x15_fields.damage + fieldOffset]) !== null && _e !== void 0 ? _e : '');
        this.abilityId = parseInt((_g = (_f = parts[LineEvent0x15_fields.abilityId]) === null || _f === void 0 ? void 0 : _f.toUpperCase()) !== null && _g !== void 0 ? _g : '');
        this.abilityName = (_h = parts[LineEvent0x15_fields.abilityName]) !== null && _h !== void 0 ? _h : '';
        this.targetId = (_k = (_j = parts[LineEvent0x15_fields.targetId]) === null || _j === void 0 ? void 0 : _j.toUpperCase()) !== null && _k !== void 0 ? _k : '';
        this.targetName = (_l = parts[LineEvent0x15_fields.targetName]) !== null && _l !== void 0 ? _l : '';
        this.targetHp = parseInt((_m = parts[LineEvent0x15_fields.targetHp + fieldOffset]) !== null && _m !== void 0 ? _m : '');
        this.targetMaxHp = parseInt((_o = parts[LineEvent0x15_fields.targetMaxHp + fieldOffset]) !== null && _o !== void 0 ? _o : '');
        this.targetMp = parseInt((_p = parts[LineEvent0x15_fields.targetMp + fieldOffset]) !== null && _p !== void 0 ? _p : '');
        this.targetMaxMp = parseInt((_q = parts[LineEvent0x15_fields.targetMaxMp + fieldOffset]) !== null && _q !== void 0 ? _q : '');
        this.targetX = parseFloat((_r = parts[LineEvent0x15_fields.targetX + fieldOffset]) !== null && _r !== void 0 ? _r : '');
        this.targetY = parseFloat((_s = parts[LineEvent0x15_fields.targetY + fieldOffset]) !== null && _s !== void 0 ? _s : '');
        this.targetZ = parseFloat((_t = parts[LineEvent0x15_fields.targetZ + fieldOffset]) !== null && _t !== void 0 ? _t : '');
        this.targetHeading = parseFloat((_u = parts[LineEvent0x15_fields.targetHeading + fieldOffset]) !== null && _u !== void 0 ? _u : '');
        this.hp = parseInt((_v = parts[LineEvent0x15_fields.sourceHp + fieldOffset]) !== null && _v !== void 0 ? _v : '');
        this.maxHp = parseInt((_w = parts[LineEvent0x15_fields.sourceMaxHp + fieldOffset]) !== null && _w !== void 0 ? _w : '');
        this.mp = parseInt((_x = parts[LineEvent0x15_fields.sourceMp + fieldOffset]) !== null && _x !== void 0 ? _x : '');
        this.maxMp = parseInt((_y = parts[LineEvent0x15_fields.sourceMaxMp + fieldOffset]) !== null && _y !== void 0 ? _y : '');
        this.x = parseFloat((_z = parts[LineEvent0x15_fields.x + fieldOffset]) !== null && _z !== void 0 ? _z : '');
        this.y = parseFloat((_0 = parts[LineEvent0x15_fields.y + fieldOffset]) !== null && _0 !== void 0 ? _0 : '');
        this.z = parseFloat((_1 = parts[LineEvent0x15_fields.z + fieldOffset]) !== null && _1 !== void 0 ? _1 : '');
        this.heading = parseFloat((_2 = parts[LineEvent0x15_fields.heading + fieldOffset]) !== null && _2 !== void 0 ? _2 : '');
        repo.updateCombatant(this.id, {
            job: undefined,
            name: this.name,
            spawn: this.timestamp,
            despawn: this.timestamp,
        });
        repo.updateCombatant(this.targetId, {
            job: undefined,
            name: this.targetName,
            spawn: this.timestamp,
            despawn: this.timestamp,
        });
    }
}
class LineEvent21 extends LineEvent0x15 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x16.ts

// Ability hit multiple/no target event
// Duplicate of 0x15 as far as data
class LineEvent0x16 extends LineEvent0x15 {
    constructor(repo, line, parts) {
        super(repo, line, parts);
    }
}
class LineEvent22 extends LineEvent0x16 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x17.ts

const LineEvent0x17_fields = {
    id: 2,
    name: 3,
    abilityId: 4,
    abilityName: 5,
    reason: 6,
};
// Cancel ability event
class LineEvent0x17 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g;
        super(repo, line, parts);
        this.isSource = true;
        this.isAbility = true;
        this.id = (_b = (_a = parts[LineEvent0x17_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x17_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.abilityId = parseInt((_e = (_d = parts[LineEvent0x17_fields.abilityId]) === null || _d === void 0 ? void 0 : _d.toUpperCase()) !== null && _e !== void 0 ? _e : '');
        this.abilityName = (_f = parts[LineEvent0x17_fields.abilityName]) !== null && _f !== void 0 ? _f : '';
        this.reason = (_g = parts[LineEvent0x17_fields.reason]) !== null && _g !== void 0 ? _g : '';
    }
}
class LineEvent23 extends LineEvent0x17 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x18.ts


const LineEvent0x18_fields = {
    id: 2,
    name: 3,
    type: 4,
    effectId: 5,
    damage: 6,
    currentHp: 7,
    maxHp: 8,
    currentMp: 9,
    maxMp: 10,
    currentTp: 11,
    maxTp: 12,
    x: 13,
    y: 14,
    z: 15,
    heading: 16,
};
// DoT/HoT event
class LineEvent0x18 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        super(repo, line, parts);
        this.isSource = true;
        this.id = (_b = (_a = parts[LineEvent0x18_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x18_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.type = (_d = parts[LineEvent0x18_fields.type]) !== null && _d !== void 0 ? _d : '';
        this.effectId = (_f = (_e = parts[LineEvent0x18_fields.effectId]) === null || _e === void 0 ? void 0 : _e.toUpperCase()) !== null && _f !== void 0 ? _f : '';
        this.damage = parseInt((_g = parts[LineEvent0x18_fields.damage]) !== null && _g !== void 0 ? _g : '', 16);
        this.hp = parseInt((_h = parts[LineEvent0x18_fields.currentHp]) !== null && _h !== void 0 ? _h : '');
        this.maxHp = parseInt((_j = parts[LineEvent0x18_fields.maxHp]) !== null && _j !== void 0 ? _j : '');
        this.mp = parseInt((_k = parts[LineEvent0x18_fields.currentMp]) !== null && _k !== void 0 ? _k : '');
        this.maxMp = parseInt((_l = parts[LineEvent0x18_fields.maxMp]) !== null && _l !== void 0 ? _l : '');
        this.tp = parseInt((_m = parts[LineEvent0x18_fields.currentTp]) !== null && _m !== void 0 ? _m : '');
        this.maxTp = parseInt((_o = parts[LineEvent0x18_fields.maxTp]) !== null && _o !== void 0 ? _o : '');
        this.x = parseFloat((_p = parts[LineEvent0x18_fields.x]) !== null && _p !== void 0 ? _p : '');
        this.y = parseFloat((_q = parts[LineEvent0x18_fields.y]) !== null && _q !== void 0 ? _q : '');
        this.z = parseFloat((_r = parts[LineEvent0x18_fields.z]) !== null && _r !== void 0 ? _r : '');
        this.heading = parseFloat((_s = parts[LineEvent0x18_fields.heading]) !== null && _s !== void 0 ? _s : '');
        repo.updateCombatant(this.id, {
            job: undefined,
            name: this.name,
            spawn: this.timestamp,
            despawn: this.timestamp,
        });
        let effectName = '';
        const resolvedName = repo.resolveName(this.id, this.name);
        if (this.effectId in LineEvent0x18.showEffectNamesFor)
            effectName = (_t = LineEvent0x18.showEffectNamesFor[this.effectId]) !== null && _t !== void 0 ? _t : '';
        let effectPart = '';
        if (effectName)
            effectPart = effectName + ' ';
        this.convertedLine = this.prefix() + effectPart + this.type +
            ' Tick on ' + resolvedName +
            ' for ' + this.damage.toString() + ' damage.';
        this.properCaseConvertedLine = this.prefix() + effectPart + this.type +
            ' Tick on ' + EmulatorCommon.properCase(resolvedName) +
            ' for ' + this.damage.toString() + ' damage.';
    }
}
LineEvent0x18.showEffectNamesFor = {
    '4C4': 'Excognition',
    '35D': 'Wildfire',
    '1F5': 'Doton',
    '2ED': 'Salted Earth',
    '4B5': 'Flamethrower',
    '2E3': 'Asylum',
    '777': 'Asylum',
    '798': 'Sacred Soil',
    '4C7': 'Fey Union',
    '742': 'Nascent Glint',
};
class LineEvent24 extends LineEvent0x18 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x19.ts


const LineEvent0x19_fields = {
    id: 2,
    name: 3,
    targetId: 4,
    targetName: 5,
};
// Combatant defeated event
class LineEvent0x19 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f;
        super(repo, line, parts);
        this.id = (_b = (_a = parts[LineEvent0x19_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x19_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.targetId = (_e = (_d = parts[LineEvent0x19_fields.targetId]) === null || _d === void 0 ? void 0 : _d.toUpperCase()) !== null && _e !== void 0 ? _e : '';
        this.targetName = (_f = parts[LineEvent0x19_fields.targetName]) !== null && _f !== void 0 ? _f : '';
        repo.updateCombatant(this.id, {
            job: undefined,
            name: this.name,
            spawn: this.timestamp,
            despawn: this.timestamp,
        });
        repo.updateCombatant(this.targetId, {
            job: undefined,
            name: this.targetName,
            spawn: this.timestamp,
            despawn: this.timestamp,
        });
        let resolvedName = undefined;
        let resolvedTargetName = undefined;
        if (this.id !== '00')
            resolvedName = repo.resolveName(this.id, this.name);
        if (this.targetId !== '00')
            resolvedTargetName = repo.resolveName(this.targetId, this.targetName);
        const defeatedName = (resolvedName !== null && resolvedName !== void 0 ? resolvedName : this.name);
        const killerName = (resolvedTargetName !== null && resolvedTargetName !== void 0 ? resolvedTargetName : this.targetName);
        this.convertedLine = this.prefix() + defeatedName +
            ' was defeated by ' + killerName + '.';
        this.properCaseConvertedLine = this.prefix() + EmulatorCommon.properCase(defeatedName) +
            ' was defeated by ' + EmulatorCommon.properCase(killerName) + '.';
    }
}
class LineEvent25 extends LineEvent0x19 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x1A.ts


const LineEvent0x1A_fields = {
    abilityId: 2,
    abilityName: 3,
    durationString: 4,
    id: 5,
    name: 6,
    targetId: 7,
    targetName: 8,
    stacks: 9,
    targetHp: 10,
    sourceHp: 11,
};
// Gain status effect event
// Deliberately don't flag this as LineEventSource or LineEventTarget
// because 0x1A line values aren't accurate
class LineEvent0x1A extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        super(repo, line, parts);
        this.isAbility = true;
        this.abilityId = parseInt((_b = (_a = parts[LineEvent0x1A_fields.abilityId]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '');
        this.abilityName = (_c = parts[LineEvent0x1A_fields.abilityName]) !== null && _c !== void 0 ? _c : '';
        this.durationString = (_d = parts[LineEvent0x1A_fields.durationString]) !== null && _d !== void 0 ? _d : '';
        this.durationFloat = parseFloat(this.durationString);
        this.id = (_f = (_e = parts[LineEvent0x1A_fields.id]) === null || _e === void 0 ? void 0 : _e.toUpperCase()) !== null && _f !== void 0 ? _f : '';
        this.name = (_g = parts[LineEvent0x1A_fields.name]) !== null && _g !== void 0 ? _g : '';
        this.targetId = (_j = (_h = parts[LineEvent0x1A_fields.targetId]) === null || _h === void 0 ? void 0 : _h.toUpperCase()) !== null && _j !== void 0 ? _j : '';
        this.targetName = (_k = parts[LineEvent0x1A_fields.targetName]) !== null && _k !== void 0 ? _k : '';
        this.stacks = parseInt((_l = parts[LineEvent0x1A_fields.stacks]) !== null && _l !== void 0 ? _l : '0');
        this.targetHp = parseInt((_m = parts[LineEvent0x1A_fields.targetHp]) !== null && _m !== void 0 ? _m : '');
        this.hp = parseInt((_o = parts[LineEvent0x1A_fields.sourceHp]) !== null && _o !== void 0 ? _o : '');
        repo.updateCombatant(this.id, {
            name: this.name,
            spawn: this.timestamp,
            despawn: this.timestamp,
            job: undefined,
        });
        repo.updateCombatant(this.targetId, {
            name: this.targetName,
            spawn: this.timestamp,
            despawn: this.timestamp,
            job: undefined,
        });
        this.resolvedName = repo.resolveName(this.id, this.name);
        this.resolvedTargetName = repo.resolveName(this.targetId, this.targetName);
        this.fallbackResolvedTargetName =
            repo.resolveName(this.id, this.name, this.targetId, this.targetName);
        let stackCountText = '';
        if (this.stacks > 0 && this.stacks < 20 &&
            LineEvent0x1A.showStackCountFor.includes(this.abilityId))
            stackCountText = ' (' + this.stacks.toString() + ')';
        this.convertedLine = this.prefix() + this.targetId +
            ':' + this.targetName +
            ' gains the effect of ' + this.abilityName +
            ' from ' + this.fallbackResolvedTargetName +
            ' for ' + this.durationString + ' Seconds.' + stackCountText;
        this.properCaseConvertedLine = this.prefix() + this.targetId +
            ':' + EmulatorCommon.properCase(this.targetName) +
            ' gains the effect of ' + this.abilityName +
            ' from ' + EmulatorCommon.properCase(this.fallbackResolvedTargetName) +
            ' for ' + this.durationString + ' Seconds.' + stackCountText;
    }
}
LineEvent0x1A.showStackCountFor = [
    304,
    406,
    350,
    714,
    505,
    1239,
    1297,
];
class LineEvent26 extends LineEvent0x1A {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x1B.ts

const LineEvent0x1B_fields = {
    targetId: 2,
    targetName: 3,
    headmarkerId: 6,
};
// Head marker event
class LineEvent0x1B extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d;
        super(repo, line, parts);
        this.isSource = true;
        this.id = (_b = (_a = parts[LineEvent0x1B_fields.targetId]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x1B_fields.targetName]) !== null && _c !== void 0 ? _c : '';
        this.headmarkerId = (_d = parts[LineEvent0x1B_fields.headmarkerId]) !== null && _d !== void 0 ? _d : '';
    }
}
class LineEvent27 extends LineEvent0x1B {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x1C.ts

const LineEvent0x1C_fields = {
    operation: 2,
    waymark: 3,
    id: 4,
    name: 5,
    x: 6,
    y: 7,
    z: 8,
};
// Floor waymarker event
class LineEvent0x1C extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        super(repo, line, parts);
        this.operation = (_a = parts[LineEvent0x1C_fields.operation]) !== null && _a !== void 0 ? _a : '';
        this.waymark = (_b = parts[LineEvent0x1C_fields.waymark]) !== null && _b !== void 0 ? _b : '';
        this.id = (_d = (_c = parts[LineEvent0x1C_fields.id]) === null || _c === void 0 ? void 0 : _c.toUpperCase()) !== null && _d !== void 0 ? _d : '';
        this.name = (_e = parts[LineEvent0x1C_fields.name]) !== null && _e !== void 0 ? _e : '';
        this.x = (_f = parts[LineEvent0x1C_fields.x]) !== null && _f !== void 0 ? _f : '';
        this.y = (_g = parts[LineEvent0x1C_fields.y]) !== null && _g !== void 0 ? _g : '';
        this.z = (_h = parts[LineEvent0x1C_fields.z]) !== null && _h !== void 0 ? _h : '';
    }
}
class LineEvent28 extends LineEvent0x1C {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x1D.ts

const LineEvent0x1D_fields = {
    operation: 2,
    waymark: 3,
    id: 4,
    name: 5,
    targetId: 6,
    targetName: 7,
};
// Waymarker
class LineEvent0x1D extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        super(repo, line, parts);
        this.operation = (_a = parts[LineEvent0x1D_fields.operation]) !== null && _a !== void 0 ? _a : '';
        this.waymark = (_b = parts[LineEvent0x1D_fields.waymark]) !== null && _b !== void 0 ? _b : '';
        this.id = (_d = (_c = parts[LineEvent0x1D_fields.id]) === null || _c === void 0 ? void 0 : _c.toUpperCase()) !== null && _d !== void 0 ? _d : '';
        this.name = (_e = parts[LineEvent0x1D_fields.name]) !== null && _e !== void 0 ? _e : '';
        this.targetId = (_g = (_f = parts[LineEvent0x1D_fields.targetId]) === null || _f === void 0 ? void 0 : _f.toUpperCase()) !== null && _g !== void 0 ? _g : '';
        this.targetName = (_h = parts[LineEvent0x1D_fields.targetName]) !== null && _h !== void 0 ? _h : '';
    }
}
class LineEvent29 extends LineEvent0x1D {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x1E.ts


// Lose status effect event
// Extend the gain status event to reduce duplicate code since they're
// the same from a data perspective
class LineEvent0x1E extends LineEvent0x1A {
    constructor(repo, line, parts) {
        super(repo, line, parts);
        let stackCountText = '';
        if (this.stacks > 0 && this.stacks < 20 &&
            LineEvent0x1A.showStackCountFor.includes(this.abilityId))
            stackCountText = ' (' + this.stacks.toString() + ')';
        this.convertedLine = this.prefix() + this.targetId +
            ':' + this.targetName +
            ' loses the effect of ' + this.abilityName +
            ' from ' + this.fallbackResolvedTargetName +
            ' for ' + this.durationString + ' Seconds.' + stackCountText;
        this.properCaseConvertedLine = this.prefix() + this.targetId +
            ':' + EmulatorCommon.properCase(this.targetName) +
            ' loses the effect of ' + this.abilityName +
            ' from ' + EmulatorCommon.properCase(this.fallbackResolvedTargetName) +
            ' for ' + this.durationString + ' Seconds.' + stackCountText;
    }
}
class LineEvent30 extends LineEvent0x1E {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x1F.ts


const splitFunc = (s) => [
    s.substr(6, 2),
    s.substr(4, 2),
    s.substr(2, 2),
    s.substr(0, 2),
];
const LineEvent0x1F_fields = {
    id: 2,
    dataBytes1: 3,
    dataBytes2: 4,
    dataBytes3: 5,
    dataBytes4: 6,
};
// Job gauge event
class LineEvent0x1F extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        super(repo, line, parts);
        this.id = (_b = (_a = parts[LineEvent0x1F_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.dataBytes1 = EmulatorCommon.zeroPad((_c = parts[LineEvent0x1F_fields.dataBytes1]) !== null && _c !== void 0 ? _c : '');
        this.dataBytes2 = EmulatorCommon.zeroPad((_d = parts[LineEvent0x1F_fields.dataBytes2]) !== null && _d !== void 0 ? _d : '');
        this.dataBytes3 = EmulatorCommon.zeroPad((_e = parts[LineEvent0x1F_fields.dataBytes3]) !== null && _e !== void 0 ? _e : '');
        this.dataBytes4 = EmulatorCommon.zeroPad((_f = parts[LineEvent0x1F_fields.dataBytes4]) !== null && _f !== void 0 ? _f : '');
        this.jobGaugeBytes = [
            ...splitFunc(this.dataBytes1),
            ...splitFunc(this.dataBytes2),
            ...splitFunc(this.dataBytes3),
            ...splitFunc(this.dataBytes4),
        ];
        this.name = ((_g = repo.Combatants[this.id]) === null || _g === void 0 ? void 0 : _g.name) || '';
        repo.updateCombatant(this.id, {
            name: (_h = repo.Combatants[this.id]) === null || _h === void 0 ? void 0 : _h.name,
            spawn: this.timestamp,
            despawn: this.timestamp,
            job: (_j = this.jobGaugeBytes[0]) === null || _j === void 0 ? void 0 : _j.toUpperCase(),
        });
        this.convertedLine = this.prefix() +
            this.id + ':' + this.name +
            ':' + this.dataBytes1 +
            ':' + this.dataBytes2 +
            ':' + this.dataBytes3 +
            ':' + this.dataBytes4;
        this.properCaseConvertedLine = this.prefix() +
            this.id + ':' + (EmulatorCommon.properCase(this.name)) +
            ':' + this.dataBytes1 +
            ':' + this.dataBytes2 +
            ':' + this.dataBytes3 +
            ':' + this.dataBytes4;
    }
}
class LineEvent31 extends LineEvent0x1F {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x22.ts

const LineEvent0x22_fields = {
    id: 2,
    name: 3,
    targetId: 4,
    targetName: 5,
    targetable: 6,
};
// Nameplate toggle
class LineEvent0x22 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g;
        super(repo, line, parts);
        this.isSource = true;
        this.id = (_b = (_a = parts[LineEvent0x22_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x22_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.targetId = (_e = (_d = parts[LineEvent0x22_fields.targetId]) === null || _d === void 0 ? void 0 : _d.toUpperCase()) !== null && _e !== void 0 ? _e : '';
        this.targetName = (_f = parts[LineEvent0x22_fields.targetName]) !== null && _f !== void 0 ? _f : '';
        this.targetable = !!parseInt((_g = parts[LineEvent0x22_fields.targetable]) !== null && _g !== void 0 ? _g : '', 16);
    }
}
class LineEvent34 extends LineEvent0x22 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x23.ts

const LineEvent0x23_fields = {
    id: 2,
    name: 3,
    targetId: 4,
    targetName: 5,
    tetherId: 8,
};
// Tether event
class LineEvent0x23 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g;
        super(repo, line, parts);
        this.id = (_b = (_a = parts[LineEvent0x23_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x23_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.targetId = (_e = (_d = parts[LineEvent0x23_fields.targetId]) === null || _d === void 0 ? void 0 : _d.toUpperCase()) !== null && _e !== void 0 ? _e : '';
        this.targetName = (_f = parts[LineEvent0x23_fields.targetName]) !== null && _f !== void 0 ? _f : '';
        this.tetherId = (_g = parts[LineEvent0x23_fields.tetherId]) !== null && _g !== void 0 ? _g : '';
    }
}
class LineEvent35 extends LineEvent0x23 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x24.ts

const LineEvent0x24_fields = {
    valueHex: 2,
    bars: 3,
};
// Limit gauge event
class LineEvent0x24 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b;
        super(repo, line, parts);
        this.valueHex = (_a = parts[LineEvent0x24_fields.valueHex]) !== null && _a !== void 0 ? _a : '';
        this.valueDec = parseInt(this.valueHex, 16);
        this.bars = (_b = parts[LineEvent0x24_fields.bars]) !== null && _b !== void 0 ? _b : '';
        this.convertedLine = this.prefix() + 'Limit Break: ' + this.valueHex;
    }
}
class LineEvent36 extends LineEvent0x24 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x25.ts

const LineEvent0x25_fields = {
    id: 2,
    name: 3,
    sequenceId: 4,
    currentHp: 5,
    maxHp: 6,
    currentMp: 7,
    maxMp: 8,
    currentTp: 9,
    maxTp: 10,
    x: 11,
    y: 12,
    z: 13,
    heading: 14,
};
// Action sync event
class LineEvent0x25 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        super(repo, line, parts);
        this.isSource = true;
        this.id = (_b = (_a = parts[LineEvent0x25_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x25_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.sequenceId = (_d = parts[LineEvent0x25_fields.sequenceId]) !== null && _d !== void 0 ? _d : '';
        this.hp = parseInt((_e = parts[LineEvent0x25_fields.currentHp]) !== null && _e !== void 0 ? _e : '');
        this.maxHp = parseInt((_f = parts[LineEvent0x25_fields.maxHp]) !== null && _f !== void 0 ? _f : '');
        this.mp = parseInt((_g = parts[LineEvent0x25_fields.currentMp]) !== null && _g !== void 0 ? _g : '');
        this.maxMp = parseInt((_h = parts[LineEvent0x25_fields.maxMp]) !== null && _h !== void 0 ? _h : '');
        this.tp = parseInt((_j = parts[LineEvent0x25_fields.currentTp]) !== null && _j !== void 0 ? _j : '');
        this.maxTp = parseInt((_k = parts[LineEvent0x25_fields.maxTp]) !== null && _k !== void 0 ? _k : '');
        this.x = parseFloat((_l = parts[LineEvent0x25_fields.x]) !== null && _l !== void 0 ? _l : '');
        this.y = parseFloat((_m = parts[LineEvent0x25_fields.y]) !== null && _m !== void 0 ? _m : '');
        this.z = parseFloat((_o = parts[LineEvent0x25_fields.z]) !== null && _o !== void 0 ? _o : '');
        this.heading = parseFloat((_p = parts[LineEvent0x25_fields.heading]) !== null && _p !== void 0 ? _p : '');
    }
}
class LineEvent37 extends LineEvent0x25 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x26.ts



const LineEvent0x26_fields = {
    id: 2,
    name: 3,
    jobLevelData: 4,
    currentHp: 5,
    maxHp: 6,
    currentMp: 7,
    maxMp: 8,
    currentTp: 9,
    maxTp: 10,
    x: 11,
    y: 12,
    z: 13,
    heading: 14,
};
// Network status effect event
class LineEvent0x26 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        super(repo, line, parts);
        this.isSource = true;
        this.isJobLevel = true;
        this.id = (_b = (_a = parts[LineEvent0x26_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x26_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.jobLevelData = (_d = parts[LineEvent0x26_fields.jobLevelData]) !== null && _d !== void 0 ? _d : '';
        this.hp = parseInt((_e = parts[LineEvent0x26_fields.currentHp]) !== null && _e !== void 0 ? _e : '');
        this.maxHp = parseInt((_f = parts[LineEvent0x26_fields.maxHp]) !== null && _f !== void 0 ? _f : '');
        this.mp = parseInt((_g = parts[LineEvent0x26_fields.currentMp]) !== null && _g !== void 0 ? _g : '');
        this.maxMp = parseInt((_h = parts[LineEvent0x26_fields.maxMp]) !== null && _h !== void 0 ? _h : '');
        this.tp = parseInt((_j = parts[LineEvent0x26_fields.currentTp]) !== null && _j !== void 0 ? _j : '');
        this.maxTp = parseInt((_k = parts[LineEvent0x26_fields.maxTp]) !== null && _k !== void 0 ? _k : '');
        this.x = parseFloat((_l = parts[LineEvent0x26_fields.x]) !== null && _l !== void 0 ? _l : '');
        this.y = parseFloat((_m = parts[LineEvent0x26_fields.y]) !== null && _m !== void 0 ? _m : '');
        this.z = parseFloat((_o = parts[LineEvent0x26_fields.z]) !== null && _o !== void 0 ? _o : '');
        this.heading = parseFloat((_p = parts[LineEvent0x26_fields.heading]) !== null && _p !== void 0 ? _p : '');
        const padded = EmulatorCommon.zeroPad(this.jobLevelData, 8);
        this.jobIdHex = padded.substr(6, 2).toUpperCase();
        this.jobId = parseInt(this.jobIdHex, 16);
        this.job = util.jobEnumToJob(this.jobId);
        this.level = parseInt(padded.substr(4, 2), 16);
    }
}
class LineEvent38 extends LineEvent0x26 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/LineEvent0x27.ts

const LineEvent0x27_fields = {
    id: 2,
    name: 3,
    currentHp: 4,
    maxHp: 5,
    currentMp: 6,
    maxMp: 7,
    currentTp: 8,
    maxTp: 9,
    x: 10,
    y: 11,
    z: 12,
    heading: 13,
};
// Network update hp event
class LineEvent0x27 extends LineEvent {
    constructor(repo, line, parts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        super(repo, line, parts);
        this.isSource = true;
        this.id = (_b = (_a = parts[LineEvent0x27_fields.id]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        this.name = (_c = parts[LineEvent0x27_fields.name]) !== null && _c !== void 0 ? _c : '';
        this.hp = parseInt((_d = parts[LineEvent0x27_fields.currentHp]) !== null && _d !== void 0 ? _d : '');
        this.maxHp = parseInt((_e = parts[LineEvent0x27_fields.maxHp]) !== null && _e !== void 0 ? _e : '');
        this.mp = parseInt((_f = parts[LineEvent0x27_fields.currentMp]) !== null && _f !== void 0 ? _f : '');
        this.maxMp = parseInt((_g = parts[LineEvent0x27_fields.maxMp]) !== null && _g !== void 0 ? _g : '');
        this.tp = parseInt((_h = parts[LineEvent0x27_fields.currentTp]) !== null && _h !== void 0 ? _h : '');
        this.maxTp = parseInt((_j = parts[LineEvent0x27_fields.maxTp]) !== null && _j !== void 0 ? _j : '');
        this.x = parseFloat((_k = parts[LineEvent0x27_fields.x]) !== null && _k !== void 0 ? _k : '');
        this.y = parseFloat((_l = parts[LineEvent0x27_fields.y]) !== null && _l !== void 0 ? _l : '');
        this.z = parseFloat((_m = parts[LineEvent0x27_fields.z]) !== null && _m !== void 0 ? _m : '');
        this.heading = parseFloat((_o = parts[LineEvent0x27_fields.heading]) !== null && _o !== void 0 ? _o : '');
    }
}
class LineEvent39 extends LineEvent0x27 {
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/network_log_converter/ParseLine.ts

























class ParseLine {
    static parse(repo, line) {
        let ret;
        const parts = line.split('|');
        const event = parts[0];
        // Don't parse raw network packet lines
        if (!event || event === '252')
            return;
        // This is ugly, but Webpack prefers being explicit
        switch ('LineEvent' + event) {
            case 'LineEvent00':
                ret = new LineEvent00(repo, line, parts);
                break;
            case 'LineEvent01':
                ret = new LineEvent01(repo, line, parts);
                break;
            case 'LineEvent02':
                ret = new LineEvent02(repo, line, parts);
                break;
            case 'LineEvent03':
                ret = new LineEvent03(repo, line, parts);
                break;
            case 'LineEvent04':
                ret = new LineEvent04(repo, line, parts);
                break;
            case 'LineEvent12':
                ret = new LineEvent12(repo, line, parts);
                break;
            case 'LineEvent20':
                ret = new LineEvent20(repo, line, parts);
                break;
            case 'LineEvent21':
                ret = new LineEvent21(repo, line, parts);
                break;
            case 'LineEvent22':
                ret = new LineEvent22(repo, line, parts);
                break;
            case 'LineEvent23':
                ret = new LineEvent23(repo, line, parts);
                break;
            case 'LineEvent24':
                ret = new LineEvent24(repo, line, parts);
                break;
            case 'LineEvent25':
                ret = new LineEvent25(repo, line, parts);
                break;
            case 'LineEvent26':
                ret = new LineEvent26(repo, line, parts);
                break;
            case 'LineEvent27':
                ret = new LineEvent27(repo, line, parts);
                break;
            case 'LineEvent28':
                ret = new LineEvent28(repo, line, parts);
                break;
            case 'LineEvent29':
                ret = new LineEvent29(repo, line, parts);
                break;
            case 'LineEvent30':
                ret = new LineEvent30(repo, line, parts);
                break;
            case 'LineEvent31':
                ret = new LineEvent31(repo, line, parts);
                break;
            case 'LineEvent34':
                ret = new LineEvent34(repo, line, parts);
                break;
            case 'LineEvent35':
                ret = new LineEvent35(repo, line, parts);
                break;
            case 'LineEvent36':
                ret = new LineEvent36(repo, line, parts);
                break;
            case 'LineEvent37':
                ret = new LineEvent37(repo, line, parts);
                break;
            case 'LineEvent38':
                ret = new LineEvent38(repo, line, parts);
                break;
            case 'LineEvent39':
                ret = new LineEvent39(repo, line, parts);
                break;
            default:
                ret = new LineEvent(repo, line, parts);
        }
        // Also don't parse lines with a non-sane date. This is 2000-01-01 00:00:00
        if (ret && ret.timestamp < 946684800)
            return;
        // Finally, if the object marks itself as invalid, skip it
        if (ret && ret.invalid)
            return;
        return ret;
    }
}

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/NetworkLogConverter.ts



const isLineEvent = (line) => {
    return !!line;
};
class NetworkLogConverter extends EventBus {
    convertFile(data) {
        const repo = new LogRepository();
        return this.convertLines(
        // Split data into an array of separate lines, removing any blank lines.
        data.split(NetworkLogConverter.lineSplitRegex).filter((l) => l !== ''), repo);
    }
    convertLines(lines, repo) {
        let lineEvents = lines.map((l) => ParseLine.parse(repo, l)).filter(isLineEvent);
        // Call `convert` to convert the network line to non-network format and update indexing values
        lineEvents = lineEvents.map((l, i) => {
            l.index = i;
            return l;
        });
        // Sort the lines based on `${timestamp}_${index}` to handle out-of-order lines properly
        // @TODO: Remove this once underlying CombatantTracker update issues are resolved
        return lineEvents.sort((l, r) => (`${l.timestamp}_${l.index}`).localeCompare(`${r.timestamp}_${r.index}`));
    }
}
NetworkLogConverter.lineSplitRegex = /\r?\n/gm;

;// CONCATENATED MODULE: ./resources/languages.ts
const languages = ['en', 'de', 'fr', 'ja', 'cn', 'ko'];
const isLang = (lang) => {
    const langStrs = languages;
    if (!lang)
        return false;
    return langStrs.includes(lang);
};

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/Encounter.ts








const isPetName = (name, language) => {
    if (language)
        return pet_names[language].includes(name);
    for (const lang in pet_names) {
        if (!isLang(lang))
            throw new UnreachableCode();
        if (pet_names[lang].includes(name))
            return true;
    }
    return false;
};
const isValidTimestamp = (timestamp) => {
    return timestamp > 0 && timestamp < Number.MAX_SAFE_INTEGER;
};
class Encounter {
    constructor(encounterDay, encounterZoneId, encounterZoneName, logLines) {
        this.encounterDay = encounterDay;
        this.encounterZoneId = encounterZoneId;
        this.encounterZoneName = encounterZoneName;
        this.logLines = logLines;
        this.initialOffset = Number.MAX_SAFE_INTEGER;
        this.endStatus = 'Unknown';
        this.startStatus = 'Unknown';
        this.engageAt = Number.MAX_SAFE_INTEGER;
        this.firstPlayerAbility = Number.MAX_SAFE_INTEGER;
        this.firstEnemyAbility = Number.MAX_SAFE_INTEGER;
        this.firstLineIndex = 0;
        this.startTimestamp = 0;
        this.endTimestamp = 0;
        this.duration = 0;
        this.playbackOffset = 0;
        this.language = 'en';
        this.version = Encounter.encounterVersion;
    }
    initialize() {
        const startStatuses = new Set();
        this.logLines.forEach((line, i) => {
            var _a, _b, _c, _d;
            if (!line)
                throw new UnreachableCode();
            let res = EmulatorCommon.matchStart(line.networkLine);
            if (res) {
                this.firstLineIndex = i;
                if ((_a = res.groups) === null || _a === void 0 ? void 0 : _a.StartType)
                    startStatuses.add(res.groups.StartType);
                if ((_b = res.groups) === null || _b === void 0 ? void 0 : _b.StartIn) {
                    const startIn = parseInt(res.groups.StartIn);
                    if (startIn >= 0)
                        this.engageAt = Math.min(line.timestamp + startIn, this.engageAt);
                }
            }
            else {
                res = EmulatorCommon.matchEnd(line.networkLine);
                if (res) {
                    if ((_c = res.groups) === null || _c === void 0 ? void 0 : _c.EndType)
                        this.endStatus = res.groups.EndType;
                }
                else if (isLineEventSource(line) && isLineEventTarget(line)) {
                    if (line.id.startsWith('1') ||
                        (line.id.startsWith('4') && isPetName(line.name, this.language))) {
                        // Player or pet ability
                        if (line.targetId.startsWith('4') && !isPetName(line.targetName, this.language)) {
                            // Targetting non player or pet
                            this.firstPlayerAbility = Math.min(this.firstPlayerAbility, line.timestamp);
                        }
                    }
                    else if (line.id.startsWith('4') && !isPetName(line.name, this.language)) {
                        // Non-player ability
                        if (line.targetId.startsWith('1') || isPetName(line.targetName, this.language)) {
                            // Targetting player or pet
                            this.firstEnemyAbility = Math.min(this.firstEnemyAbility, line.timestamp);
                        }
                    }
                }
            }
            const matchedLang = (_d = res === null || res === void 0 ? void 0 : res.groups) === null || _d === void 0 ? void 0 : _d.language;
            if (isLang(matchedLang))
                this.language = matchedLang;
        });
        this.combatantTracker = new CombatantTracker(this.logLines, this.language);
        this.startTimestamp = this.combatantTracker.firstTimestamp;
        this.endTimestamp = this.combatantTracker.lastTimestamp;
        this.duration = this.endTimestamp - this.startTimestamp;
        if (this.initialOffset === Number.MAX_SAFE_INTEGER) {
            if (this.engageAt < Number.MAX_SAFE_INTEGER)
                this.initialOffset = this.engageAt - this.startTimestamp;
            else if (this.firstPlayerAbility < Number.MAX_SAFE_INTEGER)
                this.initialOffset = this.firstPlayerAbility - this.startTimestamp;
            else if (this.firstEnemyAbility < Number.MAX_SAFE_INTEGER)
                this.initialOffset = this.firstEnemyAbility - this.startTimestamp;
            else
                this.initialOffset = 0;
        }
        const firstLine = this.logLines[this.firstLineIndex];
        if (firstLine && firstLine.offset)
            this.playbackOffset = firstLine.offset;
        this.startStatus = [...startStatuses].sort().join(', ');
    }
    get initialTimestamp() {
        return this.startTimestamp + this.initialOffset;
    }
    shouldPersistFight() {
        return isValidTimestamp(this.firstPlayerAbility) && isValidTimestamp(this.firstEnemyAbility);
    }
    upgrade(version) {
        if (Encounter.encounterVersion <= version)
            return false;
        const repo = new LogRepository();
        const converter = new NetworkLogConverter();
        this.logLines = converter.convertLines(this.logLines.map((l) => l.networkLine), repo);
        this.version = Encounter.encounterVersion;
        this.initialize();
        return true;
    }
}
Encounter.encounterVersion = 1;

;// CONCATENATED MODULE: ./ui/raidboss/emulator/data/LogEventHandler.ts



class LogEventHandler extends EventBus {
    constructor() {
        super(...arguments);
        this.currentFight = [];
        this.currentZoneName = 'Unknown';
        this.currentZoneId = '-1';
    }
    parseLogs(logs) {
        for (const lineObj of logs) {
            this.currentFight.push(lineObj);
            lineObj.offset = lineObj.timestamp - this.currentFightStart;
            const res = EmulatorCommon.matchEnd(lineObj.networkLine);
            if (res) {
                this.endFight();
            }
            else if (lineObj instanceof LineEvent0x01) {
                this.currentZoneId = lineObj.zoneId;
                this.currentZoneName = lineObj.zoneName;
                this.endFight();
            }
        }
    }
    get currentFightStart() {
        var _a, _b;
        return (_b = (_a = this.currentFight[0]) === null || _a === void 0 ? void 0 : _a.timestamp) !== null && _b !== void 0 ? _b : 0;
    }
    get currentFightEnd() {
        var _a, _b;
        return (_b = (_a = this.currentFight.slice(-1)[0]) === null || _a === void 0 ? void 0 : _a.timestamp) !== null && _b !== void 0 ? _b : 0;
    }
    endFight() {
        if (this.currentFight.length < 2)
            return;
        const start = new Date(this.currentFightStart).toISOString();
        const end = new Date(this.currentFightEnd).toISOString();
        console.debug(`Dispatching new fight
Start: ${start}
End: ${end}
Zone: ${this.currentZoneName}
Line Count: ${this.currentFight.length}
`);
        void this.dispatch('fight', start.substr(0, 10), this.currentZoneId, this.currentZoneName, this.currentFight);
        this.currentFight = [];
    }
}

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js??ruleSet[1].rules[1].use!./ui/raidboss/emulator/data/NetworkLogConverterWorker.js






onmessage = async msg => {
  const logConverter = new NetworkLogConverter();
  const localLogHandler = new LogEventHandler();
  const repo = new LogRepository(); // Listen for LogEventHandler to dispatch fights and persist them

  localLogHandler.on('fight', async (day, zoneId, zoneName, lines) => {
    const enc = new Encounter(day, zoneId, zoneName, lines);
    enc.initialize();

    if (enc.shouldPersistFight()) {
      postMessage({
        type: 'encounter',
        encounter: enc,
        name: enc.combatantTracker.getMainCombatantName()
      });
    }
  }); // Convert the message manually due to memory issues with extremely large files

  const decoder = new TextDecoder('UTF-8');
  let buf = new Uint8Array(msg.data);
  let nextOffset = 0;
  let lines = [];
  let lineCount = 0;

  for (let currentOffset = nextOffset; nextOffset < buf.length && nextOffset !== -1; currentOffset = nextOffset) {
    nextOffset = buf.indexOf(0x0A, nextOffset + 1);
    const line = decoder.decode(buf.slice(currentOffset, nextOffset)).trim();

    if (line.length) {
      ++lineCount;
      lines.push(line);
    }

    if (lines.length >= 1000) {
      lines = logConverter.convertLines(lines, repo);
      localLogHandler.parseLogs(lines);
      postMessage({
        type: 'progress',
        lines: lineCount,
        bytes: nextOffset,
        totalBytes: buf.length
      });
      lines = [];
    }
  }

  if (lines.length > 0) {
    lines = logConverter.convertLines(lines, repo);
    localLogHandler.parseLogs(lines);
    lines = [];
  }

  postMessage({
    type: 'progress',
    lines: lineCount,
    bytes: buf.length,
    totalBytes: buf.length
  });
  buf = null;
  localLogHandler.endFight();
  postMessage({
    type: 'done'
  });
};
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vcmVzb3VyY2VzL3JlZ2V4ZXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3Jlc291cmNlcy9uZXRyZWdleGVzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi9yZXNvdXJjZXMvdHJhbnNsYXRpb25zLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9yYWlkYm9zcy9lbXVsYXRvci9FbXVsYXRvckNvbW1vbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vcmVzb3VyY2VzL25vdF9yZWFjaGVkLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9yYWlkYm9zcy9lbXVsYXRvci9kYXRhL0NvbWJhdGFudC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvcmFpZGJvc3MvZW11bGF0b3IvZGF0YS9Db21iYXRhbnRKb2JTZWFyY2gudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvQ29tYmF0YW50U3RhdGUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3Jlc291cmNlcy9wZXRfbmFtZXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvcmFpZGJvc3MvZW11bGF0b3IvZGF0YS9Db21iYXRhbnRUcmFja2VyLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9yYWlkYm9zcy9lbXVsYXRvci9kYXRhL25ldHdvcmtfbG9nX2NvbnZlcnRlci9Mb2dSZXBvc2l0b3J5LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9yYWlkYm9zcy9lbXVsYXRvci9FdmVudEJ1cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvcmFpZGJvc3MvZW11bGF0b3IvZGF0YS9uZXR3b3JrX2xvZ19jb252ZXJ0ZXIvTGluZUV2ZW50MHgwMC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvcmFpZGJvc3MvZW11bGF0b3IvZGF0YS9uZXR3b3JrX2xvZ19jb252ZXJ0ZXIvTGluZUV2ZW50MHgwMS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvcmFpZGJvc3MvZW11bGF0b3IvZGF0YS9uZXR3b3JrX2xvZ19jb252ZXJ0ZXIvTGluZUV2ZW50MHgwMi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vcmVzb3VyY2VzL3V0aWwudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MDMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MDQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MEMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MTQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MTUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MTYudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MTcudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MTgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MTkudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MUEudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MUIudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MUMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MUQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MUUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MUYudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MjIudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MjMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MjQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MjUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MjYudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL0xpbmVFdmVudDB4MjcudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvbmV0d29ya19sb2dfY29udmVydGVyL1BhcnNlTGluZS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvcmFpZGJvc3MvZW11bGF0b3IvZGF0YS9OZXR3b3JrTG9nQ29udmVydGVyLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi9yZXNvdXJjZXMvbGFuZ3VhZ2VzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9yYWlkYm9zcy9lbXVsYXRvci9kYXRhL0VuY291bnRlci50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvcmFpZGJvc3MvZW11bGF0b3IvZGF0YS9Mb2dFdmVudEhhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3JhaWRib3NzL2VtdWxhdG9yL2RhdGEvTmV0d29ya0xvZ0NvbnZlcnRlcldvcmtlci5qcyJdLCJuYW1lcyI6WyJvbm1lc3NhZ2UiLCJtc2ciLCJsb2dDb252ZXJ0ZXIiLCJOZXR3b3JrTG9nQ29udmVydGVyIiwibG9jYWxMb2dIYW5kbGVyIiwiTG9nRXZlbnRIYW5kbGVyIiwicmVwbyIsIkxvZ1JlcG9zaXRvcnkiLCJvbiIsImRheSIsInpvbmVJZCIsInpvbmVOYW1lIiwibGluZXMiLCJlbmMiLCJFbmNvdW50ZXIiLCJpbml0aWFsaXplIiwic2hvdWxkUGVyc2lzdEZpZ2h0IiwicG9zdE1lc3NhZ2UiLCJ0eXBlIiwiZW5jb3VudGVyIiwibmFtZSIsImNvbWJhdGFudFRyYWNrZXIiLCJnZXRNYWluQ29tYmF0YW50TmFtZSIsImRlY29kZXIiLCJUZXh0RGVjb2RlciIsImJ1ZiIsIlVpbnQ4QXJyYXkiLCJkYXRhIiwibmV4dE9mZnNldCIsImxpbmVDb3VudCIsImN1cnJlbnRPZmZzZXQiLCJsZW5ndGgiLCJpbmRleE9mIiwibGluZSIsImRlY29kZSIsInNsaWNlIiwidHJpbSIsInB1c2giLCJjb252ZXJ0TGluZXMiLCJwYXJzZUxvZ3MiLCJieXRlcyIsInRvdGFsQnl0ZXMiLCJlbmRGaWdodCJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFVQSxNQUFNLGlCQUFpQixHQUFHLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQVUsQ0FBQztBQUNqRyxNQUFNLGFBQWEsR0FBRyxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQVUsQ0FBQztBQUNySCxNQUFNLGlCQUFpQixHQUFHO0lBQ3hCLFdBQVc7SUFDWCxVQUFVO0lBQ1YsUUFBUTtJQUNSLElBQUk7SUFDSixTQUFTO0lBQ1QsVUFBVTtJQUNWLFFBQVE7SUFDUixPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTztJQUNQLFFBQVE7SUFDUixRQUFRO0lBQ1IsUUFBUTtJQUNSLFFBQVE7SUFDUixRQUFRO0lBQ1IsVUFBVTtJQUNWLGFBQWE7SUFDYixVQUFVO0lBQ1YsYUFBYTtJQUNiLFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULGVBQWU7SUFDZixJQUFJO0lBQ0osT0FBTztJQUNQLElBQUk7SUFDSixPQUFPO0lBQ1AsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsU0FBUztJQUNULFNBQVM7Q0FDRCxDQUFDO0FBQ1gs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a0IsQ0FBQyxHQUFHLEdBQUc7WUFDbkUsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUNuRSxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsR0FBRyxHQUFHO1lBQzVFLE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEdBQUc7WUFDakUsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUMvRCxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxHQUFHO1lBQy9ELE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEdBQUc7WUFDL0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUMvRCxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxHQUFHO1lBQy9ELE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEdBQUc7WUFDL0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUMvRCxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxHQUFHO1lBQy9ELE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEdBQUc7WUFDL0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUMvRCxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxHQUFHO1lBQy9ELE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEdBQUc7WUFDakUsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUNqRSxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsR0FBRyxHQUFHO1lBQ2pFLE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEdBQUc7WUFDakUsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUcsR0FBRztZQUNqRSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDLEdBQUcsR0FBRztZQUMzRixPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxZ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LEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQ3JGLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO1FBQ3JGLElBQUk7S0FDTDtJQUNELEdBQUcsRUFBRTtRQUNILEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDckYsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDcEYsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0tBQ3ZFO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUN0RixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDeEYsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDdkYsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtLQUMzRDtJQUNELEdBQUcsRUFBRTtRQUNILEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztRQUNsRixLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDbEYsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQ2xGLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztRQUNsRixLQUFLO0tBQ047SUFDRCxHQUFHLEVBQUU7UUFDSCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSztRQUN0RixJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQ3hGLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDbkYsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRztLQUM5RTtJQUNELEdBQUcsRUFBRTtRQUNILEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDekYsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztRQUNyRixLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDdkYsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJO1FBQ3pGLElBQUksRUFBRSxJQUFJO0tBQ1g7SUFDRCxHQUFHLEVBQUU7UUFDSCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQ3pGLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO1FBQ3pGLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUN4RixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztRQUN4RixLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUN0RixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7S0FDakI7SUFDRCxHQUFHLEVBQUU7UUFDSCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQ3pGLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDekYsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQzFGLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0tBQy9FO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUs7UUFDekYsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDcEYsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRTtLQUNuRjtJQUNELEdBQUcsRUFBRTtRQUNILEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDekYsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUNwRixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSztRQUNuRixLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUN2RixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0tBQ3ZCO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztRQUN6RixLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUNyRixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDeEYsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtLQUM3RTtJQUNELEdBQUcsRUFBRTtRQUNILEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQ3hGLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQzFGLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO1FBQ3JGLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHO0tBQzVCO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztRQUN6RixLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUN2RixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQ3JGLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0tBQ25GO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQ2xGLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztRQUNsRixLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDbEYsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQ2xGLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztRQUNsRixLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztLQUNsQztJQUNELEdBQUcsRUFBRTtRQUNILEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQ3RGLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDbkYsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDdEYsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztLQUN2RDtJQUNELEdBQUcsRUFBRTtRQUNILEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztRQUNsRixLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDbEYsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7UUFDdEYsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUN0RixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1FBQ3BGLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7S0FDM0Q7SUFDRCxHQUFHLEVBQUU7UUFDSCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDbEYsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUNuRixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUNsRixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtRQUNsRixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0tBQ3ZCO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1FBQ2xGLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztRQUNsRixLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7UUFDbEYsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFF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QUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFdBQVcsU0FBRyxLQUFLLENBQUMsb0JBQU0sQ0FBQyxXQUFXLENBQUMsbUNBQUksRUFBRSxDQUFDO1FBQ25ELElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsRUFBRSxHQUFHLFVBQVUsT0FBQyxLQUFLLENBQUMsb0JBQU0sQ0FBQyxTQUFTLENBQUMsbUNBQUksRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFdBQVcsU0FBRyxLQUFLLENBQUMsb0JBQU0sQ0FBQyxXQUFXLENBQUMsbUNBQUksRUFBRSxDQUFDO1FBQ25ELElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsRUFBRSxHQUFHLFVBQVUsT0FBQyxLQUFLLENBQUMsb0JBQU0sQ0FBQyxTQUFTLENBQUMsbUNBQUksRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLE9BQUMsS0FBSyxDQUFDLG9CQUFNLENBQUMsS0FBSyxDQUFDLG1DQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxPQUFPLFNBQUcsS0FBSyxDQUFDLG9CQUFNLENBQUMsT0FBTyxDQUFDLG1DQUFJLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE9BQU8sU0FBRyxLQUFLLENBQUMsb0JBQU0sQ0FBQyxPQUFPLENBQUMsbUNBQUksRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxTQUFHLEtBQUssQ0FBQyxvQkFBTSxDQUFDLE9BQU8sQ0FBQyxtQ0FBSSxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLENB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IjoiTmV0d29ya0xvZ0NvbnZlcnRlcldvcmtlci5idW5kbGUud29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzZVJlZ0V4cCB9IGZyb20gJy4uL3R5cGVzL3RyaWdnZXInO1xyXG5cclxuZXhwb3J0IHR5cGUgUGFyYW1zPFQgZXh0ZW5kcyBzdHJpbmc+ID1cclxuICBQYXJ0aWFsPFJlY29yZDxFeGNsdWRlPFQsICd0aW1lc3RhbXAnIHwgJ2NhcHR1cmUnPiwgc3RyaW5nIHwgc3RyaW5nW10+ICZcclxuICB7ICd0aW1lc3RhbXAnOiBzdHJpbmc7ICdjYXB0dXJlJzogYm9vbGVhbiB9PjtcclxuXHJcbmV4cG9ydCB0eXBlIFJlZ2V4PFQgZXh0ZW5kcyBzdHJpbmc+ID0gQmFzZVJlZ0V4cDxFeGNsdWRlPFQsICdjYXB0dXJlJz4+O1xyXG5cclxudHlwZSBWYWxpZFN0cmluZ09yQXJyYXkgPSBzdHJpbmcgfCBzdHJpbmdbXTtcclxuXHJcbmNvbnN0IHN0YXJ0c1VzaW5nUGFyYW1zID0gWyd0aW1lc3RhbXAnLCAnc291cmNlJywgJ2lkJywgJ2FiaWxpdHknLCAndGFyZ2V0JywgJ2NhcHR1cmUnXSBhcyBjb25zdDtcclxuY29uc3QgYWJpbGl0eVBhcmFtcyA9IFsndGltZXN0YW1wJywgJ3NvdXJjZScsICdzb3VyY2VJZCcsICdpZCcsICdhYmlsaXR5JywgJ3RhcmdldElkJywgJ3RhcmdldCcsICdjYXB0dXJlJ10gYXMgY29uc3Q7XHJcbmNvbnN0IGFiaWxpdHlGdWxsUGFyYW1zID0gW1xyXG4gICd0aW1lc3RhbXAnLFxyXG4gICdzb3VyY2VJZCcsXHJcbiAgJ3NvdXJjZScsXHJcbiAgJ2lkJyxcclxuICAnYWJpbGl0eScsXHJcbiAgJ3RhcmdldElkJyxcclxuICAndGFyZ2V0JyxcclxuICAnZmxhZ3MnLFxyXG4gICdmbGFnMCcsXHJcbiAgJ2ZsYWcxJyxcclxuICAnZmxhZzInLFxyXG4gICdmbGFnMycsXHJcbiAgJ2ZsYWc0JyxcclxuICAnZmxhZzUnLFxyXG4gICdmbGFnNicsXHJcbiAgJ2ZsYWc3JyxcclxuICAnZmxhZzgnLFxyXG4gICdmbGFnOScsXHJcbiAgJ2ZsYWcxMCcsXHJcbiAgJ2ZsYWcxMScsXHJcbiAgJ2ZsYWcxMicsXHJcbiAgJ2ZsYWcxMycsXHJcbiAgJ2ZsYWcxNCcsXHJcbiAgJ3RhcmdldEhwJyxcclxuICAndGFyZ2V0TWF4SHAnLFxyXG4gICd0YXJnZXRNcCcsXHJcbiAgJ3RhcmdldE1heE1wJyxcclxuICAndGFyZ2V0WCcsXHJcbiAgJ3RhcmdldFknLFxyXG4gICd0YXJnZXRaJyxcclxuICAndGFyZ2V0SGVhZGluZycsXHJcbiAgJ2hwJyxcclxuICAnbWF4SHAnLFxyXG4gICdtcCcsXHJcbiAgJ21heE1wJyxcclxuICAneCcsXHJcbiAgJ3knLFxyXG4gICd6JyxcclxuICAnaGVhZGluZycsXHJcbiAgJ2NhcHR1cmUnLFxyXG5dIGFzIGNvbnN0O1xyXG5jb25zdCBoZWFkTWFya2VyUGFyYW1zID0gWyd0aW1lc3RhbXAnLCAndGFyZ2V0SWQnLCAndGFyZ2V0JywgJ2lkJywgJ2NhcHR1cmUnXSBhcyBjb25zdDtcclxuY29uc3QgYWRkZWRDb21iYXRhbnRQYXJhbXMgPSBbJ3RpbWVzdGFtcCcsICduYW1lJywgJ2NhcHR1cmUnXSBhcyBjb25zdDtcclxuY29uc3QgYWRkZWRDb21iYXRhbnRGdWxsUGFyYW1zID0gW1xyXG4gICd0aW1lc3RhbXAnLFxyXG4gICdpZCcsXHJcbiAgJ25hbWUnLFxyXG4gICdqb2InLFxyXG4gICdsZXZlbCcsXHJcbiAgJ2hwJyxcclxuICAneCcsXHJcbiAgJ3knLFxyXG4gICd6JyxcclxuICAnbnBjSWQnLFxyXG4gICdjYXB0dXJlJyxcclxuXSBhcyBjb25zdDtcclxuY29uc3QgcmVtb3ZpbmdDb21iYXRhbnRQYXJhbXMgPSBbXHJcbiAgJ3RpbWVzdGFtcCcsXHJcbiAgJ2lkJyxcclxuICAnbmFtZScsXHJcbiAgJ2hwJyxcclxuICAneCcsXHJcbiAgJ3knLFxyXG4gICd6JyxcclxuICAnY2FwdHVyZScsXHJcbl0gYXMgY29uc3Q7XHJcbmNvbnN0IGdhaW5zRWZmZWN0UGFyYW1zID0gWyd0aW1lc3RhbXAnLCAndGFyZ2V0SWQnLCAndGFyZ2V0JywgJ2VmZmVjdCcsICdzb3VyY2UnLCAnZHVyYXRpb24nLCAnY2FwdHVyZSddIGFzIGNvbnN0O1xyXG5jb25zdCBzdGF0dXNFZmZlY3RFeHBsaWNpdFBhcmFtcyA9IFtcclxuICAndGltZXN0YW1wJyxcclxuICAndGFyZ2V0SWQnLFxyXG4gICd0YXJnZXQnLFxyXG4gICdqb2InLFxyXG4gICdocCcsXHJcbiAgJ21heEhwJyxcclxuICAnbXAnLFxyXG4gICdtYXhNcCcsXHJcbiAgJ3gnLFxyXG4gICd5JyxcclxuICAneicsXHJcbiAgJ2hlYWRpbmcnLFxyXG4gICdkYXRhMCcsXHJcbiAgJ2RhdGExJyxcclxuICAnZGF0YTInLFxyXG4gICdkYXRhMycsXHJcbiAgJ2RhdGE0JyxcclxuICAnY2FwdHVyZScsXHJcbl0gYXMgY29uc3Q7XHJcbmNvbnN0IGxvc2VzRWZmZWN0UGFyYW1zID0gWyd0aW1lc3RhbXAnLCAndGFyZ2V0SWQnLCAndGFyZ2V0JywgJ2VmZmVjdCcsICdzb3VyY2UnLCAnY2FwdHVyZSddIGFzIGNvbnN0O1xyXG5jb25zdCBzdGF0Q2hhbmdlUGFyYW1zID0gW1xyXG4gICd0aW1lc3RhbXAnLFxyXG4gICdqb2InLFxyXG4gICdzdHJlbmd0aCcsXHJcbiAgJ2RleHRlcml0eScsXHJcbiAgJ3ZpdGFsaXR5JyxcclxuICAnaW50ZWxsaWdlbmNlJyxcclxuICAnbWluZCcsXHJcbiAgJ3BpZXR5JyxcclxuICAnYXR0YWNrUG93ZXInLFxyXG4gICdkaXJlY3RIaXQnLFxyXG4gICdjcml0aWNhbEhpdCcsXHJcbiAgJ2F0dGFja01hZ2ljUG90ZW5jeScsXHJcbiAgJ2hlYWxNYWdpY1BvdGVuY3knLFxyXG4gICdkZXRlcm1pbmF0aW9uJyxcclxuICAnc2tpbGxTcGVlZCcsXHJcbiAgJ3NwZWxsU3BlZWQnLFxyXG4gICd0ZW5hY2l0eScsXHJcbiAgJ2NhcHR1cmUnLFxyXG5dIGFzIGNvbnN0O1xyXG5jb25zdCB0ZXRoZXJQYXJhbXMgPSBbJ3RpbWVzdGFtcCcsICdzb3VyY2UnLCAnc291cmNlSWQnLCAndGFyZ2V0JywgJ3RhcmdldElkJywgJ2lkJywgJ2NhcHR1cmUnXSBhcyBjb25zdDtcclxuY29uc3Qgd2FzRGVmZWF0ZWRQYXJhbXMgPSBbJ3RpbWVzdGFtcCcsICd0YXJnZXQnLCAnc291cmNlJywgJ2NhcHR1cmUnXSBhcyBjb25zdDtcclxuY29uc3QgaGFzSFBQYXJhbXMgPSBbJ3RpbWVzdGFtcCcsICduYW1lJywgJ2hwJywgJ2NhcHR1cmUnXSBhcyBjb25zdDtcclxuY29uc3QgZWNob1BhcmFtcyA9IFsndGltZXN0YW1wJywgJ2NvZGUnLCAnbGluZScsICdjYXB0dXJlJ10gYXMgY29uc3Q7XHJcbmNvbnN0IGRpYWxvZ1BhcmFtcyA9IFsndGltZXN0YW1wJywgJ2NvZGUnLCAnbGluZScsICduYW1lJywgJ2NhcHR1cmUnXSBhcyBjb25zdDtcclxuY29uc3QgbWVzc2FnZVBhcmFtcyA9IFsndGltZXN0YW1wJywgJ2NvZGUnLCAnbGluZScsICdjYXB0dXJlJ10gYXMgY29uc3Q7XHJcbmNvbnN0IGdhbWVMb2dQYXJhbXMgPSBbJ3RpbWVzdGFtcCcsICdjb2RlJywgJ2xpbmUnLCAnY2FwdHVyZSddIGFzIGNvbnN0O1xyXG5jb25zdCBnYW1lTmFtZUxvZ1BhcmFtcyA9IFsndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSBhcyBjb25zdDtcclxuY29uc3QgY2hhbmdlWm9uZVBhcmFtcyA9IFsndGltZXN0YW1wJywgJ25hbWUnLCAnY2FwdHVyZSddIGFzIGNvbnN0O1xyXG5jb25zdCBuZXR3b3JrNmRQYXJhbXMgPSBbJ3RpbWVzdGFtcCcsICdpbnN0YW5jZScsICdjb21tYW5kJywgJ2RhdGEwJywgJ2RhdGExJywgJ2RhdGEyJywgJ2RhdGEzJywgJ2NhcHR1cmUnXSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCB0eXBlIFN0YXJ0c1VzaW5nUGFyYW1zID0gdHlwZW9mIHN0YXJ0c1VzaW5nUGFyYW1zW251bWJlcl07XHJcbmV4cG9ydCB0eXBlIEFiaWxpdHlQYXJhbXMgPSB0eXBlb2YgYWJpbGl0eVBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBBYmlsaXR5RnVsbFBhcmFtcyA9IHR5cGVvZiBhYmlsaXR5RnVsbFBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBIZWFkTWFya2VyUGFyYW1zID0gdHlwZW9mIGhlYWRNYXJrZXJQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgQWRkZWRDb21iYXRhbnRQYXJhbXMgPSB0eXBlb2YgYWRkZWRDb21iYXRhbnRQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgQWRkZWRDb21iYXRhbnRGdWxsUGFyYW1zID0gdHlwZW9mIGFkZGVkQ29tYmF0YW50RnVsbFBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBSZW1vdmluZ0NvbWJhdGFudFBhcmFtcyA9IHR5cGVvZiByZW1vdmluZ0NvbWJhdGFudFBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBHYWluc0VmZmVjdFBhcmFtcyA9IHR5cGVvZiBnYWluc0VmZmVjdFBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBTdGF0dXNFZmZlY3RFeHBsaWNpdFBhcmFtcyA9IHR5cGVvZiBzdGF0dXNFZmZlY3RFeHBsaWNpdFBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBMb3Nlc0VmZmVjdFBhcmFtcyA9IHR5cGVvZiBsb3Nlc0VmZmVjdFBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBTdGF0Q2hhbmdlUGFyYW1zID0gdHlwZW9mIHN0YXRDaGFuZ2VQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgVGV0aGVyUGFyYW1zID0gdHlwZW9mIHRldGhlclBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBXYXNEZWZlYXRlZFBhcmFtcyA9IHR5cGVvZiB3YXNEZWZlYXRlZFBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBIYXNIUFBhcmFtcyA9IHR5cGVvZiBoYXNIUFBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBFY2hvUGFyYW1zID0gdHlwZW9mIGVjaG9QYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgRGlhbG9nUGFyYW1zID0gdHlwZW9mIGRpYWxvZ1BhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBNZXNzYWdlUGFyYW1zID0gdHlwZW9mIG1lc3NhZ2VQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgR2FtZUxvZ1BhcmFtcyA9IHR5cGVvZiBnYW1lTG9nUGFyYW1zW251bWJlcl07XHJcbmV4cG9ydCB0eXBlIEdhbWVOYW1lTG9nUGFyYW1zID0gdHlwZW9mIGdhbWVOYW1lTG9nUGFyYW1zW251bWJlcl07XHJcbmV4cG9ydCB0eXBlIENoYW5nZVpvbmVQYXJhbXMgPSB0eXBlb2YgY2hhbmdlWm9uZVBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBOZXR3b3JrNmRQYXJhbXMgPSB0eXBlb2YgbmV0d29yazZkUGFyYW1zW251bWJlcl07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWdleGVzIHtcclxuICAvKipcclxuICAgKiBmaWVsZHM6IHNvdXJjZSwgaWQsIGFiaWxpdHksIHRhcmdldCwgY2FwdHVyZVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMxNC1uZXR3b3Jrc3RhcnRzY2FzdGluZ1xyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGFydHNVc2luZyhmPzogUGFyYW1zPFN0YXJ0c1VzaW5nUGFyYW1zPik6IFJlZ2V4PFN0YXJ0c1VzaW5nUGFyYW1zPiB7XHJcbiAgICBpZiAodHlwZW9mIGYgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBmID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKGYsICdzdGFydHNVc2luZycsIHN0YXJ0c1VzaW5nUGFyYW1zKTtcclxuICAgIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChmLmNhcHR1cmUpO1xyXG4gICAgbGV0IHN0ciA9IFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0aW1lc3RhbXAnLCAnXFxcXHl7VGltZXN0YW1wfScpICtcclxuICAgICAgJyAxNDonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2lkJywgZi5pZCwgJ1xcXFx5e0FiaWxpdHlDb2RlfScpICsgJzonO1xyXG5cclxuICAgIGlmIChmLnNvdXJjZSB8fCBmLmlkIHx8IGYudGFyZ2V0IHx8IGNhcHR1cmUpXHJcbiAgICAgIHN0ciArPSBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnc291cmNlJywgZi5zb3VyY2UsICcuKj8nKSArICcgc3RhcnRzIHVzaW5nICc7XHJcblxyXG4gICAgaWYgKGYuYWJpbGl0eSB8fCBmLnRhcmdldCB8fCBjYXB0dXJlKVxyXG4gICAgICBzdHIgKz0gUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2FiaWxpdHknLCBmLmFiaWxpdHksICcuKj8nKSArICcgb24gJztcclxuXHJcbiAgICBpZiAoZi50YXJnZXQgfHwgY2FwdHVyZSlcclxuICAgICAgc3RyICs9IFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0YXJnZXQnLCBmLnRhcmdldCwgJy4qPycpICsgJ1xcXFwuJztcclxuXHJcbiAgICByZXR1cm4gUmVnZXhlcy5wYXJzZShzdHIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZmllbGRzOiBzb3VyY2VJZCwgc291cmNlLCBpZCwgYWJpbGl0eSwgdGFyZ2V0SWQsIHRhcmdldCwgY2FwdHVyZVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMxNS1uZXR3b3JrYWJpbGl0eVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMxNi1uZXR3b3JrYW9lYWJpbGl0eVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5KGY/OiBQYXJhbXM8QWJpbGl0eVBhcmFtcz4pOiBSZWdleDxBYmlsaXR5UGFyYW1zPiB7XHJcbiAgICBpZiAodHlwZW9mIGYgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBmID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKGYsICdhYmlsaXR5JywgYWJpbGl0eVBhcmFtcyk7XHJcbiAgICBjb25zdCBjYXB0dXJlID0gUmVnZXhlcy50cnVlSWZVbmRlZmluZWQoZi5jYXB0dXJlKTtcclxuICAgIGxldCBzdHIgPSBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGltZXN0YW1wJywgJ1xcXFx5e1RpbWVzdGFtcH0nKSArXHJcbiAgICAgICcgMVs1Nl06JyArIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdzb3VyY2VJZCcsICdcXFxceXtPYmplY3RJZH0nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdzb3VyY2UnLCBmLnNvdXJjZSwgJ1teOl0qPycpICsgJzonO1xyXG5cclxuICAgIGlmIChmLmlkIHx8IGYuYWJpbGl0eSB8fCBmLnRhcmdldCB8fCBmLnRhcmdldElkIHx8IGNhcHR1cmUpXHJcbiAgICAgIHN0ciArPSBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnaWQnLCBmLmlkLCAnXFxcXHl7QWJpbGl0eUNvZGV9JykgKyAnOic7XHJcblxyXG4gICAgaWYgKGYuYWJpbGl0eSB8fCBmLnRhcmdldCB8fCBmLnRhcmdldElkIHx8IGNhcHR1cmUpXHJcbiAgICAgIHN0ciArPSBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnYWJpbGl0eScsIGYuYWJpbGl0eSwgJ1teOl0qPycpICsgJzonO1xyXG5cclxuICAgIGlmIChmLnRhcmdldCB8fCBmLnRhcmdldElkIHx8IGNhcHR1cmUpXHJcbiAgICAgIHN0ciArPSBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGFyZ2V0SWQnLCAnXFxcXHl7T2JqZWN0SWR9JykgKyAnOic7XHJcblxyXG4gICAgaWYgKGYudGFyZ2V0IHx8IGNhcHR1cmUpXHJcbiAgICAgIHN0ciArPSBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGFyZ2V0JywgZi50YXJnZXQsICdbXjpdKj8nKSArICc6JztcclxuXHJcbiAgICByZXR1cm4gUmVnZXhlcy5wYXJzZShzdHIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZmllbGRzOiBzb3VyY2VJZCwgc291cmNlLCBpZCwgYWJpbGl0eSwgdGFyZ2V0SWQsIHRhcmdldCwgZmxhZ3MsIHgsIHksIHosIGhlYWRpbmcsIGNhcHR1cmVcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMTUtbmV0d29ya2FiaWxpdHlcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMTYtbmV0d29ya2FvZWFiaWxpdHlcclxuICAgKi9cclxuICBzdGF0aWMgYWJpbGl0eUZ1bGwoZj86IFBhcmFtczxBYmlsaXR5RnVsbFBhcmFtcz4pOiBSZWdleDxBYmlsaXR5RnVsbFBhcmFtcz4ge1xyXG4gICAgaWYgKHR5cGVvZiBmID09PSAndW5kZWZpbmVkJylcclxuICAgICAgZiA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhmLCAnYWJpbGl0eUZ1bGwnLCBhYmlsaXR5RnVsbFBhcmFtcyk7XHJcbiAgICBjb25zdCBjYXB0dXJlID0gUmVnZXhlcy50cnVlSWZVbmRlZmluZWQoZi5jYXB0dXJlKTtcclxuICAgIGNvbnN0IHN0ciA9IFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0aW1lc3RhbXAnLCAnXFxcXHl7VGltZXN0YW1wfScpICtcclxuICAgICAgJyAxWzU2XTonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3NvdXJjZUlkJywgZi5zb3VyY2VJZCwgJ1xcXFx5e09iamVjdElkfScpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3NvdXJjZScsIGYuc291cmNlLCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnaWQnLCBmLmlkLCAnXFxcXHl7QWJpbGl0eUNvZGV9JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnYWJpbGl0eScsIGYuYWJpbGl0eSwgJ1teOl0qPycpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RhcmdldElkJywgZi50YXJnZXRJZCwgJ1xcXFx5e09iamVjdElkfScpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RhcmdldCcsIGYudGFyZ2V0LCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZ3MnLCBmLmZsYWdzLCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzAnLCBmLmZsYWcwLCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzEnLCBmLmZsYWcxLCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzInLCBmLmZsYWcyLCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzMnLCBmLmZsYWczLCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzQnLCBmLmZsYWc0LCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzUnLCBmLmZsYWc1LCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzYnLCBmLmZsYWc2LCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzcnLCBmLmZsYWc3LCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzgnLCBmLmZsYWc4LCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzknLCBmLmZsYWc5LCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzEwJywgZi5mbGFnMTAsICdbXjpdKj8nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdmbGFnMTEnLCBmLmZsYWcxMSwgJ1teOl0qPycpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2ZsYWcxMicsIGYuZmxhZzEyLCAnW146XSo/JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZmxhZzEzJywgZi5mbGFnMTMsICdbXjpdKj8nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdmbGFnMTQnLCBmLmZsYWcxMywgJ1teOl0qPycpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5vcHRpb25hbChSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGFyZ2V0SHAnLCBmLnRhcmdldEhwLCAnXFxcXHl7RmxvYXR9JykpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5vcHRpb25hbChSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGFyZ2V0TWF4SHAnLCBmLnRhcmdldE1heEhwLCAnXFxcXHl7RmxvYXR9JykpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5vcHRpb25hbChSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGFyZ2V0TXAnLCBmLnRhcmdldE1wLCAnXFxcXHl7RmxvYXR9JykpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5vcHRpb25hbChSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGFyZ2V0TWF4TXAnLCBmLnRhcmdldE1heE1wLCAnXFxcXHl7RmxvYXR9JykpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5vcHRpb25hbCgnXFxcXHl7RmxvYXR9JykgKyAnOicgKyAvLyBUYXJnZXQgVFBcclxuICAgICAgUmVnZXhlcy5vcHRpb25hbCgnXFxcXHl7RmxvYXR9JykgKyAnOicgKyAvLyBUYXJnZXQgTWF4IFRQXHJcbiAgICAgIFJlZ2V4ZXMub3B0aW9uYWwoUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RhcmdldFgnLCBmLnRhcmdldFgsICdcXFxceXtGbG9hdH0nKSkgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm9wdGlvbmFsKFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0YXJnZXRZJywgZi50YXJnZXRZLCAnXFxcXHl7RmxvYXR9JykpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5vcHRpb25hbChSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGFyZ2V0WicsIGYudGFyZ2V0WiwgJ1xcXFx5e0Zsb2F0fScpKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMub3B0aW9uYWwoUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RhcmdldEhlYWRpbmcnLCBmLnRhcmdldEhlYWRpbmcsICdcXFxceXtGbG9hdH0nKSkgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnaHAnLCBmLmhwLCAnXFxcXHl7RmxvYXR9JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnbWF4SHAnLCBmLm1heEhwLCAnXFxcXHl7RmxvYXR9JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnbXAnLCBmLm1wLCAnXFxcXHl7RmxvYXR9JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnbWF4TXAnLCBmLm1heE1wLCAnXFxcXHl7RmxvYXR9JykgKyAnOicgK1xyXG4gICAgICAnXFxcXHl7RmxvYXR9OicgKyAvLyBTb3VyY2UgVFBcclxuICAgICAgJ1xcXFx5e0Zsb2F0fTonICsgLy8gU291cmNlIE1heCBUUFxyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAneCcsIGYueCwgJ1xcXFx5e0Zsb2F0fScpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3knLCBmLnksICdcXFxceXtGbG9hdH0nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd6JywgZi56LCAnXFxcXHl7RmxvYXR9JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnaGVhZGluZycsIGYuaGVhZGluZywgJ1xcXFx5e0Zsb2F0fScpICsgJzonICtcclxuICAgICAgJy4qPyQnOyAvLyBVbmtub3duIGxhc3QgZmllbGRcclxuICAgIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cik7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogZmllbGRzOiB0YXJnZXRJZCwgdGFyZ2V0LCBpZCwgY2FwdHVyZVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMxYi1uZXR3b3JrdGFyZ2V0aWNvbi1oZWFkLW1hcmtlcnNcclxuICAgKi9cclxuICBzdGF0aWMgaGVhZE1hcmtlcihmPzogUGFyYW1zPEhlYWRNYXJrZXJQYXJhbXM+KTogUmVnZXg8SGVhZE1hcmtlclBhcmFtcz4ge1xyXG4gICAgaWYgKHR5cGVvZiBmID09PSAndW5kZWZpbmVkJylcclxuICAgICAgZiA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhmLCAnaGVhZE1hcmtlcicsIGhlYWRNYXJrZXJQYXJhbXMpO1xyXG4gICAgY29uc3QgY2FwdHVyZSA9IFJlZ2V4ZXMudHJ1ZUlmVW5kZWZpbmVkKGYuY2FwdHVyZSk7XHJcbiAgICBjb25zdCBzdHIgPSBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGltZXN0YW1wJywgJ1xcXFx5e1RpbWVzdGFtcH0nKSArXHJcbiAgICAgICcgMUI6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0YXJnZXRJZCcsIGYudGFyZ2V0SWQsICdcXFxceXtPYmplY3RJZH0nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0YXJnZXQnLCBmLnRhcmdldCwgJ1teOl0qPycpICsgJzouLi4uOi4uLi46JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdpZCcsIGYuaWQsICcuLi4uJykgKyAnOic7XHJcbiAgICByZXR1cm4gUmVnZXhlcy5wYXJzZShzdHIpO1xyXG4gIH1cclxuXHJcbiAgLy8gZmllbGRzOiBuYW1lLCBjYXB0dXJlXHJcbiAgLy8gbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzAzLWFkZGNvbWJhdGFudFxyXG4gIHN0YXRpYyBhZGRlZENvbWJhdGFudChmPzogUGFyYW1zPEFkZGVkQ29tYmF0YW50UGFyYW1zPik6IFJlZ2V4PEFkZGVkQ29tYmF0YW50UGFyYW1zPiB7XHJcbiAgICBpZiAodHlwZW9mIGYgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBmID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKGYsICdhZGRlZENvbWJhdGFudCcsIGFkZGVkQ29tYmF0YW50UGFyYW1zKTtcclxuICAgIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChmLmNhcHR1cmUpO1xyXG4gICAgY29uc3Qgc3RyID0gUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RpbWVzdGFtcCcsICdcXFxceXtUaW1lc3RhbXB9JykgK1xyXG4gICAgICAnIDAzOlxcXFx5e09iamVjdElkfTpBZGRlZCBuZXcgY29tYmF0YW50ICcgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnbmFtZScsIGYubmFtZSwgJy4qPycpICsgJ1xcXFwuJztcclxuICAgIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBmaWVsZHM6IGlkLCBuYW1lLCBocCwgeCwgeSwgeiwgbnBjSWQsIGNhcHR1cmVcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMDMtYWRkY29tYmF0YW50XHJcbiAgICovXHJcbiAgc3RhdGljIGFkZGVkQ29tYmF0YW50RnVsbChcclxuICAgICAgZj86IFBhcmFtczxBZGRlZENvbWJhdGFudEZ1bGxQYXJhbXM+LFxyXG4gICk6IFJlZ2V4PEFkZGVkQ29tYmF0YW50RnVsbFBhcmFtcz4ge1xyXG4gICAgaWYgKHR5cGVvZiBmID09PSAndW5kZWZpbmVkJylcclxuICAgICAgZiA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhmLCAnYWRkZWRDb21iYXRhbnRGdWxsJywgYWRkZWRDb21iYXRhbnRGdWxsUGFyYW1zKTtcclxuICAgIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChmLmNhcHR1cmUpO1xyXG4gICAgY29uc3Qgc3RyID0gUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RpbWVzdGFtcCcsICdcXFxceXtUaW1lc3RhbXB9JykgK1xyXG4gICAgICAnIDAzOicgKyBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnaWQnLCBmLmlkLCAnXFxcXHl7T2JqZWN0SWR9JykgK1xyXG4gICAgICAnOkFkZGVkIG5ldyBjb21iYXRhbnQgJyArIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICduYW1lJywgZi5uYW1lLCAnW146XSo/JykgK1xyXG4gICAgICAnXFxcXC4gezJ9Sm9iOiAnICsgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2pvYicsIGYuam9iLCAnW146XSo/JykgK1xyXG4gICAgICAnIExldmVsOiAnICsgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2xldmVsJywgZi5sZXZlbCwgJ1teOl0qPycpICtcclxuICAgICAgJyBNYXggSFA6ICcgKyBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnaHAnLCBmLmhwLCAnWzAtOV0rJykgKyAnXFwuJyArXHJcbiAgICAgICcuKj9Qb3M6IFxcXFwoJyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd4JywgZi54LCAnXFxcXHl7RmxvYXR9JykgKyAnLCcgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAneScsIGYueSwgJ1xcXFx5e0Zsb2F0fScpICsgJywnICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3onLCBmLnosICdcXFxceXtGbG9hdH0nKSArICdcXFxcKScgK1xyXG4gICAgICAnKD86IFxcXFwoJyArIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICducGNJZCcsIGYubnBjSWQsICcuKj8nKSArICdcXFxcKSk/XFxcXC4nO1xyXG4gICAgcmV0dXJuIFJlZ2V4ZXMucGFyc2Uoc3RyKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGZpZWxkczogaWQsIG5hbWUsIGhwLCBjYXB0dXJlXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzA0LXJlbW92ZWNvbWJhdGFudFxyXG4gICAqL1xyXG4gIHN0YXRpYyByZW1vdmluZ0NvbWJhdGFudChmPzogUGFyYW1zPFJlbW92aW5nQ29tYmF0YW50UGFyYW1zPik6IFJlZ2V4PFJlbW92aW5nQ29tYmF0YW50UGFyYW1zPiB7XHJcbiAgICBpZiAodHlwZW9mIGYgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBmID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKGYsICdyZW1vdmluZ0NvbWJhdGFudCcsIHJlbW92aW5nQ29tYmF0YW50UGFyYW1zKTtcclxuICAgIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChmLmNhcHR1cmUpO1xyXG4gICAgY29uc3Qgc3RyID0gUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RpbWVzdGFtcCcsICdcXFxceXtUaW1lc3RhbXB9JykgK1xyXG4gICAgICAnIDA0OicgKyBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnaWQnLCAnXFxcXHl7T2JqZWN0SWR9JykgK1xyXG4gICAgICAnOlJlbW92aW5nIGNvbWJhdGFudCAnICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ25hbWUnLCBmLm5hbWUsICcuKj8nKSArICdcXFxcLicgK1xyXG4gICAgICAnLio/TWF4IEhQOiAnICsgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2hwJywgZi5ocCwgJ1swLTldKycpICsgJ1xcLicgK1xyXG4gICAgICBSZWdleGVzLm9wdGlvbmFsKCcuKj9Qb3M6IFxcXFwoJyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd4JywgZi54LCAnXFxcXHl7RmxvYXR9JykgKyAnLCcgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAneScsIGYueSwgJ1xcXFx5e0Zsb2F0fScpICsgJywnICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3onLCBmLnosICdcXFxceXtGbG9hdH0nKSArICdcXFxcKScpO1xyXG4gICAgcmV0dXJuIFJlZ2V4ZXMucGFyc2Uoc3RyKTtcclxuICB9XHJcblxyXG5cclxuICAvLyBmaWVsZHM6IHRhcmdldElkLCB0YXJnZXQsIGVmZmVjdCwgc291cmNlLCBkdXJhdGlvbiwgY2FwdHVyZVxyXG4gIC8vIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMxYS1uZXR3b3JrYnVmZlxyXG4gIHN0YXRpYyBnYWluc0VmZmVjdChmPzogUGFyYW1zPEdhaW5zRWZmZWN0UGFyYW1zPik6IFJlZ2V4PEdhaW5zRWZmZWN0UGFyYW1zPiB7XHJcbiAgICBpZiAodHlwZW9mIGYgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBmID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKGYsICdnYWluc0VmZmVjdCcsIGdhaW5zRWZmZWN0UGFyYW1zKTtcclxuICAgIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChmLmNhcHR1cmUpO1xyXG4gICAgY29uc3Qgc3RyID0gUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RpbWVzdGFtcCcsICdcXFxceXtUaW1lc3RhbXB9JykgK1xyXG4gICAgICAnIDFBOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGFyZ2V0SWQnLCBmLnRhcmdldElkLCAnXFxcXHl7T2JqZWN0SWR9JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGFyZ2V0JywgZi50YXJnZXQsICcuKj8nKSArXHJcbiAgICAgICcgZ2FpbnMgdGhlIGVmZmVjdCBvZiAnICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2VmZmVjdCcsIGYuZWZmZWN0LCAnLio/JykgK1xyXG4gICAgICAnIGZyb20gJyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdzb3VyY2UnLCBmLnNvdXJjZSwgJy4qPycpICtcclxuICAgICAgJyBmb3IgJyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdkdXJhdGlvbicsIGYuZHVyYXRpb24sICdcXFxceXtGbG9hdH0nKSArXHJcbiAgICAgICcgU2Vjb25kc1xcXFwuJztcclxuICAgIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcmVmZXIgZ2FpbnNFZmZlY3Qgb3ZlciB0aGlzIGZ1bmN0aW9uIHVubGVzcyB5b3UgcmVhbGx5IG5lZWQgZXh0cmEgZGF0YS5cclxuICAgKiBmaWVsZHM6IHRhcmdldElkLCB0YXJnZXQsIGpvYiwgaHAsIG1heEhwLCBtcCwgbWF4TXAsIHgsIHksIHosIGhlYWRpbmcsXHJcbiAgICogICAgICAgICBkYXRhMCwgZGF0YTEsIGRhdGEyLCBkYXRhMywgZGF0YTRcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMjYtbmV0d29ya3N0YXR1c2VmZmVjdHNcclxuICAgKi9cclxuICBzdGF0aWMgc3RhdHVzRWZmZWN0RXhwbGljaXQoXHJcbiAgICAgIGY/OiBQYXJhbXM8U3RhdHVzRWZmZWN0RXhwbGljaXRQYXJhbXM+LFxyXG4gICk6IFJlZ2V4PFN0YXR1c0VmZmVjdEV4cGxpY2l0UGFyYW1zPiB7XHJcbiAgICBpZiAodHlwZW9mIGYgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBmID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKGYsICdzdGF0dXNFZmZlY3RFeHBsaWNpdCcsIHN0YXR1c0VmZmVjdEV4cGxpY2l0UGFyYW1zKTtcclxuICAgIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChmLmNhcHR1cmUpO1xyXG5cclxuICAgIGNvbnN0IGtGaWVsZCA9ICcuKj86JztcclxuXHJcbiAgICBjb25zdCBzdHIgPSBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGltZXN0YW1wJywgJ1xcXFx5e1RpbWVzdGFtcH0nKSArXHJcbiAgICAgICcgMjY6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0YXJnZXRJZCcsIGYudGFyZ2V0SWQsICdcXFxceXtPYmplY3RJZH0nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0YXJnZXQnLCBmLnRhcmdldCwgJ1teOl0qPycpICsgJzonICtcclxuICAgICAgJ1swLTlBLUZdezAsNn0nICsgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2pvYicsIGYuam9iLCAnWzAtOUEtRl17MCwyfScpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2hwJywgZi5ocCwgJ1xcXFx5e0Zsb2F0fScpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ21heEhwJywgZi5tYXhIcCwgJ1xcXFx5e0Zsb2F0fScpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ21wJywgZi5tcCwgJ1xcXFx5e0Zsb2F0fScpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ21heE1wJywgZi5tYXhNcCwgJ1xcXFx5e0Zsb2F0fScpICsgJzonICtcclxuICAgICAga0ZpZWxkICsgLy8gdHAgbG9sXHJcbiAgICAgIGtGaWVsZCArIC8vIG1heCB0cCBleHRyYSBsb2xcclxuICAgICAgLy8geCwgeSwgeiBoZWFkaW5nIG1heSBiZSBibGFua1xyXG4gICAgICBSZWdleGVzLm9wdGlvbmFsKFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd4JywgZi54LCAnXFxcXHl7RmxvYXR9JykpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5vcHRpb25hbChSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAneScsIGYueSwgJ1xcXFx5e0Zsb2F0fScpKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMub3B0aW9uYWwoUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3onLCBmLnosICdcXFxceXtGbG9hdH0nKSkgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm9wdGlvbmFsKFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdoZWFkaW5nJywgZi5oZWFkaW5nLCAnXFxcXHl7RmxvYXR9JykpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2RhdGEwJywgZi5kYXRhMCwgJ1teOl0qPycpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2RhdGExJywgZi5kYXRhMSwgJ1teOl0qPycpICsgJzonICtcclxuICAgICAgLy8gZGF0YTIsIDMsIDQgbWF5IG5vdCBleGlzdCBhbmQgdGhlIGxpbmUgbWF5IHRlcm1pbmF0ZS5cclxuICAgICAgUmVnZXhlcy5vcHRpb25hbChSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZGF0YTInLCBmLmRhdGEyLCAnW146XSo/JykgKyAnOicpICtcclxuICAgICAgUmVnZXhlcy5vcHRpb25hbChSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZGF0YTMnLCBmLmRhdGEzLCAnW146XSo/JykgKyAnOicpICtcclxuICAgICAgUmVnZXhlcy5vcHRpb25hbChSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZGF0YTQnLCBmLmRhdGE0LCAnW146XSo/JykgKyAnOicpO1xyXG4gICAgcmV0dXJuIFJlZ2V4ZXMucGFyc2Uoc3RyKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBmaWVsZHM6IHRhcmdldElkLCB0YXJnZXQsIGVmZmVjdCwgc291cmNlLCBjYXB0dXJlXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzFlLW5ldHdvcmtidWZmcmVtb3ZlXHJcbiAgICovXHJcbiAgc3RhdGljIGxvc2VzRWZmZWN0KGY/OiBQYXJhbXM8TG9zZXNFZmZlY3RQYXJhbXM+KTogUmVnZXg8TG9zZXNFZmZlY3RQYXJhbXM+IHtcclxuICAgIGlmICh0eXBlb2YgZiA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIGYgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoZiwgJ2xvc2VzRWZmZWN0JywgbG9zZXNFZmZlY3RQYXJhbXMpO1xyXG4gICAgY29uc3QgY2FwdHVyZSA9IFJlZ2V4ZXMudHJ1ZUlmVW5kZWZpbmVkKGYuY2FwdHVyZSk7XHJcbiAgICBjb25zdCBzdHIgPSBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGltZXN0YW1wJywgJ1xcXFx5e1RpbWVzdGFtcH0nKSArXHJcbiAgICAgICcgMUU6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0YXJnZXRJZCcsIGYudGFyZ2V0SWQsICdcXFxceXtPYmplY3RJZH0nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0YXJnZXQnLCBmLnRhcmdldCwgJy4qPycpICtcclxuICAgICAgJyBsb3NlcyB0aGUgZWZmZWN0IG9mICcgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZWZmZWN0JywgZi5lZmZlY3QsICcuKj8nKSArXHJcbiAgICAgICcgZnJvbSAnICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3NvdXJjZScsIGYuc291cmNlLCAnLio/JykgKyAnXFxcXC4nO1xyXG4gICAgcmV0dXJuIFJlZ2V4ZXMucGFyc2Uoc3RyKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBmaWVsZHM6IHNvdXJjZSwgc291cmNlSWQsIHRhcmdldCwgdGFyZ2V0SWQsIGlkLCBjYXB0dXJlXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzIzLW5ldHdvcmt0ZXRoZXJcclxuICAgKi9cclxuICBzdGF0aWMgdGV0aGVyKGY/OiBQYXJhbXM8VGV0aGVyUGFyYW1zPik6IFJlZ2V4PFRldGhlclBhcmFtcz4ge1xyXG4gICAgaWYgKHR5cGVvZiBmID09PSAndW5kZWZpbmVkJylcclxuICAgICAgZiA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhmLCAndGV0aGVyJywgdGV0aGVyUGFyYW1zKTtcclxuICAgIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChmLmNhcHR1cmUpO1xyXG4gICAgY29uc3Qgc3RyID0gUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RpbWVzdGFtcCcsICdcXFxceXtUaW1lc3RhbXB9JykgK1xyXG4gICAgICAnIDIzOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnc291cmNlSWQnLCBmLnNvdXJjZUlkLCAnXFxcXHl7T2JqZWN0SWR9JykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnc291cmNlJywgZi5zb3VyY2UsICdbXjpdKj8nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0YXJnZXRJZCcsIGYudGFyZ2V0SWQsICdcXFxceXtPYmplY3RJZH0nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0YXJnZXQnLCBmLnRhcmdldCwgJ1teOl0qPycpICtcclxuICAgICAgJzouLi4uOi4uLi46JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdpZCcsIGYuaWQsICcuLi4uJykgKyAnOic7XHJcbiAgICByZXR1cm4gUmVnZXhlcy5wYXJzZShzdHIpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqICd0YXJnZXQnIHdhcyBkZWZlYXRlZCBieSAnc291cmNlJ1xyXG4gICAqIGZpZWxkczogdGFyZ2V0LCBzb3VyY2UsIGNhcHR1cmVcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMTktbmV0d29ya2RlYXRoXHJcbiAgICovXHJcbiAgc3RhdGljIHdhc0RlZmVhdGVkKGY/OiBQYXJhbXM8V2FzRGVmZWF0ZWRQYXJhbXM+KTogUmVnZXg8V2FzRGVmZWF0ZWRQYXJhbXM+IHtcclxuICAgIGlmICh0eXBlb2YgZiA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIGYgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoZiwgJ3dhc0RlZmVhdGVkJywgd2FzRGVmZWF0ZWRQYXJhbXMpO1xyXG4gICAgY29uc3QgY2FwdHVyZSA9IFJlZ2V4ZXMudHJ1ZUlmVW5kZWZpbmVkKGYuY2FwdHVyZSk7XHJcbiAgICBjb25zdCBzdHIgPSBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGltZXN0YW1wJywgJ1xcXFx5e1RpbWVzdGFtcH0nKSArXHJcbiAgICAgICcgMTk6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0YXJnZXQnLCBmLnRhcmdldCwgJy4qPycpICtcclxuICAgICAgJyB3YXMgZGVmZWF0ZWQgYnkgJyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdzb3VyY2UnLCBmLnNvdXJjZSwgJy4qPycpICsgJ1xcXFwuJztcclxuICAgIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cik7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogZmllbGRzOiBuYW1lLCBocCwgY2FwdHVyZVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMwZC1jb21iYXRhbnRocFxyXG4gICAqL1xyXG4gIHN0YXRpYyBoYXNIUChmPzogUGFyYW1zPEhhc0hQUGFyYW1zPik6IFJlZ2V4PEhhc0hQUGFyYW1zPiB7XHJcbiAgICBpZiAodHlwZW9mIGYgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBmID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKGYsICdoYXNIUCcsIGhhc0hQUGFyYW1zKTtcclxuICAgIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChmLmNhcHR1cmUpO1xyXG4gICAgY29uc3Qgc3RyID0gUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RpbWVzdGFtcCcsICdcXFxceXtUaW1lc3RhbXB9JykgK1xyXG4gICAgICAnIDBEOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnbmFtZScsIGYubmFtZSwgJy4qPycpICtcclxuICAgICAgJyBIUCBhdCAnICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2hwJywgZi5ocCwgJ1xcXFxkKycpICsgJyUnO1xyXG4gICAgcmV0dXJuIFJlZ2V4ZXMucGFyc2Uoc3RyKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBmaWVsZHM6IGNvZGUsIGxpbmUsIGNhcHR1cmVcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBlY2hvKGY/OiBQYXJhbXM8RWNob1BhcmFtcz4pOiBSZWdleDxFY2hvUGFyYW1zPiB7XHJcbiAgICBpZiAodHlwZW9mIGYgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBmID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKGYsICdlY2hvJywgZWNob1BhcmFtcyk7XHJcbiAgICByZXR1cm4gUmVnZXhlcy5nYW1lTG9nKHtcclxuICAgICAgbGluZTogZi5saW5lLFxyXG4gICAgICBjYXB0dXJlOiBmLmNhcHR1cmUsXHJcbiAgICAgIGNvZGU6ICcwMDM4JyxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIGZpZWxkczogY29kZSwgbGluZSwgbmFtZSwgY2FwdHVyZVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGRpYWxvZyhmPzogUGFyYW1zPERpYWxvZ1BhcmFtcz4pOiBSZWdleDxEaWFsb2dQYXJhbXM+IHtcclxuICAgIGlmICh0eXBlb2YgZiA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIGYgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoZiwgJ2RpYWxvZycsIGRpYWxvZ1BhcmFtcyk7XHJcbiAgICBjb25zdCBjYXB0dXJlID0gUmVnZXhlcy50cnVlSWZVbmRlZmluZWQoZi5jYXB0dXJlKTtcclxuICAgIGNvbnN0IHN0ciA9IFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0aW1lc3RhbXAnLCAnXFxcXHl7VGltZXN0YW1wfScpICtcclxuICAgICAgJyAwMDonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2NvZGUnLCAnMDA0NCcpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ25hbWUnLCBmLm5hbWUsICcuKj8nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdsaW5lJywgZi5saW5lLCAnLionKSArICckJztcclxuICAgIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cik7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogZmllbGRzOiBjb2RlLCBsaW5lLCBjYXB0dXJlXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgbWVzc2FnZShmPzogUGFyYW1zPE1lc3NhZ2VQYXJhbXM+KTogUmVnZXg8TWVzc2FnZVBhcmFtcz4ge1xyXG4gICAgaWYgKHR5cGVvZiBmID09PSAndW5kZWZpbmVkJylcclxuICAgICAgZiA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhmLCAnbWVzc2FnZScsIG1lc3NhZ2VQYXJhbXMpO1xyXG4gICAgcmV0dXJuIFJlZ2V4ZXMuZ2FtZUxvZyh7XHJcbiAgICAgIGxpbmU6IGYubGluZSxcclxuICAgICAgY2FwdHVyZTogZi5jYXB0dXJlLFxyXG4gICAgICBjb2RlOiAnMDgzOScsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGZpZWxkczogY29kZSwgbGluZSwgY2FwdHVyZVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGdhbWVMb2coZj86IFBhcmFtczxHYW1lTG9nUGFyYW1zPik6IFJlZ2V4PEdhbWVMb2dQYXJhbXM+IHtcclxuICAgIGlmICh0eXBlb2YgZiA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIGYgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoZiwgJ2dhbWVMb2cnLCBnYW1lTG9nUGFyYW1zKTtcclxuICAgIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChmLmNhcHR1cmUpO1xyXG4gICAgY29uc3Qgc3RyID0gUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RpbWVzdGFtcCcsICdcXFxceXtUaW1lc3RhbXB9JykgK1xyXG4gICAgICAnIDAwOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnY29kZScsIGYuY29kZSwgJy4uLi4nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdsaW5lJywgZi5saW5lLCAnLionKSArICckJztcclxuICAgIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cik7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogZmllbGRzOiBjb2RlLCBuYW1lLCBsaW5lLCBjYXB0dXJlXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzAwLWxvZ2xpbmVcclxuICAgKiBTb21lIGdhbWUgbG9nIGxpbmVzIGhhdmUgbmFtZXMgaW4gdGhlbSwgYnV0IG5vdCBhbGwuICBBbGwgbmV0d29yayBsb2cgbGluZXMgZm9yIHRoZXNlXHJcbiAgICogaGF2ZSBlbXB0eSBmaWVsZHMsIGJ1dCB0aGVzZSBnZXQgZHJvcHBlZCBieSB0aGUgQUNUIEZGWFYgcGx1Z2luLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBnYW1lTmFtZUxvZyhmPzogUGFyYW1zPEdhbWVOYW1lTG9nUGFyYW1zPik6IFJlZ2V4PEdhbWVOYW1lTG9nUGFyYW1zPiB7XHJcbiAgICBpZiAodHlwZW9mIGYgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBmID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKGYsICdnYW1lTmFtZUxvZycsIGdhbWVOYW1lTG9nUGFyYW1zKTtcclxuICAgIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChmLmNhcHR1cmUpO1xyXG4gICAgY29uc3Qgc3RyID0gUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RpbWVzdGFtcCcsICdcXFxceXtUaW1lc3RhbXB9JykgK1xyXG4gICAgICAnIDAwOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnY29kZScsIGYuY29kZSwgJy4uLi4nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICduYW1lJywgZi5uYW1lLCAnW146XSonKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdsaW5lJywgZi5saW5lLCAnLionKSArICckJztcclxuICAgIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBmaWVsZHM6IGpvYiwgc3RyZW5ndGgsIGRleHRlcml0eSwgdml0YWxpdHksIGludGVsbGlnZW5jZSwgbWluZCwgcGlldHksIGF0dGFja1Bvd2VyLFxyXG4gICAqICAgICAgICAgZGlyZWN0SGl0LCBjcml0aWNhbEhpdCwgYXR0YWNrTWFnaWNQb3RlbmN5LCBoZWFsTWFnaWNQb3RlbmN5LCBkZXRlcm1pbmF0aW9uLFxyXG4gICAqICAgICAgICAgc2tpbGxTcGVlZCwgc3BlbGxTcGVlZCwgdGVuYWNpdHksIGNhcHR1cmVcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMGMtcGxheWVyc3RhdHNcclxuICAgKi9cclxuICBzdGF0aWMgc3RhdENoYW5nZShmPzogUGFyYW1zPFN0YXRDaGFuZ2VQYXJhbXM+KTogUmVnZXg8U3RhdENoYW5nZVBhcmFtcz4ge1xyXG4gICAgaWYgKHR5cGVvZiBmID09PSAndW5kZWZpbmVkJylcclxuICAgICAgZiA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhmLCAnc3RhdENoYW5nZScsIHN0YXRDaGFuZ2VQYXJhbXMpO1xyXG4gICAgY29uc3QgY2FwdHVyZSA9IFJlZ2V4ZXMudHJ1ZUlmVW5kZWZpbmVkKGYuY2FwdHVyZSk7XHJcbiAgICBjb25zdCBzdHIgPSBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGltZXN0YW1wJywgJ1xcXFx5e1RpbWVzdGFtcH0nKSArXHJcbiAgICAgICcgMEM6UGxheWVyIFN0YXRzOiAnICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2pvYicsIGYuam9iLCAnXFxcXGQrJykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnc3RyZW5ndGgnLCBmLnN0cmVuZ3RoLCAnXFxcXGQrJykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnZGV4dGVyaXR5JywgZi5kZXh0ZXJpdHksICdcXFxcZCsnKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd2aXRhbGl0eScsIGYudml0YWxpdHksICdcXFxcZCsnKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdpbnRlbGxpZ2VuY2UnLCBmLmludGVsbGlnZW5jZSwgJ1xcXFxkKycpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ21pbmQnLCBmLm1pbmQsICdcXFxcZCsnKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdwaWV0eScsIGYucGlldHksICdcXFxcZCsnKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdhdHRhY2tQb3dlcicsIGYuYXR0YWNrUG93ZXIsICdcXFxcZCsnKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdkaXJlY3RIaXQnLCBmLmRpcmVjdEhpdCwgJ1xcXFxkKycpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2NyaXRpY2FsSGl0JywgZi5jcml0aWNhbEhpdCwgJ1xcXFxkKycpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2F0dGFja01hZ2ljUG90ZW5jeScsIGYuYXR0YWNrTWFnaWNQb3RlbmN5LCAnXFxcXGQrJykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnaGVhbE1hZ2ljUG90ZW5jeScsIGYuaGVhbE1hZ2ljUG90ZW5jeSwgJ1xcXFxkKycpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2RldGVybWluYXRpb24nLCBmLmRldGVybWluYXRpb24sICdcXFxcZCsnKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdza2lsbFNwZWVkJywgZi5za2lsbFNwZWVkLCAnXFxcXGQrJykgKyAnOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAnc3BlbGxTcGVlZCcsIGYuc3BlbGxTcGVlZCwgJ1xcXFxkKycpICtcclxuICAgICAgJzowOicgK1xyXG4gICAgICBSZWdleGVzLm1heWJlQ2FwdHVyZShjYXB0dXJlLCAndGVuYWNpdHknLCBmLnRlbmFjaXR5LCAnXFxcXGQrJyk7XHJcbiAgICByZXR1cm4gUmVnZXhlcy5wYXJzZShzdHIpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIGZpZWxkczogbmFtZSwgY2FwdHVyZVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMwMS1jaGFuZ2V6b25lXHJcbiAgICovXHJcbiAgc3RhdGljIGNoYW5nZVpvbmUoZj86IFBhcmFtczxDaGFuZ2Vab25lUGFyYW1zPik6IFJlZ2V4PENoYW5nZVpvbmVQYXJhbXM+IHtcclxuICAgIGlmICh0eXBlb2YgZiA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIGYgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoZiwgJ2NoYW5nZVpvbmUnLCBjaGFuZ2Vab25lUGFyYW1zKTtcclxuICAgIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChmLmNhcHR1cmUpO1xyXG4gICAgY29uc3Qgc3RyID0gUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ3RpbWVzdGFtcCcsICdcXFxceXtUaW1lc3RhbXB9JykgK1xyXG4gICAgICAnIDAxOkNoYW5nZWQgWm9uZSB0byAnICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ25hbWUnLCBmLm5hbWUsICcuKj8nKSArICdcXFxcLic7XHJcbiAgICByZXR1cm4gUmVnZXhlcy5wYXJzZShzdHIpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIGZpZWxkczogaW5zdGFuY2UsIGNvbW1hbmQsIGRhdGEwLCBkYXRhMSwgZGF0YTIsIGRhdGEzXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzIxLW5ldHdvcms2ZC1hY3Rvci1jb250cm9sLWxpbmVzXHJcbiAgICovXHJcbiAgc3RhdGljIG5ldHdvcms2ZChmPzogUGFyYW1zPE5ldHdvcms2ZFBhcmFtcz4pOiBSZWdleDxOZXR3b3JrNmRQYXJhbXM+IHtcclxuICAgIGlmICh0eXBlb2YgZiA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIGYgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoZiwgJ25ldHdvcms2ZCcsIG5ldHdvcms2ZFBhcmFtcyk7XHJcbiAgICBjb25zdCBjYXB0dXJlID0gUmVnZXhlcy50cnVlSWZVbmRlZmluZWQoZi5jYXB0dXJlKTtcclxuICAgIGNvbnN0IHN0ciA9IFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICd0aW1lc3RhbXAnLCAnXFxcXHl7VGltZXN0YW1wfScpICtcclxuICAgICAgJyAyMTonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2luc3RhbmNlJywgZi5pbnN0YW5jZSwgJy4qPycpICsgJzonICtcclxuICAgICAgUmVnZXhlcy5tYXliZUNhcHR1cmUoY2FwdHVyZSwgJ2NvbW1hbmQnLCBmLmNvbW1hbmQsICcuKj8nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdkYXRhMCcsIGYuZGF0YTAsICcuKj8nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdkYXRhMScsIGYuZGF0YTEsICcuKj8nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdkYXRhMicsIGYuZGF0YTIsICcuKj8nKSArICc6JyArXHJcbiAgICAgIFJlZ2V4ZXMubWF5YmVDYXB0dXJlKGNhcHR1cmUsICdkYXRhMycsIGYuZGF0YTMsICcuKj8nKSArICckJztcclxuICAgIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIGJ1aWxkaW5nIG5hbWVkIGNhcHR1cmUgZ3JvdXBcclxuICAgKi9cclxuICBzdGF0aWMgbWF5YmVDYXB0dXJlKFxyXG4gICAgICBjYXB0dXJlOiBib29sZWFuLFxyXG4gICAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICAgIHZhbHVlOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCxcclxuICAgICAgZGVmYXVsdFZhbHVlPzogc3RyaW5nLFxyXG4gICk6IHN0cmluZyB7XHJcbiAgICBpZiAoIXZhbHVlKVxyXG4gICAgICB2YWx1ZSA9IGRlZmF1bHRWYWx1ZTtcclxuICAgIHZhbHVlID0gUmVnZXhlcy5hbnlPZih2YWx1ZSBhcyBWYWxpZFN0cmluZ09yQXJyYXkpO1xyXG4gICAgcmV0dXJuIGNhcHR1cmUgPyBSZWdleGVzLm5hbWVkQ2FwdHVyZShuYW1lLCB2YWx1ZSkgOiB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBvcHRpb25hbChzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYCg/OiR7c3RyfSk/YDtcclxuICB9XHJcblxyXG4gIC8vIENyZWF0ZXMgYSBuYW1lZCByZWdleCBjYXB0dXJlIGdyb3VwIG5hbWVkIHxuYW1lfCBmb3IgdGhlIG1hdGNoIHx2YWx1ZXwuXHJcbiAgc3RhdGljIG5hbWVkQ2FwdHVyZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgaWYgKG5hbWUuaW5jbHVkZXMoJz4nKSlcclxuICAgICAgY29uc29sZS5lcnJvcignXCInICsgbmFtZSArICdcIiBjb250YWlucyBcIj5cIi4nKTtcclxuICAgIGlmIChuYW1lLmluY2x1ZGVzKCc8JykpXHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1wiJyArIG5hbWUgKyAnXCIgY29udGFpbnMgXCI+XCIuJyk7XHJcblxyXG4gICAgcmV0dXJuICcoPzwnICsgbmFtZSArICc+JyArIHZhbHVlICsgJyknO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVuaWVuY2UgZm9yIHR1cm5pbmcgbXVsdGlwbGUgYXJncyBpbnRvIGEgdW5pb25lZCByZWd1bGFyIGV4cHJlc3Npb24uXHJcbiAgICogYW55T2YoeCwgeSwgeikgb3IgYW55T2YoW3gsIHksIHpdKSBkbyB0aGUgc2FtZSB0aGluZywgYW5kIHJldHVybiAoPzp4fHl8eikuXHJcbiAgICogYW55T2YoeCkgb3IgYW55T2YoeCkgb24gaXRzIG93biBzaW1wbGlmaWVzIHRvIGp1c3QgeC5cclxuICAgKiBhcmdzIG1heSBiZSBzdHJpbmdzIG9yIFJlZ0V4cCwgYWx0aG91Z2ggYW55IGFkZGl0aW9uYWwgbWFya2VycyB0byBSZWdFeHBcclxuICAgKiBsaWtlIC9pbnNlbnNpdGl2ZS9pIGFyZSBkcm9wcGVkLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBhbnlPZiguLi5hcmdzOiAoc3RyaW5nfHN0cmluZ1tdfFJlZ0V4cClbXSk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBhbnlPZkFycmF5ID0gKGFycmF5OiAoc3RyaW5nfFJlZ0V4cClbXSk6IHN0cmluZyA9PiB7XHJcbiAgICAgIHJldHVybiBgKD86JHthcnJheS5tYXAoKGVsZW0pID0+IGVsZW0gaW5zdGFuY2VvZiBSZWdFeHAgPyBlbGVtLnNvdXJjZSA6IGVsZW0pLmpvaW4oJ3wnKX0pYDtcclxuICAgIH07XHJcbiAgICBsZXQgYXJyYXk6IChzdHJpbmd8UmVnRXhwKVtdID0gW107XHJcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnc1swXSkpXHJcbiAgICAgICAgYXJyYXkgPSBhcmdzWzBdO1xyXG4gICAgICBlbHNlIGlmIChhcmdzWzBdKVxyXG4gICAgICAgIGFycmF5ID0gW2FyZ3NbMF1dO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgYXJyYXkgPSBbXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFRPRE86IG1vcmUgYWNjdXJhdGUgdHlwZSBpbnN0ZWFkIG9mIGBhc2AgY2FzdFxyXG4gICAgICBhcnJheSA9IGFyZ3MgYXMgc3RyaW5nW107XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYW55T2ZBcnJheShhcnJheSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgcGFyc2UocmVnZXhwU3RyaW5nOiBSZWdFeHAgfCBzdHJpbmcpOiBSZWdFeHAge1xyXG4gICAgY29uc3Qga0NhY3Rib3RDYXRlZ29yaWVzID0ge1xyXG4gICAgICBUaW1lc3RhbXA6ICdeLnsxNH0nLFxyXG4gICAgICBOZXRUaW1lc3RhbXA6ICcuezMzfScsXHJcbiAgICAgIE5ldEZpZWxkOiAnKD86W158XSpcXFxcfCknLFxyXG4gICAgICBMb2dUeXBlOiAnWzAtOUEtRmEtZl17Mn0nLFxyXG4gICAgICBBYmlsaXR5Q29kZTogJ1swLTlBLUZhLWZdezEsOH0nLFxyXG4gICAgICBPYmplY3RJZDogJ1swLTlBLUZdezh9JyxcclxuICAgICAgLy8gTWF0Y2hlcyBhbnkgY2hhcmFjdGVyIG5hbWUgKGluY2x1ZGluZyBlbXB0eSBzdHJpbmdzIHdoaWNoIHRoZSBGRlhJVlxyXG4gICAgICAvLyBBQ1QgcGx1Z2luIGNhbiBnZW5lcmF0ZSB3aGVuIHVua25vd24pLlxyXG4gICAgICBOYW1lOiAnKD86W15cXFxcczp8XSsoPzogW15cXFxcczp8XSspP3wpJyxcclxuICAgICAgLy8gRmxvYXRzIGNhbiBoYXZlIGNvbW1hIGFzIHNlcGFyYXRvciBpbiBGRlhJViBwbHVnaW4gb3V0cHV0OiBodHRwczovL2dpdGh1Yi5jb20vcmF2YWhuL0ZGWElWX0FDVF9QbHVnaW4vaXNzdWVzLzEzN1xyXG4gICAgICBGbG9hdDogJy0/WzAtOV0rKD86Wy4sXVswLTldKyk/KD86RS0/WzAtOV0rKT8nLFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBBbGwgcmVnZXhlcyBpbiBjYWN0Ym90IGFyZSBjYXNlIGluc2Vuc2l0aXZlLlxyXG4gICAgLy8gVGhpcyBhdm9pZHMgaGVhZGFjaGVzIGFzIHRoaW5ncyBsaWtlIGBWaWNlIGFuZCBWYW5pdHlgIHR1cm5zIGludG9cclxuICAgIC8vIGBWaWNlIEFuZCBWYW5pdHlgLCBlc3BlY2lhbGx5IGZvciBGcmVuY2ggYW5kIEdlcm1hbi4gIEl0IGFwcGVhcnMgdG9cclxuICAgIC8vIGhhdmUgYSB+MjAlIHJlZ2V4IHBhcnNpbmcgb3ZlcmhlYWQsIGJ1dCBhdCBsZWFzdCB0aGV5IHdvcmsuXHJcbiAgICBsZXQgbW9kaWZpZXJzID0gJ2knO1xyXG4gICAgaWYgKHJlZ2V4cFN0cmluZyBpbnN0YW5jZW9mIFJlZ0V4cCkge1xyXG4gICAgICBtb2RpZmllcnMgKz0gKHJlZ2V4cFN0cmluZy5nbG9iYWwgPyAnZycgOiAnJykgK1xyXG4gICAgICAgICAgICAgICAgICAgIChyZWdleHBTdHJpbmcubXVsdGlsaW5lID8gJ20nIDogJycpO1xyXG4gICAgICByZWdleHBTdHJpbmcgPSByZWdleHBTdHJpbmcuc291cmNlO1xyXG4gICAgfVxyXG4gICAgcmVnZXhwU3RyaW5nID0gcmVnZXhwU3RyaW5nLnJlcGxhY2UoL1xcXFx5XFx7KC4qPylcXH0vZywgKG1hdGNoLCBncm91cCkgPT4ge1xyXG4gICAgICByZXR1cm4ga0NhY3Rib3RDYXRlZ29yaWVzW2dyb3VwIGFzIGtleW9mIHR5cGVvZiBrQ2FjdGJvdENhdGVnb3JpZXNdIHx8IG1hdGNoO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleHBTdHJpbmcsIG1vZGlmaWVycyk7XHJcbiAgfVxyXG5cclxuICAvLyBMaWtlIFJlZ2V4LlJlZ2V4ZXMucGFyc2UsIGJ1dCBmb3JjZSBnbG9iYWwgZmxhZy5cclxuICBzdGF0aWMgcGFyc2VHbG9iYWwocmVnZXhwU3RyaW5nOiBSZWdFeHAgfCBzdHJpbmcpOiBSZWdFeHAge1xyXG4gICAgY29uc3QgcmVnZXggPSBSZWdleGVzLnBhcnNlKHJlZ2V4cFN0cmluZyk7XHJcbiAgICBsZXQgbW9kaWZpZXJzID0gJ2dpJztcclxuICAgIGlmIChyZWdleHBTdHJpbmcgaW5zdGFuY2VvZiBSZWdFeHApXHJcbiAgICAgIG1vZGlmaWVycyArPSAocmVnZXhwU3RyaW5nLm11bHRpbGluZSA/ICdtJyA6ICcnKTtcclxuICAgIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LnNvdXJjZSwgbW9kaWZpZXJzKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyB0cnVlSWZVbmRlZmluZWQodmFsdWU/OiBib29sZWFuKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodHlwZW9mICh2YWx1ZSkgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIHJldHVybiAhIXZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHZhbGlkYXRlUGFyYW1zKFxyXG4gICAgICBmOiBSZWFkb25seTx7IFtzOiBzdHJpbmddOiB1bmtub3duIH0+LFxyXG4gICAgICBmdW5jTmFtZTogc3RyaW5nLFxyXG4gICAgICBwYXJhbXM6IFJlYWRvbmx5PHN0cmluZ1tdPixcclxuICApOiB2b2lkIHtcclxuICAgIGlmIChmID09PSBudWxsKVxyXG4gICAgICByZXR1cm47XHJcbiAgICBpZiAodHlwZW9mIGYgIT09ICdvYmplY3QnKVxyXG4gICAgICByZXR1cm47XHJcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoZik7XHJcbiAgICBmb3IgKGxldCBrID0gMDsgayA8IGtleXMubGVuZ3RoOyArK2spIHtcclxuICAgICAgY29uc3Qga2V5ID0ga2V5c1trXTtcclxuICAgICAgaWYgKGtleSAmJiAhcGFyYW1zLmluY2x1ZGVzKGtleSkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZnVuY05hbWV9OiBpbnZhbGlkIHBhcmFtZXRlciAnJHtrZXl9Jy4gIGAgK1xyXG4gICAgICAgICAgICBgVmFsaWQgcGFyYW1zOiAke0pTT04uc3RyaW5naWZ5KHBhcmFtcyl9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgQmFzZVJlZ0V4cCB9IGZyb20gJy4uL3R5cGVzL3RyaWdnZXInO1xyXG5pbXBvcnQgUmVnZXhlcywgeyBQYXJhbXMgfSBmcm9tICcuL3JlZ2V4ZXMnO1xyXG5cclxuaW50ZXJmYWNlIEZpZWxkcyB7XHJcbiAgZmllbGQ6IHN0cmluZztcclxuICB2YWx1ZT86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgTmV0UmVnZXg8VCBleHRlbmRzIHN0cmluZz4gPSBCYXNlUmVnRXhwPEV4Y2x1ZGU8VCwgJ2NhcHR1cmUnPj47XHJcblxyXG4vLyBEaWZmZXJlbmNlcyBmcm9tIFJlZ2V4ZXM6XHJcbi8vICogbWF5IGhhdmUgbW9yZSBmaWVsZHNcclxuLy8gKiBBZGRlZENvbWJhdGFudCBucGMgaWQgaXMgYnJva2VuIHVwIGludG8gbnBjTmFtZUlkIGFuZCBucGNCYXNlSWRcclxuLy8gKiBnYW1lTG9nIGFsd2F5cyBzcGxpdHMgbmFtZSBpbnRvIGl0cyBvd24gZmllbGQgKGJ1dCBwcmV2aW91c2x5IHdvdWxkbid0KVxyXG5cclxuY29uc3Qgc2VwYXJhdG9yID0gJ1xcXFx8JztcclxuY29uc3QgbWF0Y2hEZWZhdWx0ID0gJ1tefF0qJztcclxuXHJcbmNvbnN0IHN0YXJ0c1VzaW5nUGFyYW1zID0gWyd0aW1lc3RhbXAnLCAnc291cmNlSWQnLCAnc291cmNlJywgJ2lkJywgJ2FiaWxpdHknLCAndGFyZ2V0SWQnLCAndGFyZ2V0JywgJ2Nhc3RUaW1lJ10gYXMgY29uc3Q7XHJcbmNvbnN0IGFiaWxpdHlQYXJhbXMgPSBbJ3NvdXJjZUlkJywgJ3NvdXJjZScsICdpZCcsICdhYmlsaXR5JywgJ3RhcmdldElkJywgJ3RhcmdldCddIGFzIGNvbnN0O1xyXG5jb25zdCBhYmlsaXR5RnVsbFBhcmFtcyA9IFsnc291cmNlSWQnLCAnc291cmNlJywgJ2lkJywgJ2FiaWxpdHknLCAndGFyZ2V0SWQnLCAndGFyZ2V0JywgJ2ZsYWdzJywgJ2RhbWFnZScsICd0YXJnZXRDdXJyZW50SHAnLCAndGFyZ2V0TWF4SHAnLCAneCcsICd5JywgJ3onLCAnaGVhZGluZyddIGFzIGNvbnN0O1xyXG5jb25zdCBoZWFkTWFya2VyUGFyYW1zID0gWyd0YXJnZXRJZCcsICd0YXJnZXQnLCAnaWQnXSBhcyBjb25zdDtcclxuY29uc3QgYWRkZWRDb21iYXRhbnRQYXJhbXMgPSBbJ2lkJywgJ25hbWUnXSBhcyBjb25zdDtcclxuY29uc3QgYWRkZWRDb21iYXRhbnRGdWxsUGFyYW1zID0gWydpZCcsICduYW1lJywgJ2pvYicsICdsZXZlbCcsICdvd25lcklkJywgJ3dvcmxkJywgJ25wY05hbWVJZCcsICducGNCYXNlSWQnLCAnY3VycmVudEhwJywgJ2hwJywgJ3gnLCAneScsICd6JywgJ2hlYWRpbmcnXSBhcyBjb25zdDtcclxuY29uc3QgcmVtb3ZpbmdDb21iYXRhbnRQYXJhbXMgPSBbJ2lkJywgJ25hbWUnLCAnaHAnXSBhcyBjb25zdDtcclxuY29uc3QgZ2FpbnNFZmZlY3RQYXJhbXMgPSBbJ2VmZmVjdElkJywgJ2VmZmVjdCcsICdkdXJhdGlvbicsICdzb3VyY2VJZCcsICdzb3VyY2UnLCAndGFyZ2V0SWQnLCAndGFyZ2V0JywgJ2NvdW50J10gYXMgY29uc3Q7XHJcbmNvbnN0IHN0YXR1c0VmZmVjdEV4cGxpY2l0UGFyYW1zID0gWyd0YXJnZXRJZCcsICd0YXJnZXQnLCAnaHAnLCAnbWF4SHAnLCAneCcsICd5JywgJ3onLCAnaGVhZGluZycsICdkYXRhMCcsICdkYXRhMScsICdkYXRhMicsICdkYXRhMycsICdkYXRhNCddIGFzIGNvbnN0O1xyXG5jb25zdCBsb3Nlc0VmZmVjdFBhcmFtcyA9IFsnZWZmZWN0SWQnLCAnZWZmZWN0JywgJ3NvdXJjZUlkJywgJ3NvdXJjZScsICd0YXJnZXRJZCcsICd0YXJnZXQnLCAnY291bnQnXSBhcyBjb25zdDtcclxuY29uc3QgdGV0aGVyUGFyYW1zID0gWydzb3VyY2VJZCcsICdzb3VyY2UnLCAndGFyZ2V0SWQnLCAndGFyZ2V0JywgJ2lkJ10gYXMgY29uc3Q7XHJcbmNvbnN0IHdhc0RlZmVhdGVkUGFyYW1zID0gWyd0YXJnZXRJZCcsICd0YXJnZXQnLCAnc291cmNlSWQnLCAnc291cmNlJ10gYXMgY29uc3Q7XHJcbmNvbnN0IGVjaG9QYXJhbXMgPSBbJ2NvZGUnLCAnbmFtZScsICdsaW5lJ10gYXMgY29uc3Q7XHJcbmNvbnN0IGRpYWxvZ1BhcmFtcyA9IFsnY29kZScsICduYW1lJywgJ2xpbmUnXSBhcyBjb25zdDtcclxuY29uc3QgbWVzc2FnZVBhcmFtcyA9IFsnY29kZScsICduYW1lJywgJ2xpbmUnXSBhcyBjb25zdDtcclxuY29uc3QgZ2FtZUxvZ1BhcmFtcyA9IFsnY29kZScsICduYW1lJywgJ2xpbmUnXSBhcyBjb25zdDtcclxuY29uc3QgZ2FtZU5hbWVMb2dQYXJhbXMgPSBbJ2NvZGUnLCAnbmFtZScsICdsaW5lJ10gYXMgY29uc3Q7XHJcbmNvbnN0IHN0YXRDaGFuZ2VQYXJhbXMgPSBbJ2pvYicsICdzdHJlbmd0aCcsICdkZXh0ZXJpdHknLCAndml0YWxpdHknLCAnaW50ZWxsaWdlbmNlJywgJ21pbmQnLCAncGlldHknLCAnYXR0YWNrUG93ZXInLCAnZGlyZWN0SGl0JywgJ2NyaXRpY2FsSGl0JywgJ2F0dGFja01hZ2ljUG90ZW5jeScsICdoZWFsTWFnaWNQb3RlbmN5JywgJ2RldGVybWluYXRpb24nLCAnc2tpbGxTcGVlZCcsICdzcGVsbFNwZWVkJywgJ3RlbmFjaXR5J10gYXMgY29uc3Q7XHJcbmNvbnN0IGNoYW5nZVpvbmVQYXJhbXMgPSBbJ2lkJywgJ25hbWUnXSBhcyBjb25zdDtcclxuY29uc3QgbmV0d29yazZkUGFyYW1zID0gWydpbnN0YW5jZScsICdjb21tYW5kJywgJ2RhdGEwJywgJ2RhdGExJywgJ2RhdGEyJywgJ2RhdGEzJ10gYXMgY29uc3Q7XHJcbmNvbnN0IG5hbWVUb2dnbGVQYXJhbXMgPSBbJ2lkJywgJ25hbWUnLCAndG9nZ2xlJ10gYXMgY29uc3Q7XHJcblxyXG5leHBvcnQgdHlwZSBTdGFydHNVc2luZ1BhcmFtcyA9IHR5cGVvZiBzdGFydHNVc2luZ1BhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBBYmlsaXR5UGFyYW1zID0gdHlwZW9mIGFiaWxpdHlQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgQWJpbGl0eUZ1bGxQYXJhbXMgPSB0eXBlb2YgYWJpbGl0eUZ1bGxQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgSGVhZE1hcmtlclBhcmFtcyA9IHR5cGVvZiBoZWFkTWFya2VyUGFyYW1zW251bWJlcl07XHJcbmV4cG9ydCB0eXBlIEFkZGVkQ29tYmF0YW50UGFyYW1zID0gdHlwZW9mIGFkZGVkQ29tYmF0YW50UGFyYW1zW251bWJlcl07XHJcbmV4cG9ydCB0eXBlIEFkZGVkQ29tYmF0YW50RnVsbFBhcmFtcyA9IHR5cGVvZiBhZGRlZENvbWJhdGFudEZ1bGxQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgUmVtb3ZpbmdDb21iYXRhbnRQYXJhbXMgPSB0eXBlb2YgcmVtb3ZpbmdDb21iYXRhbnRQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgR2FpbnNFZmZlY3RQYXJhbXMgPSB0eXBlb2YgZ2FpbnNFZmZlY3RQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgU3RhdHVzRWZmZWN0RXhwbGljaXRQYXJhbXMgPSB0eXBlb2Ygc3RhdHVzRWZmZWN0RXhwbGljaXRQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgTG9zZXNFZmZlY3RQYXJhbXMgPSB0eXBlb2YgbG9zZXNFZmZlY3RQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgVGV0aGVyUGFyYW1zID0gdHlwZW9mIHRldGhlclBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBXYXNEZWZlYXRlZFBhcmFtcyA9IHR5cGVvZiB3YXNEZWZlYXRlZFBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBFY2hvUGFyYW1zID0gdHlwZW9mIGVjaG9QYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgRGlhbG9nUGFyYW1zID0gdHlwZW9mIGRpYWxvZ1BhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBNZXNzYWdlUGFyYW1zID0gdHlwZW9mIG1lc3NhZ2VQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgR2FtZUxvZ1BhcmFtcyA9IHR5cGVvZiBnYW1lTG9nUGFyYW1zW251bWJlcl07XHJcbmV4cG9ydCB0eXBlIEdhbWVOYW1lTG9nUGFyYW1zID0gdHlwZW9mIGdhbWVOYW1lTG9nUGFyYW1zW251bWJlcl07XHJcbmV4cG9ydCB0eXBlIFN0YXRDaGFuZ2VQYXJhbXMgPSB0eXBlb2Ygc3RhdENoYW5nZVBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBDaGFuZ2Vab25lUGFyYW1zID0gdHlwZW9mIGNoYW5nZVpvbmVQYXJhbXNbbnVtYmVyXTtcclxuZXhwb3J0IHR5cGUgTmV0d29yazZkUGFyYW1zID0gdHlwZW9mIG5ldHdvcms2ZFBhcmFtc1tudW1iZXJdO1xyXG5leHBvcnQgdHlwZSBOYW1lVG9nZ2xlUGFyYW1zID0gdHlwZW9mIG5hbWVUb2dnbGVQYXJhbXNbbnVtYmVyXTtcclxuXHJcbi8vIElmIE5ldFJlZ2V4ZXMuc2V0RmxhZ1RyYW5zbGF0aW9uc05lZWRlZCBpcyBzZXQgdG8gdHJ1ZSwgdGhlbiBhbnlcclxuLy8gcmVnZXggY3JlYXRlZCB0aGF0IHJlcXVpcmVzIGEgdHJhbnNsYXRpb24gd2lsbCBiZWdpbiB3aXRoIHRoaXMgc3RyaW5nXHJcbi8vIGFuZCBtYXRjaCB0aGUgbWFnaWNTdHJpbmdSZWdleC4gIFRoaXMgaXMgbWF5YmUgYSBiaXQgZ29vZnksIGJ1dCBpc1xyXG4vLyBhIHByZXR0eSBzdHJhaWdodGZvcndhcmQgd2F5IHRvIG1hcmsgcmVnZXhlcyBmb3IgdHJhbnNsYXRpb25zLlxyXG4vLyBJZiBpc3N1ZSAjMTMwNiBpcyBldmVyIHJlc29sdmVkLCB3ZSBjYW4gcmVtb3ZlIHRoaXMuXHJcbmNvbnN0IG1hZ2ljVHJhbnNsYXRpb25TdHJpbmcgPSBgXl5gO1xyXG5jb25zdCBtYWdpY1N0cmluZ1JlZ2V4ID0gL15cXF5cXF4vO1xyXG5jb25zdCBrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbiA9IFtcclxuICAnYWJpbGl0eScsXHJcbiAgJ25hbWUnLFxyXG4gICdzb3VyY2UnLFxyXG4gICd0YXJnZXQnLFxyXG4gICdsaW5lJyxcclxuXTtcclxuXHJcbmNvbnN0IHBhcnNlSGVscGVyID0gKFxyXG4gICAgcGFyYW1zOiB7IHRpbWVzdGFtcD86IHN0cmluZzsgY2FwdHVyZT86IGJvb2xlYW4gfSB8IHVuZGVmaW5lZCxcclxuICAgIGZ1bmNOYW1lOiBzdHJpbmcsXHJcbiAgICBmaWVsZHM6IHsgW3M6IHN0cmluZ106IEZpZWxkcyB9LFxyXG4pOiBSZWdFeHAgPT4ge1xyXG4gIHBhcmFtcyA9IHBhcmFtcyA/PyB7fTtcclxuICBjb25zdCB2YWxpZEZpZWxkczogc3RyaW5nW10gPSBbXTtcclxuICBmb3IgKGNvbnN0IHZhbHVlIG9mIE9iamVjdC52YWx1ZXMoZmllbGRzKSkge1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpXHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgdmFsaWRGaWVsZHMucHVzaCh2YWx1ZS5maWVsZCk7XHJcbiAgfVxyXG4gIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMocGFyYW1zLCBmdW5jTmFtZSwgWydjYXB0dXJlJywgLi4udmFsaWRGaWVsZHNdKTtcclxuXHJcbiAgLy8gRmluZCB0aGUgbGFzdCBrZXkgd2UgY2FyZSBhYm91dCwgc28gd2UgY2FuIHNob3J0ZW4gdGhlIHJlZ2V4IGlmIG5lZWRlZC5cclxuICBjb25zdCBjYXB0dXJlID0gUmVnZXhlcy50cnVlSWZVbmRlZmluZWQocGFyYW1zLmNhcHR1cmUpO1xyXG4gIGNvbnN0IGZpZWxkS2V5cyA9IE9iamVjdC5rZXlzKGZpZWxkcyk7XHJcbiAgbGV0IG1heEtleTtcclxuICBpZiAoY2FwdHVyZSkge1xyXG4gICAgbWF4S2V5ID0gZmllbGRLZXlzW2ZpZWxkS2V5cy5sZW5ndGggLSAxXTtcclxuICB9IGVsc2Uge1xyXG4gICAgbWF4S2V5ID0gMDtcclxuICAgIGZvciAoY29uc3Qga2V5IG9mIGZpZWxkS2V5cykge1xyXG4gICAgICBjb25zdCB2YWx1ZSA9IGZpZWxkc1trZXldID8/IHt9O1xyXG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JylcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgY29uc3QgZmllbGROYW1lID0gZmllbGRzW2tleV0/LmZpZWxkO1xyXG4gICAgICBpZiAoZmllbGROYW1lICYmIGZpZWxkTmFtZSBpbiBwYXJhbXMpXHJcbiAgICAgICAgbWF4S2V5ID0ga2V5O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gRm9yIHRlc3RpbmcsIGl0J3MgdXNlZnVsIHRvIGtub3cgaWYgdGhpcyBpcyBhIHJlZ2V4IHRoYXQgcmVxdWlyZXNcclxuICAvLyB0cmFuc2xhdGlvbi4gIFdlIHRlc3QgdGhpcyBieSBzZWVpbmcgaWYgdGhlcmUgYXJlIGFueSBzcGVjaWZpZWRcclxuICAvLyBmaWVsZHMsIGFuZCBpZiBzbywgaW5zZXJ0aW5nIGEgbWFnaWMgc3RyaW5nIHRoYXQgd2UgY2FuIGRldGVjdC5cclxuICAvLyBUaGlzIGxldHMgdXMgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIFwicmVnZXggdGhhdCBzaG91bGQgYmUgdHJhbnNsYXRlZFwiXHJcbiAgLy8gZS5nLiBhIHJlZ2V4IHdpdGggYHRhcmdldGAgc3BlY2lmaWVkLCBhbmQgXCJyZWdleCB0aGF0IHNob3VsZG4ndFwiXHJcbiAgLy8gZS5nLiBhIGdhaW5zIGVmZmVjdCB3aXRoIGp1c3QgZWZmZWN0SWQgc3BlY2lmaWVkLlxyXG4gIGNvbnN0IHRyYW5zUGFyYW1zID0gT2JqZWN0LmtleXMocGFyYW1zKS5maWx0ZXIoKGspID0+IGtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uLmluY2x1ZGVzKGspKTtcclxuICBjb25zdCBuZWVkc1RyYW5zbGF0aW9ucyA9IE5ldFJlZ2V4ZXMuZmxhZ1RyYW5zbGF0aW9uc05lZWRlZCAmJiB0cmFuc1BhcmFtcy5sZW5ndGggPiAwO1xyXG5cclxuICAvLyBCdWlsZCB0aGUgcmVnZXggZnJvbSB0aGUgZmllbGRzLlxyXG4gIGxldCBzdHIgPSBuZWVkc1RyYW5zbGF0aW9ucyA/IG1hZ2ljVHJhbnNsYXRpb25TdHJpbmcgOiAnXic7XHJcbiAgbGV0IGxhc3RLZXkgPSAtMTtcclxuICBmb3IgKGNvbnN0IF9rZXkgaW4gZmllbGRzKSB7XHJcbiAgICBjb25zdCBrZXkgPSBwYXJzZUludChfa2V5KTtcclxuICAgIC8vIEZpbGwgaW4gYmxhbmtzLlxyXG4gICAgY29uc3QgbWlzc2luZ0ZpZWxkcyA9IGtleSAtIGxhc3RLZXkgLSAxO1xyXG4gICAgaWYgKG1pc3NpbmdGaWVsZHMgPT09IDEpXHJcbiAgICAgIHN0ciArPSAnXFxcXHl7TmV0RmllbGR9JztcclxuICAgIGVsc2UgaWYgKG1pc3NpbmdGaWVsZHMgPiAxKVxyXG4gICAgICBzdHIgKz0gYFxcXFx5e05ldEZpZWxkfXske21pc3NpbmdGaWVsZHN9fWA7XHJcbiAgICBsYXN0S2V5ID0ga2V5O1xyXG5cclxuICAgIGNvbnN0IHZhbHVlID0gZmllbGRzW2tleV07XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JylcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2Z1bmNOYW1lfTogaW52YWxpZCB2YWx1ZTogJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9YCk7XHJcblxyXG4gICAgY29uc3QgZmllbGROYW1lID0gZmllbGRzW2tleV0/LmZpZWxkO1xyXG4gICAgY29uc3QgZmllbGRWYWx1ZSA9IGZpZWxkc1trZXldPy52YWx1ZT8udG9TdHJpbmcoKSA/PyBtYXRjaERlZmF1bHQ7XHJcblxyXG4gICAgaWYgKGZpZWxkTmFtZSkge1xyXG4gICAgICBzdHIgKz0gUmVnZXhlcy5tYXliZUNhcHR1cmUoXHJcbiAgICAgICAgICAvLyBtb3JlIGFjY3VyYXRlIHR5cGUgaW5zdGVhZCBvZiBgYXNgIGNhc3RcclxuICAgICAgICAgIC8vIG1heWJlIHRoaXMgZnVuY3Rpb24gbmVlZHMgYSByZWZhY3RvcmluZ1xyXG4gICAgICAgICAgY2FwdHVyZSwgZmllbGROYW1lLCAocGFyYW1zIGFzIHsgW3M6IHN0cmluZ106IHN0cmluZyB9KVtmaWVsZE5hbWVdLCBmaWVsZFZhbHVlKSArXHJcbiAgICAgICAgc2VwYXJhdG9yO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RyICs9IGZpZWxkVmFsdWUgKyBzZXBhcmF0b3I7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFN0b3AgaWYgd2UncmUgbm90IGNhcHR1cmluZyBhbmQgZG9uJ3QgY2FyZSBhYm91dCBmdXR1cmUgZmllbGRzLlxyXG4gICAgaWYgKGtleSA+PSAobWF4S2V5ID8/IDAgYXMgbnVtYmVyKSlcclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG4gIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cik7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOZXRSZWdleGVzIHtcclxuICBzdGF0aWMgZmxhZ1RyYW5zbGF0aW9uc05lZWRlZCA9IGZhbHNlO1xyXG4gIHN0YXRpYyBzZXRGbGFnVHJhbnNsYXRpb25zTmVlZGVkKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICBOZXRSZWdleGVzLmZsYWdUcmFuc2xhdGlvbnNOZWVkZWQgPSB2YWx1ZTtcclxuICB9XHJcbiAgc3RhdGljIGRvZXNOZXRSZWdleE5lZWRUcmFuc2xhdGlvbihyZWdleDogUmVnRXhwIHwgc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAvLyBOZWVkIHRvIGBzZXRGbGFnVHJhbnNsYXRpb25zTmVlZGVkYCBiZWZvcmUgY2FsbGluZyB0aGlzIGZ1bmN0aW9uLlxyXG4gICAgY29uc29sZS5hc3NlcnQoTmV0UmVnZXhlcy5mbGFnVHJhbnNsYXRpb25zTmVlZGVkKTtcclxuICAgIGNvbnN0IHN0ciA9IHR5cGVvZiByZWdleCA9PT0gJ3N0cmluZycgPyByZWdleCA6IHJlZ2V4LnNvdXJjZTtcclxuICAgIHJldHVybiAhIW1hZ2ljU3RyaW5nUmVnZXguZXhlYyhzdHIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzE0LW5ldHdvcmtzdGFydHNjYXN0aW5nXHJcbiAgICovXHJcbiAgc3RhdGljIHN0YXJ0c1VzaW5nKHBhcmFtcz86IFBhcmFtczxTdGFydHNVc2luZ1BhcmFtcz4pOiBOZXRSZWdleDxTdGFydHNVc2luZ1BhcmFtcz4ge1xyXG4gICAgcmV0dXJuIHBhcnNlSGVscGVyKHBhcmFtcywgJ3N0YXJ0c1VzaW5nJywge1xyXG4gICAgICAwOiB7IGZpZWxkOiAndHlwZScsIHZhbHVlOiAnMjAnIH0sXHJcbiAgICAgIDE6IHsgZmllbGQ6ICd0aW1lc3RhbXAnIH0sXHJcbiAgICAgIDI6IHsgZmllbGQ6ICdzb3VyY2VJZCcgfSxcclxuICAgICAgMzogeyBmaWVsZDogJ3NvdXJjZScgfSxcclxuICAgICAgNDogeyBmaWVsZDogJ2lkJyB9LFxyXG4gICAgICA1OiB7IGZpZWxkOiAnYWJpbGl0eScgfSxcclxuICAgICAgNjogeyBmaWVsZDogJ3RhcmdldElkJyB9LFxyXG4gICAgICA3OiB7IGZpZWxkOiAndGFyZ2V0JyB9LFxyXG4gICAgICA4OiB7IGZpZWxkOiAnY2FzdFRpbWUnIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMTUtbmV0d29ya2FiaWxpdHlcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMTYtbmV0d29ya2FvZWFiaWxpdHlcclxuICAgKi9cclxuICBzdGF0aWMgYWJpbGl0eShwYXJhbXM/OiBQYXJhbXM8QWJpbGl0eVBhcmFtcz4pOiBOZXRSZWdleDxBYmlsaXR5UGFyYW1zPiB7XHJcbiAgICByZXR1cm4gcGFyc2VIZWxwZXIocGFyYW1zLCAnYWJpbGl0eScsIHtcclxuICAgICAgMDogeyBmaWVsZDogJ3R5cGUnLCB2YWx1ZTogJzJbMTJdJyB9LFxyXG4gICAgICAxOiB7IGZpZWxkOiAndGltZXN0YW1wJyB9LFxyXG4gICAgICAyOiB7IGZpZWxkOiAnc291cmNlSWQnIH0sXHJcbiAgICAgIDM6IHsgZmllbGQ6ICdzb3VyY2UnIH0sXHJcbiAgICAgIDQ6IHsgZmllbGQ6ICdpZCcgfSxcclxuICAgICAgNTogeyBmaWVsZDogJ2FiaWxpdHknIH0sXHJcbiAgICAgIDY6IHsgZmllbGQ6ICd0YXJnZXRJZCcgfSxcclxuICAgICAgNzogeyBmaWVsZDogJ3RhcmdldCcgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMxNS1uZXR3b3JrYWJpbGl0eVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMxNi1uZXR3b3JrYW9lYWJpbGl0eVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5RnVsbChwYXJhbXM/OiBQYXJhbXM8QWJpbGl0eUZ1bGxQYXJhbXM+KTogTmV0UmVnZXg8QWJpbGl0eUZ1bGxQYXJhbXM+IHtcclxuICAgIHJldHVybiBwYXJzZUhlbHBlcihwYXJhbXMsICdhYmlsaXR5RnVsbCcsIHtcclxuICAgICAgMDogeyBmaWVsZDogJ3R5cGUnLCB2YWx1ZTogJzJbMTJdJyB9LFxyXG4gICAgICAxOiB7IGZpZWxkOiAndGltZXN0YW1wJyB9LFxyXG4gICAgICAyOiB7IGZpZWxkOiAnc291cmNlSWQnIH0sXHJcbiAgICAgIDM6IHsgZmllbGQ6ICdzb3VyY2UnIH0sXHJcbiAgICAgIDQ6IHsgZmllbGQ6ICdpZCcgfSxcclxuICAgICAgNTogeyBmaWVsZDogJ2FiaWxpdHknIH0sXHJcbiAgICAgIDY6IHsgZmllbGQ6ICd0YXJnZXRJZCcgfSxcclxuICAgICAgNzogeyBmaWVsZDogJ3RhcmdldCcgfSxcclxuICAgICAgODogeyBmaWVsZDogJ2ZsYWdzJyB9LFxyXG4gICAgICA5OiB7IGZpZWxkOiAnZGFtYWdlJyB9LFxyXG4gICAgICAyNDogeyBmaWVsZDogJ3RhcmdldEN1cnJlbnRIcCcgfSxcclxuICAgICAgMjU6IHsgZmllbGQ6ICd0YXJnZXRNYXhIcCcgfSxcclxuICAgICAgNDA6IHsgZmllbGQ6ICd4JyB9LFxyXG4gICAgICA0MTogeyBmaWVsZDogJ3knIH0sXHJcbiAgICAgIDQyOiB7IGZpZWxkOiAneicgfSxcclxuICAgICAgNDM6IHsgZmllbGQ6ICdoZWFkaW5nJyB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzFiLW5ldHdvcmt0YXJnZXRpY29uLWhlYWQtbWFya2Vyc1xyXG4gICAqL1xyXG4gIHN0YXRpYyBoZWFkTWFya2VyKHBhcmFtcz86IFBhcmFtczxIZWFkTWFya2VyUGFyYW1zPik6IE5ldFJlZ2V4PEhlYWRNYXJrZXJQYXJhbXM+IHtcclxuICAgIHJldHVybiBwYXJzZUhlbHBlcihwYXJhbXMsICdoZWFkTWFya2VyJywge1xyXG4gICAgICAwOiB7IGZpZWxkOiAndHlwZScsIHZhbHVlOiAnMjcnIH0sXHJcbiAgICAgIDE6IHsgZmllbGQ6ICd0aW1lc3RhbXAnIH0sXHJcbiAgICAgIDI6IHsgZmllbGQ6ICd0YXJnZXRJZCcgfSxcclxuICAgICAgMzogeyBmaWVsZDogJ3RhcmdldCcgfSxcclxuICAgICAgNjogeyBmaWVsZDogJ2lkJyB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzAzLWFkZGNvbWJhdGFudFxyXG4gICAqL1xyXG4gIHN0YXRpYyBhZGRlZENvbWJhdGFudChwYXJhbXM/OiBQYXJhbXM8QWRkZWRDb21iYXRhbnRQYXJhbXM+KTogTmV0UmVnZXg8QWRkZWRDb21iYXRhbnRQYXJhbXM+IHtcclxuICAgIHJldHVybiBwYXJzZUhlbHBlcihwYXJhbXMsICdhZGRlZENvbWJhdGFudCcsIHtcclxuICAgICAgMDogeyBmaWVsZDogJ3R5cGUnLCB2YWx1ZTogJzAzJyB9LFxyXG4gICAgICAxOiB7IGZpZWxkOiAndGltZXN0YW1wJyB9LFxyXG4gICAgICAyOiB7IGZpZWxkOiAnaWQnIH0sXHJcbiAgICAgIDM6IHsgZmllbGQ6ICduYW1lJyB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzAzLWFkZGNvbWJhdGFudFxyXG4gICAqL1xyXG4gIHN0YXRpYyBhZGRlZENvbWJhdGFudEZ1bGwoXHJcbiAgICAgIHBhcmFtcz86IFBhcmFtczxBZGRlZENvbWJhdGFudEZ1bGxQYXJhbXM+LFxyXG4gICk6IE5ldFJlZ2V4PEFkZGVkQ29tYmF0YW50RnVsbFBhcmFtcz4ge1xyXG4gICAgcmV0dXJuIHBhcnNlSGVscGVyKHBhcmFtcywgJ2FkZGVkQ29tYmF0YW50RnVsbCcsIHtcclxuICAgICAgMDogeyBmaWVsZDogJ3R5cGUnLCB2YWx1ZTogJzAzJyB9LFxyXG4gICAgICAxOiB7IGZpZWxkOiAndGltZXN0YW1wJyB9LFxyXG4gICAgICAyOiB7IGZpZWxkOiAnaWQnIH0sXHJcbiAgICAgIDM6IHsgZmllbGQ6ICduYW1lJyB9LFxyXG4gICAgICA0OiB7IGZpZWxkOiAnam9iJyB9LFxyXG4gICAgICA1OiB7IGZpZWxkOiAnbGV2ZWwnIH0sXHJcbiAgICAgIDY6IHsgZmllbGQ6ICdvd25lcklkJyB9LFxyXG4gICAgICA4OiB7IGZpZWxkOiAnd29ybGQnIH0sXHJcbiAgICAgIDk6IHsgZmllbGQ6ICducGNOYW1lSWQnIH0sXHJcbiAgICAgIDEwOiB7IGZpZWxkOiAnbnBjQmFzZUlkJyB9LFxyXG4gICAgICAxMTogeyBmaWVsZDogJ2N1cnJlbnRIcCcgfSxcclxuICAgICAgMTI6IHsgZmllbGQ6ICdocCcgfSxcclxuICAgICAgMTc6IHsgZmllbGQ6ICd4JyB9LFxyXG4gICAgICAxODogeyBmaWVsZDogJ3knIH0sXHJcbiAgICAgIDE5OiB7IGZpZWxkOiAneicgfSxcclxuICAgICAgMjA6IHsgZmllbGQ6ICdoZWFkaW5nJyB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzA0LXJlbW92ZWNvbWJhdGFudFxyXG4gICAqL1xyXG4gIHN0YXRpYyByZW1vdmluZ0NvbWJhdGFudChcclxuICAgICAgcGFyYW1zPzogUGFyYW1zPFJlbW92aW5nQ29tYmF0YW50UGFyYW1zPixcclxuICApOiBOZXRSZWdleDxSZW1vdmluZ0NvbWJhdGFudFBhcmFtcz4ge1xyXG4gICAgcmV0dXJuIHBhcnNlSGVscGVyKHBhcmFtcywgJ3JlbW92aW5nQ29tYmF0YW50Jywge1xyXG4gICAgICAwOiB7IGZpZWxkOiAndHlwZScsIHZhbHVlOiAnMDQnIH0sXHJcbiAgICAgIDE6IHsgZmllbGQ6ICd0aW1lc3RhbXAnIH0sXHJcbiAgICAgIDI6IHsgZmllbGQ6ICdpZCcgfSxcclxuICAgICAgMzogeyBmaWVsZDogJ25hbWUnIH0sXHJcbiAgICAgIDEyOiB7IGZpZWxkOiAnaHAnIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMWEtbmV0d29ya2J1ZmZcclxuICAgKi9cclxuICBzdGF0aWMgZ2FpbnNFZmZlY3QocGFyYW1zPzogUGFyYW1zPEdhaW5zRWZmZWN0UGFyYW1zPik6IE5ldFJlZ2V4PEdhaW5zRWZmZWN0UGFyYW1zPiB7XHJcbiAgICByZXR1cm4gcGFyc2VIZWxwZXIocGFyYW1zLCAnZ2FpbnNFZmZlY3QnLCB7XHJcbiAgICAgIDA6IHsgZmllbGQ6ICd0eXBlJywgdmFsdWU6ICcyNicgfSxcclxuICAgICAgMTogeyBmaWVsZDogJ3RpbWVzdGFtcCcgfSxcclxuICAgICAgMjogeyBmaWVsZDogJ2VmZmVjdElkJyB9LFxyXG4gICAgICAzOiB7IGZpZWxkOiAnZWZmZWN0JyB9LFxyXG4gICAgICA0OiB7IGZpZWxkOiAnZHVyYXRpb24nIH0sXHJcbiAgICAgIDU6IHsgZmllbGQ6ICdzb3VyY2VJZCcgfSxcclxuICAgICAgNjogeyBmaWVsZDogJ3NvdXJjZScgfSxcclxuICAgICAgNzogeyBmaWVsZDogJ3RhcmdldElkJyB9LFxyXG4gICAgICA4OiB7IGZpZWxkOiAndGFyZ2V0JyB9LFxyXG4gICAgICA5OiB7IGZpZWxkOiAnY291bnQnIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBQcmVmZXIgZ2FpbnNFZmZlY3Qgb3ZlciB0aGlzIGZ1bmN0aW9uIHVubGVzcyB5b3UgcmVhbGx5IG5lZWQgZXh0cmEgZGF0YS5cclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMjYtbmV0d29ya3N0YXR1c2VmZmVjdHNcclxuICAgKi9cclxuICBzdGF0aWMgc3RhdHVzRWZmZWN0RXhwbGljaXQoXHJcbiAgICAgIHBhcmFtcz86IFBhcmFtczxTdGF0dXNFZmZlY3RFeHBsaWNpdFBhcmFtcz4sXHJcbiAgKTogTmV0UmVnZXg8U3RhdHVzRWZmZWN0RXhwbGljaXRQYXJhbXM+IHtcclxuICAgIHJldHVybiBwYXJzZUhlbHBlcihwYXJhbXMsICdzdGF0dXNFZmZlY3RFeHBsaWNpdCcsIHtcclxuICAgICAgMDogeyBmaWVsZDogJ3R5cGUnLCB2YWx1ZTogJzM4JyB9LFxyXG4gICAgICAxOiB7IGZpZWxkOiAndGltZXN0YW1wJyB9LFxyXG4gICAgICAyOiB7IGZpZWxkOiAndGFyZ2V0SWQnIH0sXHJcbiAgICAgIDM6IHsgZmllbGQ6ICd0YXJnZXQnIH0sXHJcbiAgICAgIDU6IHsgZmllbGQ6ICdocCcgfSxcclxuICAgICAgNjogeyBmaWVsZDogJ21heEhwJyB9LFxyXG4gICAgICAxMTogeyBmaWVsZDogJ3gnIH0sXHJcbiAgICAgIDEyOiB7IGZpZWxkOiAneScgfSxcclxuICAgICAgMTM6IHsgZmllbGQ6ICd6JyB9LFxyXG4gICAgICAxNDogeyBmaWVsZDogJ2hlYWRpbmcnIH0sXHJcbiAgICAgIDE1OiB7IGZpZWxkOiAnZGF0YTAnIH0sXHJcbiAgICAgIDE2OiB7IGZpZWxkOiAnZGF0YTEnIH0sXHJcbiAgICAgIDE3OiB7IGZpZWxkOiAnZGF0YTInIH0sXHJcbiAgICAgIDE4OiB7IGZpZWxkOiAnZGF0YTMnIH0sXHJcbiAgICAgIDE5OiB7IGZpZWxkOiAnZGF0YTQnIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMWUtbmV0d29ya2J1ZmZyZW1vdmVcclxuICAgKi9cclxuICBzdGF0aWMgbG9zZXNFZmZlY3QocGFyYW1zPzogUGFyYW1zPExvc2VzRWZmZWN0UGFyYW1zPik6IE5ldFJlZ2V4PExvc2VzRWZmZWN0UGFyYW1zPiB7XHJcbiAgICByZXR1cm4gcGFyc2VIZWxwZXIocGFyYW1zLCAnbG9zZXNFZmZlY3QnLCB7XHJcbiAgICAgIDA6IHsgZmllbGQ6ICd0eXBlJywgdmFsdWU6ICczMCcgfSxcclxuICAgICAgMTogeyBmaWVsZDogJ3RpbWVzdGFtcCcgfSxcclxuICAgICAgMjogeyBmaWVsZDogJ2VmZmVjdElkJyB9LFxyXG4gICAgICAzOiB7IGZpZWxkOiAnZWZmZWN0JyB9LFxyXG4gICAgICA1OiB7IGZpZWxkOiAnc291cmNlSWQnIH0sXHJcbiAgICAgIDY6IHsgZmllbGQ6ICdzb3VyY2UnIH0sXHJcbiAgICAgIDc6IHsgZmllbGQ6ICd0YXJnZXRJZCcgfSxcclxuICAgICAgODogeyBmaWVsZDogJ3RhcmdldCcgfSxcclxuICAgICAgOTogeyBmaWVsZDogJ2NvdW50JyB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzIzLW5ldHdvcmt0ZXRoZXJcclxuICAgKi9cclxuICBzdGF0aWMgdGV0aGVyKHBhcmFtcz86IFBhcmFtczxUZXRoZXJQYXJhbXM+KTogTmV0UmVnZXg8VGV0aGVyUGFyYW1zPiB7XHJcbiAgICByZXR1cm4gcGFyc2VIZWxwZXIocGFyYW1zLCAndGV0aGVyJywge1xyXG4gICAgICAwOiB7IGZpZWxkOiAndHlwZScsIHZhbHVlOiAnMzUnIH0sXHJcbiAgICAgIDE6IHsgZmllbGQ6ICd0aW1lc3RhbXAnIH0sXHJcbiAgICAgIDI6IHsgZmllbGQ6ICdzb3VyY2VJZCcgfSxcclxuICAgICAgMzogeyBmaWVsZDogJ3NvdXJjZScgfSxcclxuICAgICAgNDogeyBmaWVsZDogJ3RhcmdldElkJyB9LFxyXG4gICAgICA1OiB7IGZpZWxkOiAndGFyZ2V0JyB9LFxyXG4gICAgICA4OiB7IGZpZWxkOiAnaWQnIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiAndGFyZ2V0JyB3YXMgZGVmZWF0ZWQgYnkgJ3NvdXJjZSdcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMTktbmV0d29ya2RlYXRoXHJcbiAgICovXHJcbiAgc3RhdGljIHdhc0RlZmVhdGVkKHBhcmFtcz86IFBhcmFtczxXYXNEZWZlYXRlZFBhcmFtcz4pOiBOZXRSZWdleDxXYXNEZWZlYXRlZFBhcmFtcz4ge1xyXG4gICAgcmV0dXJuIHBhcnNlSGVscGVyKHBhcmFtcywgJ3dhc0RlZmVhdGVkJywge1xyXG4gICAgICAwOiB7IGZpZWxkOiAndHlwZScsIHZhbHVlOiAnMjUnIH0sXHJcbiAgICAgIDE6IHsgZmllbGQ6ICd0aW1lc3RhbXAnIH0sXHJcbiAgICAgIDI6IHsgZmllbGQ6ICd0YXJnZXRJZCcgfSxcclxuICAgICAgMzogeyBmaWVsZDogJ3RhcmdldCcgfSxcclxuICAgICAgNDogeyBmaWVsZDogJ3NvdXJjZUlkJyB9LFxyXG4gICAgICA1OiB7IGZpZWxkOiAnc291cmNlJyB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZWNobyhwYXJhbXM/OiBQYXJhbXM8RWNob1BhcmFtcz4pOiBOZXRSZWdleDxFY2hvUGFyYW1zPiB7XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIHBhcmFtcyA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhwYXJhbXMsICdlY2hvJywgWyd0eXBlJywgJ3RpbWVzdGFtcCcsICdjb2RlJywgJ25hbWUnLCAnbGluZScsICdjYXB0dXJlJ10pO1xyXG4gICAgcGFyYW1zLmNvZGUgPSAnMDAzOCc7XHJcbiAgICByZXR1cm4gTmV0UmVnZXhlcy5nYW1lTG9nKHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZGlhbG9nKHBhcmFtcz86IFBhcmFtczxEaWFsb2dQYXJhbXM+KTogTmV0UmVnZXg8RGlhbG9nUGFyYW1zPiB7XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIHBhcmFtcyA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhwYXJhbXMsICdkaWFsb2cnLCBbJ3R5cGUnLCAndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSk7XHJcbiAgICBwYXJhbXMuY29kZSA9ICcwMDQ0JztcclxuICAgIHJldHVybiBOZXRSZWdleGVzLmdhbWVMb2cocGFyYW1zKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBtZXNzYWdlKHBhcmFtcz86IFBhcmFtczxNZXNzYWdlUGFyYW1zPik6IE5ldFJlZ2V4PE1lc3NhZ2VQYXJhbXM+IHtcclxuICAgIGlmICh0eXBlb2YgcGFyYW1zID09PSAndW5kZWZpbmVkJylcclxuICAgICAgcGFyYW1zID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKHBhcmFtcywgJ21lc3NhZ2UnLCBbJ3R5cGUnLCAndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSk7XHJcbiAgICBwYXJhbXMuY29kZSA9ICcwODM5JztcclxuICAgIHJldHVybiBOZXRSZWdleGVzLmdhbWVMb2cocGFyYW1zKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBmaWVsZHM6IGNvZGUsIG5hbWUsIGxpbmUsIGNhcHR1cmVcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnYW1lTG9nKHBhcmFtcz86IFBhcmFtczxHYW1lTG9nUGFyYW1zPik6IE5ldFJlZ2V4PEdhbWVMb2dQYXJhbXM+IHtcclxuICAgIHJldHVybiBwYXJzZUhlbHBlcihwYXJhbXMsICdnYW1lTG9nJywge1xyXG4gICAgICAwOiB7IGZpZWxkOiAndHlwZScsIHZhbHVlOiAnMDAnIH0sXHJcbiAgICAgIDE6IHsgZmllbGQ6ICd0aW1lc3RhbXAnIH0sXHJcbiAgICAgIDI6IHsgZmllbGQ6ICdjb2RlJyB9LFxyXG4gICAgICAzOiB7IGZpZWxkOiAnbmFtZScgfSxcclxuICAgICAgNDogeyBmaWVsZDogJ2xpbmUnIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vcXVpc3F1b3VzL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjMDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnYW1lTmFtZUxvZyhwYXJhbXM/OiBQYXJhbXM8R2FtZU5hbWVMb2dQYXJhbXM+KTogTmV0UmVnZXg8R2FtZU5hbWVMb2dQYXJhbXM+IHtcclxuICAgIC8vIGZvciBjb21wYXQgd2l0aCBSZWdleGVzLlxyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuZ2FtZUxvZyhwYXJhbXMpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMwYy1wbGF5ZXJzdGF0c1xyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGF0Q2hhbmdlKHBhcmFtcz86IFBhcmFtczxTdGF0Q2hhbmdlUGFyYW1zPik6IE5ldFJlZ2V4PFN0YXRDaGFuZ2VQYXJhbXM+IHtcclxuICAgIHJldHVybiBwYXJzZUhlbHBlcihwYXJhbXMsICdzdGF0Q2hhbmdlJywge1xyXG4gICAgICAwOiB7IGZpZWxkOiAndHlwZScsIHZhbHVlOiAnMTInIH0sXHJcbiAgICAgIDE6IHsgZmllbGQ6ICd0aW1lc3RhbXAnIH0sXHJcbiAgICAgIDI6IHsgZmllbGQ6ICdqb2InIH0sXHJcbiAgICAgIDM6IHsgZmllbGQ6ICdzdHJlbmd0aCcgfSxcclxuICAgICAgNDogeyBmaWVsZDogJ2RleHRlcml0eScgfSxcclxuICAgICAgNTogeyBmaWVsZDogJ3ZpdGFsaXR5JyB9LFxyXG4gICAgICA2OiB7IGZpZWxkOiAnaW50ZWxsaWdlbmNlJyB9LFxyXG4gICAgICA3OiB7IGZpZWxkOiAnbWluZCcgfSxcclxuICAgICAgODogeyBmaWVsZDogJ3BpZXR5JyB9LFxyXG4gICAgICA5OiB7IGZpZWxkOiAnYXR0YWNrUG93ZXInIH0sXHJcbiAgICAgIDEwOiB7IGZpZWxkOiAnZGlyZWN0SGl0JyB9LFxyXG4gICAgICAxMTogeyBmaWVsZDogJ2NyaXRpY2FsSGl0JyB9LFxyXG4gICAgICAxMjogeyBmaWVsZDogJ2F0dGFja01hZ2ljUG90ZW5jeScgfSxcclxuICAgICAgMTM6IHsgZmllbGQ6ICdoZWFsTWFnaWNQb3RlbmN5JyB9LFxyXG4gICAgICAxNDogeyBmaWVsZDogJ2RldGVybWluYXRpb24nIH0sXHJcbiAgICAgIDE1OiB7IGZpZWxkOiAnc2tpbGxTcGVlZCcgfSxcclxuICAgICAgMTY6IHsgZmllbGQ6ICdzcGVsbFNwZWVkJyB9LFxyXG4gICAgICAxODogeyBmaWVsZDogJ3RlbmFjaXR5JyB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzAxLWNoYW5nZXpvbmVcclxuICAgKi9cclxuICBzdGF0aWMgY2hhbmdlWm9uZShwYXJhbXM/OiBQYXJhbXM8Q2hhbmdlWm9uZVBhcmFtcz4pOiBOZXRSZWdleDxDaGFuZ2Vab25lUGFyYW1zPiB7XHJcbiAgICByZXR1cm4gcGFyc2VIZWxwZXIocGFyYW1zLCAnY2hhbmdlWm9uZScsIHtcclxuICAgICAgMDogeyBmaWVsZDogJ3R5cGUnLCB2YWx1ZTogJzAxJyB9LFxyXG4gICAgICAxOiB7IGZpZWxkOiAndGltZXN0YW1wJyB9LFxyXG4gICAgICAyOiB7IGZpZWxkOiAnaWQnIH0sXHJcbiAgICAgIDM6IHsgZmllbGQ6ICduYW1lJyB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL3F1aXNxdW91cy9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kIzIxLW5ldHdvcms2ZC1hY3Rvci1jb250cm9sLWxpbmVzXHJcbiAgICovXHJcbiAgc3RhdGljIG5ldHdvcms2ZChwYXJhbXM/OiBQYXJhbXM8TmV0d29yazZkUGFyYW1zPik6IE5ldFJlZ2V4PE5ldHdvcms2ZFBhcmFtcz4ge1xyXG4gICAgcmV0dXJuIHBhcnNlSGVscGVyKHBhcmFtcywgJ25ldHdvcms2ZCcsIHtcclxuICAgICAgMDogeyBmaWVsZDogJ3R5cGUnLCB2YWx1ZTogJzMzJyB9LFxyXG4gICAgICAxOiB7IGZpZWxkOiAndGltZXN0YW1wJyB9LFxyXG4gICAgICAyOiB7IGZpZWxkOiAnaW5zdGFuY2UnIH0sXHJcbiAgICAgIDM6IHsgZmllbGQ6ICdjb21tYW5kJyB9LFxyXG4gICAgICA0OiB7IGZpZWxkOiAnZGF0YTAnIH0sXHJcbiAgICAgIDU6IHsgZmllbGQ6ICdkYXRhMScgfSxcclxuICAgICAgNjogeyBmaWVsZDogJ2RhdGEyJyB9LFxyXG4gICAgICA3OiB7IGZpZWxkOiAnZGF0YTMnIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9xdWlzcXVvdXMvY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCMyMi1uZXR3b3JrbmFtZXRvZ2dsZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBuYW1lVG9nZ2xlKHBhcmFtcz86IFBhcmFtczxOYW1lVG9nZ2xlUGFyYW1zPik6IE5ldFJlZ2V4PE5hbWVUb2dnbGVQYXJhbXM+IHtcclxuICAgIHJldHVybiBwYXJzZUhlbHBlcihwYXJhbXMsICduYW1lVG9nZ2xlJywge1xyXG4gICAgICAwOiB7IGZpZWxkOiAndHlwZScsIHZhbHVlOiAnMzQnIH0sXHJcbiAgICAgIDE6IHsgZmllbGQ6ICd0aW1lc3RhbXAnIH0sXHJcbiAgICAgIDI6IHsgZmllbGQ6ICdpZCcgfSxcclxuICAgICAgMzogeyBmaWVsZDogJ25hbWUnIH0sXHJcbiAgICAgIDY6IHsgZmllbGQ6ICd0b2dnbGUnIH0sXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTGFuZyB9IGZyb20gJy4vbGFuZ3VhZ2VzJztcclxuaW1wb3J0IFJlZ2V4ZXMgZnJvbSAnLi9yZWdleGVzJztcclxuaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi9uZXRyZWdleGVzJztcclxuXHJcbi8vIEZpbGwgaW4gTG9jYWxlUmVnZXggc28gdGhhdCB0aGluZ3MgbGlrZSBMb2NhbGVSZWdleC5jb3VudGRvd25TdGFydC5kZSBpcyBhIHZhbGlkIHJlZ2V4LlxyXG5jb25zdCBsb2NhbGVMaW5lcyA9IHtcclxuICBjb3VudGRvd25TdGFydDoge1xyXG4gICAgZW46ICdCYXR0bGUgY29tbWVuY2luZyBpbiAoPzx0aW1lPlxcXFx5e0Zsb2F0fSkgc2Vjb25kcyEgXFxcXCgoPzxwbGF5ZXI+Lio/KVxcXFwpJyxcclxuICAgIGRlOiAnTm9jaCAoPzx0aW1lPlxcXFx5e0Zsb2F0fSkgU2VrdW5kZW4gYmlzIEthbXBmYmVnaW5uISBcXFxcKCg/PHBsYXllcj4uKj8pXFxcXCknLFxyXG4gICAgZnI6ICdEw6lidXQgZHUgY29tYmF0IGRhbnMgKD88dGltZT5cXFxceXtGbG9hdH0pIHNlY29uZGVzWyBdPyEgXFxcXCgoPzxwbGF5ZXI+Lio/KVxcXFwpJyxcclxuICAgIGphOiAn5oim6ZeY6ZaL5aeL44G+44GnKD88dGltZT5cXFxceXtGbG9hdH0p56eS77yBIFxcXFwoKD88cGxheWVyPi4qPylcXFxcKScsXHJcbiAgICBjbjogJ+i3neemu+aImOaWl+W8gOWni+i/mOaciSg/PHRpbWU+XFxcXHl7RmxvYXR9Keenku+8gSDvvIgoPzxwbGF5ZXI+Lio/Ke+8iScsXHJcbiAgICBrbzogJ+yghO2IrCDsi5zsnpEgKD88dGltZT5cXFxceXtGbG9hdH0p7LSIIOyghCEgXFxcXCgoPzxwbGF5ZXI+Lio/KVxcXFwpJyxcclxuICB9LFxyXG4gIGNvdW50ZG93bkVuZ2FnZToge1xyXG4gICAgZW46ICdFbmdhZ2UhJyxcclxuICAgIGRlOiAnU3RhcnQhJyxcclxuICAgIGZyOiAnw4AgbFxcJ2F0dGFxdWVbIF0/IScsXHJcbiAgICBqYTogJ+aIpumXmOmWi+Wni++8gScsXHJcbiAgICBjbjogJ+aImOaWl+W8gOWni++8gScsXHJcbiAgICBrbzogJ+yghO2IrCDsi5zsnpEhJyxcclxuICB9LFxyXG4gIGNvdW50ZG93bkNhbmNlbDoge1xyXG4gICAgZW46ICdDb3VudGRvd24gY2FuY2VsZWQgYnkgKD88cGxheWVyPlxcXFx5e05hbWV9KScsXHJcbiAgICBkZTogJyg/PHBsYXllcj5cXFxceXtOYW1lfSkgaGF0IGRlbiBDb3VudGRvd24gYWJnZWJyb2NoZW4nLFxyXG4gICAgZnI6ICdMZSBjb21wdGUgw6AgcmVib3VycyBhIMOpdMOpIGludGVycm9tcHUgcGFyICg/PHBsYXllcj5cXFxceXtOYW1lfSlbIF0/XFxcXC4nLFxyXG4gICAgamE6ICcoPzxwbGF5ZXI+XFxcXHl7TmFtZX0p44Gr44KI44KK44CB5oim6ZeY6ZaL5aeL44Kr44Km44Oz44OI44GM44Kt44Oj44Oz44K744Or44GV44KM44G+44GX44Gf44CCJyxcclxuICAgIGNuOiAnKD88cGxheWVyPlxcXFx5e05hbWV9KeWPlua2iOS6huaImOaWl+W8gOWni+WAkuiuoeaXtuOAgicsXHJcbiAgICBrbzogJyg/PHBsYXllcj5cXFxceXtOYW1lfSkg64uY7J20IOy0iOydveq4sOulvCDst6jshoztlojsirXri4jri6RcXFxcLicsXHJcbiAgfSxcclxuICBhcmVhU2VhbDoge1xyXG4gICAgZW46ICcoPzxhcmVhPi4qPykgd2lsbCBiZSBzZWFsZWQgb2ZmIGluICg/PHRpbWU+XFxcXHl7RmxvYXR9KSBzZWNvbmRzIScsXHJcbiAgICBkZTogJ05vY2ggKD88dGltZT5cXFxceXtGbG9hdH0pIFNla3VuZGVuLCBiaXMgc2ljaCAoPzxhcmVhPi4qPykgc2NobGllw590JyxcclxuICAgIGZyOiAnRmVybWV0dXJlICg/PGFyZWE+Lio/KSBkYW5zICg/PHRpbWU+XFxcXHl7RmxvYXR9KSBzZWNvbmRlc1sgXT9cXFxcLicsXHJcbiAgICBqYTogJyg/PGFyZWE+Lio/KeOBruWwgemOluOBvuOBp+OBguOBqCg/PHRpbWU+XFxcXHl7RmxvYXR9KeenkicsXHJcbiAgICBjbjogJ+i3nSg/PGFyZWE+Lio/Keiiq+WwgemUgei/mOaciSg/PHRpbWU+XFxcXHl7RmxvYXR9KeenkicsXHJcbiAgICBrbzogJyg/PHRpbWU+XFxcXHl7RmxvYXR9Key0iCDtm4Tsl5AgKD88YXJlYT4uKj8pKOydtHzqsIApIOu0ieyHhOuQqeuLiOuLpFxcXFwuJyxcclxuICB9LFxyXG4gIGFyZWFVbnNlYWw6IHtcclxuICAgIGVuOiAnKD88YXJlYT4uKj8pIGlzIG5vIGxvbmdlciBzZWFsZWQuJyxcclxuICAgIGRlOiAnKD88YXJlYT4uKj8pIMO2ZmZuZXQgc2ljaCBlcm5ldXQuJyxcclxuICAgIGZyOiAnT3V2ZXJ0dXJlICg/PGFyZWE+Lio/KVsgXT8hJyxcclxuICAgIGphOiAnKD88YXJlYT4uKj8p44Gu5bCB6Y6W44GM6Kej44GL44KM44Gf4oCm4oCmJyxcclxuICAgIGNuOiAnKD88YXJlYT4uKj8p55qE5bCB6ZSB6Kej6Zmk5LqGJyxcclxuICAgIGtvOiAnKD88YXJlYT4uKj8p7J2YIOu0ieyHhOqwgCDtlbTsoJzrkJjsl4jsirXri4jri6RcXFxcLicsXHJcbiAgfSxcclxuICAvLyBSZWNpcGUgbmFtZSBhbHdheXMgc3RhcnQgd2l0aCBcXHVlMGJiXHJcbiAgLy8gSFEgaWNvbiBpcyBcXHVlMDNjXHJcbiAgY3JhZnRpbmdTdGFydDoge1xyXG4gICAgZW46ICdZb3UgYmVnaW4gc3ludGhlc2l6aW5nICg/PGNvdW50Pihhbj98XFxcXGQrKSApP1xcdWUwYmIoPzxyZWNpcGU+LiopXFxcXC4nLFxyXG4gICAgZGU6ICdEdSBoYXN0IGJlZ29ubmVuLCBkdXJjaCBTeW50aGVzZSAoPzxjb3VudD4oZWluKGV8ZXN8ZW18ZXIpP3xcXFxcZCspICk/XFx1ZTBiYig/PHJlY2lwZT4uKikgaGVyenVzdGVsbGVuXFxcXC4nLFxyXG4gICAgZnI6ICdWb3VzIGNvbW1lbmNleiDDoCBmYWJyaXF1ZXIgKD88Y291bnQ+KHVuZT98XFxcXGQrKSApP1xcdWUwYmIoPzxyZWNpcGU+LiopXFxcXC4nLFxyXG4gICAgamE6ICcoPzxwbGF5ZXI+XFxcXHl7TmFtZX0p44GvXFx1ZTBiYig/PHJlY2lwZT4uKikow5coPzxjb3VudD5cXFxcZCspKT/jga7oo73kvZzjgpLplovlp4vjgZfjgZ/jgIInLFxyXG4gICAgY246ICcoPzxwbGF5ZXI+XFxcXHl7TmFtZX0p5byA5aeL5Yi25L2c4oCcXFx1ZTBiYig/PHJlY2lwZT4uKinigJ0ow5coPzxjb3VudD5cXFxcZCspKT/jgIInLFxyXG4gICAga286ICdcXHVlMGJiKD88cmVjaXBlPi4qKSjDlyg/PGNvdW50PlxcXFxkKynqsJwpPyDsoJzsnpHsnYQg7Iuc7J6R7ZWp64uI64ukXFxcXC4nLFxyXG4gIH0sXHJcbiAgdHJpYWxDcmFmdGluZ1N0YXJ0OiB7XHJcbiAgICBlbjogJ1lvdSBiZWdpbiB0cmlhbCBzeW50aGVzaXMgb2YgXFx1ZTBiYig/PHJlY2lwZT4uKilcXFxcLicsXHJcbiAgICBkZTogJ0R1IGhhc3QgbWl0IGRlciBUZXN0c3ludGhlc2Ugdm9uIFxcdWUwYmIoPzxyZWNpcGU+LiopIGJlZ29ubmVuXFxcXC4nLFxyXG4gICAgZnI6ICdWb3VzIGNvbW1lbmNleiB1bmUgc3ludGjDqHNlIGRcXCdlc3NhaSBwb3VyIHVuZT8gXFx1ZTBiYig/PHJlY2lwZT4uKilcXFxcLicsXHJcbiAgICBqYTogJyg/PHBsYXllcj5cXFxceXtOYW1lfSnjga9cXHVlMGJiKD88cmVjaXBlPi4qKeOBruijveS9nOe3tOe/kuOCkumWi+Wni+OBl+OBn+OAgicsXHJcbiAgICBjbjogJyg/PHBsYXllcj5cXFxceXtOYW1lfSnlvIDlp4vnu4PkuaDliLbkvZxcXHVlMGJiKD88cmVjaXBlPi4qKeOAgicsXHJcbiAgICBrbzogJ1xcdWUwYmIoPzxyZWNpcGU+LiopIOygnOyekSDsl7DsirXsnYQg7Iuc7J6R7ZWp64uI64ukXFxcXC4nLFxyXG4gIH0sXHJcbiAgY3JhZnRpbmdGaW5pc2g6IHtcclxuICAgIGVuOiAnWW91IHN5bnRoZXNpemUgKD88Y291bnQ+KGFuP3xcXFxcZCspICk/XFx1ZTBiYig/PHJlY2lwZT4uKikoXFx1ZTAzYyk/XFxcXC4nLFxyXG4gICAgZGU6ICdEdSBoYXN0IGVyZm9sZ3JlaWNoICg/PGNvdW50PihlaW4oZXxlc3xlbXxlcik/fFxcXFxkKykgKT8oPzxyZWNpcGU+LiopKFxcdWUwM2MpPyBoZXJnZXN0ZWxsdFxcXFwuJyxcclxuICAgIGZyOiAnVm91cyBmYWJyaXF1ZXogKD88Y291bnQ+KHVuZT98XFxcXGQrKSApP1xcdWUwYmIoPzxyZWNpcGU+LiopKFxcdWUwM2MpP1xcXFwuJyxcclxuICAgIGphOiAnKD88cGxheWVyPlxcXFx5e05hbWV9KeOBr1xcdWUwYmIoPzxyZWNpcGU+LiopKFxcdWUwM2MpPyjDlyg/PGNvdW50PlxcXFxkKykpP+OCkuWujOaIkOOBleOBm+OBn++8gScsXHJcbiAgICBjbjogJyg/PHBsYXllcj5cXFxceXtOYW1lfSnliLbkvZzigJxcXHVlMGJiKD88cmVjaXBlPi4qKShcXHVlMDNjKT/igJ0ow5coPzxjb3VudD5cXFxcZCspKT/miJDlip/vvIEnLFxyXG4gICAga286ICcoPzxwbGF5ZXI+XFxcXHl7TmFtZX0pIOuLmOydtCBcXHVlMGJiKD88cmVjaXBlPi4qKShcXHVlMDNjKT8ow5coPzxjb3VudD5cXFxcZCsp6rCcKT8o7J2EfOulvCkg7JmE7ISx7ZaI7Iq164uI64ukIScsXHJcbiAgfSxcclxuICB0cmlhbENyYWZ0aW5nRmluaXNoOiB7XHJcbiAgICBlbjogJ1lvdXIgdHJpYWwgc3ludGhlc2lzIG9mIFxcdWUwYmIoPzxyZWNpcGU+LiopIHByb3ZlZCBhIHN1Y2Nlc3MhJyxcclxuICAgIGRlOiAnRGllIFRlc3RzeW50aGVzZSB2b24gXFx1ZTBiYig/PHJlY2lwZT4uKikgd2FyIGVyZm9sZ3JlaWNoIScsXHJcbiAgICBmcjogJ1ZvdHJlIHN5bnRow6hzZSBkXFwnZXNzYWkgcG91ciBmYWJyaXF1ZXIgXFx1ZTBiYig/PHJlY2lwZT4uKikgYSDDqXTDqSBjb3Vyb25uw6llIGRlIHN1Y2PDqHMhJyxcclxuICAgIGphOiAnKD88cGxheWVyPlxcXFx5e05hbWV9KeOBr1xcdWUwYmIoPzxyZWNpcGU+Liop44Gu6KO95L2c57e057+S44Gr5oiQ5Yqf44GX44Gf77yBJyxcclxuICAgIGNuOiAnKD88cGxheWVyPlxcXFx5e05hbWV9Kee7g+S5oOWItuS9nFxcdWUwYmIoPzxyZWNpcGU+Liop5oiQ5Yqf5LqG77yBJyxcclxuICAgIGtvOiAnXFx1ZTBiYig/PHJlY2lwZT4uKikg7KCc7J6RIOyXsOyKteyXkCDshLHqs7XtlojsirXri4jri6QhJyxcclxuICB9LFxyXG4gIGNyYWZ0aW5nRmFpbDoge1xyXG4gICAgZW46ICdZb3VyIHN5bnRoZXNpcyBmYWlscyEnLFxyXG4gICAgZGU6ICdEZWluZSBTeW50aGVzZSBpc3QgZmVobGdlc2NobGFnZW4hJyxcclxuICAgIGZyOiAnTGEgc3ludGjDqHNlIMOpY2hvdWVcXFxcLnszfScsXHJcbiAgICBqYTogJyg/PHBsYXllcj5cXFxceXtOYW1lfSnjga/oo73kvZzjgavlpLHmlZfjgZfjgZ/igKbigKYnLFxyXG4gICAgY246ICcoPzxwbGF5ZXI+XFxcXHl7TmFtZX0p5Yi25L2c5aSx6LSl5LqG4oCm4oCmJyxcclxuICAgIGtvOiAn7KCc7J6R7JeQIOyLpO2MqO2WiOyKteuLiOuLpOKApuKAplxcXFwuJyxcclxuICB9LFxyXG4gIHRyaWFsQ3JhZnRpbmdGYWlsOiB7XHJcbiAgICBlbjogJ1lvdXIgdHJpYWwgc3ludGhlc2lzIG9mIFxcdWUwYmIoPzxyZWNpcGU+LiopIGZhaWxlZFxcXFwuezN9JyxcclxuICAgIGRlOiAnRGllIFRlc3RzeW50aGVzZSB2b24gXFx1ZTBiYig/PHJlY2lwZT4uKikgaXN0IGZlaGxnZXNjaGxhZ2VuXFxcXC57M30nLFxyXG4gICAgZnI6ICdWb3RyZSBzeW50aMOoc2UgZFxcJ2Vzc2FpIHBvdXIgZmFicmlxdWVyIFxcdWUwYmIoPzxyZWNpcGU+LiopIHNcXCdlc3Qgc29sZMOpZSBwYXIgdW4gw6ljaGVjXFxcXC57M30nLFxyXG4gICAgamE6ICcoPzxwbGF5ZXI+XFxcXHl7TmFtZX0p44GvXFx1ZTBiYig/PHJlY2lwZT4uKinjga7oo73kvZznt7Tnv5LjgavlpLHmlZfjgZfjgZ/igKbigKYnLFxyXG4gICAgY246ICcoPzxwbGF5ZXI+XFxcXHl7TmFtZX0p57uD5Lmg5Yi25L2cXFx1ZTBiYig/PHJlY2lwZT4uKinlpLHotKXkuobigKbigKYnLFxyXG4gICAga286ICdcXHVlMGJiKD88cmVjaXBlPi4qKSDsoJzsnpEg7Jew7Iq17JeQIOyLpO2MqO2WiOyKteuLiOuLpOKApuKAplxcXFwuJyxcclxuICB9LFxyXG4gIGNyYWZ0aW5nQ2FuY2VsOiB7XHJcbiAgICBlbjogJ1lvdSBjYW5jZWwgdGhlIHN5bnRoZXNpc1xcXFwuJyxcclxuICAgIGRlOiAnRHUgaGFzdCBkaWUgU3ludGhlc2UgYWJnZWJyb2NoZW5cXFxcLicsXHJcbiAgICBmcjogJ0xhIHN5bnRow6hzZSBlc3QgYW5udWzDqWVcXFxcLicsXHJcbiAgICBqYTogJyg/PHBsYXllcj5cXFxceXtOYW1lfSnjga/oo73kvZzjgpLkuK3mraLjgZfjgZ/jgIInLFxyXG4gICAgY246ICcoPzxwbGF5ZXI+XFxcXHl7TmFtZX0p5Lit5q2i5LqG5Yi25L2c5L2c5Lia44CCJyxcclxuICAgIGtvOiAn7KCc7J6R7J2EIOykkeyngO2WiOyKteuLiOuLpFxcXFwuJyxcclxuICB9LFxyXG4gIHRyaWFsQ3JhZnRpbmdDYW5jZWw6IHtcclxuICAgIGVuOiAnWW91IGFiYW5kb25lZCB0cmlhbCBzeW50aGVzaXNcXFxcLicsXHJcbiAgICBkZTogJ1Rlc3RzeW50aGVzZSBhYmdlYnJvY2hlblxcXFwuJyxcclxuICAgIGZyOiAnVm91cyBhdmV6IGludGVycm9tcHUgbGEgc3ludGjDqHNlIGRcXCdlc3NhaVxcXFwuJyxcclxuICAgIGphOiAnKD88cGxheWVyPlxcXFx5e05hbWV9KeOBr+ijveS9nOe3tOe/kuOCkuS4reatouOBl+OBn+OAgicsXHJcbiAgICBjbjogJyg/PHBsYXllcj5cXFxceXtOYW1lfSnlgZzmraLkuobnu4PkuaDjgIInLFxyXG4gICAga286ICfsoJzsnpEg7Jew7Iq17J2EIOykkeyngO2WiOyKteuLiOuLpFxcXFwuJyxcclxuICB9LFxyXG59IGFzIGNvbnN0O1xyXG5cclxudHlwZSBMb2NhbGVMaW5lID0geyBlbjogc3RyaW5nIH0gJiBQYXJ0aWFsPFJlY29yZDxFeGNsdWRlPExhbmcsICdlbic+LCBzdHJpbmc+PjtcclxuXHJcbnR5cGUgTG9jYWxlUmVnZXhlc09iaiA9IFJlY29yZDxrZXlvZiB0eXBlb2YgbG9jYWxlTGluZXMsIFJlY29yZDxMYW5nLCBSZWdFeHA+PjtcclxuXHJcbmNsYXNzIFJlZ2V4U2V0IHtcclxuICByZWdleGVzPzogTG9jYWxlUmVnZXhlc09iajtcclxuICBuZXRSZWdleGVzPzogTG9jYWxlUmVnZXhlc09iajtcclxuXHJcbiAgZ2V0IGxvY2FsZVJlZ2V4KCk6IExvY2FsZVJlZ2V4ZXNPYmoge1xyXG4gICAgaWYgKHRoaXMucmVnZXhlcylcclxuICAgICAgcmV0dXJuIHRoaXMucmVnZXhlcztcclxuICAgIHRoaXMucmVnZXhlcyA9IHRoaXMuYnVpbGRMb2NhbGVSZWdleGVzKGxvY2FsZUxpbmVzLCAoczogc3RyaW5nKSA9PiBSZWdleGVzLmdhbWVMb2coeyBsaW5lOiBzICsgJy4qPycgfSkpO1xyXG4gICAgcmV0dXJuIHRoaXMucmVnZXhlcztcclxuICB9XHJcblxyXG4gIGdldCBsb2NhbGVOZXRSZWdleCgpOiBMb2NhbGVSZWdleGVzT2JqIHtcclxuICAgIGlmICh0aGlzLm5ldFJlZ2V4ZXMpXHJcbiAgICAgIHJldHVybiB0aGlzLm5ldFJlZ2V4ZXM7XHJcbiAgICB0aGlzLm5ldFJlZ2V4ZXMgPSB0aGlzLmJ1aWxkTG9jYWxlUmVnZXhlcyhsb2NhbGVMaW5lcywgKHM6IHN0cmluZykgPT4gTmV0UmVnZXhlcy5nYW1lTG9nKHsgbGluZTogcyArICdbXnxdKj8nIH0pKTtcclxuICAgIHJldHVybiB0aGlzLm5ldFJlZ2V4ZXM7XHJcbiAgfVxyXG5cclxuICBidWlsZExvY2FsZVJlZ2V4ZXMoXHJcbiAgICAgIGxvY2FsZXM6IHR5cGVvZiBsb2NhbGVMaW5lcyxcclxuICAgICAgYnVpbGRlcjogKHM6IHN0cmluZykgPT4gUmVnRXhwLFxyXG4gICk6IExvY2FsZVJlZ2V4ZXNPYmoge1xyXG4gICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcclxuICAgICAgICBPYmplY3RcclxuICAgICAgICAgIC5lbnRyaWVzKGxvY2FsZXMpXHJcbiAgICAgICAgICAubWFwKChba2V5LCBsaW5lc10pID0+IFtrZXksIHRoaXMuYnVpbGRMb2NhbGVSZWdleChsaW5lcywgYnVpbGRlcildKSxcclxuICAgICkgYXMgTG9jYWxlUmVnZXhlc09iajtcclxuICB9XHJcblxyXG4gIGJ1aWxkTG9jYWxlUmVnZXgobGluZXM6IExvY2FsZUxpbmUsIGJ1aWxkZXI6IChzOiBzdHJpbmcpID0+IFJlZ0V4cCk6IFJlY29yZDxMYW5nLCBSZWdFeHA+IHtcclxuICAgIGNvbnN0IHJlZ2V4RW4gPSBidWlsZGVyKGxpbmVzLmVuKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVuOiByZWdleEVuLFxyXG4gICAgICBkZTogbGluZXMuZGUgPyBidWlsZGVyKGxpbmVzLmRlKSA6IHJlZ2V4RW4sXHJcbiAgICAgIGZyOiBsaW5lcy5mciA/IGJ1aWxkZXIobGluZXMuZnIpIDogcmVnZXhFbixcclxuICAgICAgamE6IGxpbmVzLmphID8gYnVpbGRlcihsaW5lcy5qYSkgOiByZWdleEVuLFxyXG4gICAgICBjbjogbGluZXMuY24gPyBidWlsZGVyKGxpbmVzLmNuKSA6IHJlZ2V4RW4sXHJcbiAgICAgIGtvOiBsaW5lcy5rbyA/IGJ1aWxkZXIobGluZXMua28pIDogcmVnZXhFbixcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCByZWdleFNldCA9IG5ldyBSZWdleFNldCgpO1xyXG5cclxuZXhwb3J0IGNvbnN0IExvY2FsZVJlZ2V4ID0gcmVnZXhTZXQubG9jYWxlUmVnZXg7XHJcbmV4cG9ydCBjb25zdCBMb2NhbGVOZXRSZWdleCA9IHJlZ2V4U2V0LmxvY2FsZU5ldFJlZ2V4O1xyXG4iLCJpbXBvcnQgeyBMb2NhbGVOZXRSZWdleCB9IGZyb20gJy4uLy4uLy4uL3Jlc291cmNlcy90cmFuc2xhdGlvbnMnO1xyXG5pbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCB7IExhbmcgfSBmcm9tICcuLi8uLi8uLi9yZXNvdXJjZXMvbGFuZ3VhZ2VzJztcclxuaW1wb3J0IHsgTG9nRXZlbnQgfSBmcm9tICcuLi8uLi8uLi90eXBlcy9ldmVudCc7XHJcbmltcG9ydCBMaW5lRXZlbnQgZnJvbSAnLi9kYXRhL25ldHdvcmtfbG9nX2NvbnZlcnRlci9MaW5lRXZlbnQnO1xyXG5cclxuLy8gRGlzYWJsZSBuby1leHBsaWNpdC1hbnkgZm9yIGNsb25lRGF0YSBhcyBpdCBuZWVkcyB0byB3b3JrIG9uIHJhdyBvYmplY3RzIGZvciBwZXJmb3JtYW5jZSByZWFzb25zLlxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG5leHBvcnQgdHlwZSBEYXRhVHlwZSA9IHsgW2tleTogc3RyaW5nXTogYW55IH0gfCBudWxsO1xyXG5cclxuZXhwb3J0IHR5cGUgRW11bGF0b3JMb2dFdmVudCA9IExvZ0V2ZW50ICYge1xyXG4gIGRldGFpbDoge1xyXG4gICAgbG9nczogTGluZUV2ZW50W107XHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW11bGF0b3JDb21tb24ge1xyXG4gIHN0YXRpYyBjbG9uZURhdGEoZGF0YTogRGF0YVR5cGUsIGV4Y2x1ZGUgPSBbJ29wdGlvbnMnLCAncGFydHknXSk6IERhdGFUeXBlIHtcclxuICAgIGNvbnN0IHJldDogRGF0YVR5cGUgPSB7fTtcclxuXHJcbiAgICAvLyBVc2UgZXh0cmEgbG9naWMgZm9yIHRvcC1sZXZlbCBleHRlbmQgZm9yIHByb3BlcnR5IGV4Y2x1c2lvblxyXG4gICAgLy8gVGhpcyBjdXQgdGhlIGV4ZWN1dGlvbiB0aW1lIG9mIHRoaXMgY29kZSBmcm9tIDQxLDAwMG1zIHRvIDUwbXMgd2hlbiBwYXJzaW5nIGEgMTIgbWludXRlIHB1bGxcclxuICAgIGZvciAoY29uc3QgaSBpbiBkYXRhKSB7XHJcbiAgICAgIGlmIChleGNsdWRlLmluY2x1ZGVzKGkpKVxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgaWYgKHR5cGVvZiBkYXRhW2ldID09PSAnb2JqZWN0JylcclxuICAgICAgICByZXRbaV0gPSBFbXVsYXRvckNvbW1vbi5fY2xvbmVEYXRhKGRhdGFbaV0pO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgLy8gQXNzaWdubWVudCBvZiBhbnkgdG8gYW55LiBTZWUgRGF0YVR5cGUgZGVmaW5pdGlvbiBhYm92ZSBmb3IgcmVhc29uaW5nLlxyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFzc2lnbm1lbnRcclxuICAgICAgICByZXRbaV0gPSBkYXRhW2ldO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBfY2xvbmVEYXRhKGRhdGE6IERhdGFUeXBlKTogRGF0YVR5cGUge1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xyXG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7ICsraSlcclxuICAgICAgICAgIHJldFtpXSA9IEVtdWxhdG9yQ29tbW9uLl9jbG9uZURhdGEoZGF0YVtpXSk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChkYXRhID09PSBudWxsKVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBSZWdFeHApXHJcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoZGF0YSk7XHJcblxyXG4gICAgICBjb25zdCByZXQ6IERhdGFUeXBlID0ge307XHJcbiAgICAgIGZvciAoY29uc3QgaSBpbiBkYXRhKVxyXG4gICAgICAgIHJldFtpXSA9IEVtdWxhdG9yQ29tbW9uLl9jbG9uZURhdGEoZGF0YVtpXSk7XHJcblxyXG4gICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRhdGE7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgdGltZVRvU3RyaW5nKHRpbWU6IG51bWJlciwgaW5jbHVkZU1pbGxpcyA9IHRydWUpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgbmVnYXRpdmUgPSB0aW1lIDwgMCA/ICctJyA6ICcnO1xyXG4gICAgdGltZSA9IE1hdGguYWJzKHRpbWUpO1xyXG4gICAgY29uc3QgbWlsbGlzTnVtID0gdGltZSAlIDEwMDA7XHJcbiAgICBjb25zdCBzZWNzTnVtID0gKCh0aW1lICUgKDYwICogMTAwMCkpIC0gbWlsbGlzTnVtKSAvIDEwMDA7XHJcbiAgICAvLyBNaWxsaXNlY29uZHNcclxuICAgIGNvbnN0IG1pbGxpcyA9IGAwMCR7bWlsbGlzTnVtfWAuc3Vic3RyKC0zKTtcclxuICAgIGNvbnN0IHNlY3MgPSBgMCR7c2Vjc051bX1gLnN1YnN0cigtMik7XHJcbiAgICBjb25zdCBtaW5zID0gYDAkeygoKCh0aW1lICUgKDYwICogNjAgKiAxMDAwKSkgLSBtaWxsaXNOdW0pIC8gMTAwMCkgLSBzZWNzTnVtKSAvIDYwfWAuc3Vic3RyKC0yKTtcclxuICAgIHJldHVybiBuZWdhdGl2ZSArIG1pbnMgKyAnOicgKyBzZWNzICsgKGluY2x1ZGVNaWxsaXMgPyAnLicgKyBtaWxsaXMgOiAnJyk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgdGltZVRvRGF0ZVN0cmluZyh0aW1lOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuZGF0ZU9iamVjdFRvRGF0ZVN0cmluZyhuZXcgRGF0ZSh0aW1lKSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZGF0ZU9iamVjdFRvRGF0ZVN0cmluZyhkYXRlOiBEYXRlKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHllYXIgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XHJcbiAgICBjb25zdCBtb250aCA9IEVtdWxhdG9yQ29tbW9uLnplcm9QYWQoKGRhdGUuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkpO1xyXG4gICAgY29uc3QgZGF5ID0gRW11bGF0b3JDb21tb24uemVyb1BhZChkYXRlLmdldERhdGUoKS50b1N0cmluZygpKTtcclxuICAgIHJldHVybiBgJHt5ZWFyfS0ke21vbnRofS0ke2RheX1gO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHRpbWVUb1RpbWVTdHJpbmcodGltZTogbnVtYmVyLCBpbmNsdWRlTWlsbGlzID0gZmFsc2UpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuZGF0ZU9iamVjdFRvVGltZVN0cmluZyhuZXcgRGF0ZSh0aW1lKSwgaW5jbHVkZU1pbGxpcyk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZGF0ZU9iamVjdFRvVGltZVN0cmluZyhkYXRlOiBEYXRlLCBpbmNsdWRlTWlsbGlzID0gZmFsc2UpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgaG91ciA9IEVtdWxhdG9yQ29tbW9uLnplcm9QYWQoZGF0ZS5nZXRIb3VycygpLnRvU3RyaW5nKCkpO1xyXG4gICAgY29uc3QgbWludXRlID0gRW11bGF0b3JDb21tb24uemVyb1BhZChkYXRlLmdldE1pbnV0ZXMoKS50b1N0cmluZygpKTtcclxuICAgIGNvbnN0IHNlY29uZCA9IEVtdWxhdG9yQ29tbW9uLnplcm9QYWQoZGF0ZS5nZXRTZWNvbmRzKCkudG9TdHJpbmcoKSk7XHJcbiAgICBsZXQgcmV0ID0gYCR7aG91cn06JHttaW51dGV9OiR7c2Vjb25kfWA7XHJcbiAgICBpZiAoaW5jbHVkZU1pbGxpcylcclxuICAgICAgcmV0ID0gcmV0ICsgYC4ke2RhdGUuZ2V0TWlsbGlzZWNvbmRzKCl9YDtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIG1zVG9EdXJhdGlvbihtczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHRtcCA9IEVtdWxhdG9yQ29tbW9uLnRpbWVUb1N0cmluZyhtcywgZmFsc2UpO1xyXG4gICAgcmV0dXJuIHRtcC5yZXBsYWNlKCc6JywgJ20nKSArICdzJztcclxuICB9XHJcblxyXG4gIHN0YXRpYyBkYXRlVGltZVRvU3RyaW5nKHRpbWU6IG51bWJlciwgaW5jbHVkZU1pbGxpcyA9IGZhbHNlKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lKTtcclxuICAgIHJldHVybiBgJHt0aGlzLmRhdGVPYmplY3RUb0RhdGVTdHJpbmcoZGF0ZSl9ICR7dGhpcy5kYXRlT2JqZWN0VG9UaW1lU3RyaW5nKGRhdGUsIGluY2x1ZGVNaWxsaXMpfWA7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgemVyb1BhZChzdHI6IHN0cmluZywgbGVuID0gMik6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gKCcnICsgc3RyKS5wYWRTdGFydChsZW4sICcwJyk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgcHJvcGVyQ2FzZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbXlxcV19dK1teXFxzLV0qKSAqL2csICh0eHQpID0+IHtcclxuICAgICAgcmV0dXJuIHR4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR4dC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHNwYWNlUGFkTGVmdChzdHI6IHN0cmluZywgbGVuOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHN0ci5wYWRTdGFydChsZW4sICcgJyk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZG9lc0xpbmVNYXRjaChsaW5lOiBzdHJpbmcsXHJcbiAgICAgIHJlZ2V4ZXM6IFJlY29yZDxMYW5nLCBSZWdFeHA+IHwgUmVnRXhwKTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbCB7XHJcbiAgICBpZiAocmVnZXhlcyBpbnN0YW5jZW9mIFJlZ0V4cClcclxuICAgICAgcmV0dXJuIHJlZ2V4ZXMuZXhlYyhsaW5lKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGxhbmdTdHIgaW4gcmVnZXhlcykge1xyXG4gICAgICBjb25zdCBsYW5nID0gbGFuZ1N0ciBhcyBrZXlvZiB0eXBlb2YgcmVnZXhlcztcclxuICAgICAgY29uc3QgcmVzID0gcmVnZXhlc1tsYW5nXS5leGVjKGxpbmUpO1xyXG4gICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgaWYgKHJlcy5ncm91cHMpXHJcbiAgICAgICAgICByZXMuZ3JvdXBzLmxhbmd1YWdlID0gbGFuZztcclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBtYXRjaFN0YXJ0KGxpbmU6IHN0cmluZyk6IFJlZ0V4cE1hdGNoQXJyYXkgfCB1bmRlZmluZWQge1xyXG4gICAgbGV0IHJlcztcclxuICAgIC8vIEN1cnJlbnRseSBhbGwgb2YgdGhlc2UgcmVnZXhlcyBoYXZlIGdyb3VwcyBpZiB0aGV5IG1hdGNoIGF0IGFsbCxcclxuICAgIC8vIGJ1dCBiZSByb2J1c3QgdG8gdGhhdCBjaGFuZ2luZyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgcmVzID0gRW11bGF0b3JDb21tb24uZG9lc0xpbmVNYXRjaChsaW5lLCBFbXVsYXRvckNvbW1vbi5jb3VudGRvd25SZWdleGVzKTtcclxuICAgIGlmIChyZXMpIHtcclxuICAgICAgcmVzLmdyb3VwcyA/Pz0ge307XHJcbiAgICAgIHJlcy5ncm91cHMuU3RhcnRJbiA9IChwYXJzZUludChyZXMuZ3JvdXBzLnRpbWUgPz8gJzAnKSAqIDEwMDApLnRvU3RyaW5nKCk7XHJcbiAgICAgIHJlcy5ncm91cHMuU3RhcnRUeXBlID0gJ0NvdW50ZG93bic7XHJcbiAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcbiAgICByZXMgPSBFbXVsYXRvckNvbW1vbi5kb2VzTGluZU1hdGNoKGxpbmUsIEVtdWxhdG9yQ29tbW9uLnNlYWxSZWdleGVzKTtcclxuICAgIGlmIChyZXMpIHtcclxuICAgICAgcmVzLmdyb3VwcyA/Pz0ge307XHJcbiAgICAgIHJlcy5ncm91cHMuU3RhcnRJbiA9ICcwJztcclxuICAgICAgcmVzLmdyb3Vwcy5TdGFydFR5cGUgPSAnU2VhbCc7XHJcbiAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcbiAgICByZXMgPSBFbXVsYXRvckNvbW1vbi5kb2VzTGluZU1hdGNoKGxpbmUsIEVtdWxhdG9yQ29tbW9uLmVuZ2FnZVJlZ2V4ZXMpO1xyXG4gICAgaWYgKHJlcykge1xyXG4gICAgICByZXMuZ3JvdXBzID8/PSB7fTtcclxuICAgICAgcmVzLmdyb3Vwcy5TdGFydEluID0gJzAnO1xyXG4gICAgICByZXMuZ3JvdXBzLlN0YXJ0VHlwZSA9ICdFbmdhZ2UnO1xyXG4gICAgICByZXR1cm4gcmVzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG1hdGNoRW5kKGxpbmU6IHN0cmluZyk6IFJlZ0V4cE1hdGNoQXJyYXkgfCB1bmRlZmluZWQge1xyXG4gICAgbGV0IHJlcztcclxuICAgIC8vIEN1cnJlbnRseSBhbGwgb2YgdGhlc2UgcmVnZXhlcyBoYXZlIGdyb3VwcyBpZiB0aGV5IG1hdGNoIGF0IGFsbCxcclxuICAgIC8vIGJ1dCBiZSByb2J1c3QgdG8gdGhhdCBjaGFuZ2luZyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgcmVzID0gRW11bGF0b3JDb21tb24uZG9lc0xpbmVNYXRjaChsaW5lLCBFbXVsYXRvckNvbW1vbi53aW5SZWdleCk7XHJcbiAgICBpZiAocmVzKSB7XHJcbiAgICAgIHJlcy5ncm91cHMgPz89IHt9O1xyXG4gICAgICByZXMuZ3JvdXBzLkVuZFR5cGUgPSAnV2luJztcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxuICAgIHJlcyA9IEVtdWxhdG9yQ29tbW9uLmRvZXNMaW5lTWF0Y2gobGluZSwgRW11bGF0b3JDb21tb24ud2lwZVJlZ2V4KTtcclxuICAgIGlmIChyZXMpIHtcclxuICAgICAgcmVzLmdyb3VwcyA/Pz0ge307XHJcbiAgICAgIHJlcy5ncm91cHMuRW5kVHlwZSA9ICdXaXBlJztcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxuICAgIHJlcyA9IEVtdWxhdG9yQ29tbW9uLmRvZXNMaW5lTWF0Y2gobGluZSwgRW11bGF0b3JDb21tb24uY2FjdGJvdFdpcGVSZWdleCk7XHJcbiAgICBpZiAocmVzKSB7XHJcbiAgICAgIHJlcy5ncm91cHMgPz89IHt9O1xyXG4gICAgICByZXMuZ3JvdXBzLkVuZFR5cGUgPSAnQ2FjdGJvdCBXaXBlJztcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxuICAgIHJlcyA9IEVtdWxhdG9yQ29tbW9uLmRvZXNMaW5lTWF0Y2gobGluZSwgRW11bGF0b3JDb21tb24udW5zZWFsUmVnZXhlcyk7XHJcbiAgICBpZiAocmVzKSB7XHJcbiAgICAgIHJlcy5ncm91cHMgPz89IHt9O1xyXG4gICAgICByZXMuZ3JvdXBzLkVuZFR5cGUgPSAnVW5zZWFsJztcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN0YXRpYyBzZWFsUmVnZXhlcyA9IExvY2FsZU5ldFJlZ2V4LmFyZWFTZWFsO1xyXG4gIHN0YXRpYyBlbmdhZ2VSZWdleGVzID0gTG9jYWxlTmV0UmVnZXguY291bnRkb3duRW5nYWdlO1xyXG4gIHN0YXRpYyBjb3VudGRvd25SZWdleGVzID0gTG9jYWxlTmV0UmVnZXguY291bnRkb3duU3RhcnQ7XHJcbiAgc3RhdGljIHVuc2VhbFJlZ2V4ZXMgPSBMb2NhbGVOZXRSZWdleC5hcmVhVW5zZWFsO1xyXG4gIHN0YXRpYyB3aXBlUmVnZXggPSBOZXRSZWdleGVzLm5ldHdvcms2ZCh7IGNvbW1hbmQ6ICc0MDAwMDAxMCcgfSk7XHJcbiAgc3RhdGljIHdpblJlZ2V4ID0gTmV0UmVnZXhlcy5uZXR3b3JrNmQoeyBjb21tYW5kOiAnNDAwMDAwMDMnIH0pO1xyXG4gIHN0YXRpYyBjYWN0Ym90V2lwZVJlZ2V4ID0gTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJ2NhY3Rib3Qgd2lwZS4qPycgfSk7XHJcbn1cclxuIiwiLy8gSGVscGVyIEVycm9yIGZvciBUeXBlU2NyaXB0IHNpdHVhdGlvbnMgd2hlcmUgdGhlIHByb2dyYW1tZXIgdGhpbmtzIHRoZXlcclxuLy8ga25vdyBiZXR0ZXIgdGhhbiBUeXBlU2NyaXB0IHRoYXQgc29tZSBzaXR1YXRpb24gd2lsbCBuZXZlciBvY2N1ci5cclxuXHJcbi8vIFRoZSBpbnRlbnRpb24gaGVyZSBpcyB0aGF0IHRoZSBwcm9ncmFtbWVyIGRvZXMgbm90IGV4cGVjdCBhIHBhcnRpY3VsYXJcclxuLy8gYml0IG9mIGNvZGUgdG8gaGFwcGVuLCBhbmQgc28gaGFzIG5vdCB3cml0dGVuIGNhcmVmdWwgZXJyb3IgaGFuZGxpbmcuXHJcbi8vIElmIGl0IGRvZXMgb2NjdXIsIGF0IGxlYXN0IHRoZXJlIHdpbGwgYmUgYW4gZXJyb3IgYW5kIHdlIGNhbiBmaWd1cmUgb3V0IHdoeS5cclxuLy8gVGhpcyBpcyBwcmVmZXJhYmxlIHRvIGNhc3Rpbmcgb3IgZGlzYWJsaW5nIFR5cGVTY3JpcHQgYWx0b2dldGhlciBpbiBvcmRlciB0b1xyXG4vLyBhdm9pZCBzeW50YXggZXJyb3JzLlxyXG5cclxuLy8gT25lIGNvbW1vbiBleGFtcGxlIGlzIGEgcmVnZXgsIHdoZXJlIGlmIHRoZSByZWdleCBtYXRjaGVzIHRoZW4gYWxsIG9mIHRoZVxyXG4vLyAobm9uLW9wdGlvbmFsKSByZWdleCBncm91cHMgd2lsbCBhbHNvIGJlIHZhbGlkLCBidXQgVHlwZVNjcmlwdCBkb2Vzbid0IGtub3cuXHJcbmV4cG9ydCBjbGFzcyBVbnJlYWNoYWJsZUNvZGUgZXh0ZW5kcyBFcnJvciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcignVGhpcyBjb2RlIHNob3VsZG5cXCd0IGJlIHJlYWNoZWQnKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgVW5yZWFjaGFibGVDb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25vdF9yZWFjaGVkJztcclxuaW1wb3J0IENvbWJhdGFudFN0YXRlIGZyb20gJy4vQ29tYmF0YW50U3RhdGUnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tYmF0YW50IHtcclxuICBpZDogc3RyaW5nO1xyXG4gIG5hbWUgPSAnJztcclxuICBzZXJ2ZXIgPSAnJztcclxuICBzdGF0ZXM6IHsgW3RpbWVzdGFtcDogbnVtYmVyXTogQ29tYmF0YW50U3RhdGUgfSA9IHt9O1xyXG4gIHNpZ25pZmljYW50U3RhdGVzOiBudW1iZXJbXSA9IFtdO1xyXG4gIGxhdGVzdFRpbWVzdGFtcCA9IC0xO1xyXG4gIGpvYj86IHN0cmluZztcclxuICBqb2JJZD86IG51bWJlcjtcclxuICBsZXZlbD86IG51bWJlcjtcclxuXHJcbiAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLnNldE5hbWUobmFtZSk7XHJcbiAgfVxyXG5cclxuICBzZXROYW1lKG5hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgLy8gU29tZXRpbWVzIG5ldHdvcmsgbGluZXMgYXJyaXZlIGFmdGVyIHRoZSBjb21iYXRhbnQgaGFzIGJlZW4gY2xlYXJlZFxyXG4gICAgLy8gZnJvbSBtZW1vcnkgaW4gdGhlIGNsaWVudCwgc28gdGhlIG5ldHdvcmsgbGluZSB3aWxsIGhhdmUgYSB2YWxpZCBJRFxyXG4gICAgLy8gYnV0IHRoZSBuYW1lIHdpbGwgYmUgYmxhbmsuIFNpbmNlIHdlJ3JlIHRyYWNraW5nIHRoZSBuYW1lIGZvciB0aGVcclxuICAgIC8vIGVudGlyZSBmaWdodCBhbmQgbm90IG9uIGEgc3RhdGUtYnktc3RhdGUgYmFzaXMsIHdlIGRvbid0IHdhbnQgdG9cclxuICAgIC8vIGJsYW5rIG91dCBhIG5hbWUgaW4gdGhpcyBjYXNlLlxyXG4gICAgLy8gSWYgYSBjb21iYXRhbnQgYWN0dWFsbHkgaGFzIGEgYmxhbmsgbmFtZSwgdGhhdCdzIHN0aWxsIGFsbG93ZWQgYnlcclxuICAgIC8vIHRoZSBjb25zdHJ1Y3Rvci5cclxuICAgIGlmIChuYW1lID09PSAnJylcclxuICAgICAgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IHBhcnRzID0gbmFtZS5zcGxpdCgnKCcpO1xyXG4gICAgdGhpcy5uYW1lID0gcGFydHNbMF0gPz8gJyc7XHJcbiAgICBpZiAocGFydHMubGVuZ3RoID4gMSlcclxuICAgICAgdGhpcy5zZXJ2ZXIgPSBwYXJ0c1sxXT8ucmVwbGFjZSgvXFwpJC8sICcnKSA/PyAnJztcclxuICB9XHJcblxyXG4gIGhhc1N0YXRlKHRpbWVzdGFtcDogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5zdGF0ZXNbdGltZXN0YW1wXSAhPT0gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgcHVzaFN0YXRlKHRpbWVzdGFtcDogbnVtYmVyLCBzdGF0ZTogQ29tYmF0YW50U3RhdGUpOiB2b2lkIHtcclxuICAgIHRoaXMuc3RhdGVzW3RpbWVzdGFtcF0gPSBzdGF0ZTtcclxuICAgIHRoaXMubGF0ZXN0VGltZXN0YW1wID0gdGltZXN0YW1wO1xyXG4gICAgaWYgKCF0aGlzLnNpZ25pZmljYW50U3RhdGVzLmluY2x1ZGVzKHRpbWVzdGFtcCkpXHJcbiAgICAgIHRoaXMuc2lnbmlmaWNhbnRTdGF0ZXMucHVzaCh0aW1lc3RhbXApO1xyXG4gIH1cclxuXHJcbiAgbmV4dFNpZ25pZmljYW50U3RhdGUodGltZXN0YW1wOiBudW1iZXIpOiBDb21iYXRhbnRTdGF0ZSB7XHJcbiAgICAvLyBTaG9ydGN1dCBvdXQgaWYgdGhpcyBpcyBzaWduaWZpY2FudCBvciBpZiB0aGVyZSdzIG5vIGhpZ2hlciBzaWduaWZpY2FudCBzdGF0ZVxyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnNpZ25pZmljYW50U3RhdGVzLmluZGV4T2YodGltZXN0YW1wKTtcclxuICAgIGNvbnN0IGxhc3RTaWduaWZpY2FudFN0YXRlSW5kZXggPSB0aGlzLnNpZ25pZmljYW50U3RhdGVzLmxlbmd0aCAtIDE7XHJcbiAgICAvLyBJZiB0aW1lc3RhbXAgaXMgYSBzaWduaWZpY2FudCBzdGF0ZSBhbHJlYWR5LCBhbmQgaXQncyBub3QgdGhlIGxhc3Qgb25lLCByZXR1cm4gdGhlIG5leHRcclxuICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgbGFzdFNpZ25pZmljYW50U3RhdGVJbmRleClcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGVCeUluZGV4KGluZGV4ICsgMSk7XHJcbiAgICAvLyBJZiB0aW1lc3RhbXAgaXMgdGhlIGxhc3Qgc2lnbmlmaWNhbnQgc3RhdGUgb3IgdGhlIHRpbWVzdGFtcCBpcyBwYXN0IHRoZSBsYXN0IHNpZ25pZmljYW50XHJcbiAgICAvLyBzdGF0ZSwgcmV0dXJuIHRoZSBsYXN0IHNpZ25pZmljYW50IHN0YXRlXHJcbiAgICBlbHNlIGlmIChpbmRleCA9PT0gbGFzdFNpZ25pZmljYW50U3RhdGVJbmRleCB8fFxyXG4gICAgICAgIHRpbWVzdGFtcCA+ICh0aGlzLnNpZ25pZmljYW50U3RhdGVzW2xhc3RTaWduaWZpY2FudFN0YXRlSW5kZXhdID8/IDApKVxyXG4gICAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZUJ5SW5kZXgobGFzdFNpZ25pZmljYW50U3RhdGVJbmRleCk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNpZ25pZmljYW50U3RhdGVzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGNvbnN0IHN0YXRlSW5kZXggPSB0aGlzLnNpZ25pZmljYW50U3RhdGVzW2ldO1xyXG4gICAgICBpZiAoc3RhdGVJbmRleCAmJiBzdGF0ZUluZGV4ID4gdGltZXN0YW1wKVxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRlQnlJbmRleChpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZUJ5SW5kZXgodGhpcy5zaWduaWZpY2FudFN0YXRlcy5sZW5ndGggLSAxKTtcclxuICB9XHJcblxyXG4gIHB1c2hQYXJ0aWFsU3RhdGUodGltZXN0YW1wOiBudW1iZXIsIHByb3BzOiBQYXJ0aWFsPENvbWJhdGFudFN0YXRlPik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuc3RhdGVzW3RpbWVzdGFtcF0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAvLyBDbG9uZSB0aGUgbGFzdCBzdGF0ZSBiZWZvcmUgdGhpcyB0aW1lc3RhbXBcclxuICAgICAgY29uc3Qgc3RhdGVUaW1lc3RhbXAgPSB0aGlzLnNpZ25pZmljYW50U3RhdGVzXHJcbiAgICAgICAgLmZpbHRlcigocykgPT4gcyA8IHRpbWVzdGFtcClcclxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYiAtIGEpWzBdID8/IHRoaXMuc2lnbmlmaWNhbnRTdGF0ZXNbMF07XHJcbiAgICAgIGlmIChzdGF0ZVRpbWVzdGFtcCA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgIHRocm93IG5ldyBVbnJlYWNoYWJsZUNvZGUoKTtcclxuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLnN0YXRlc1tzdGF0ZVRpbWVzdGFtcF07XHJcbiAgICAgIGlmICghc3RhdGUpXHJcbiAgICAgICAgdGhyb3cgbmV3IFVucmVhY2hhYmxlQ29kZSgpO1xyXG4gICAgICB0aGlzLnN0YXRlc1t0aW1lc3RhbXBdID0gc3RhdGUucGFydGlhbENsb25lKHByb3BzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5zdGF0ZXNbdGltZXN0YW1wXTtcclxuICAgICAgaWYgKCFzdGF0ZSlcclxuICAgICAgICB0aHJvdyBuZXcgVW5yZWFjaGFibGVDb2RlKCk7XHJcbiAgICAgIHRoaXMuc3RhdGVzW3RpbWVzdGFtcF0gPSBzdGF0ZS5wYXJ0aWFsQ2xvbmUocHJvcHMpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5sYXRlc3RUaW1lc3RhbXAgPSBNYXRoLm1heCh0aGlzLmxhdGVzdFRpbWVzdGFtcCwgdGltZXN0YW1wKTtcclxuXHJcbiAgICBjb25zdCBsYXN0U2lnbmlmaWNhbnRTdGF0ZVRpbWVzdGFtcCA9XHJcbiAgICAgIHRoaXMuc2lnbmlmaWNhbnRTdGF0ZXNbdGhpcy5zaWduaWZpY2FudFN0YXRlcy5sZW5ndGggLSAxXTtcclxuICAgIGlmICghbGFzdFNpZ25pZmljYW50U3RhdGVUaW1lc3RhbXApXHJcbiAgICAgIHRocm93IG5ldyBVbnJlYWNoYWJsZUNvZGUoKTtcclxuICAgIGNvbnN0IG9sZFN0YXRlSlNPTiA9IEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGVzW2xhc3RTaWduaWZpY2FudFN0YXRlVGltZXN0YW1wXSk7XHJcbiAgICBjb25zdCBuZXdTdGF0ZUpTT04gPSBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlc1t0aW1lc3RhbXBdKTtcclxuXHJcbiAgICBpZiAobGFzdFNpZ25pZmljYW50U3RhdGVUaW1lc3RhbXAgIT09IHRpbWVzdGFtcCAmJiBuZXdTdGF0ZUpTT04gIT09IG9sZFN0YXRlSlNPTilcclxuICAgICAgdGhpcy5zaWduaWZpY2FudFN0YXRlcy5wdXNoKHRpbWVzdGFtcCk7XHJcbiAgfVxyXG5cclxuICBnZXRTdGF0ZSh0aW1lc3RhbXA6IG51bWJlcik6IENvbWJhdGFudFN0YXRlIHtcclxuICAgIGNvbnN0IHN0YXRlQnlUaW1lc3RhbXAgPSB0aGlzLnN0YXRlc1t0aW1lc3RhbXBdO1xyXG4gICAgaWYgKHN0YXRlQnlUaW1lc3RhbXApXHJcbiAgICAgIHJldHVybiBzdGF0ZUJ5VGltZXN0YW1wO1xyXG5cclxuICAgIGNvbnN0IGluaXRpYWxUaW1lc3RhbXAgPSB0aGlzLnNpZ25pZmljYW50U3RhdGVzWzBdO1xyXG4gICAgaWYgKGluaXRpYWxUaW1lc3RhbXAgPT09IHVuZGVmaW5lZClcclxuICAgICAgdGhyb3cgbmV3IFVucmVhY2hhYmxlQ29kZSgpO1xyXG4gICAgaWYgKHRpbWVzdGFtcCA8IGluaXRpYWxUaW1lc3RhbXApXHJcbiAgICAgIHJldHVybiB0aGlzLmdldFN0YXRlQnlJbmRleCgwKTtcclxuXHJcbiAgICBsZXQgaSA9IDA7XHJcbiAgICBmb3IgKDsgaSA8IHRoaXMuc2lnbmlmaWNhbnRTdGF0ZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgY29uc3QgcHJldlRpbWVzdGFtcCA9IHRoaXMuc2lnbmlmaWNhbnRTdGF0ZXNbaV07XHJcbiAgICAgIGlmIChwcmV2VGltZXN0YW1wID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgdGhyb3cgbmV3IFVucmVhY2hhYmxlQ29kZSgpO1xyXG4gICAgICBpZiAocHJldlRpbWVzdGFtcCA+IHRpbWVzdGFtcClcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZUJ5SW5kZXgoaSAtIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLmdldFN0YXRlQnlJbmRleChpIC0gMSk7XHJcbiAgfVxyXG5cclxuICAvLyBTaG91bGQgb25seSBiZSBjYWxsZWQgd2hlbiBgaW5kZXhgIGlzIHZhbGlkLlxyXG4gIHByaXZhdGUgZ2V0U3RhdGVCeUluZGV4KGluZGV4OiBudW1iZXIpOiBDb21iYXRhbnRTdGF0ZSB7XHJcbiAgICBjb25zdCBzdGF0ZUluZGV4ID0gdGhpcy5zaWduaWZpY2FudFN0YXRlc1tpbmRleF07XHJcbiAgICBpZiAoc3RhdGVJbmRleCA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICB0aHJvdyBuZXcgVW5yZWFjaGFibGVDb2RlKCk7XHJcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuc3RhdGVzW3N0YXRlSW5kZXhdO1xyXG4gICAgaWYgKHN0YXRlID09PSB1bmRlZmluZWQpXHJcbiAgICAgIHRocm93IG5ldyBVbnJlYWNoYWJsZUNvZGUoKTtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9XHJcbn1cclxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tYmF0YW50Sm9iU2VhcmNoIHtcclxuICBzdGF0aWMgZ2V0Sm9iKGFiaWxpdHlJZDogbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgIGZvciAoY29uc3Qgam9iIGluIENvbWJhdGFudEpvYlNlYXJjaC5hYmlsaXRpZXMpIHtcclxuICAgICAgaWYgKENvbWJhdGFudEpvYlNlYXJjaC5hYmlsaXRpZXNbam9iXT8uaW5jbHVkZXMoYWJpbGl0eUlkKSlcclxuICAgICAgICByZXR1cm4gam9iO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IGFiaWxpdHlNYXRjaFJlZ2V4ID0gL1thLWZBLUYwLTldezEsNH0vaTtcclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IGFiaWxpdGllczogeyBbam9iOiBzdHJpbmddOiBudW1iZXJbXSB9ID0ge1xyXG4gICAgUExEOiBbXHJcbiAgICAgIDEyOTU5LCAxMjk2MSwgMTI5NjQsIDEyOTY3LCAxMjk2OCwgMTI5NjksIDEyOTcwLCAxMjk3MSwgMTI5NzIsIDEyOTczLCAxMjk3NCwgMTI5NzUsXHJcbiAgICAgIDEyOTc2LCAxMjk3OCwgMTI5ODAsIDEyOTgxLCAxMjk4MiwgMTI5ODMsIDEyOTg0LCAxMjk4NSwgMTI5ODYsIDEyOTg3LCAxMjk4OCwgMTI5ODksXHJcbiAgICAgIDEyOTkxLCAxMjk5MiwgMTI5OTMsIDEyOTk0LCAxMjk5NiwgMTMwMDAsIDEzMDAxLCAxMzAwNiwgMTQ0ODAsIDE2NDU3LCAxNjQ1OCwgMTY0NTksXHJcbiAgICAgIDE2NDYwLCAxNjQ2MSwgMTc2NjksIDE3NjcxLCAxNzY3MiwgMTc2OTEsIDE3NjkyLCAxNzY5MywgMTc2OTQsIDE3ODY2LCAxODA1MCwgMjcsIDI5LFxyXG4gICAgICAzMCwgMzUzOCwgMzUzOSwgMzU0MCwgMzU0MSwgMzU0MiwgNDI4NCwgNDI4NSwgNDI4NiwgNTAyMDcsIDUwMjA5LCA1MDI0NiwgNTAyNjAsIDUwMjYxLFxyXG4gICAgICA1MDI2MiwgNTAyNjMsIDUwMjY0LCA3MzgyLCA3MzgzLCA3Mzg0LCA3Mzg1LCA4NzQ2LCA4NzQ5LCA4NzUwLCA4NzUxLCA4NzUyLCA4NzU0LCA4NzU1LFxyXG4gICAgICA4NzU2LFxyXG4gICAgXSxcclxuICAgIFdBUjogW1xyXG4gICAgICAxNjQ2MiwgMTY0NjMsIDE2NDY0LCAxNjQ2NSwgMTc2OTUsIDE3Njk2LCAxNzY5NywgMTc2OTgsIDE3ODg5LCAzNTQ5LCAzNTUwLCAzNTUxLCAzNTUyLFxyXG4gICAgICA0Mjg5LCA0MjkwLCA0MjkxLCA0OSwgNTAxNTcsIDUwMjE4LCA1MDI0OSwgNTAyNjUsIDUwMjY2LCA1MDI2NywgNTAyNjgsIDUwMjY5LCA1MSwgNTIsXHJcbiAgICAgIDczODYsIDczODcsIDczODgsIDczODksIDg3NTgsIDg3NjEsIDg3NjIsIDg3NjMsIDg3NjQsIDg3NjUsIDg3NjcsIDg3NjgsXHJcbiAgICBdLFxyXG4gICAgRFJLOiBbXHJcbiAgICAgIDE2NDY2LCAxNjQ2NywgMTY0NjgsIDE2NDY5LCAxNjQ3MCwgMTY0NzEsIDE2NDcyLCAxNzcwMCwgMTc3MDEsIDE3NzAyLCAzNjE3LCAzNjIxLCAzNjIzLFxyXG4gICAgICAzNjI0LCAzNjI1LCAzNjI5LCAzNjMyLCAzNjM0LCAzNjM2LCAzNjM4LCAzNjM5LCAzNjQwLCAzNjQxLCAzNjQzLCA0MzAzLCA0MzA0LCA0MzA1LCA0MzA2LFxyXG4gICAgICA0MzA3LCA0MzA4LCA0MzA5LCA0MzEwLCA0MzExLCA0MzEyLCA0NjgwLCA1MDE1OCwgNTAxNTksIDUwMjcxLCA1MDI3MiwgNTAzMTksIDczOTAsIDczOTEsXHJcbiAgICAgIDczOTIsIDczOTMsIDg3NjksIDg3NzIsIDg3NzMsIDg3NzUsIDg3NzYsIDg3NzcsIDg3NzgsIDg3NzksXHJcbiAgICBdLFxyXG4gICAgR05COiBbXHJcbiAgICAgIDE3NzAzLCAxNzcwNCwgMTc3MDUsIDE3NzA2LCAxNzcwNywgMTc3MDgsIDE3NzA5LCAxNzcxMCwgMTc3MTEsIDE3NzEyLCAxNzcxMywgMTc3MTQsXHJcbiAgICAgIDE3NzE2LCAxNzcxNywgMTc4OTAsIDE3ODkxLCAxNjEzNywgNTAzMjAsIDE2MTM4LCAxNjEzOSwgMTYxNDAsIDE2MTQxLCAxNjE0MiwgMTYxNDMsXHJcbiAgICAgIDE2MTQ0LCAxNjE0NSwgMTYxNjIsIDUwMjU3LCAxNjE0OCwgMTYxNDksIDE2MTUxLCAxNjE1MiwgNTAyNTgsIDE2MTUzLCAxNjE1NCwgMTYxNDYsXHJcbiAgICAgIDE2MTQ3LCAxNjE1MCwgMTYxNTksIDE2MTYwLCAxNjE2MSwgMTYxNTUsIDE2MTU2LCAxNjE1NywgMTYxNTgsIDE2MTYzLCAxNjE2NCwgMTYxNjUsXHJcbiAgICAgIDUwMjU5LFxyXG4gICAgXSxcclxuICAgIFdITTogW1xyXG4gICAgICAxMjk1OCwgMTI5NjIsIDEyOTY1LCAxMjk5NywgMTMwMDIsIDEzMDAzLCAxMzAwNCwgMTMwMDUsIDEzMSwgMTM2LCAxMzcsIDEzOSwgMTQwLCAxNDQ4MSxcclxuICAgICAgMTU4NCwgMTY1MzEsIDE2NTMyLCAxNjUzMywgMTY1MzQsIDE2NTM1LCAxNjUzNiwgMTc2ODgsIDE3Njg5LCAxNzY5MCwgMTc3ODksIDE3NzkwLCAxNzc5MSxcclxuICAgICAgMTc3OTMsIDE3Nzk0LCAxNzgzMiwgMzU2OCwgMzU2OSwgMzU3MCwgMzU3MSwgNDI5NiwgNDI5NywgNTAxODEsIDUwMTgyLCA1MDE5NiwgNTAzMDcsXHJcbiAgICAgIDUwMzA4LCA1MDMwOSwgNTAzMTAsIDc0MzAsIDc0MzEsIDc0MzIsIDc0MzMsIDg4OTUsIDg4OTYsIDg5MDAsIDk2MjEsIDEyNywgMTMzLFxyXG4gICAgXSxcclxuICAgIFNDSDogW1xyXG4gICAgICAxNjUzNywgMTY1MzgsIDE2NTM5LCAxNjU0MCwgMTY1NDEsIDE2NTQyLCAxNjU0MywgMTY1NDQsIDE2NTQ1LCAxNjU0NiwgMTY1NDcsIDE2NTQ4LCAxNjU1MCxcclxuICAgICAgMTY1NTEsIDE2NiwgMTY3LCAxNzIxNSwgMTcyMTYsIDE3Nzk1LCAxNzc5NiwgMTc3OTcsIDE3Nzk4LCAxNzgwMiwgMTc4NjQsIDE3ODY1LCAxNzg2OSxcclxuICAgICAgMTc4NzAsIDE3OTkwLCAxODUsIDE4NiwgMTg4LCAxODksIDE5MCwgMzU4MywgMzU4NCwgMzU4NSwgMzU4NiwgMzU4NywgNDMwMCwgNTAxODQsIDUwMjE0LFxyXG4gICAgICA1MDMxMSwgNTAzMTIsIDUwMzEzLCA1MDMyNCwgNzQzNCwgNzQzNSwgNzQzNiwgNzQzNywgNzQzOCwgNzg2OSwgODAyLCA4MDMsIDgwNSwgODkwNCwgODkwNSxcclxuICAgICAgODkwOSwgOTYyMixcclxuICAgIF0sXHJcbiAgICBBU1Q6IFtcclxuICAgICAgMTAwMjcsIDEwMDI4LCAxMDAyOSwgMTY1NTIsIDE2NTUzLCAxNjU1NCwgMTY1NTUsIDE2NTU2LCAxNjU1NywgMTY1NTgsIDE2NTU5LCAxNzA1NSwgMTcxNTEsXHJcbiAgICAgIDE3MTUyLCAxNzgwNCwgMTc4MDUsIDE3ODA2LCAxNzgwNywgMTc4MDksIDE3OTkxLCAzNTkwLCAzNTkzLCAzNTk0LCAzNTk1LCAzNTk2LCAzNTk4LCAzNTk5LFxyXG4gICAgICAzNjAwLCAzNjAxLCAzNjAzLCAzNjA0LCAzNjA1LCAzNjA2LCAzNjA4LCAzNjEwLCAzNjEyLCAzNjEzLCAzNjE0LCAzNjE1LCA0MzAxLCA0MzAyLCA0NDAxLFxyXG4gICAgICA0NDAyLCA0NDAzLCA0NDA0LCA0NDA1LCA0NDA2LCA0Njc3LCA0Njc4LCA0Njc5LCA1MDEyMiwgNTAxMjQsIDUwMTI1LCA1MDE4NiwgNTAxODcsIDUwMTg4LFxyXG4gICAgICA1MDE4OSwgNTAzMTQsIDUwMzE1LCA1MDMxNiwgNzQzOSwgNzQ0MCwgNzQ0MSwgNzQ0MiwgNzQ0MywgNzQ0NCwgNzQ0NSwgNzQ0OCwgODMyNCwgODkxMyxcclxuICAgICAgODkxNCwgODkxNiwgOTYyOSxcclxuICAgIF0sXHJcbiAgICBNTks6IFtcclxuICAgICAgMTI5NjAsIDEyOTYzLCAxMjk2NiwgMTI5NzcsIDEyOTc5LCAxMjk5MCwgMTI5OTUsIDEyOTk4LCAxMjk5OSwgMTQ0NzYsIDE0NDc4LCAxNjQ3MywgMTY0NzQsXHJcbiAgICAgIDE2NDc1LCAxNjQ3NiwgMTc2NzQsIDE3Njc1LCAxNzY3NiwgMTc2NzcsIDE3NzE5LCAxNzcyMCwgMTc3MjEsIDE3NzIyLCAxNzcyMywgMTc3MjQsIDE3NzI1LFxyXG4gICAgICAxNzcyNiwgMzU0MywgMzU0NSwgMzU0NiwgMzU0NywgNDI2MiwgNDI4NywgNDI4OCwgNTAxNjAsIDUwMTYxLCA1MDI0NSwgNTAyNzMsIDUwMjc0LCA2MywgNzAsXHJcbiAgICAgIDcxLCA3Mzk0LCA3Mzk1LCA3Mzk2LCA3NCwgODc4MCwgODc4MSwgODc4MiwgODc4MywgODc4NCwgODc4NSwgODc4NywgODc4OSwgODkyNSxcclxuICAgIF0sXHJcbiAgICBEUkc6IFtcclxuICAgICAgMTY0NzcsIDE2NDc4LCAxNjQ3OSwgMTY0ODAsIDE3NzI4LCAxNzcyOSwgMzU1MywgMzU1NCwgMzU1NSwgMzU1NiwgMzU1NywgNDI5MiwgNDI5MywgNTAxNjIsXHJcbiAgICAgIDUwMTYzLCA1MDI0NywgNTAyNzUsIDUwMjc2LCA3Mzk3LCA3Mzk4LCA3Mzk5LCA3NDAwLCA4NiwgODc5MSwgODc5MiwgODc5MywgODc5NCwgODc5NSxcclxuICAgICAgODc5NiwgODc5NywgODc5OCwgODc5OSwgODgwMiwgODgwMywgODgwNCwgODgwNSwgODgwNiwgOTIsIDk0LCA5NSwgOTYsIDk2NDAsIDc1LCA3OCxcclxuICAgIF0sXHJcbiAgICBOSU46IFtcclxuICAgICAgMTY0ODgsIDE2NDg5LCAxNjQ5MSwgMTY0OTIsIDE2NDkzLCAxNzQxMywgMTc0MTQsIDE3NDE1LCAxNzQxNiwgMTc0MTcsIDE3NDE4LCAxNzQxOSwgMTc0MjAsXHJcbiAgICAgIDE3NzMyLCAxNzczMywgMTc3MzQsIDE3NzM1LCAxNzczNiwgMTc3MzcsIDE3NzM4LCAxNzczOSwgMjI0NiwgMjI1OSwgMjI2MCwgMjI2MSwgMjI2MixcclxuICAgICAgMjI2MywgMjI2NCwgMjI2NSwgMjI2NiwgMjI2NywgMjI2OCwgMjI2OSwgMjI3MCwgMjI3MSwgMjI3MiwgMzU2MywgMzU2NiwgNDI5NSwgNTAxNjUsXHJcbiAgICAgIDUwMTY2LCA1MDE2NywgNTAyNTAsIDUwMjc5LCA1MDI4MCwgNzQwMSwgNzQwMiwgNzQwMywgODgwNywgODgwOCwgODgwOSwgODgxMCwgODgxMiwgODgxNCxcclxuICAgICAgODgxNSwgODgxNiwgODgyMCwgOTQ2MSxcclxuICAgIF0sXHJcbiAgICBTQU06IFtcclxuICAgICAgMTY0ODEsIDE2NDgyLCAxNjQ4MywgMTY0ODQsIDE2NDg1LCAxNjQ4NiwgMTY0ODcsIDE3NzQwLCAxNzc0MSwgMTc3NDIsIDE3NzQzLCAxNzc0NCwgNTAyMDgsXHJcbiAgICAgIDUwMjE1LCA1MDI3NywgNTAyNzgsIDc0NzcsIDc0NzgsIDc0NzksIDc0ODAsIDc0ODEsIDc0ODIsIDc0ODMsIDc0ODQsIDc0ODUsIDc0ODYsIDc0ODcsXHJcbiAgICAgIDc0ODgsIDc0ODksIDc0OTAsIDc0OTEsIDc0OTIsIDc0OTMsIDc0OTQsIDc0OTUsIDc0OTYsIDc0OTcsIDc0OTgsIDc0OTksIDc1MDEsIDc1MDIsIDc4NTUsXHJcbiAgICAgIDc4NTcsIDc4NjcsIDg4MjEsIDg4MjIsIDg4MjMsIDg4MjQsIDg4MjUsIDg4MjYsIDg4MjgsIDg4MjksIDg4MzAsIDg4MzEsIDg4MzMsXHJcbiAgICBdLFxyXG4gICAgQlJEOiBbXHJcbiAgICAgIDEwMDIzLCAxMTQsIDExNiwgMTE3LCAxMTgsIDEzMDA3LCAxNDQ3OSwgMTY0OTQsIDE2NDk1LCAxNjQ5NiwgMTc2NzgsIDE3Njc5LCAxNzY4MCwgMTc2ODEsXHJcbiAgICAgIDE3NjgyLCAxNzc0NSwgMTc3NDcsIDM1NTgsIDM1NTksIDM1NjAsIDM1NjEsIDM1NjIsIDQyOTQsIDUwMTY4LCA1MDE2OSwgNTAyODIsIDUwMjgzLCA1MDI4NCxcclxuICAgICAgNTAyODUsIDUwMjg2LCA1MDI4NywgNzQwNCwgNzQwNSwgNzQwNiwgNzQwNywgNzQwOCwgNzQwOSwgODgzNiwgODgzNywgODgzOCwgODgzOSwgODg0MSxcclxuICAgICAgODg0MiwgODg0MywgODg0NCwgOTYyNSwgMTA2LFxyXG4gICAgXSxcclxuICAgIE1DSDogW1xyXG4gICAgICAxNjQ5NywgMTY0OTgsIDE2NDk5LCAxNjUwMCwgMTY1MDEsIDE2NTAyLCAxNjUwMywgMTY1MDQsIDE2NzY2LCAxNjg4OSwgMTcyMDYsIDE3MjA5LCAxNzc0OSxcclxuICAgICAgMTc3NTAsIDE3NzUxLCAxNzc1MiwgMTc3NTMsIDE3NzU0LCAyODY0LCAyODY2LCAyODY4LCAyODcwLCAyODcyLCAyODczLCAyODc0LCAyODc2LCAyODc4LFxyXG4gICAgICAyODkwLCA0Mjc2LCA0Njc1LCA0Njc2LCA1MDExNywgNTAxMTksIDUwMjg4LCA1MDI4OSwgNTAyOTAsIDUwMjkxLCA1MDI5MiwgNTAyOTMsIDUwMjk0LFxyXG4gICAgICA3NDEwLCA3NDExLCA3NDEyLCA3NDEzLCA3NDE0LCA3NDE1LCA3NDE2LCA3NDE4LCA4ODQ4LCA4ODQ5LCA4ODUwLCA4ODUxLCA4ODUzLCA4ODU1LFxyXG4gICAgXSxcclxuICAgIEROQzogW1xyXG4gICAgICAxNzc1NiwgMTc3NTcsIDE3NzU4LCAxNzc1OSwgMTc3NjAsIDE3NzYxLCAxNzc2MiwgMTc3NjMsIDE3NzY0LCAxNzc2NSwgMTc3NjYsIDE3NzY3LFxyXG4gICAgICAxNzc2OCwgMTc3NjksIDE3NzcwLCAxNzc3MSwgMTc3NzIsIDE3NzczLCAxNzgyNCwgMTc4MjUsIDE3ODI2LCAxNzgyNywgMTc4MjgsIDE3ODI5LFxyXG4gICAgICAxODA3NiwgMTU5ODksIDE1OTkwLCAxNTk5MywgMTU5OTcsIDE1OTk5LCAxNjAwMCwgMTYwMDEsIDE2MDAyLCAxNjAwMywgMTYxOTEsIDE2MTkyLFxyXG4gICAgICAxNTk5MSwgMTU5OTQsIDE2MDA3LCA1MDI1MiwgMTU5OTUsIDE1OTkyLCAxNTk5NiwgMTYwMDgsIDE2MDEwLCA1MDI1MSwgMTYwMTUsIDE2MDEyLFxyXG4gICAgICAxNjAwNiwgMTgwNzMsIDUwMjUzLCAxNjAxMSwgMTYwMDksIDUwMjU0LCAxNTk5OCwgMTYwMDQsIDE2MTkzLCAxNjE5NCwgMTYxOTUsIDE2MTk2LFxyXG4gICAgICAxNjAxMywgMTYwMDUsIDUwMjU1LCA1MDI1NiwgMTYwMTQsXHJcbiAgICBdLFxyXG4gICAgQkxNOiBbXHJcbiAgICAgIDE0NDc3LCAxNTMsIDE1NCwgMTU4LCAxNTksIDE2MiwgMTY1MDUsIDE2NTA2LCAxNjUwNywgMTc2ODMsIDE3Njg0LCAxNzY4NSwgMTc2ODYsIDE3Njg3LFxyXG4gICAgICAxNzc3NCwgMTc3NzUsIDM1NzMsIDM1NzQsIDM1NzUsIDM1NzYsIDM1NzcsIDQyOTgsIDUwMTcxLCA1MDE3MiwgNTAxNzMsIDUwMTc0LCA1MDI5NSxcclxuICAgICAgNTAyOTYsIDUwMjk3LCA1MDMyMSwgNTAzMjIsIDc0MTksIDc0MjAsIDc0MjEsIDc0MjIsIDg4NTgsIDg4NTksIDg4NjAsIDg4NjEsIDg4NjIsIDg4NjMsXHJcbiAgICAgIDg4NjQsIDg4NjUsIDg4NjYsIDg4NjcsIDg4NjksIDk2MzcsIDE0OSwgMTU1LCAxNDEsIDE1MixcclxuICAgIF0sXHJcbiAgICBTTU46IFtcclxuICAgICAgMTY1MTAsIDE2NTExLCAxNjUxMywgMTY1MTQsIDE2NTE1LCAxNjUxNiwgMTY1MTcsIDE2NTE4LCAxNjUxOSwgMTY1MjIsIDE2NTIzLCAxNjU0OSxcclxuICAgICAgMTY3OTUsIDE2Nzk2LCAxNjc5NywgMTY3OTgsIDE2Nzk5LCAxNjgwMCwgMTY4MDEsIDE2ODAyLCAxNjgwMywgMTc3NzcsIDE3Nzc4LCAxNzc3OSxcclxuICAgICAgMTc3ODAsIDE3NzgxLCAxNzc4MiwgMTc3ODMsIDE3Nzg0LCAxNzc4NSwgMTgwLCAxODQsIDM1NzgsIDM1NzksIDM1ODAsIDM1ODEsIDM1ODIsIDQyOTksXHJcbiAgICAgIDUwMTc2LCA1MDE3NywgNTAxNzgsIDUwMjEzLCA1MDIxNywgNTAyOTgsIDUwMjk5LCA1MDMwMCwgNTAzMDEsIDUwMzAyLCA3NDIzLCA3NDI0LCA3NDI1LFxyXG4gICAgICA3NDI2LCA3NDI3LCA3NDI4LCA3NDI5LCA3NDQ5LCA3NDUwLCA3ODcsIDc4OCwgNzkxLCA3OTIsIDc5NCwgNzk2LCA3OTcsIDc5OCwgODAwLCA4MDEsXHJcbiAgICAgIDg4NzIsIDg4NzMsIDg4NzQsIDg4NzcsIDg4NzgsIDg4NzksIDg4ODAsIDg4ODEsIDkwMTQsIDk0MzIsXHJcbiAgICBdLFxyXG4gICAgUkRNOiBbXHJcbiAgICAgIDEwMDI1LCAxNjUyNCwgMTY1MjUsIDE2NTI2LCAxNjUyNywgMTY1MjgsIDE2NTI5LCAxNjUzMCwgMTc3ODYsIDE3Nzg3LCAxNzc4OCwgNTAxOTUsXHJcbiAgICAgIDUwMjAwLCA1MDIwMSwgNTAyMTYsIDUwMzAzLCA1MDMwNCwgNTAzMDUsIDUwMzA2LCA3NTAzLCA3NTA0LCA3NTA1LCA3NTA2LCA3NTA3LCA3NTA5LFxyXG4gICAgICA3NTEwLCA3NTExLCA3NTEyLCA3NTEzLCA3NTE0LCA3NTE1LCA3NTE2LCA3NTE3LCA3NTE4LCA3NTE5LCA3NTIwLCA3NTIxLCA3NTIzLCA3NTI0LFxyXG4gICAgICA3NTI1LCA3NTI2LCA3NTI3LCA3NTI4LCA3NTI5LCA3NTMwLCA4ODgyLCA4ODgzLCA4ODg0LCA4ODg1LCA4ODg3LCA4ODg4LCA4ODg5LCA4ODkwLFxyXG4gICAgICA4ODkxLCA4ODkyLCA5NDMzLCA5NDM0LFxyXG4gICAgXSxcclxuICAgIEJMVTogW1xyXG4gICAgICAxMTcxNSwgMTEzODMsIDExMzg0LCAxMTM4NSwgMTEzODYsIDExMzg3LCAxMTM4OCwgMTEzODksIDExMzkwLCAxMTM5MSwgMTEzOTIsIDExMzkzLFxyXG4gICAgICAxMTM5NCwgMTEzOTUsIDExMzk2LCAxMTM5NywgMTEzOTgsIDExMzk5LCAxMTQwMCwgMTE0MDEsIDExNDAyLCAxMTQwMywgMTE0MDQsIDExNDA1LFxyXG4gICAgICAxMTQwNiwgMTE0MDcsIDExNDA4LCAxMTQwOSwgMTE0MTAsIDExNDExLCAxMTQxMiwgMTE0MTMsIDExNDE0LCAxMTQxNSwgMTE0MTYsIDExNDE3LFxyXG4gICAgICAxMTQxOCwgMTE0MTksIDExNDIwLCAxMTQyMSwgMTE0MjIsIDExNDIzLCAxMTQyNCwgMTE0MjUsIDExNDI2LCAxMTQyNywgMTE0MjgsIDExNDI5LFxyXG4gICAgICAxMTQzMCwgMTE0MzEsIDUwMjE5LCA1MDIyMCwgNTAyMjEsIDUwMjIyLCA1MDIyMywgNTAyMjQsXHJcbiAgICBdLFxyXG4gIH07XHJcbn1cclxuIiwiLy8gTWVtYmVyIG5hbWVzIHRha2VuIGZyb20gT3ZlcmxheVBsdWdpbidzIE1pbmlQYXJzZS5jc1xyXG4vLyBUeXBlcyB0YWtlbiBmcm9tIEZGWElWIHBhcnNlciBwbHVnaW5cclxuZXhwb3J0IGludGVyZmFjZSBQbHVnaW5TdGF0ZSB7XHJcbiAgQ3VycmVudFdvcmxkSUQ/OiBudW1iZXI7XHJcbiAgV29ybGRJRD86IG51bWJlcjtcclxuICBXb3JsZE5hbWU/OiBzdHJpbmc7XHJcbiAgQk5wY0lEPzogbnVtYmVyO1xyXG4gIEJOcGNOYW1lSUQ/OiBudW1iZXI7XHJcbiAgUGFydHlUeXBlPzogbnVtYmVyO1xyXG4gIElEPzogbnVtYmVyO1xyXG4gIE93bmVySUQ/OiBudW1iZXI7XHJcbiAgdHlwZT86IG51bWJlcjtcclxuICBKb2I/OiBudW1iZXI7XHJcbiAgTGV2ZWw/OiBudW1iZXI7XHJcbiAgTmFtZT86IHN0cmluZztcclxuICBDdXJyZW50SFA6IG51bWJlcjtcclxuICBNYXhIUDogbnVtYmVyO1xyXG4gIEN1cnJlbnRNUDogbnVtYmVyO1xyXG4gIE1heE1QOiBudW1iZXI7XHJcbiAgUG9zWDogbnVtYmVyO1xyXG4gIFBvc1k6IG51bWJlcjtcclxuICBQb3NaOiBudW1iZXI7XHJcbiAgSGVhZGluZzogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21iYXRhbnRTdGF0ZSB7XHJcbiAgcG9zWDogbnVtYmVyO1xyXG4gIHBvc1k6IG51bWJlcjtcclxuICBwb3NaOiBudW1iZXI7XHJcbiAgaGVhZGluZzogbnVtYmVyO1xyXG4gIHRhcmdldGFibGU6IGJvb2xlYW47XHJcbiAgaHA6IG51bWJlcjtcclxuICBtYXhIcDogbnVtYmVyO1xyXG4gIG1wOiBudW1iZXI7XHJcbiAgbWF4TXA6IG51bWJlcjtcclxuXHJcbiAgY29uc3RydWN0b3IocG9zWDogbnVtYmVyLCBwb3NZOiBudW1iZXIsIHBvc1o6IG51bWJlciwgaGVhZGluZzogbnVtYmVyLFxyXG4gICAgICB0YXJnZXRhYmxlOiBib29sZWFuLFxyXG4gICAgICBocDogbnVtYmVyLCBtYXhIcDogbnVtYmVyLCBtcDogbnVtYmVyLCBtYXhNcDogbnVtYmVyKSB7XHJcbiAgICB0aGlzLnBvc1ggPSBwb3NYO1xyXG4gICAgdGhpcy5wb3NZID0gcG9zWTtcclxuICAgIHRoaXMucG9zWiA9IHBvc1o7XHJcbiAgICB0aGlzLmhlYWRpbmcgPSBoZWFkaW5nO1xyXG4gICAgdGhpcy50YXJnZXRhYmxlID0gdGFyZ2V0YWJsZTtcclxuICAgIHRoaXMuaHAgPSBocDtcclxuICAgIHRoaXMubWF4SHAgPSBtYXhIcDtcclxuICAgIHRoaXMubXAgPSBtcDtcclxuICAgIHRoaXMubWF4TXAgPSBtYXhNcDtcclxuICB9XHJcblxyXG4gIHBhcnRpYWxDbG9uZShwcm9wczogUGFydGlhbDxDb21iYXRhbnRTdGF0ZT4pOiBDb21iYXRhbnRTdGF0ZSB7XHJcbiAgICByZXR1cm4gbmV3IENvbWJhdGFudFN0YXRlKFxyXG4gICAgICAgIHByb3BzLnBvc1ggPz8gdGhpcy5wb3NYLFxyXG4gICAgICAgIHByb3BzLnBvc1kgPz8gdGhpcy5wb3NZLFxyXG4gICAgICAgIHByb3BzLnBvc1ogPz8gdGhpcy5wb3NaLFxyXG4gICAgICAgIHByb3BzLmhlYWRpbmcgPz8gdGhpcy5oZWFkaW5nLFxyXG4gICAgICAgIHByb3BzLnRhcmdldGFibGUgPz8gdGhpcy50YXJnZXRhYmxlLFxyXG4gICAgICAgIHByb3BzLmhwID8/IHRoaXMuaHAsXHJcbiAgICAgICAgcHJvcHMubWF4SHAgPz8gdGhpcy5tYXhIcCxcclxuICAgICAgICBwcm9wcy5tcCA/PyB0aGlzLm1wLFxyXG4gICAgICAgIHByb3BzLm1heE1wID8/IHRoaXMubWF4TXApO1xyXG4gIH1cclxuXHJcbiAgdG9QbHVnaW5TdGF0ZSgpOiBQbHVnaW5TdGF0ZSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBQb3NYOiB0aGlzLnBvc1gsXHJcbiAgICAgIFBvc1k6IHRoaXMucG9zWSxcclxuICAgICAgUG9zWjogdGhpcy5wb3NaLFxyXG4gICAgICBIZWFkaW5nOiB0aGlzLmhlYWRpbmcsXHJcbiAgICAgIEN1cnJlbnRIUDogdGhpcy5ocCxcclxuICAgICAgTWF4SFA6IHRoaXMubWF4SHAsXHJcbiAgICAgIEN1cnJlbnRNUDogdGhpcy5tcCxcclxuICAgICAgTWF4TVA6IHRoaXMubWF4TXAsXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG4iLCIvLyBBdXRvLWdlbmVyYXRlZCBmcm9tIGdlbl9wZXRfbmFtZXMucHlcclxuLy8gRE8gTk9UIEVESVQgVEhJUyBGSUxFIERJUkVDVExZXHJcblxyXG5pbXBvcnQgeyBMYW5nIH0gZnJvbSAnLi9sYW5ndWFnZXMnO1xyXG5cclxudHlwZSBQZXREYXRhID0ge1xyXG4gIFtuYW1lIGluIExhbmddOiByZWFkb25seSBzdHJpbmdbXTtcclxufTtcclxuXHJcbmNvbnN0IGRhdGE6IFBldERhdGEgPSB7XHJcbiAgJ2NuJzogW1xyXG4gICAgJ+e7v+Wuneefs+WFvScsXHJcbiAgICAn6buE5a6d55+z5YW9JyxcclxuICAgICfkvIrlvJfliKnnibnkuYvngbUnLFxyXG4gICAgJ+azsOWdpuS5i+eBtScsXHJcbiAgICAn6L+m5qW8572X5LmL54G1JyxcclxuICAgICfmnJ3ml6XlsI/ku5nlpbMnLFxyXG4gICAgJ+WkleaciOWwj+S7meWlsycsXHJcbiAgICAn6L2m5byP5rWu56m654Ku5aGUJyxcclxuICAgICfosaHlvI/mta7nqbrngq7loZQnLFxyXG4gICAgJ+S6mueBteelnuW3tOWTiOWnhueJuScsXHJcbiAgICAn5Lqa54G156We5LiN5q276bifJyxcclxuICAgICfngr3lpKnkvb8nLFxyXG4gICAgJ+aciOmVv+Wuneefs+WFvScsXHJcbiAgICAn6Iux6ZuE55qE5o6g5b2xJyxcclxuICAgICflkI7lvI/oh6rotbDkurrlgbYnLFxyXG4gICAgJ+WIhui6qycsXHJcbiAgXSxcclxuICAnZGUnOiBbXHJcbiAgICAnU21hcmFnZC1LYXJmdW5rZWwnLFxyXG4gICAgJ1RvcGFzLUthcmZ1bmtlbCcsXHJcbiAgICAnSWZyaXQtRWdpJyxcclxuICAgICdUaXRhbi1FZ2knLFxyXG4gICAgJ0dhcnVkYS1FZ2knLFxyXG4gICAgJ0VvcycsXHJcbiAgICAnU2VsZW5lJyxcclxuICAgICdTZWxic3RzY2h1c3MtR3lyb2NvcHRlciBUVVJNJyxcclxuICAgICdTZWxic3RzY2h1c3MtR3lyb2NvcHRlciBMw4RVRkVSJyxcclxuICAgICdEZW1pLUJhaGFtdXQnLFxyXG4gICAgJ0RlbWktUGjDtm5peCcsXHJcbiAgICAnU2VyYXBoJyxcclxuICAgICdNb25kc3RlaW4tS2FyZnVua2VsJyxcclxuICAgICdTY2hhdHRlbnNjaGVtZW4nLFxyXG4gICAgJ0F1dG9tYXRvbiBEQU1FJyxcclxuICAgICdHZWRvcHBlbHRlcyBJY2gnLFxyXG4gIF0sXHJcbiAgJ2VuJzogW1xyXG4gICAgJ0VtZXJhbGQgQ2FyYnVuY2xlJyxcclxuICAgICdUb3BheiBDYXJidW5jbGUnLFxyXG4gICAgJ0lmcml0LUVnaScsXHJcbiAgICAnVGl0YW4tRWdpJyxcclxuICAgICdHYXJ1ZGEtRWdpJyxcclxuICAgICdFb3MnLFxyXG4gICAgJ1NlbGVuZScsXHJcbiAgICAnUm9vayBBdXRvdHVycmV0JyxcclxuICAgICdCaXNob3AgQXV0b3R1cnJldCcsXHJcbiAgICAnRGVtaS1CYWhhbXV0JyxcclxuICAgICdEZW1pLVBob2VuaXgnLFxyXG4gICAgJ1NlcmFwaCcsXHJcbiAgICAnTW9vbnN0b25lIENhcmJ1bmNsZScsXHJcbiAgICAnRXN0ZWVtJyxcclxuICAgICdBdXRvbWF0b24gUXVlZW4nLFxyXG4gICAgJ0J1bnNoaW4nLFxyXG4gIF0sXHJcbiAgJ2ZyJzogW1xyXG4gICAgJ0NhcmJ1bmNsZSDDqW1lcmF1ZGUnLFxyXG4gICAgJ0NhcmJ1bmNsZSB0b3BhemUnLFxyXG4gICAgJ0lmcml0LUVnaScsXHJcbiAgICAnVGl0YW4tRWdpJyxcclxuICAgICdHYXJ1ZGEtRWdpJyxcclxuICAgICdFb3MnLFxyXG4gICAgJ1NlbGVuZScsXHJcbiAgICAnQXV0by10b3VyZWxsZSBUb3VyJyxcclxuICAgICdBdXRvLXRvdXJlbGxlIEZvdScsXHJcbiAgICAnRGVtaS1CYWhhbXV0JyxcclxuICAgICdEZW1pLVBow6luaXgnLFxyXG4gICAgJ1PDqXJhcGhpbicsXHJcbiAgICAnQ2FyYnVuY2xlIGjDqWNhdG9saXRlJyxcclxuICAgICdFc3RpbWUnLFxyXG4gICAgJ0F1dG9tYXRlIFJlaW5lJyxcclxuICAgICdPbWJyZScsXHJcbiAgXSxcclxuICAnamEnOiBbXHJcbiAgICAn44Kr44O844OQ44Oz44Kv44Or44O744Ko44Oh44Op44Or44OJJyxcclxuICAgICfjgqvjg7zjg5Djg7Pjgq/jg6vjg7vjg4jjg5Hjg7zjgronLFxyXG4gICAgJ+OCpOODleODquODvOODiOODu+OCqOOCricsXHJcbiAgICAn44K/44Kk44K/44Oz44O744Ko44KuJyxcclxuICAgICfjgqzjg6vjg7zjg4Djg7vjgqjjgq4nLFxyXG4gICAgJ+ODleOCp+OCouODquODvOODu+OCqOOCquOCuScsXHJcbiAgICAn44OV44Kn44Ki44Oq44O844O744K744Os44ONJyxcclxuICAgICfjgqrjg7zjg4jjgr/jg6zjg4Pjg4jjg7vjg6vjg7zjgq8nLFxyXG4gICAgJ+OCquODvOODiOOCv+ODrOODg+ODiOODu+ODk+OCt+ODp+ODg+ODlycsXHJcbiAgICAn44OH44Of44O744OQ44OP44Og44O844OIJyxcclxuICAgICfjg4fjg5/jg7vjg5Xjgqfjg4vjg4Pjgq/jgrknLFxyXG4gICAgJ+OCu+ODqeODleOCo+ODoCcsXHJcbiAgICAn44Kr44O844OQ44Oz44Kv44Or44O744Og44O844Oz44K544OI44O844OzJyxcclxuICAgICfoi7Hpm4Tjga7lvbHouqsnLFxyXG4gICAgJ+OCquODvOODiOODnuODiOODs+ODu+OCr+OCpOODvOODsycsXHJcbiAgICAn5YiG6LqrJyxcclxuICBdLFxyXG4gICdrbyc6IFtcclxuICAgICfsubTrspntgbQg7JeQ66mU656E65OcJyxcclxuICAgICfsubTrspntgbQg7Yag7YyM7KaIJyxcclxuICAgICfsnbTtlITrpqztirgg7JeQ6riwJyxcclxuICAgICftg4DsnbTtg4Qg7JeQ6riwJyxcclxuICAgICfqsIDro6jri6Qg7JeQ6riwJyxcclxuICAgICfsmpTsoJUg7JeQ7Jik7IqkJyxcclxuICAgICfsmpTsoJUg7IWA66CI64SkJyxcclxuICAgICfsnpDrj5ntj6ztg5Eg66OpJyxcclxuICAgICfsnpDrj5ntj6ztg5Eg67mE7IiNJyxcclxuICAgICfrjbDrr7jrsJTtlZjrrLTtirgnLFxyXG4gICAgJ+uNsOuvuO2UvOuLieyKpCcsXHJcbiAgICAn7IS465287ZWMJyxcclxuICAgICfsubTrspntgbQg66y47Iqk7YakJyxcclxuICAgICfsmIHsm4XsnZgg7ZmY7JiBJyxcclxuICAgICfsnpDrj5nsnbjtmJUg7YC4JyxcclxuICAgICfrtoTsi6AnLFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkYXRhO1xyXG4iLCJpbXBvcnQgRW11bGF0b3JDb21tb24gZnJvbSAnLi4vLi4vRW11bGF0b3JDb21tb24nO1xyXG5pbXBvcnQgTG9nUmVwb3NpdG9yeSBmcm9tICcuL0xvZ1JlcG9zaXRvcnknO1xyXG5cclxuY29uc3QgZmllbGRzID0ge1xyXG4gIGV2ZW50OiAwLFxyXG4gIHRpbWVzdGFtcDogMSxcclxufSBhcyBjb25zdDtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmljIGNsYXNzIHRvIHRyYWNrIGFuIEZGWElWIGxvZyBsaW5lXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaW5lRXZlbnQge1xyXG4gIHB1YmxpYyBvZmZzZXQgPSAwO1xyXG4gIHB1YmxpYyBjb252ZXJ0ZWRMaW5lOiBzdHJpbmc7XHJcbiAgcHVibGljIGludmFsaWQgPSBmYWxzZTtcclxuICBwdWJsaWMgaW5kZXggPSAwO1xyXG4gIHB1YmxpYyByZWFkb25seSBkZWNFdmVudDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBoZXhFdmVudDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB0aW1lc3RhbXA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgY2hlY2tzdW06IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVyQ2FzZUNvbnZlcnRlZExpbmU/OiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJlcG86IExvZ1JlcG9zaXRvcnksIHB1YmxpYyBuZXR3b3JrTGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHRoaXMuZGVjRXZlbnQgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMuZXZlbnRdID8/ICcwJyk7XHJcbiAgICB0aGlzLmhleEV2ZW50ID0gRW11bGF0b3JDb21tb24uemVyb1BhZCh0aGlzLmRlY0V2ZW50LnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpKTtcclxuICAgIHRoaXMudGltZXN0YW1wID0gbmV3IERhdGUocGFydHNbZmllbGRzLnRpbWVzdGFtcF0gPz8gJzAnKS5nZXRUaW1lKCk7XHJcbiAgICB0aGlzLmNoZWNrc3VtID0gcGFydHMuc2xpY2UoLTEpWzBdID8/ICcnO1xyXG4gICAgcmVwby51cGRhdGVUaW1lc3RhbXAodGhpcy50aW1lc3RhbXApO1xyXG4gICAgdGhpcy5jb252ZXJ0ZWRMaW5lID0gdGhpcy5wcmVmaXgoKSArIChwYXJ0cy5qb2luKCc6JykpLnJlcGxhY2UoJ3wnLCAnOicpO1xyXG4gIH1cclxuXHJcbiAgcHJlZml4KCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gJ1snICsgRW11bGF0b3JDb21tb24udGltZVRvVGltZVN0cmluZyh0aGlzLnRpbWVzdGFtcCwgdHJ1ZSkgKyAnXSAnICsgdGhpcy5oZXhFdmVudCArICc6JztcclxuICB9XHJcblxyXG4gIHN0YXRpYyBpc0RhbWFnZUhhbGxvd2VkKGRhbWFnZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKHBhcnNlSW50KGRhbWFnZSwgMTYpICYgcGFyc2VJbnQoJzEwMDAnLCAxNikpID4gMDtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBpc0RhbWFnZUJpZyhkYW1hZ2U6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIChwYXJzZUludChkYW1hZ2UsIDE2KSAmIHBhcnNlSW50KCc0MDAwJywgMTYpKSA+IDA7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY2FsY3VsYXRlRGFtYWdlKGRhbWFnZTogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgIGlmIChMaW5lRXZlbnQuaXNEYW1hZ2VIYWxsb3dlZChkYW1hZ2UpKVxyXG4gICAgICByZXR1cm4gMDtcclxuXHJcbiAgICBkYW1hZ2UgPSBFbXVsYXRvckNvbW1vbi56ZXJvUGFkKGRhbWFnZSwgOCk7XHJcbiAgICBjb25zdCBwYXJ0cyA9IFtcclxuICAgICAgZGFtYWdlLnN1YnN0cigwLCAyKSxcclxuICAgICAgZGFtYWdlLnN1YnN0cigyLCAyKSxcclxuICAgICAgZGFtYWdlLnN1YnN0cig0LCAyKSxcclxuICAgICAgZGFtYWdlLnN1YnN0cig2LCAyKSxcclxuICAgIF0gYXMgY29uc3Q7XHJcblxyXG4gICAgaWYgKCFMaW5lRXZlbnQuaXNEYW1hZ2VCaWcoZGFtYWdlKSlcclxuICAgICAgcmV0dXJuIHBhcnNlSW50KHBhcnRzLnNsaWNlKDAsIDIpLnJldmVyc2UoKS5qb2luKCcnKSwgMTYpO1xyXG5cclxuICAgIHJldHVybiBwYXJzZUludChcclxuICAgICAgICAocGFydHNbM10gKyBwYXJ0c1swXSkgK1xyXG4gICAgICAocGFyc2VJbnQocGFydHNbMV0sIDE2KSAtIHBhcnNlSW50KHBhcnRzWzNdLCAxNilcclxuICAgICAgKS50b1N0cmluZygxNiksIDE2KTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFR5cGUgZ3VhcmRzIGZvciB0aGVzZSBpbnRlcmZhY2VzIHJlcXVpcmUgdGhlaXIgb3duIGRlc2NyaXB0b3IgcHJvcGVydHlcclxuLy8gYmVjYXVzZSB3ZSBkb24ndCB3YW50IGV2ZXJ5IGxpbmUgZXZlbnQgd2l0aCBhbiBpZC9uYW1lXHJcbi8vIHRvIHVwZGF0ZSBjb21iYXRhbnQgc3RhdGUsIGZvciBleGFtcGxlXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGluZUV2ZW50U291cmNlIGV4dGVuZHMgTGluZUV2ZW50IHtcclxuICByZWFkb25seSBpc1NvdXJjZTogdHJ1ZTtcclxuICByZWFkb25seSBpZDogc3RyaW5nO1xyXG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcclxuICByZWFkb25seSB4PzogbnVtYmVyO1xyXG4gIHJlYWRvbmx5IHk/OiBudW1iZXI7XHJcbiAgcmVhZG9ubHkgej86IG51bWJlcjtcclxuICByZWFkb25seSBoZWFkaW5nPzogbnVtYmVyO1xyXG4gIHJlYWRvbmx5IHRhcmdldGFibGU/OiBib29sZWFuO1xyXG4gIHJlYWRvbmx5IGhwPzogbnVtYmVyO1xyXG4gIHJlYWRvbmx5IG1heEhwPzogbnVtYmVyO1xyXG4gIHJlYWRvbmx5IG1wPzogbnVtYmVyO1xyXG4gIHJlYWRvbmx5IG1heE1wPzogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgaXNMaW5lRXZlbnRTb3VyY2UgPSAobGluZTogTGluZUV2ZW50KTogbGluZSBpcyBMaW5lRXZlbnRTb3VyY2UgPT4ge1xyXG4gIHJldHVybiAnaXNTb3VyY2UnIGluIGxpbmU7XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIExpbmVFdmVudFRhcmdldCBleHRlbmRzIExpbmVFdmVudCB7XHJcbiAgcmVhZG9ubHkgaXNUYXJnZXQ6IHRydWU7XHJcbiAgcmVhZG9ubHkgdGFyZ2V0SWQ6IHN0cmluZztcclxuICByZWFkb25seSB0YXJnZXROYW1lOiBzdHJpbmc7XHJcbiAgcmVhZG9ubHkgdGFyZ2V0WD86IG51bWJlcjtcclxuICByZWFkb25seSB0YXJnZXRZPzogbnVtYmVyO1xyXG4gIHJlYWRvbmx5IHRhcmdldFo/OiBudW1iZXI7XHJcbiAgcmVhZG9ubHkgdGFyZ2V0SGVhZGluZz86IG51bWJlcjtcclxuICByZWFkb25seSB0YXJnZXRIcD86IG51bWJlcjtcclxuICByZWFkb25seSB0YXJnZXRNYXhIcD86IG51bWJlcjtcclxuICByZWFkb25seSB0YXJnZXRNcD86IG51bWJlcjtcclxuICByZWFkb25seSB0YXJnZXRNYXhNcD86IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGlzTGluZUV2ZW50VGFyZ2V0ID0gKGxpbmU6IExpbmVFdmVudCk6IGxpbmUgaXMgTGluZUV2ZW50VGFyZ2V0ID0+IHtcclxuICByZXR1cm4gJ2lzVGFyZ2V0JyBpbiBsaW5lO1xyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMaW5lRXZlbnRKb2JMZXZlbCBleHRlbmRzIExpbmVFdmVudCB7XHJcbiAgcmVhZG9ubHkgaXNKb2JMZXZlbDogdHJ1ZTtcclxuICByZWFkb25seSBqb2I6IHN0cmluZztcclxuICByZWFkb25seSBqb2JJZDogbnVtYmVyO1xyXG4gIHJlYWRvbmx5IGxldmVsOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBpc0xpbmVFdmVudEpvYkxldmVsID0gKGxpbmU6IExpbmVFdmVudCk6IGxpbmUgaXMgTGluZUV2ZW50Sm9iTGV2ZWwgPT4ge1xyXG4gIHJldHVybiAnaXNKb2JMZXZlbCcgaW4gbGluZTtcclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGluZUV2ZW50QWJpbGl0eSBleHRlbmRzIExpbmVFdmVudCB7XHJcbiAgcmVhZG9ubHkgaXNBYmlsaXR5OiB0cnVlO1xyXG4gIHJlYWRvbmx5IGFiaWxpdHlJZDogbnVtYmVyO1xyXG4gIHJlYWRvbmx5IGFiaWxpdHlOYW1lOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBpc0xpbmVFdmVudEFiaWxpdHkgPSAobGluZTogTGluZUV2ZW50KTogbGluZSBpcyBMaW5lRXZlbnRBYmlsaXR5ID0+IHtcclxuICByZXR1cm4gJ2lzQWJpbGl0eScgaW4gbGluZTtcclxufTtcclxuIiwiaW1wb3J0IENvbWJhdGFudCBmcm9tICcuL0NvbWJhdGFudCc7XHJcbmltcG9ydCBDb21iYXRhbnRKb2JTZWFyY2ggZnJvbSAnLi9Db21iYXRhbnRKb2JTZWFyY2gnO1xyXG5pbXBvcnQgQ29tYmF0YW50U3RhdGUgZnJvbSAnLi9Db21iYXRhbnRTdGF0ZSc7XHJcbmltcG9ydCBQZXROYW1lc0J5TGFuZyBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvcGV0X25hbWVzJztcclxuaW1wb3J0IExpbmVFdmVudCwgeyBpc0xpbmVFdmVudEpvYkxldmVsLCBpc0xpbmVFdmVudEFiaWxpdHksIGlzTGluZUV2ZW50U291cmNlLCBpc0xpbmVFdmVudFRhcmdldCwgTGluZUV2ZW50U291cmNlLCBMaW5lRXZlbnRUYXJnZXQgfSBmcm9tICcuL25ldHdvcmtfbG9nX2NvbnZlcnRlci9MaW5lRXZlbnQnO1xyXG5pbXBvcnQgeyBMYW5nIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL2xhbmd1YWdlcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21iYXRhbnRUcmFja2VyIHtcclxuICBsYW5ndWFnZTogTGFuZztcclxuICBmaXJzdFRpbWVzdGFtcDogbnVtYmVyO1xyXG4gIGxhc3RUaW1lc3RhbXA6IG51bWJlcjtcclxuICBjb21iYXRhbnRzOiB7IFtpZDogc3RyaW5nXTogQ29tYmF0YW50IH0gPSB7fTtcclxuICBwYXJ0eU1lbWJlcnM6IHN0cmluZ1tdID0gW107XHJcbiAgZW5lbWllczogc3RyaW5nW10gPSBbXTtcclxuICBvdGhlcnM6IHN0cmluZ1tdID0gW107XHJcbiAgcGV0czogc3RyaW5nW10gPSBbXTtcclxuICBtYWluQ29tYmF0YW50SUQ/OiBzdHJpbmc7XHJcbiAgaW5pdGlhbFN0YXRlczogeyBbaWQ6IHN0cmluZ106IFBhcnRpYWw8Q29tYmF0YW50U3RhdGU+IH0gPSB7fTtcclxuICBjb25zdHJ1Y3Rvcihsb2dMaW5lczogTGluZUV2ZW50W10sIGxhbmd1YWdlOiBMYW5nKSB7XHJcbiAgICB0aGlzLmxhbmd1YWdlID0gbGFuZ3VhZ2U7XHJcbiAgICB0aGlzLmZpcnN0VGltZXN0YW1wID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XHJcbiAgICB0aGlzLmxhc3RUaW1lc3RhbXAgPSAwO1xyXG4gICAgdGhpcy5pbml0aWFsaXplKGxvZ0xpbmVzKTtcclxuICAgIC8vIENsZWFyIGluaXRpYWxTdGF0ZXMgYWZ0ZXIgd2UgaW5pdGlhbGl6ZSwgd2UgZG9uJ3QgbmVlZCBpdCBhbnltb3JlXHJcbiAgICB0aGlzLmluaXRpYWxTdGF0ZXMgPSB7fTtcclxuICB9XHJcblxyXG4gIGluaXRpYWxpemUobG9nTGluZXM6IExpbmVFdmVudFtdKTogdm9pZCB7XHJcbiAgICAvLyBGaXJzdCBwYXNzOiBHZXQgbGlzdCBvZiBjb21iYXRhbnRzLCBmaWd1cmUgb3V0IHdoZXJlIHRoZXlcclxuICAgIC8vIHN0YXJ0IGF0IGlmIHBvc3NpYmxlXHJcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbG9nTGluZXMpIHtcclxuICAgICAgdGhpcy5maXJzdFRpbWVzdGFtcCA9IE1hdGgubWluKHRoaXMuZmlyc3RUaW1lc3RhbXAsIGxpbmUudGltZXN0YW1wKTtcclxuICAgICAgdGhpcy5sYXN0VGltZXN0YW1wID0gTWF0aC5tYXgodGhpcy5sYXN0VGltZXN0YW1wLCBsaW5lLnRpbWVzdGFtcCk7XHJcblxyXG4gICAgICBpZiAoaXNMaW5lRXZlbnRTb3VyY2UobGluZSkpXHJcbiAgICAgICAgdGhpcy5hZGRDb21iYXRhbnRGcm9tTGluZShsaW5lKTtcclxuXHJcbiAgICAgIGlmIChpc0xpbmVFdmVudFRhcmdldChsaW5lKSlcclxuICAgICAgICB0aGlzLmFkZENvbWJhdGFudEZyb21UYXJnZXRMaW5lKGxpbmUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJldHdlZW4gcGFzc2VzOiBDcmVhdGUgb3VyIGluaXRpYWwgY29tYmF0YW50IHN0YXRlc1xyXG4gICAgZm9yIChjb25zdCBpZCBpbiB0aGlzLmluaXRpYWxTdGF0ZXMpIHtcclxuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmluaXRpYWxTdGF0ZXNbaWRdID8/IHt9O1xyXG4gICAgICB0aGlzLmNvbWJhdGFudHNbaWRdPy5wdXNoU3RhdGUodGhpcy5maXJzdFRpbWVzdGFtcCwgbmV3IENvbWJhdGFudFN0YXRlKFxyXG4gICAgICAgICAgTnVtYmVyKHN0YXRlLnBvc1gpLFxyXG4gICAgICAgICAgTnVtYmVyKHN0YXRlLnBvc1kpLFxyXG4gICAgICAgICAgTnVtYmVyKHN0YXRlLnBvc1opLFxyXG4gICAgICAgICAgTnVtYmVyKHN0YXRlLmhlYWRpbmcpLFxyXG4gICAgICAgICAgc3RhdGUudGFyZ2V0YWJsZSA/PyBmYWxzZSxcclxuICAgICAgICAgIE51bWJlcihzdGF0ZS5ocCksXHJcbiAgICAgICAgICBOdW1iZXIoc3RhdGUubWF4SHApLFxyXG4gICAgICAgICAgTnVtYmVyKHN0YXRlLm1wKSxcclxuICAgICAgICAgIE51bWJlcihzdGF0ZS5tYXhNcCksXHJcbiAgICAgICkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNlY29uZCBwYXNzOiBBbmFseXplIGNvbWJhdGFudCBpbmZvcm1hdGlvbiBmb3IgdHJhY2tpbmdcclxuICAgIGNvbnN0IGV2ZW50VHJhY2tlcjogeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfSA9IHt9O1xyXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxvZ0xpbmVzKSB7XHJcbiAgICAgIGlmIChpc0xpbmVFdmVudFNvdXJjZShsaW5lKSkge1xyXG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5leHRyYWN0U3RhdGVGcm9tTGluZShsaW5lKTtcclxuICAgICAgICBpZiAoc3RhdGUpIHtcclxuICAgICAgICAgIGV2ZW50VHJhY2tlcltsaW5lLmlkXSA9IGV2ZW50VHJhY2tlcltsaW5lLmlkXSA/PyAwO1xyXG4gICAgICAgICAgKytldmVudFRyYWNrZXJbbGluZS5pZF07XHJcbiAgICAgICAgICB0aGlzLmNvbWJhdGFudHNbbGluZS5pZF0/LnB1c2hQYXJ0aWFsU3RhdGUobGluZS50aW1lc3RhbXAsIHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzTGluZUV2ZW50VGFyZ2V0KGxpbmUpKSB7XHJcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmV4dHJhY3RTdGF0ZUZyb21UYXJnZXRMaW5lKGxpbmUpO1xyXG4gICAgICAgIGlmIChzdGF0ZSkge1xyXG4gICAgICAgICAgZXZlbnRUcmFja2VyW2xpbmUudGFyZ2V0SWRdID0gZXZlbnRUcmFja2VyW2xpbmUudGFyZ2V0SWRdID8/IDA7XHJcbiAgICAgICAgICArK2V2ZW50VHJhY2tlcltsaW5lLnRhcmdldElkXTtcclxuICAgICAgICAgIHRoaXMuY29tYmF0YW50c1tsaW5lLnRhcmdldElkXT8ucHVzaFBhcnRpYWxTdGF0ZShsaW5lLnRpbWVzdGFtcCwgc3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEZpZ3VyZSBvdXQgcGFydHkvZW5lbXkvb3RoZXIgc3RhdHVzXHJcbiAgICBjb25zdCBwZXROYW1lcyA9IFBldE5hbWVzQnlMYW5nW3RoaXMubGFuZ3VhZ2VdO1xyXG4gICAgdGhpcy5vdGhlcnMgPSB0aGlzLm90aGVycy5maWx0ZXIoKElEKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmNvbWJhdGFudHNbSURdPy5qb2IgIT09IHVuZGVmaW5lZCAmJlxyXG4gICAgICAgIHRoaXMuY29tYmF0YW50c1tJRF0/LmpvYiAhPT0gJ05PTkUnICYmXHJcbiAgICAgICAgSUQuc3RhcnRzV2l0aCgnMScpKSB7XHJcbiAgICAgICAgdGhpcy5wYXJ0eU1lbWJlcnMucHVzaChJRCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9IGVsc2UgaWYgKHBldE5hbWVzLmluY2x1ZGVzKHRoaXMuY29tYmF0YW50c1tJRF0/Lm5hbWUgPz8gJycpKSB7XHJcbiAgICAgICAgdGhpcy5wZXRzLnB1c2goSUQpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfSBlbHNlIGlmICgoZXZlbnRUcmFja2VyW0lEXSA/PyAwKSA+IDApIHtcclxuICAgICAgICB0aGlzLmVuZW1pZXMucHVzaChJRCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTWFpbiBjb21iYXRhbnQgaXMgdGhlIG9uZSB0aGF0IHRvb2sgdGhlIG1vc3QgYWN0aW9uc1xyXG4gICAgdGhpcy5tYWluQ29tYmF0YW50SUQgPSB0aGlzLmVuZW1pZXMuc29ydCgobCwgcikgPT4ge1xyXG4gICAgICByZXR1cm4gKGV2ZW50VHJhY2tlcltyXSA/PyAwKSAtIChldmVudFRyYWNrZXJbbF0gPz8gMCk7XHJcbiAgICB9KVswXTtcclxuICB9XHJcblxyXG4gIGFkZENvbWJhdGFudEZyb21MaW5lKGxpbmU6IExpbmVFdmVudFNvdXJjZSk6IHZvaWQge1xyXG4gICAgY29uc3QgY29tYmF0YW50ID0gdGhpcy5pbml0Q29tYmF0YW50KGxpbmUuaWQsIGxpbmUubmFtZSk7XHJcbiAgICBjb25zdCBpbml0U3RhdGUgPSB0aGlzLmluaXRpYWxTdGF0ZXNbbGluZS5pZF0gPz8ge307XHJcblxyXG4gICAgY29uc3QgZXh0cmFjdGVkU3RhdGUgPSB0aGlzLmV4dHJhY3RTdGF0ZUZyb21MaW5lKGxpbmUpID8/IHt9O1xyXG5cclxuICAgIGluaXRTdGF0ZS5wb3NYID0gaW5pdFN0YXRlLnBvc1ggPz8gZXh0cmFjdGVkU3RhdGUucG9zWDtcclxuICAgIGluaXRTdGF0ZS5wb3NZID0gaW5pdFN0YXRlLnBvc1kgPz8gZXh0cmFjdGVkU3RhdGUucG9zWTtcclxuICAgIGluaXRTdGF0ZS5wb3NaID0gaW5pdFN0YXRlLnBvc1ogPz8gZXh0cmFjdGVkU3RhdGUucG9zWjtcclxuICAgIGluaXRTdGF0ZS5oZWFkaW5nID0gaW5pdFN0YXRlLmhlYWRpbmcgPz8gZXh0cmFjdGVkU3RhdGUuaGVhZGluZztcclxuICAgIGluaXRTdGF0ZS50YXJnZXRhYmxlID0gaW5pdFN0YXRlLnRhcmdldGFibGUgPz8gZXh0cmFjdGVkU3RhdGUudGFyZ2V0YWJsZTtcclxuICAgIGluaXRTdGF0ZS5ocCA9IGluaXRTdGF0ZS5ocCA/PyBleHRyYWN0ZWRTdGF0ZS5ocDtcclxuICAgIGluaXRTdGF0ZS5tYXhIcCA9IGluaXRTdGF0ZS5tYXhIcCA/PyBleHRyYWN0ZWRTdGF0ZS5tYXhIcDtcclxuICAgIGluaXRTdGF0ZS5tcCA9IGluaXRTdGF0ZS5tcCA/PyBleHRyYWN0ZWRTdGF0ZS5tcDtcclxuICAgIGluaXRTdGF0ZS5tYXhNcCA9IGluaXRTdGF0ZS5tYXhNcCA/PyBleHRyYWN0ZWRTdGF0ZS5tYXhNcDtcclxuXHJcbiAgICBpZiAoaXNMaW5lRXZlbnRKb2JMZXZlbChsaW5lKSkge1xyXG4gICAgICBjb21iYXRhbnQuam9iID0gdGhpcy5jb21iYXRhbnRzW2xpbmUuaWRdPy5qb2IgPz8gbGluZS5qb2I7XHJcbiAgICAgIGNvbWJhdGFudC5sZXZlbCA9IHRoaXMuY29tYmF0YW50c1tsaW5lLmlkXT8ubGV2ZWwgPz8gbGluZS5sZXZlbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNMaW5lRXZlbnRBYmlsaXR5KGxpbmUpKSB7XHJcbiAgICAgIGlmICghY29tYmF0YW50LmpvYiAmJiAhbGluZS5pZC5zdGFydHNXaXRoKCc0JykgJiYgbGluZS5hYmlsaXR5SWQgIT09IHVuZGVmaW5lZClcclxuICAgICAgICBjb21iYXRhbnQuam9iID0gQ29tYmF0YW50Sm9iU2VhcmNoLmdldEpvYihsaW5lLmFiaWxpdHlJZCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbWJhdGFudC5qb2IpXHJcbiAgICAgIGNvbWJhdGFudC5qb2IgPSBjb21iYXRhbnQuam9iLnRvVXBwZXJDYXNlKCk7XHJcbiAgfVxyXG5cclxuICBhZGRDb21iYXRhbnRGcm9tVGFyZ2V0TGluZShsaW5lOiBMaW5lRXZlbnRUYXJnZXQpOiB2b2lkIHtcclxuICAgIHRoaXMuaW5pdENvbWJhdGFudChsaW5lLnRhcmdldElkLCBsaW5lLnRhcmdldE5hbWUpO1xyXG4gICAgY29uc3QgaW5pdFN0YXRlID0gdGhpcy5pbml0aWFsU3RhdGVzW2xpbmUudGFyZ2V0SWRdID8/IHt9O1xyXG5cclxuICAgIGNvbnN0IGV4dHJhY3RlZFN0YXRlID0gdGhpcy5leHRyYWN0U3RhdGVGcm9tVGFyZ2V0TGluZShsaW5lKSA/PyB7fTtcclxuXHJcbiAgICBpbml0U3RhdGUucG9zWCA9IGluaXRTdGF0ZS5wb3NYID8/IGV4dHJhY3RlZFN0YXRlLnBvc1g7XHJcbiAgICBpbml0U3RhdGUucG9zWSA9IGluaXRTdGF0ZS5wb3NZID8/IGV4dHJhY3RlZFN0YXRlLnBvc1k7XHJcbiAgICBpbml0U3RhdGUucG9zWiA9IGluaXRTdGF0ZS5wb3NaID8/IGV4dHJhY3RlZFN0YXRlLnBvc1o7XHJcbiAgICBpbml0U3RhdGUuaGVhZGluZyA9IGluaXRTdGF0ZS5oZWFkaW5nID8/IGV4dHJhY3RlZFN0YXRlLmhlYWRpbmc7XHJcbiAgICBpbml0U3RhdGUuaHAgPSBpbml0U3RhdGUuaHAgPz8gZXh0cmFjdGVkU3RhdGUuaHA7XHJcbiAgICBpbml0U3RhdGUubWF4SHAgPSBpbml0U3RhdGUubWF4SHAgPz8gZXh0cmFjdGVkU3RhdGUubWF4SHA7XHJcbiAgICBpbml0U3RhdGUubXAgPSBpbml0U3RhdGUubXAgPz8gZXh0cmFjdGVkU3RhdGUubXA7XHJcbiAgICBpbml0U3RhdGUubWF4TXAgPSBpbml0U3RhdGUubWF4TXAgPz8gZXh0cmFjdGVkU3RhdGUubWF4TXA7XHJcbiAgfVxyXG5cclxuICBleHRyYWN0U3RhdGVGcm9tTGluZShsaW5lOiBMaW5lRXZlbnRTb3VyY2UpOiBQYXJ0aWFsPENvbWJhdGFudFN0YXRlPiB7XHJcbiAgICBjb25zdCBzdGF0ZTogUGFydGlhbDxDb21iYXRhbnRTdGF0ZT4gPSB7fTtcclxuXHJcbiAgICBpZiAobGluZS54ICE9PSB1bmRlZmluZWQpXHJcbiAgICAgIHN0YXRlLnBvc1ggPSBsaW5lLng7XHJcbiAgICBpZiAobGluZS55ICE9PSB1bmRlZmluZWQpXHJcbiAgICAgIHN0YXRlLnBvc1kgPSBsaW5lLnk7XHJcbiAgICBpZiAobGluZS56ICE9PSB1bmRlZmluZWQpXHJcbiAgICAgIHN0YXRlLnBvc1ogPSBsaW5lLno7XHJcbiAgICBpZiAobGluZS5oZWFkaW5nICE9PSB1bmRlZmluZWQpXHJcbiAgICAgIHN0YXRlLmhlYWRpbmcgPSBsaW5lLmhlYWRpbmc7XHJcbiAgICBpZiAobGluZS50YXJnZXRhYmxlICE9PSB1bmRlZmluZWQpXHJcbiAgICAgIHN0YXRlLnRhcmdldGFibGUgPSBsaW5lLnRhcmdldGFibGU7XHJcbiAgICBpZiAobGluZS5ocCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICBzdGF0ZS5ocCA9IGxpbmUuaHA7XHJcbiAgICBpZiAobGluZS5tYXhIcCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICBzdGF0ZS5tYXhIcCA9IGxpbmUubWF4SHA7XHJcbiAgICBpZiAobGluZS5tcCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICBzdGF0ZS5tcCA9IGxpbmUubXA7XHJcbiAgICBpZiAobGluZS5tYXhNcCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICBzdGF0ZS5tYXhNcCA9IGxpbmUubWF4TXA7XHJcblxyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH1cclxuXHJcbiAgZXh0cmFjdFN0YXRlRnJvbVRhcmdldExpbmUobGluZTogTGluZUV2ZW50VGFyZ2V0KTogUGFydGlhbDxDb21iYXRhbnRTdGF0ZT4ge1xyXG4gICAgY29uc3Qgc3RhdGU6IFBhcnRpYWw8Q29tYmF0YW50U3RhdGU+ID0ge307XHJcblxyXG4gICAgaWYgKGxpbmUudGFyZ2V0WCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICBzdGF0ZS5wb3NYID0gbGluZS50YXJnZXRYO1xyXG4gICAgaWYgKGxpbmUudGFyZ2V0WSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICBzdGF0ZS5wb3NZID0gbGluZS50YXJnZXRZO1xyXG4gICAgaWYgKGxpbmUudGFyZ2V0WiAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICBzdGF0ZS5wb3NaID0gbGluZS50YXJnZXRaO1xyXG4gICAgaWYgKGxpbmUudGFyZ2V0SGVhZGluZyAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICBzdGF0ZS5oZWFkaW5nID0gbGluZS50YXJnZXRIZWFkaW5nO1xyXG4gICAgaWYgKGxpbmUudGFyZ2V0SHAgIT09IHVuZGVmaW5lZClcclxuICAgICAgc3RhdGUuaHAgPSBsaW5lLnRhcmdldEhwO1xyXG4gICAgaWYgKGxpbmUudGFyZ2V0TWF4SHAgIT09IHVuZGVmaW5lZClcclxuICAgICAgc3RhdGUubWF4SHAgPSBsaW5lLnRhcmdldE1heEhwO1xyXG4gICAgaWYgKGxpbmUudGFyZ2V0TXAgIT09IHVuZGVmaW5lZClcclxuICAgICAgc3RhdGUubXAgPSBsaW5lLnRhcmdldE1wO1xyXG4gICAgaWYgKGxpbmUudGFyZ2V0TWF4TXAgIT09IHVuZGVmaW5lZClcclxuICAgICAgc3RhdGUubWF4TXAgPSBsaW5lLnRhcmdldE1heE1wO1xyXG5cclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9XHJcblxyXG4gIGluaXRDb21iYXRhbnQoaWQ6IHN0cmluZywgbmFtZTogc3RyaW5nKTogQ29tYmF0YW50IHtcclxuICAgIGxldCBjb21iYXRhbnQgPSB0aGlzLmNvbWJhdGFudHNbaWRdO1xyXG4gICAgaWYgKGNvbWJhdGFudCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGNvbWJhdGFudCA9IHRoaXMuY29tYmF0YW50c1tpZF0gPSBuZXcgQ29tYmF0YW50KGlkLCBuYW1lKTtcclxuICAgICAgdGhpcy5vdGhlcnMucHVzaChpZCk7XHJcbiAgICAgIHRoaXMuaW5pdGlhbFN0YXRlc1tpZF0gPSB7XHJcbiAgICAgICAgdGFyZ2V0YWJsZTogdHJ1ZSxcclxuICAgICAgfTtcclxuICAgIH0gZWxzZSBpZiAoY29tYmF0YW50Lm5hbWUgPT09ICcnKSB7XHJcbiAgICAgIGNvbWJhdGFudC5zZXROYW1lKG5hbWUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvbWJhdGFudDtcclxuICB9XHJcblxyXG4gIGdldE1haW5Db21iYXRhbnROYW1lKCk6IHN0cmluZyB7XHJcbiAgICBpZiAodGhpcy5tYWluQ29tYmF0YW50SUQpXHJcbiAgICAgIHJldHVybiB0aGlzLmNvbWJhdGFudHNbdGhpcy5tYWluQ29tYmF0YW50SURdPy5uYW1lID8/ICdVbmtub3duJztcclxuICAgIHJldHVybiAnVW5rbm93bic7XHJcbiAgfVxyXG59XHJcbiIsImV4cG9ydCB0eXBlIENvbWJhdGFudCA9IHtcclxuICBuYW1lPzogc3RyaW5nO1xyXG4gIGpvYj86IHN0cmluZztcclxuICBzcGF3bjogbnVtYmVyO1xyXG4gIGRlc3Bhd246IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9nUmVwb3NpdG9yeSB7XHJcbiAgQ29tYmF0YW50czogeyBbaWQ6IHN0cmluZ106IENvbWJhdGFudCB9ID0ge307XHJcbiAgZmlyc3RUaW1lc3RhbXAgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcclxuXHJcbiAgdXBkYXRlVGltZXN0YW1wKHRpbWVzdGFtcDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLmZpcnN0VGltZXN0YW1wID0gTWF0aC5taW4odGhpcy5maXJzdFRpbWVzdGFtcCwgdGltZXN0YW1wKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZUNvbWJhdGFudChpZDogc3RyaW5nLCBjOiBDb21iYXRhbnQpOiB2b2lkIHtcclxuICAgIGlkID0gaWQudG9VcHBlckNhc2UoKTtcclxuICAgIGlmIChpZCAmJiBpZC5sZW5ndGgpIHtcclxuICAgICAgbGV0IGNvbWJhdGFudCA9IHRoaXMuQ29tYmF0YW50c1tpZF07XHJcbiAgICAgIGlmIChjb21iYXRhbnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGNvbWJhdGFudCA9IHtcclxuICAgICAgICAgIG5hbWU6IGMubmFtZSxcclxuICAgICAgICAgIGpvYjogYy5qb2IsXHJcbiAgICAgICAgICBzcGF3bjogYy5zcGF3bixcclxuICAgICAgICAgIGRlc3Bhd246IGMuZGVzcGF3bixcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuQ29tYmF0YW50c1tpZF0gPSBjb21iYXRhbnQ7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29tYmF0YW50Lm5hbWUgPSBjLm5hbWUgfHwgY29tYmF0YW50Lm5hbWU7XHJcbiAgICAgICAgY29tYmF0YW50LmpvYiA9IGMuam9iIHx8IGNvbWJhdGFudC5qb2I7XHJcbiAgICAgICAgY29tYmF0YW50LnNwYXduID0gTWF0aC5taW4oY29tYmF0YW50LnNwYXduLCBjLnNwYXduKTtcclxuICAgICAgICBjb21iYXRhbnQuZGVzcGF3biA9IE1hdGgubWF4KGNvbWJhdGFudC5kZXNwYXduLCBjLmRlc3Bhd24pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXNvbHZlTmFtZShcclxuICAgICAgaWQ6IHN0cmluZyxcclxuICAgICAgbmFtZTogc3RyaW5nLFxyXG4gICAgICBmYWxsYmFja0lkOiBzdHJpbmcgfCBudWxsID0gbnVsbCxcclxuICAgICAgZmFsbGJhY2tOYW1lOiBzdHJpbmcgfCBudWxsID0gbnVsbCk6IHN0cmluZyB7XHJcbiAgICBsZXQgcmV0ID0gbmFtZTtcclxuXHJcbiAgICBpZiAoZmFsbGJhY2tJZCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAoaWQgPT09ICdFMDAwMDAwMCcgJiYgcmV0ID09PSAnJykge1xyXG4gICAgICAgIGlmIChmYWxsYmFja0lkLnN0YXJ0c1dpdGgoJzQnKSlcclxuICAgICAgICAgIHJldCA9IGZhbGxiYWNrTmFtZSA/PyAnJztcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICByZXQgPSAnVW5rbm93bic7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAocmV0ID09PSAnJylcclxuICAgICAgcmV0ID0gdGhpcy5Db21iYXRhbnRzW2lkXT8ubmFtZSA/PyAnJztcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxufVxyXG4iLCIvLyBFdmVudEJ1cyBieSBkZWZpbml0aW9uIHJlcXVpcmVzIGdlbmVyaWMgcGFyYW1ldGVycy5cclxuLy8gTWFwIG91ciBzdGFuZC1pbiBnZW5lcmljcyB0byBhY3R1YWwgZ2VuZXJpY3MgaGVyZS5cclxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHlwZXNcclxudHlwZSBTY29wZSA9IG9iamVjdDtcclxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxudHlwZSBQYXJhbSA9IGFueTtcclxuXHJcbnR5cGUgQ2FsbGJhY2tGdW5jdGlvbiA9ICguLi5hcmdzOiBQYXJhbSkgPT4gdm9pZDtcclxudHlwZSBFdmVudE1hcEVudHJ5ID0ge1xyXG4gIGV2ZW50OiBzdHJpbmc7XHJcbiAgc2NvcGU6IFNjb3BlO1xyXG4gIGNhbGxiYWNrOiBDYWxsYmFja0Z1bmN0aW9uO1xyXG59O1xyXG50eXBlIEV2ZW50TWFwID0geyBbZXZlbnQ6IHN0cmluZ106IEV2ZW50TWFwRW50cnlbXSB9O1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgaXMgYSBiYXNlIGNsYXNzIHRoYXQgY2xhc3NlcyBjYW4gZXh0ZW5kIHRvIGluaGVyaXQgZXZlbnQgYnVzIGNhcGFiaWxpdGllcy5cclxuICogVGhpcyBhbGxvd3Mgb3RoZXIgY2xhc3NlcyB0byBsaXN0ZW4gZm9yIGV2ZW50cyB3aXRoIHRoZSBgb25gIGZ1bmN0aW9uLlxyXG4gKiBUaGUgaW5oZXJpdGluZyBjbGFzcyBjYW4gZmlyZSB0aG9zZSBldmVudHMgd2l0aCB0aGUgYGRpc3BhdGNoYCBmdW5jdGlvbi5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50QnVzIHtcclxuICBwcml2YXRlIGxpc3RlbmVyczogRXZlbnRNYXAgPSB7fTtcclxuICAvKipcclxuICAgKiBTdWJzY3JpYmUgdG8gYW4gZXZlbnRcclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQocykgdG8gc3Vic2NyaWJlIHRvLCBzcGFjZSBzZXBhcmF0ZWRcclxuICAgKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIGludm9rZVxyXG4gICAqIEBwYXJhbSBzY29wZSBPcHRpb25hbC4gVGhlIHNjb3BlIHRvIGFwcGx5IHRoZSBmdW5jdGlvbiBhZ2FpbnN0XHJcbiAgICogQHJldHVybnMgVGhlIGNhbGxiYWNrcyByZWdpc3RlcmVkIHRvIHRoZSBldmVudChzKVxyXG4gICAqL1xyXG4gIG9uKGV2ZW50OiBzdHJpbmcsIGNhbGxiYWNrPzogQ2FsbGJhY2tGdW5jdGlvbiwgc2NvcGU/OiBTY29wZSk6IEV2ZW50TWFwRW50cnlbXSB7XHJcbiAgICBjb25zdCBldmVudHMgPSBldmVudC5zcGxpdCgnICcpO1xyXG4gICAgY29uc3QgcmV0OiBFdmVudE1hcEVudHJ5W10gPSBbXTtcclxuICAgIHNjb3BlID0gc2NvcGUgPz8gKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8ge30gOiB3aW5kb3cpO1xyXG4gICAgZm9yIChjb25zdCBldmVudCBvZiBldmVudHMpIHtcclxuICAgICAgY29uc3QgZXZlbnRzOiBFdmVudE1hcEVudHJ5W10gPSB0aGlzLmxpc3RlbmVyc1tldmVudF0gPz89IFtdO1xyXG4gICAgICBpZiAoY2FsbGJhY2sgIT09IHVuZGVmaW5lZClcclxuICAgICAgICBldmVudHMucHVzaCh7IGV2ZW50OiBldmVudCwgc2NvcGU6IHNjb3BlLCBjYWxsYmFjazogY2FsbGJhY2sgfSk7XHJcbiAgICAgIHJldC5wdXNoKC4uLih0aGlzLmxpc3RlbmVyc1tldmVudF0gPz8gW10pKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwYXRjaCBhbiBldmVudCB0byBhbnkgc3Vic2NyaWJlcnNcclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgdG8gZGlzcGF0Y2hcclxuICAgKiBAcGFyYW0gZXZlbnRBcmd1bWVudHMgVGhlIGV2ZW50IGFyZ3VtZW50cyB0byBwYXNzIHRvIGxpc3RlbmVyc1xyXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IGNhbiBiZSBhd2FpdCdkIG9yIGlnbm9yZWRcclxuICAgKi9cclxuICBhc3luYyBkaXNwYXRjaChldmVudDogc3RyaW5nLCAuLi5ldmVudEFyZ3VtZW50czogUGFyYW0pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICh0aGlzLmxpc3RlbmVyc1tldmVudF0gPT09IHVuZGVmaW5lZClcclxuICAgICAgcmV0dXJuO1xyXG5cclxuICAgIGZvciAoY29uc3QgbCBvZiB0aGlzLmxpc3RlbmVyc1tldmVudF0gPz8gW10pIHtcclxuICAgICAgY29uc3QgcmVzID0gbC5jYWxsYmFjay5hcHBseShsLnNjb3BlLCBldmVudEFyZ3VtZW50cyk7XHJcbiAgICAgIGF3YWl0IFByb21pc2UucmVzb2x2ZShyZXMpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgTGluZUV2ZW50IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmNvbnN0IGZpZWxkcyA9IHtcclxuICB0eXBlOiAyLFxyXG4gIHNwZWFrZXI6IDMsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vLyBDaGF0IGV2ZW50XHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQweDAwIGV4dGVuZHMgTGluZUV2ZW50IHtcclxuICBwdWJsaWMgcmVhZG9ubHkgdHlwZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBzcGVha2VyOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1lc3NhZ2U6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IocmVwbzogTG9nUmVwb3NpdG9yeSwgbGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHN1cGVyKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuXHJcbiAgICB0aGlzLnR5cGUgPSBwYXJ0c1tmaWVsZHMudHlwZV0gPz8gJyc7XHJcbiAgICB0aGlzLnNwZWFrZXIgPSBwYXJ0c1tmaWVsZHMuc3BlYWtlcl0gPz8gJyc7XHJcbiAgICB0aGlzLm1lc3NhZ2UgPSBwYXJ0cy5zbGljZSg0LCAtMSkuam9pbignfCcpO1xyXG5cclxuICAgIC8vIFRoZSBleGFjdCByZWFzb24gZm9yIHRoaXMgY2hlY2sgaXNuJ3QgY2xlYXIgYW55bW9yZSBidXQgbWF5IGJlIHJlbGF0ZWQgdG9cclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9yYXZhaG4vRkZYSVZfQUNUX1BsdWdpbi9pc3N1ZXMvMjUwXHJcbiAgICBpZiAodGhpcy5tZXNzYWdlLnNwbGl0KCdcXHUwMDFmXFx1MDAxZicpLmxlbmd0aCA+IDEpXHJcbiAgICAgIHRoaXMuaW52YWxpZCA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5jb252ZXJ0ZWRMaW5lID1cclxuICAgICAgdGhpcy5wcmVmaXgoKSArIHRoaXMudHlwZSArICc6JyArXHJcbiAgICAgICAgLy8gSWYgc3BlYWtlciBpcyBibGFuaywgaXQncyBleGNsdWRlZCBmcm9tIHRoZSBjb252ZXJ0ZWQgbGluZVxyXG4gICAgICAgICh0aGlzLnNwZWFrZXIgIT09ICcnID8gdGhpcy5zcGVha2VyICsgJzonIDogJycpICtcclxuICAgICAgICB0aGlzLm1lc3NhZ2UudHJpbSgpO1xyXG4gICAgdGhpcy5jb252ZXJ0ZWRMaW5lID0gTGluZUV2ZW50MDAucmVwbGFjZUNoYXRTeW1ib2xzKHRoaXMuY29udmVydGVkTGluZSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgcmVwbGFjZUNoYXRTeW1ib2xzKGxpbmU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBmb3IgKGNvbnN0IHJlcCBvZiBMaW5lRXZlbnQwMC5jaGF0U3ltYm9sUmVwbGFjZW1lbnRzKVxyXG4gICAgICBsaW5lID0gbGluZS5yZXBsYWNlKHJlcC5TZWFyY2gsIHJlcC5SZXBsYWNlKTtcclxuXHJcbiAgICByZXR1cm4gbGluZTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBjaGF0U3ltYm9sUmVwbGFjZW1lbnRzID0gW1xyXG4gICAge1xyXG4gICAgICBTZWFyY2g6IC86XFx1RTA2Ri9nLFxyXG4gICAgICBSZXBsYWNlOiAnOuKHkicsXHJcbiAgICAgIFR5cGU6ICdTeW1ib2wnLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgU2VhcmNoOiAvIFxcdUUwQkJcXHVFMDVDL2csXHJcbiAgICAgIFJlcGxhY2U6ICcgJyxcclxuICAgICAgVHlwZTogJ1Bvc2l0aXZlIEVmZmVjdCcsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBTZWFyY2g6IC8gXFx1RTBCQlxcdUUwNUIvZyxcclxuICAgICAgUmVwbGFjZTogJyAnLFxyXG4gICAgICBUeXBlOiAnTmVnYXRpdmUgRWZmZWN0JyxcclxuICAgIH0sXHJcbiAgXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDAwIGV4dGVuZHMgTGluZUV2ZW50MHgwMCB7fVxyXG4iLCJpbXBvcnQgTGluZUV2ZW50IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IEVtdWxhdG9yQ29tbW9uIGZyb20gJy4uLy4uL0VtdWxhdG9yQ29tbW9uJztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmNvbnN0IGZpZWxkcyA9IHtcclxuICB6b25lSWQ6IDIsXHJcbiAgem9uZU5hbWU6IDMsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vLyBab25lIGNoYW5nZSBldmVudFxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MHgwMSBleHRlbmRzIExpbmVFdmVudCB7XHJcbiAgcHVibGljIHJlYWRvbmx5IHByb3BlckNhc2VDb252ZXJ0ZWRMaW5lOiBzdHJpbmc7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSB6b25lSWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgem9uZU5hbWU6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgem9uZU5hbWVQcm9wZXJDYXNlOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJlcG86IExvZ1JlcG9zaXRvcnksIG5ldHdvcmtMaW5lOiBzdHJpbmcsIHBhcnRzOiBzdHJpbmdbXSkge1xyXG4gICAgc3VwZXIocmVwbywgbmV0d29ya0xpbmUsIHBhcnRzKTtcclxuXHJcbiAgICB0aGlzLnpvbmVJZCA9IHBhcnRzW2ZpZWxkcy56b25lSWRdID8/ICcnO1xyXG4gICAgdGhpcy56b25lTmFtZSA9IHBhcnRzW2ZpZWxkcy56b25lTmFtZV0gPz8gJyc7XHJcbiAgICB0aGlzLnpvbmVOYW1lUHJvcGVyQ2FzZSA9IEVtdWxhdG9yQ29tbW9uLnByb3BlckNhc2UodGhpcy56b25lTmFtZSk7XHJcblxyXG4gICAgdGhpcy5jb252ZXJ0ZWRMaW5lID0gdGhpcy5wcmVmaXgoKSArXHJcbiAgICAgICdDaGFuZ2VkIFpvbmUgdG8gJyArIHRoaXMuem9uZU5hbWUgKyAnLic7XHJcbiAgICB0aGlzLnByb3BlckNhc2VDb252ZXJ0ZWRMaW5lID0gdGhpcy5wcmVmaXgoKSArXHJcbiAgICAgICdDaGFuZ2VkIFpvbmUgdG8gJyArIHRoaXMuem9uZU5hbWVQcm9wZXJDYXNlICsgJy4nO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDAxIGV4dGVuZHMgTGluZUV2ZW50MHgwMSB7fVxyXG4iLCJpbXBvcnQgTGluZUV2ZW50IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmNvbnN0IGZpZWxkcyA9IHtcclxuICBpZDogMixcclxuICBuYW1lOiAzLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gUGxheWVyIGNoYW5nZSBldmVudFxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MHgwMiBleHRlbmRzIExpbmVFdmVudCB7XHJcbiAgcHVibGljIHJlYWRvbmx5IGlkOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IocmVwbzogTG9nUmVwb3NpdG9yeSwgbGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHN1cGVyKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gcGFydHNbZmllbGRzLmlkXT8udG9VcHBlckNhc2UoKSA/PyAnJztcclxuICAgIHRoaXMubmFtZSA9IHBhcnRzW2ZpZWxkcy5uYW1lXSA/PyAnJztcclxuXHJcbiAgICB0aGlzLmNvbnZlcnRlZExpbmUgPSB0aGlzLnByZWZpeCgpICsgJ0NoYW5nZWQgcHJpbWFyeSBwbGF5ZXIgdG8gJyArIHRoaXMubmFtZSArICcuJztcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQwMiBleHRlbmRzIExpbmVFdmVudDB4MDIge31cclxuIiwiaW1wb3J0IHsgSm9iLCBSb2xlIH0gZnJvbSAnLi4vdHlwZXMvam9iJztcclxuXHJcbi8vIFRPRE86IGl0J2QgYmUgbmljZSB0byBub3QgcmVwZWF0IGpvYiBuYW1lcywgYnV0IGF0IGxlYXN0IFJlY29yZCBlbmZvcmNlcyB0aGF0IGFsbCBhcmUgc2V0LlxyXG5jb25zdCBuYW1lVG9Kb2JFbnVtOiBSZWNvcmQ8Sm9iLCBudW1iZXI+ID0ge1xyXG4gIE5PTkU6IDAsXHJcbiAgR0xBOiAxLFxyXG4gIFBHTDogMixcclxuICBNUkQ6IDMsXHJcbiAgTE5DOiA0LFxyXG4gIEFSQzogNSxcclxuICBDTko6IDYsXHJcbiAgVEhNOiA3LFxyXG4gIENSUDogOCxcclxuICBCU006IDksXHJcbiAgQVJNOiAxMCxcclxuICBHU006IDExLFxyXG4gIExUVzogMTIsXHJcbiAgV1ZSOiAxMyxcclxuICBBTEM6IDE0LFxyXG4gIENVTDogMTUsXHJcbiAgTUlOOiAxNixcclxuICBCVE46IDE3LFxyXG4gIEZTSDogMTgsXHJcbiAgUExEOiAxOSxcclxuICBNTks6IDIwLFxyXG4gIFdBUjogMjEsXHJcbiAgRFJHOiAyMixcclxuICBCUkQ6IDIzLFxyXG4gIFdITTogMjQsXHJcbiAgQkxNOiAyNSxcclxuICBBQ046IDI2LFxyXG4gIFNNTjogMjcsXHJcbiAgU0NIOiAyOCxcclxuICBST0c6IDI5LFxyXG4gIE5JTjogMzAsXHJcbiAgTUNIOiAzMSxcclxuICBEUks6IDMyLFxyXG4gIEFTVDogMzMsXHJcbiAgU0FNOiAzNCxcclxuICBSRE06IDM1LFxyXG4gIEJMVTogMzYsXHJcbiAgR05COiAzNyxcclxuICBETkM6IDM4LFxyXG59O1xyXG5cclxuY29uc3QgYWxsSm9icyA9IE9iamVjdC5rZXlzKG5hbWVUb0pvYkVudW0pIGFzIEpvYltdO1xyXG5jb25zdCBhbGxSb2xlcyA9IFsndGFuaycsICdoZWFsZXInLCAnZHBzJywgJ2NyYWZ0ZXInLCAnZ2F0aGVyZXInLCAnbm9uZSddIGFzIFJvbGVbXTtcclxuXHJcbmNvbnN0IHRhbmtKb2JzOiBKb2JbXSA9IFsnR0xBJywgJ1BMRCcsICdNUkQnLCAnV0FSJywgJ0RSSycsICdHTkInXTtcclxuY29uc3QgaGVhbGVySm9iczogSm9iW10gPSBbJ0NOSicsICdXSE0nLCAnU0NIJywgJ0FTVCddO1xyXG5jb25zdCBtZWxlZURwc0pvYnM6IEpvYltdID0gWydQR0wnLCAnTU5LJywgJ0xOQycsICdEUkcnLCAnUk9HJywgJ05JTicsICdTQU0nXTtcclxuY29uc3QgcmFuZ2VkRHBzSm9iczogSm9iW10gPSBbJ0FSQycsICdCUkQnLCAnRE5DJywgJ01DSCddO1xyXG5jb25zdCBjYXN0ZXJEcHNKb2JzOiBKb2JbXSA9IFsnQkxVJywgJ1JETScsICdCTE0nLCAnU01OJywgJ0FDTicsICdUSE0nXTtcclxuY29uc3QgZHBzSm9iczogSm9iW10gPSBbLi4ubWVsZWVEcHNKb2JzLCAuLi5yYW5nZWREcHNKb2JzLCAuLi5jYXN0ZXJEcHNKb2JzXTtcclxuY29uc3QgY3JhZnRpbmdKb2JzOiBKb2JbXSA9IFsnQ1JQJywgJ0JTTScsICdBUk0nLCAnR1NNJywgJ0xUVycsICdXVlInLCAnQUxDJywgJ0NVTCddO1xyXG5jb25zdCBnYXRoZXJpbmdKb2JzOiBKb2JbXSA9IFsnTUlOJywgJ0JUTicsICdGU0gnXTtcclxuXHJcbmNvbnN0IHN0dW5Kb2JzOiBKb2JbXSA9IFsnQkxVJywgLi4udGFua0pvYnMsIC4uLm1lbGVlRHBzSm9ic107XHJcbmNvbnN0IHNpbGVuY2VKb2JzOiBKb2JbXSA9IFsnQkxVJywgLi4udGFua0pvYnMsIC4uLnJhbmdlZERwc0pvYnNdO1xyXG5jb25zdCBzbGVlcEpvYnM6IEpvYltdID0gWydCTE0nLCAnQkxVJywgLi4uaGVhbGVySm9ic107XHJcbmNvbnN0IGZlaW50Sm9iczogSm9iW10gPSBbLi4ubWVsZWVEcHNKb2JzXTtcclxuY29uc3QgYWRkbGVKb2JzOiBKb2JbXSA9IFsuLi5jYXN0ZXJEcHNKb2JzXTtcclxuY29uc3QgY2xlYW5zZUpvYnM6IEpvYltdID0gWydCTFUnLCAnQlJEJywgLi4uaGVhbGVySm9ic107XHJcblxyXG5jb25zdCBqb2JUb1JvbGVNYXA6IE1hcDxKb2IsIFJvbGU+ID0gKCgpID0+IHtcclxuICBjb25zdCBhZGRUb01hcCA9IChtYXA6IE1hcDxKb2IsIFJvbGU+LCBqb2JzOiBKb2JbXSwgcm9sZTogUm9sZSkgPT4ge1xyXG4gICAgam9icy5mb3JFYWNoKChqb2IpID0+IG1hcC5zZXQoam9iLCByb2xlKSk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbWFwOiBNYXA8Sm9iLCBSb2xlPiA9IG5ldyBNYXAoW1snTk9ORScsICdub25lJ11dKTtcclxuICBhZGRUb01hcChtYXAsIHRhbmtKb2JzLCAndGFuaycpO1xyXG4gIGFkZFRvTWFwKG1hcCwgaGVhbGVySm9icywgJ2hlYWxlcicpO1xyXG4gIGFkZFRvTWFwKG1hcCwgZHBzSm9icywgJ2RwcycpO1xyXG4gIGFkZFRvTWFwKG1hcCwgY3JhZnRpbmdKb2JzLCAnY3JhZnRlcicpO1xyXG4gIGFkZFRvTWFwKG1hcCwgZ2F0aGVyaW5nSm9icywgJ2dhdGhlcmVyJyk7XHJcblxyXG4gIHJldHVybiBtYXA7XHJcbn0pKCk7XHJcblxyXG5jb25zdCBVdGlsID0ge1xyXG4gIGpvYkVudW1Ub0pvYjogKGlkOiBudW1iZXIpID0+IHtcclxuICAgIGNvbnN0IGpvYiA9IGFsbEpvYnMuZmluZCgoam9iOiBKb2IpID0+IG5hbWVUb0pvYkVudW1bam9iXSA9PT0gaWQpO1xyXG4gICAgcmV0dXJuIGpvYiA/PyAnTk9ORSc7XHJcbiAgfSxcclxuICBqb2JUb0pvYkVudW06IChqb2I6IEpvYikgPT4gbmFtZVRvSm9iRW51bVtqb2JdLFxyXG4gIGpvYlRvUm9sZTogKGpvYjogSm9iKSA9PiB7XHJcbiAgICBjb25zdCByb2xlID0gam9iVG9Sb2xlTWFwLmdldChqb2IpO1xyXG4gICAgcmV0dXJuIHJvbGUgPz8gJ25vbmUnO1xyXG4gIH0sXHJcbiAgZ2V0QWxsUm9sZXM6ICgpOiByZWFkb25seSBSb2xlW10gPT4gYWxsUm9sZXMsXHJcbiAgaXNUYW5rSm9iOiAoam9iOiBKb2IpID0+IHRhbmtKb2JzLmluY2x1ZGVzKGpvYiksXHJcbiAgaXNIZWFsZXJKb2I6IChqb2I6IEpvYikgPT4gaGVhbGVySm9icy5pbmNsdWRlcyhqb2IpLFxyXG4gIGlzTWVsZWVEcHNKb2I6IChqb2I6IEpvYikgPT4gbWVsZWVEcHNKb2JzLmluY2x1ZGVzKGpvYiksXHJcbiAgaXNSYW5nZWREcHNKb2I6IChqb2I6IEpvYikgPT4gcmFuZ2VkRHBzSm9icy5pbmNsdWRlcyhqb2IpLFxyXG4gIGlzQ2FzdGVyRHBzSm9iOiAoam9iOiBKb2IpID0+IGNhc3RlckRwc0pvYnMuaW5jbHVkZXMoam9iKSxcclxuICBpc0Rwc0pvYjogKGpvYjogSm9iKSA9PiBkcHNKb2JzLmluY2x1ZGVzKGpvYiksXHJcbiAgaXNDcmFmdGluZ0pvYjogKGpvYjogSm9iKSA9PiBjcmFmdGluZ0pvYnMuaW5jbHVkZXMoam9iKSxcclxuICBpc0dhdGhlcmluZ0pvYjogKGpvYjogSm9iKSA9PiBnYXRoZXJpbmdKb2JzLmluY2x1ZGVzKGpvYiksXHJcbiAgaXNDb21iYXRKb2I6IChqb2I6IEpvYikgPT4ge1xyXG4gICAgcmV0dXJuICFjcmFmdGluZ0pvYnMuaW5jbHVkZXMoam9iKSAmJiAhZ2F0aGVyaW5nSm9icy5pbmNsdWRlcyhqb2IpO1xyXG4gIH0sXHJcbiAgY2FuU3R1bjogKGpvYjogSm9iKSA9PiBzdHVuSm9icy5pbmNsdWRlcyhqb2IpLFxyXG4gIGNhblNpbGVuY2U6IChqb2I6IEpvYikgPT4gc2lsZW5jZUpvYnMuaW5jbHVkZXMoam9iKSxcclxuICBjYW5TbGVlcDogKGpvYjogSm9iKSA9PiBzbGVlcEpvYnMuaW5jbHVkZXMoam9iKSxcclxuICBjYW5DbGVhbnNlOiAoam9iOiBKb2IpID0+IGNsZWFuc2VKb2JzLmluY2x1ZGVzKGpvYiksXHJcbiAgY2FuRmVpbnQ6IChqb2I6IEpvYikgPT4gZmVpbnRKb2JzLmluY2x1ZGVzKGpvYiksXHJcbiAgY2FuQWRkbGU6IChqb2I6IEpvYikgPT4gYWRkbGVKb2JzLmluY2x1ZGVzKGpvYiksXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBVdGlsO1xyXG4iLCJpbXBvcnQgTGluZUV2ZW50LCB7IExpbmVFdmVudEpvYkxldmVsLCBMaW5lRXZlbnRTb3VyY2UgfSBmcm9tICcuL0xpbmVFdmVudCc7XHJcbmltcG9ydCBFbXVsYXRvckNvbW1vbiBmcm9tICcuLi8uLi9FbXVsYXRvckNvbW1vbic7XHJcbmltcG9ydCBVdGlsIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy91dGlsJztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmNvbnN0IGZpZWxkcyA9IHtcclxuICBpZDogMixcclxuICBuYW1lOiAzLFxyXG4gIGpvYklkSGV4OiA0LFxyXG4gIGxldmVsU3RyaW5nOiA1LFxyXG4gIG93bmVySWQ6IDYsXHJcbiAgd29ybGRJZDogNyxcclxuICB3b3JsZE5hbWU6IDgsXHJcbiAgbnBjTmFtZUlkOiA5LFxyXG4gIG5wY0Jhc2VJZDogMTAsXHJcbiAgY3VycmVudEhwOiAxMSxcclxuICBtYXhIcFN0cmluZzogMTQsXHJcbiAgY3VycmVudE1wOiAxMyxcclxuICBtYXhNcFN0cmluZzogMTQsXHJcbiAgY3VycmVudFRwOiAxNSxcclxuICBtYXhUcDogMTYsXHJcbiAgeFN0cmluZzogMTcsXHJcbiAgeVN0cmluZzogMTgsXHJcbiAgelN0cmluZzogMTksXHJcbiAgaGVhZGluZzogMjAsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vLyBBZGRlZCBjb21iYXRhbnQgZXZlbnRcclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDB4MDMgZXh0ZW5kcyBMaW5lRXZlbnQgaW1wbGVtZW50cyBMaW5lRXZlbnRTb3VyY2UsIExpbmVFdmVudEpvYkxldmVsIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBqb2JJZEhleDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBqb2JJZDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBqb2I6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbGV2ZWxTdHJpbmc6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbGV2ZWw6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgb3duZXJJZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB3b3JsZElkOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHdvcmxkTmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBucGNOYW1lSWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbnBjQmFzZUlkOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGhwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1heEhwU3RyaW5nOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1heEhwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1wOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1heE1wU3RyaW5nOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1heE1wOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1heFRwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHhTdHJpbmc6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB5U3RyaW5nOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHk6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgelN0cmluZzogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB6OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGhlYWRpbmc6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNTb3VyY2UgPSB0cnVlO1xyXG4gIHB1YmxpYyByZWFkb25seSBpc0pvYkxldmVsID0gdHJ1ZTtcclxuXHJcbiAgY29uc3RydWN0b3IocmVwbzogTG9nUmVwb3NpdG9yeSwgbGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHN1cGVyKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gcGFydHNbZmllbGRzLmlkXT8udG9VcHBlckNhc2UoKSA/PyAnJztcclxuICAgIHRoaXMubmFtZSA9IHBhcnRzW2ZpZWxkcy5uYW1lXSA/PyAnJztcclxuICAgIHRoaXMuam9iSWRIZXggPSBwYXJ0c1tmaWVsZHMuam9iSWRIZXhdPy50b1VwcGVyQ2FzZSgpID8/ICcnO1xyXG4gICAgdGhpcy5qb2JJZCA9IHBhcnNlSW50KHRoaXMuam9iSWRIZXgsIDE2KTtcclxuICAgIHRoaXMuam9iID0gVXRpbC5qb2JFbnVtVG9Kb2IodGhpcy5qb2JJZCk7XHJcbiAgICB0aGlzLmxldmVsU3RyaW5nID0gcGFydHNbZmllbGRzLmxldmVsU3RyaW5nXSA/PyAnJztcclxuICAgIHRoaXMubGV2ZWwgPSBwYXJzZUZsb2F0KHRoaXMubGV2ZWxTdHJpbmcpO1xyXG4gICAgdGhpcy5vd25lcklkID0gcGFydHNbZmllbGRzLm93bmVySWRdPy50b1VwcGVyQ2FzZSgpID8/ICcnO1xyXG4gICAgdGhpcy53b3JsZElkID0gcGFydHNbZmllbGRzLndvcmxkSWRdID8/ICcnO1xyXG4gICAgdGhpcy53b3JsZE5hbWUgPSBwYXJ0c1tmaWVsZHMud29ybGROYW1lXSA/PyAnJztcclxuICAgIHRoaXMubnBjTmFtZUlkID0gcGFydHNbZmllbGRzLm5wY05hbWVJZF0gPz8gJyc7XHJcbiAgICB0aGlzLm5wY0Jhc2VJZCA9IHBhcnRzW2ZpZWxkcy5ucGNCYXNlSWRdID8/ICcnO1xyXG4gICAgdGhpcy5ocCA9IHBhcnNlRmxvYXQocGFydHNbZmllbGRzLmN1cnJlbnRIcF0gPz8gJycpO1xyXG4gICAgdGhpcy5tYXhIcFN0cmluZyA9IHBhcnRzW2ZpZWxkcy5tYXhIcFN0cmluZ10gPz8gJyc7XHJcbiAgICB0aGlzLm1heEhwID0gcGFyc2VGbG9hdCh0aGlzLm1heEhwU3RyaW5nKTtcclxuICAgIHRoaXMubXAgPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy5jdXJyZW50TXBdID8/ICcnKTtcclxuICAgIHRoaXMubWF4TXBTdHJpbmcgPSBwYXJ0c1tmaWVsZHMubWF4TXBTdHJpbmddID8/ICcnO1xyXG4gICAgdGhpcy5tYXhNcCA9IHBhcnNlRmxvYXQodGhpcy5tYXhNcFN0cmluZyk7XHJcbiAgICB0aGlzLnRwID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMuY3VycmVudFRwXSA/PyAnJyk7XHJcbiAgICB0aGlzLm1heFRwID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMubWF4VHBdID8/ICcnKTtcclxuICAgIHRoaXMueFN0cmluZyA9IHBhcnRzW2ZpZWxkcy54U3RyaW5nXSA/PyAnJztcclxuICAgIHRoaXMueCA9IHBhcnNlRmxvYXQodGhpcy54U3RyaW5nKTtcclxuICAgIHRoaXMueVN0cmluZyA9IHBhcnRzW2ZpZWxkcy55U3RyaW5nXSA/PyAnJztcclxuICAgIHRoaXMueSA9IHBhcnNlRmxvYXQodGhpcy55U3RyaW5nKTtcclxuICAgIHRoaXMuelN0cmluZyA9IHBhcnRzW2ZpZWxkcy56U3RyaW5nXSA/PyAnJztcclxuICAgIHRoaXMueiA9IHBhcnNlRmxvYXQodGhpcy56U3RyaW5nKTtcclxuICAgIHRoaXMuaGVhZGluZyA9IHBhcnNlRmxvYXQocGFydHNbZmllbGRzLmhlYWRpbmddID8/ICcnKTtcclxuXHJcbiAgICByZXBvLnVwZGF0ZUNvbWJhdGFudCh0aGlzLmlkLCB7XHJcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgc3Bhd246IHRoaXMudGltZXN0YW1wLFxyXG4gICAgICBkZXNwYXduOiB0aGlzLnRpbWVzdGFtcCxcclxuICAgICAgam9iOiB0aGlzLmpvYklkSGV4LFxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IGNvbWJhdGFudE5hbWUgPSB0aGlzLm5hbWU7XHJcbiAgICBpZiAodGhpcy53b3JsZE5hbWUgIT09ICcnKVxyXG4gICAgICBjb21iYXRhbnROYW1lID0gY29tYmF0YW50TmFtZSArICcoJyArIHRoaXMud29ybGROYW1lICsgJyknO1xyXG5cclxuICAgIHRoaXMuY29udmVydGVkTGluZSA9IHRoaXMucHJlZml4KCkgKyB0aGlzLmlkLnRvVXBwZXJDYXNlKCkgK1xyXG4gICAgICAnOkFkZGVkIG5ldyBjb21iYXRhbnQgJyArIGNvbWJhdGFudE5hbWUgK1xyXG4gICAgICAnLiAgSm9iOiAnICsgdGhpcy5qb2IgK1xyXG4gICAgICAnIExldmVsOiAnICsgdGhpcy5sZXZlbFN0cmluZyArXHJcbiAgICAgICcgTWF4IEhQOiAnICsgdGhpcy5tYXhIcFN0cmluZyArXHJcbiAgICAgICcgTWF4IE1QOiAnICsgdGhpcy5tYXhNcFN0cmluZyArXHJcbiAgICAgICcgUG9zOiAoJyArIHRoaXMueFN0cmluZyArICcsJyArIHRoaXMueVN0cmluZyArICcsJyArIHRoaXMuelN0cmluZyArICcpJztcclxuXHJcbiAgICAvLyBUaGlzIGxhc3QgcGFydCBpcyBndWVzc3dvcmsgZm9yIHRoZSBhcmVhIGJldHdlZW4gOSBhbmQgMTAuXHJcbiAgICBjb25zdCB1bmtub3duVmFsdWUgPSB0aGlzLm5wY05hbWVJZCArXHJcbiAgICAgIEVtdWxhdG9yQ29tbW9uLnplcm9QYWQodGhpcy5ucGNCYXNlSWQsIDggKyBNYXRoLm1heCgwLCA2IC0gdGhpcy5ucGNOYW1lSWQubGVuZ3RoKSk7XHJcblxyXG4gICAgaWYgKHVua25vd25WYWx1ZSAhPT0gJzAwMDAwMDAwMDAwMDAwJylcclxuICAgICAgdGhpcy5jb252ZXJ0ZWRMaW5lICs9ICcgKCcgKyB1bmtub3duVmFsdWUgKyAnKSc7XHJcblxyXG4gICAgdGhpcy5jb252ZXJ0ZWRMaW5lICs9ICcuJztcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQwMyBleHRlbmRzIExpbmVFdmVudDB4MDMgeyB9XHJcbiIsImltcG9ydCB7IExpbmVFdmVudDB4MDMgfSBmcm9tICcuL0xpbmVFdmVudDB4MDMnO1xyXG5pbXBvcnQgTG9nUmVwb3NpdG9yeSBmcm9tICcuL0xvZ1JlcG9zaXRvcnknO1xyXG5cclxuLy8gUmVtb3ZlZCBjb21iYXRhbnQgZXZlbnRcclxuLy8gRXh0ZW5kIHRoZSBhZGQgY29tYmF0YW50IGV2ZW50IHRvIHJlZHVjZSBkdXBsaWNhdGUgY29kZSBzaW5jZSB0aGV5J3JlXHJcbi8vIHRoZSBzYW1lIGZyb20gYSBkYXRhIHBlcnNwZWN0aXZlXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQweDA0IGV4dGVuZHMgTGluZUV2ZW50MHgwMyB7XHJcbiAgY29uc3RydWN0b3IocmVwbzogTG9nUmVwb3NpdG9yeSwgbGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHN1cGVyKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuXHJcbiAgICB0aGlzLmNvbnZlcnRlZExpbmUgPSB0aGlzLnByZWZpeCgpICsgdGhpcy5pZC50b1VwcGVyQ2FzZSgpICtcclxuICAgICAgJzpSZW1vdmluZyBjb21iYXRhbnQgJyArIHRoaXMubmFtZSArXHJcbiAgICAgICcuIE1heCBNUDogJyArIHRoaXMubWF4TXBTdHJpbmcgK1xyXG4gICAgICAnLiBQb3M6ICgnICsgdGhpcy54U3RyaW5nICsgJywnICsgdGhpcy55U3RyaW5nICsgJywnICsgdGhpcy56U3RyaW5nICsgJyknO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDA0IGV4dGVuZHMgTGluZUV2ZW50MHgwNCB7IH1cclxuIiwiaW1wb3J0IExpbmVFdmVudCBmcm9tICcuL0xpbmVFdmVudCc7XHJcbmltcG9ydCBMb2dSZXBvc2l0b3J5IGZyb20gJy4vTG9nUmVwb3NpdG9yeSc7XHJcblxyXG5jb25zdCBmaWVsZHMgPSB7XHJcbiAgY2xhc3M6IDIsXHJcbiAgc3RyZW5ndGg6IDMsXHJcbiAgZGV4dGVyaXR5OiA0LFxyXG4gIHZpdGFsaXR5OiA1LFxyXG4gIGludGVsbGlnZW5jZTogNixcclxuICBtaW5kOiA3LFxyXG4gIHBpZXR5OiA4LFxyXG4gIGF0dGFja1Bvd2VyOiA5LFxyXG4gIGRpcmVjdEhpdDogMTAsXHJcbiAgY3JpdGljYWxIaXQ6IDExLFxyXG4gIGF0dGFja01hZ2ljUG90ZW5jeTogMTIsXHJcbiAgaGVhbE1hZ2ljUG90ZW5jeTogMTMsXHJcbiAgZGV0ZXJtaW5hdGlvbjogMTQsXHJcbiAgc2tpbGxTcGVlZDogMTUsXHJcbiAgc3BlbGxTcGVlZDogMTYsXHJcbiAgdGVuYWNpdHk6IDE4LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gUGxheWVyIHN0YXRzIGV2ZW50XHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQweDBDIGV4dGVuZHMgTGluZUV2ZW50IHtcclxuICBwdWJsaWMgcmVhZG9ubHkgY2xhc3M6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgc3RyZW5ndGg6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgZGV4dGVyaXR5OiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHZpdGFsaXR5OiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGludGVsbGlnZW5jZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBtaW5kOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHBpZXR5OiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGF0dGFja1Bvd2VyOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGRpcmVjdEhpdDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBjcml0aWNhbEhpdDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBhdHRhY2tNYWdpY1BvdGVuY3k6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgaGVhbE1hZ2ljUG90ZW5jeTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBkZXRlcm1pbmF0aW9uOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHNraWxsU3BlZWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgc3BlbGxTcGVlZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB0ZW5hY2l0eTogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihyZXBvOiBMb2dSZXBvc2l0b3J5LCBsaW5lOiBzdHJpbmcsIHBhcnRzOiBzdHJpbmdbXSkge1xyXG4gICAgc3VwZXIocmVwbywgbGluZSwgcGFydHMpO1xyXG5cclxuICAgIHRoaXMuY2xhc3MgPSBwYXJ0c1tmaWVsZHMuY2xhc3NdID8/ICcnO1xyXG4gICAgdGhpcy5zdHJlbmd0aCA9IHBhcnRzW2ZpZWxkcy5zdHJlbmd0aF0gPz8gJyc7XHJcbiAgICB0aGlzLmRleHRlcml0eSA9IHBhcnRzW2ZpZWxkcy5kZXh0ZXJpdHldID8/ICcnO1xyXG4gICAgdGhpcy52aXRhbGl0eSA9IHBhcnRzW2ZpZWxkcy52aXRhbGl0eV0gPz8gJyc7XHJcbiAgICB0aGlzLmludGVsbGlnZW5jZSA9IHBhcnRzW2ZpZWxkcy5pbnRlbGxpZ2VuY2VdID8/ICcnO1xyXG4gICAgdGhpcy5taW5kID0gcGFydHNbZmllbGRzLm1pbmRdID8/ICcnO1xyXG4gICAgdGhpcy5waWV0eSA9IHBhcnRzW2ZpZWxkcy5waWV0eV0gPz8gJyc7XHJcbiAgICB0aGlzLmF0dGFja1Bvd2VyID0gcGFydHNbZmllbGRzLmF0dGFja1Bvd2VyXSA/PyAnJztcclxuICAgIHRoaXMuZGlyZWN0SGl0ID0gcGFydHNbZmllbGRzLmRpcmVjdEhpdF0gPz8gJyc7XHJcbiAgICB0aGlzLmNyaXRpY2FsSGl0ID0gcGFydHNbZmllbGRzLmNyaXRpY2FsSGl0XSA/PyAnJztcclxuICAgIHRoaXMuYXR0YWNrTWFnaWNQb3RlbmN5ID0gcGFydHNbZmllbGRzLmF0dGFja01hZ2ljUG90ZW5jeV0gPz8gJyc7XHJcbiAgICB0aGlzLmhlYWxNYWdpY1BvdGVuY3kgPSBwYXJ0c1tmaWVsZHMuaGVhbE1hZ2ljUG90ZW5jeV0gPz8gJyc7XHJcbiAgICB0aGlzLmRldGVybWluYXRpb24gPSBwYXJ0c1tmaWVsZHMuZGV0ZXJtaW5hdGlvbl0gPz8gJyc7XHJcbiAgICB0aGlzLnNraWxsU3BlZWQgPSBwYXJ0c1tmaWVsZHMuc2tpbGxTcGVlZF0gPz8gJyc7XHJcbiAgICB0aGlzLnNwZWxsU3BlZWQgPSBwYXJ0c1tmaWVsZHMuc3BlbGxTcGVlZF0gPz8gJyc7XHJcbiAgICB0aGlzLnRlbmFjaXR5ID0gcGFydHNbZmllbGRzLnRlbmFjaXR5XSA/PyAnJztcclxuXHJcbiAgICB0aGlzLmNvbnZlcnRlZExpbmUgPSB0aGlzLnByZWZpeCgpICtcclxuICAgICAgJ1BsYXllciBTdGF0czogJyArIHBhcnRzLnNsaWNlKDIsIHBhcnRzLmxlbmd0aCAtIDEpLmpvaW4oJzonKS5yZXBsYWNlKC9cXHwvZywgJzonKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQxMiBleHRlbmRzIExpbmVFdmVudDB4MEMgeyB9XHJcbiIsImltcG9ydCBMaW5lRXZlbnQsIHsgTGluZUV2ZW50QWJpbGl0eSwgTGluZUV2ZW50U291cmNlLCBMaW5lRXZlbnRUYXJnZXQgfSBmcm9tICcuL0xpbmVFdmVudCc7XHJcbmltcG9ydCBFbXVsYXRvckNvbW1vbiBmcm9tICcuLi8uLi9FbXVsYXRvckNvbW1vbic7XHJcbmltcG9ydCBMb2dSZXBvc2l0b3J5IGZyb20gJy4vTG9nUmVwb3NpdG9yeSc7XHJcblxyXG5jb25zdCBmaWVsZHMgPSB7XHJcbiAgaWQ6IDIsXHJcbiAgbmFtZTogMyxcclxuICBhYmlsaXR5SWQ6IDQsXHJcbiAgYWJpbGl0eU5hbWU6IDUsXHJcbiAgdGFyZ2V0SWQ6IDYsXHJcbiAgdGFyZ2V0TmFtZTogNyxcclxuICBkdXJhdGlvbjogOCxcclxufSBhcyBjb25zdDtcclxuXHJcbi8vIEFiaWxpdHkgdXNlIGV2ZW50XHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQweDE0IGV4dGVuZHMgTGluZUV2ZW50XHJcbiAgaW1wbGVtZW50cyBMaW5lRXZlbnRTb3VyY2UsIExpbmVFdmVudFRhcmdldCwgTGluZUV2ZW50QWJpbGl0eSB7XHJcbiAgcHVibGljIHJlYWRvbmx5IHByb3BlckNhc2VDb252ZXJ0ZWRMaW5lOiBzdHJpbmc7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBpZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGFiaWxpdHlJZDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBhYmlsaXR5SWRIZXg6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgYWJpbGl0eU5hbWU6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgdGFyZ2V0SWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgdGFyZ2V0TmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBkdXJhdGlvbjogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBpc1NvdXJjZSA9IHRydWU7XHJcbiAgcHVibGljIHJlYWRvbmx5IGlzVGFyZ2V0ID0gdHJ1ZTtcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNBYmlsaXR5ID0gdHJ1ZTtcclxuXHJcbiAgY29uc3RydWN0b3IocmVwbzogTG9nUmVwb3NpdG9yeSwgbGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHN1cGVyKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gcGFydHNbZmllbGRzLmlkXT8udG9VcHBlckNhc2UoKSA/PyAnJztcclxuICAgIHRoaXMubmFtZSA9IHBhcnRzW2ZpZWxkcy5uYW1lXSA/PyAnJztcclxuICAgIHRoaXMuYWJpbGl0eUlkSGV4ID0gcGFydHNbZmllbGRzLmFiaWxpdHlJZF0/LnRvVXBwZXJDYXNlKCkgPz8gJyc7XHJcbiAgICB0aGlzLmFiaWxpdHlJZCA9IHBhcnNlSW50KHRoaXMuYWJpbGl0eUlkSGV4KTtcclxuICAgIHRoaXMuYWJpbGl0eU5hbWUgPSBwYXJ0c1tmaWVsZHMuYWJpbGl0eU5hbWVdID8/ICcnO1xyXG4gICAgdGhpcy50YXJnZXRJZCA9IHBhcnRzW2ZpZWxkcy50YXJnZXRJZF0/LnRvVXBwZXJDYXNlKCkgPz8gJyc7XHJcbiAgICB0aGlzLnRhcmdldE5hbWUgPSBwYXJ0c1tmaWVsZHMudGFyZ2V0TmFtZV0gPz8gJyc7XHJcbiAgICB0aGlzLmR1cmF0aW9uID0gcGFydHNbZmllbGRzLmR1cmF0aW9uXSA/PyAnJztcclxuXHJcbiAgICByZXBvLnVwZGF0ZUNvbWJhdGFudCh0aGlzLmlkLCB7XHJcbiAgICAgIGpvYjogdW5kZWZpbmVkLFxyXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgIHNwYXduOiB0aGlzLnRpbWVzdGFtcCxcclxuICAgICAgZGVzcGF3bjogdGhpcy50aW1lc3RhbXAsXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXBvLnVwZGF0ZUNvbWJhdGFudCh0aGlzLnRhcmdldElkLCB7XHJcbiAgICAgIGpvYjogdW5kZWZpbmVkLFxyXG4gICAgICBuYW1lOiB0aGlzLnRhcmdldE5hbWUsXHJcbiAgICAgIHNwYXduOiB0aGlzLnRpbWVzdGFtcCxcclxuICAgICAgZGVzcGF3bjogdGhpcy50aW1lc3RhbXAsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLnRhcmdldE5hbWUubGVuZ3RoID09PSAwID8gJ1Vua25vd24nIDogdGhpcy50YXJnZXROYW1lO1xyXG5cclxuICAgIHRoaXMuY29udmVydGVkTGluZSA9IHRoaXMucHJlZml4KCkgKyB0aGlzLmFiaWxpdHlJZEhleCArXHJcbiAgICAgICc6JyArIHRoaXMubmFtZSArXHJcbiAgICAgICcgc3RhcnRzIHVzaW5nICcgKyB0aGlzLmFiaWxpdHlOYW1lICtcclxuICAgICAgJyBvbiAnICsgdGFyZ2V0ICsgJy4nO1xyXG4gICAgdGhpcy5wcm9wZXJDYXNlQ29udmVydGVkTGluZSA9IHRoaXMucHJlZml4KCkgKyB0aGlzLmFiaWxpdHlJZEhleCArXHJcbiAgICAgICc6JyArIEVtdWxhdG9yQ29tbW9uLnByb3BlckNhc2UodGhpcy5uYW1lKSArXHJcbiAgICAgICcgc3RhcnRzIHVzaW5nICcgKyB0aGlzLmFiaWxpdHlOYW1lICtcclxuICAgICAgJyBvbiAnICsgRW11bGF0b3JDb21tb24ucHJvcGVyQ2FzZSh0YXJnZXQpICsgJy4nO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDIwIGV4dGVuZHMgTGluZUV2ZW50MHgxNCB7IH1cclxuIiwiaW1wb3J0IExpbmVFdmVudCwgeyBMaW5lRXZlbnRBYmlsaXR5LCBMaW5lRXZlbnRTb3VyY2UsIExpbmVFdmVudFRhcmdldCB9IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmNvbnN0IGZpZWxkcyA9IHtcclxuICBpZDogMixcclxuICBuYW1lOiAzLFxyXG4gIGZsYWdzOiA4LFxyXG4gIGRhbWFnZTogOSxcclxuICBhYmlsaXR5SWQ6IDQsXHJcbiAgYWJpbGl0eU5hbWU6IDUsXHJcbiAgdGFyZ2V0SWQ6IDYsXHJcbiAgdGFyZ2V0TmFtZTogNyxcclxuICB0YXJnZXRIcDogMjQsXHJcbiAgdGFyZ2V0TWF4SHA6IDI1LFxyXG4gIHRhcmdldE1wOiAyNixcclxuICB0YXJnZXRNYXhNcDogMjcsXHJcbiAgdGFyZ2V0WDogMzAsXHJcbiAgdGFyZ2V0WTogMzEsXHJcbiAgdGFyZ2V0WjogMzIsXHJcbiAgdGFyZ2V0SGVhZGluZzogMzMsXHJcbiAgc291cmNlSHA6IDM0LFxyXG4gIHNvdXJjZU1heEhwOiAzNSxcclxuICBzb3VyY2VNcDogMzYsXHJcbiAgc291cmNlTWF4TXA6IDM3LFxyXG4gIHg6IDQwLFxyXG4gIHk6IDQxLFxyXG4gIHo6IDQyLFxyXG4gIGhlYWRpbmc6IDQzLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gQWJpbGl0eSBoaXQgc2luZ2xlIHRhcmdldCBldmVudFxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MHgxNSBleHRlbmRzIExpbmVFdmVudFxyXG4gIGltcGxlbWVudHMgTGluZUV2ZW50U291cmNlLCBMaW5lRXZlbnRUYXJnZXQsIExpbmVFdmVudEFiaWxpdHkge1xyXG4gIHB1YmxpYyByZWFkb25seSBkYW1hZ2U6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBhYmlsaXR5SWQ6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgYWJpbGl0eU5hbWU6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgdGFyZ2V0SWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgdGFyZ2V0TmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBmbGFnczogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRIcDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRNYXhIcDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRNcDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRNYXhNcDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRYOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRhcmdldFk6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgdGFyZ2V0WjogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRIZWFkaW5nOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGhwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1heEhwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1wOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1heE1wOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgeTogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB6OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGhlYWRpbmc6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNTb3VyY2UgPSB0cnVlO1xyXG4gIHB1YmxpYyByZWFkb25seSBpc1RhcmdldCA9IHRydWU7XHJcbiAgcHVibGljIHJlYWRvbmx5IGlzQWJpbGl0eSA9IHRydWU7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJlcG86IExvZ1JlcG9zaXRvcnksIGxpbmU6IHN0cmluZywgcGFydHM6IHN0cmluZ1tdKSB7XHJcbiAgICBzdXBlcihyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcblxyXG4gICAgdGhpcy5pZCA9IHBhcnRzW2ZpZWxkcy5pZF0/LnRvVXBwZXJDYXNlKCkgPz8gJyc7XHJcbiAgICB0aGlzLm5hbWUgPSBwYXJ0c1tmaWVsZHMubmFtZV0gPz8gJyc7XHJcblxyXG4gICAgdGhpcy5mbGFncyA9IHBhcnRzW2ZpZWxkcy5mbGFnc10gPz8gJyc7XHJcblxyXG4gICAgY29uc3QgZmllbGRPZmZzZXQgPSB0aGlzLmZsYWdzID09PSAnM0YnID8gMiA6IDA7XHJcblxyXG4gICAgdGhpcy5kYW1hZ2UgPSBMaW5lRXZlbnQuY2FsY3VsYXRlRGFtYWdlKHBhcnRzW2ZpZWxkcy5kYW1hZ2UgKyBmaWVsZE9mZnNldF0gPz8gJycpO1xyXG4gICAgdGhpcy5hYmlsaXR5SWQgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMuYWJpbGl0eUlkXT8udG9VcHBlckNhc2UoKSA/PyAnJyk7XHJcbiAgICB0aGlzLmFiaWxpdHlOYW1lID0gcGFydHNbZmllbGRzLmFiaWxpdHlOYW1lXSA/PyAnJztcclxuICAgIHRoaXMudGFyZ2V0SWQgPSBwYXJ0c1tmaWVsZHMudGFyZ2V0SWRdPy50b1VwcGVyQ2FzZSgpID8/ICcnO1xyXG4gICAgdGhpcy50YXJnZXROYW1lID0gcGFydHNbZmllbGRzLnRhcmdldE5hbWVdID8/ICcnO1xyXG5cclxuICAgIHRoaXMudGFyZ2V0SHAgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMudGFyZ2V0SHAgKyBmaWVsZE9mZnNldF0gPz8gJycpO1xyXG4gICAgdGhpcy50YXJnZXRNYXhIcCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy50YXJnZXRNYXhIcCArIGZpZWxkT2Zmc2V0XSA/PyAnJyk7XHJcbiAgICB0aGlzLnRhcmdldE1wID0gcGFyc2VJbnQocGFydHNbZmllbGRzLnRhcmdldE1wICsgZmllbGRPZmZzZXRdID8/ICcnKTtcclxuICAgIHRoaXMudGFyZ2V0TWF4TXAgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMudGFyZ2V0TWF4TXAgKyBmaWVsZE9mZnNldF0gPz8gJycpO1xyXG4gICAgdGhpcy50YXJnZXRYID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMudGFyZ2V0WCArIGZpZWxkT2Zmc2V0XSA/PyAnJyk7XHJcbiAgICB0aGlzLnRhcmdldFkgPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy50YXJnZXRZICsgZmllbGRPZmZzZXRdID8/ICcnKTtcclxuICAgIHRoaXMudGFyZ2V0WiA9IHBhcnNlRmxvYXQocGFydHNbZmllbGRzLnRhcmdldFogKyBmaWVsZE9mZnNldF0gPz8gJycpO1xyXG4gICAgdGhpcy50YXJnZXRIZWFkaW5nID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMudGFyZ2V0SGVhZGluZyArIGZpZWxkT2Zmc2V0XSA/PyAnJyk7XHJcblxyXG4gICAgdGhpcy5ocCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5zb3VyY2VIcCArIGZpZWxkT2Zmc2V0XSA/PyAnJyk7XHJcbiAgICB0aGlzLm1heEhwID0gcGFyc2VJbnQocGFydHNbZmllbGRzLnNvdXJjZU1heEhwICsgZmllbGRPZmZzZXRdID8/ICcnKTtcclxuICAgIHRoaXMubXAgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMuc291cmNlTXAgKyBmaWVsZE9mZnNldF0gPz8gJycpO1xyXG4gICAgdGhpcy5tYXhNcCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5zb3VyY2VNYXhNcCArIGZpZWxkT2Zmc2V0XSA/PyAnJyk7XHJcbiAgICB0aGlzLnggPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy54ICsgZmllbGRPZmZzZXRdID8/ICcnKTtcclxuICAgIHRoaXMueSA9IHBhcnNlRmxvYXQocGFydHNbZmllbGRzLnkgKyBmaWVsZE9mZnNldF0gPz8gJycpO1xyXG4gICAgdGhpcy56ID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMueiArIGZpZWxkT2Zmc2V0XSA/PyAnJyk7XHJcbiAgICB0aGlzLmhlYWRpbmcgPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy5oZWFkaW5nICsgZmllbGRPZmZzZXRdID8/ICcnKTtcclxuXHJcblxyXG4gICAgcmVwby51cGRhdGVDb21iYXRhbnQodGhpcy5pZCwge1xyXG4gICAgICBqb2I6IHVuZGVmaW5lZCxcclxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICBzcGF3bjogdGhpcy50aW1lc3RhbXAsXHJcbiAgICAgIGRlc3Bhd246IHRoaXMudGltZXN0YW1wLFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmVwby51cGRhdGVDb21iYXRhbnQodGhpcy50YXJnZXRJZCwge1xyXG4gICAgICBqb2I6IHVuZGVmaW5lZCxcclxuICAgICAgbmFtZTogdGhpcy50YXJnZXROYW1lLFxyXG4gICAgICBzcGF3bjogdGhpcy50aW1lc3RhbXAsXHJcbiAgICAgIGRlc3Bhd246IHRoaXMudGltZXN0YW1wLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MjEgZXh0ZW5kcyBMaW5lRXZlbnQweDE1IHt9XHJcbiIsImltcG9ydCB7IExpbmVFdmVudDB4MTUgfSBmcm9tICcuL0xpbmVFdmVudDB4MTUnO1xyXG5pbXBvcnQgTG9nUmVwb3NpdG9yeSBmcm9tICcuL0xvZ1JlcG9zaXRvcnknO1xyXG5cclxuLy8gQWJpbGl0eSBoaXQgbXVsdGlwbGUvbm8gdGFyZ2V0IGV2ZW50XHJcbi8vIER1cGxpY2F0ZSBvZiAweDE1IGFzIGZhciBhcyBkYXRhXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQweDE2IGV4dGVuZHMgTGluZUV2ZW50MHgxNSB7XHJcbiAgY29uc3RydWN0b3IocmVwbzogTG9nUmVwb3NpdG9yeSwgbGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHN1cGVyKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQyMiBleHRlbmRzIExpbmVFdmVudDB4MTYge31cclxuIiwiaW1wb3J0IExpbmVFdmVudCwgeyBMaW5lRXZlbnRBYmlsaXR5LCBMaW5lRXZlbnRTb3VyY2UgfSBmcm9tICcuL0xpbmVFdmVudCc7XHJcbmltcG9ydCBMb2dSZXBvc2l0b3J5IGZyb20gJy4vTG9nUmVwb3NpdG9yeSc7XHJcblxyXG5jb25zdCBmaWVsZHMgPSB7XHJcbiAgaWQ6IDIsXHJcbiAgbmFtZTogMyxcclxuICBhYmlsaXR5SWQ6IDQsXHJcbiAgYWJpbGl0eU5hbWU6IDUsXHJcbiAgcmVhc29uOiA2LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gQ2FuY2VsIGFiaWxpdHkgZXZlbnRcclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDB4MTcgZXh0ZW5kcyBMaW5lRXZlbnRcclxuICBpbXBsZW1lbnRzIExpbmVFdmVudFNvdXJjZSwgTGluZUV2ZW50QWJpbGl0eSB7XHJcbiAgcHVibGljIHJlYWRvbmx5IGlkOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgYWJpbGl0eUlkOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGFiaWxpdHlOYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHJlYXNvbjogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBpc1NvdXJjZSA9IHRydWU7XHJcbiAgcHVibGljIHJlYWRvbmx5IGlzQWJpbGl0eSA9IHRydWU7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJlcG86IExvZ1JlcG9zaXRvcnksIGxpbmU6IHN0cmluZywgcGFydHM6IHN0cmluZ1tdKSB7XHJcbiAgICBzdXBlcihyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcblxyXG4gICAgdGhpcy5pZCA9IHBhcnRzW2ZpZWxkcy5pZF0/LnRvVXBwZXJDYXNlKCkgPz8gJyc7XHJcbiAgICB0aGlzLm5hbWUgPSBwYXJ0c1tmaWVsZHMubmFtZV0gPz8gJyc7XHJcbiAgICB0aGlzLmFiaWxpdHlJZCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5hYmlsaXR5SWRdPy50b1VwcGVyQ2FzZSgpID8/ICcnKTtcclxuICAgIHRoaXMuYWJpbGl0eU5hbWUgPSBwYXJ0c1tmaWVsZHMuYWJpbGl0eU5hbWVdID8/ICcnO1xyXG4gICAgdGhpcy5yZWFzb24gPSBwYXJ0c1tmaWVsZHMucmVhc29uXSA/PyAnJztcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQyMyBleHRlbmRzIExpbmVFdmVudDB4MTcge31cclxuIiwiaW1wb3J0IExpbmVFdmVudCwgeyBMaW5lRXZlbnRTb3VyY2UgfSBmcm9tICcuL0xpbmVFdmVudCc7XHJcbmltcG9ydCBFbXVsYXRvckNvbW1vbiBmcm9tICcuLi8uLi9FbXVsYXRvckNvbW1vbic7XHJcbmltcG9ydCBMb2dSZXBvc2l0b3J5IGZyb20gJy4vTG9nUmVwb3NpdG9yeSc7XHJcblxyXG5jb25zdCBmaWVsZHMgPSB7XHJcbiAgaWQ6IDIsXHJcbiAgbmFtZTogMyxcclxuICB0eXBlOiA0LFxyXG4gIGVmZmVjdElkOiA1LFxyXG4gIGRhbWFnZTogNixcclxuICBjdXJyZW50SHA6IDcsXHJcbiAgbWF4SHA6IDgsXHJcbiAgY3VycmVudE1wOiA5LFxyXG4gIG1heE1wOiAxMCxcclxuICBjdXJyZW50VHA6IDExLFxyXG4gIG1heFRwOiAxMixcclxuICB4OiAxMyxcclxuICB5OiAxNCxcclxuICB6OiAxNSxcclxuICBoZWFkaW5nOiAxNixcclxufSBhcyBjb25zdDtcclxuXHJcbi8vIERvVC9Ib1QgZXZlbnRcclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDB4MTggZXh0ZW5kcyBMaW5lRXZlbnQgaW1wbGVtZW50cyBMaW5lRXZlbnRTb3VyY2Uge1xyXG4gIHB1YmxpYyByZWFkb25seSBwcm9wZXJDYXNlQ29udmVydGVkTGluZTogc3RyaW5nO1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB0eXBlOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGVmZmVjdElkOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGRhbWFnZTogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBocDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBtYXhIcDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBtcDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBtYXhNcDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB0cDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBtYXhUcDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB4OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHk6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgejogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBoZWFkaW5nOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGlzU291cmNlID0gdHJ1ZTtcclxuXHJcbiAgY29uc3RydWN0b3IocmVwbzogTG9nUmVwb3NpdG9yeSwgbGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHN1cGVyKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gcGFydHNbZmllbGRzLmlkXT8udG9VcHBlckNhc2UoKSA/PyAnJztcclxuICAgIHRoaXMubmFtZSA9IHBhcnRzW2ZpZWxkcy5uYW1lXSA/PyAnJztcclxuXHJcbiAgICB0aGlzLnR5cGUgPSBwYXJ0c1tmaWVsZHMudHlwZV0gPz8gJyc7XHJcbiAgICB0aGlzLmVmZmVjdElkID0gcGFydHNbZmllbGRzLmVmZmVjdElkXT8udG9VcHBlckNhc2UoKSA/PyAnJztcclxuICAgIHRoaXMuZGFtYWdlID0gcGFyc2VJbnQocGFydHNbZmllbGRzLmRhbWFnZV0gPz8gJycsIDE2KTtcclxuXHJcbiAgICB0aGlzLmhwID0gcGFyc2VJbnQocGFydHNbZmllbGRzLmN1cnJlbnRIcF0gPz8gJycpO1xyXG4gICAgdGhpcy5tYXhIcCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5tYXhIcF0gPz8gJycpO1xyXG4gICAgdGhpcy5tcCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5jdXJyZW50TXBdID8/ICcnKTtcclxuICAgIHRoaXMubWF4TXAgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMubWF4TXBdID8/ICcnKTtcclxuICAgIHRoaXMudHAgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMuY3VycmVudFRwXSA/PyAnJyk7XHJcbiAgICB0aGlzLm1heFRwID0gcGFyc2VJbnQocGFydHNbZmllbGRzLm1heFRwXSA/PyAnJyk7XHJcbiAgICB0aGlzLnggPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy54XSA/PyAnJyk7XHJcbiAgICB0aGlzLnkgPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy55XSA/PyAnJyk7XHJcbiAgICB0aGlzLnogPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy56XSA/PyAnJyk7XHJcbiAgICB0aGlzLmhlYWRpbmcgPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy5oZWFkaW5nXSA/PyAnJyk7XHJcblxyXG4gICAgcmVwby51cGRhdGVDb21iYXRhbnQodGhpcy5pZCwge1xyXG4gICAgICBqb2I6IHVuZGVmaW5lZCxcclxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICBzcGF3bjogdGhpcy50aW1lc3RhbXAsXHJcbiAgICAgIGRlc3Bhd246IHRoaXMudGltZXN0YW1wLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IGVmZmVjdE5hbWUgPSAnJztcclxuICAgIGNvbnN0IHJlc29sdmVkTmFtZSA9IHJlcG8ucmVzb2x2ZU5hbWUodGhpcy5pZCwgdGhpcy5uYW1lKTtcclxuXHJcbiAgICBpZiAodGhpcy5lZmZlY3RJZCBpbiBMaW5lRXZlbnQweDE4LnNob3dFZmZlY3ROYW1lc0ZvcilcclxuICAgICAgZWZmZWN0TmFtZSA9IExpbmVFdmVudDB4MTguc2hvd0VmZmVjdE5hbWVzRm9yW3RoaXMuZWZmZWN0SWRdID8/ICcnO1xyXG5cclxuICAgIGxldCBlZmZlY3RQYXJ0ID0gJyc7XHJcbiAgICBpZiAoZWZmZWN0TmFtZSlcclxuICAgICAgZWZmZWN0UGFydCA9IGVmZmVjdE5hbWUgKyAnICc7XHJcblxyXG4gICAgdGhpcy5jb252ZXJ0ZWRMaW5lID0gdGhpcy5wcmVmaXgoKSArIGVmZmVjdFBhcnQgKyB0aGlzLnR5cGUgK1xyXG4gICAgICAnIFRpY2sgb24gJyArIHJlc29sdmVkTmFtZSArXHJcbiAgICAgICcgZm9yICcgKyB0aGlzLmRhbWFnZS50b1N0cmluZygpICsgJyBkYW1hZ2UuJztcclxuXHJcbiAgICB0aGlzLnByb3BlckNhc2VDb252ZXJ0ZWRMaW5lID0gdGhpcy5wcmVmaXgoKSArIGVmZmVjdFBhcnQgKyB0aGlzLnR5cGUgK1xyXG4gICAgICAnIFRpY2sgb24gJyArIEVtdWxhdG9yQ29tbW9uLnByb3BlckNhc2UocmVzb2x2ZWROYW1lKSArXHJcbiAgICAgICcgZm9yICcgKyB0aGlzLmRhbWFnZS50b1N0cmluZygpICsgJyBkYW1hZ2UuJztcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzaG93RWZmZWN0TmFtZXNGb3I6IHsgW2VmZmVjdElkOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcclxuICAgICc0QzQnOiAnRXhjb2duaXRpb24nLFxyXG4gICAgJzM1RCc6ICdXaWxkZmlyZScsXHJcbiAgICAnMUY1JzogJ0RvdG9uJyxcclxuICAgICcyRUQnOiAnU2FsdGVkIEVhcnRoJyxcclxuICAgICc0QjUnOiAnRmxhbWV0aHJvd2VyJyxcclxuICAgICcyRTMnOiAnQXN5bHVtJyxcclxuICAgICc3NzcnOiAnQXN5bHVtJyxcclxuICAgICc3OTgnOiAnU2FjcmVkIFNvaWwnLFxyXG4gICAgJzRDNyc6ICdGZXkgVW5pb24nLFxyXG4gICAgJzc0Mic6ICdOYXNjZW50IEdsaW50JyxcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MjQgZXh0ZW5kcyBMaW5lRXZlbnQweDE4IHsgfVxyXG4iLCJpbXBvcnQgTGluZUV2ZW50IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IEVtdWxhdG9yQ29tbW9uIGZyb20gJy4uLy4uL0VtdWxhdG9yQ29tbW9uJztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmNvbnN0IGZpZWxkcyA9IHtcclxuICBpZDogMixcclxuICBuYW1lOiAzLFxyXG4gIHRhcmdldElkOiA0LFxyXG4gIHRhcmdldE5hbWU6IDUsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vLyBDb21iYXRhbnQgZGVmZWF0ZWQgZXZlbnRcclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDB4MTkgZXh0ZW5kcyBMaW5lRXZlbnQge1xyXG4gIHB1YmxpYyByZWFkb25seSBwcm9wZXJDYXNlQ29udmVydGVkTGluZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBpZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRhcmdldElkOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRhcmdldE5hbWU6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IocmVwbzogTG9nUmVwb3NpdG9yeSwgbGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHN1cGVyKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gcGFydHNbZmllbGRzLmlkXT8udG9VcHBlckNhc2UoKSA/PyAnJztcclxuICAgIHRoaXMubmFtZSA9IHBhcnRzW2ZpZWxkcy5uYW1lXSA/PyAnJztcclxuICAgIHRoaXMudGFyZ2V0SWQgPSBwYXJ0c1tmaWVsZHMudGFyZ2V0SWRdPy50b1VwcGVyQ2FzZSgpID8/ICcnO1xyXG4gICAgdGhpcy50YXJnZXROYW1lID0gcGFydHNbZmllbGRzLnRhcmdldE5hbWVdID8/ICcnO1xyXG5cclxuICAgIHJlcG8udXBkYXRlQ29tYmF0YW50KHRoaXMuaWQsIHtcclxuICAgICAgam9iOiB1bmRlZmluZWQsXHJcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgc3Bhd246IHRoaXMudGltZXN0YW1wLFxyXG4gICAgICBkZXNwYXduOiB0aGlzLnRpbWVzdGFtcCxcclxuICAgIH0pO1xyXG5cclxuICAgIHJlcG8udXBkYXRlQ29tYmF0YW50KHRoaXMudGFyZ2V0SWQsIHtcclxuICAgICAgam9iOiB1bmRlZmluZWQsXHJcbiAgICAgIG5hbWU6IHRoaXMudGFyZ2V0TmFtZSxcclxuICAgICAgc3Bhd246IHRoaXMudGltZXN0YW1wLFxyXG4gICAgICBkZXNwYXduOiB0aGlzLnRpbWVzdGFtcCxcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCByZXNvbHZlZE5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxuICAgIGxldCByZXNvbHZlZFRhcmdldE5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICBpZiAodGhpcy5pZCAhPT0gJzAwJylcclxuICAgICAgcmVzb2x2ZWROYW1lID0gcmVwby5yZXNvbHZlTmFtZSh0aGlzLmlkLCB0aGlzLm5hbWUpO1xyXG5cclxuICAgIGlmICh0aGlzLnRhcmdldElkICE9PSAnMDAnKVxyXG4gICAgICByZXNvbHZlZFRhcmdldE5hbWUgPSByZXBvLnJlc29sdmVOYW1lKHRoaXMudGFyZ2V0SWQsIHRoaXMudGFyZ2V0TmFtZSk7XHJcblxyXG4gICAgY29uc3QgZGVmZWF0ZWROYW1lID0gKHJlc29sdmVkTmFtZSA/PyB0aGlzLm5hbWUpO1xyXG4gICAgY29uc3Qga2lsbGVyTmFtZSA9IChyZXNvbHZlZFRhcmdldE5hbWUgPz8gdGhpcy50YXJnZXROYW1lKTtcclxuICAgIHRoaXMuY29udmVydGVkTGluZSA9IHRoaXMucHJlZml4KCkgKyBkZWZlYXRlZE5hbWUgK1xyXG4gICAgICAnIHdhcyBkZWZlYXRlZCBieSAnICsga2lsbGVyTmFtZSArICcuJztcclxuICAgIHRoaXMucHJvcGVyQ2FzZUNvbnZlcnRlZExpbmUgPSB0aGlzLnByZWZpeCgpICsgRW11bGF0b3JDb21tb24ucHJvcGVyQ2FzZShkZWZlYXRlZE5hbWUpICtcclxuICAgICAgJyB3YXMgZGVmZWF0ZWQgYnkgJyArIEVtdWxhdG9yQ29tbW9uLnByb3BlckNhc2Uoa2lsbGVyTmFtZSkgKyAnLic7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MjUgZXh0ZW5kcyBMaW5lRXZlbnQweDE5IHsgfVxyXG4iLCJpbXBvcnQgTGluZUV2ZW50LCB7IExpbmVFdmVudEFiaWxpdHkgfSBmcm9tICcuL0xpbmVFdmVudCc7XHJcbmltcG9ydCBFbXVsYXRvckNvbW1vbiBmcm9tICcuLi8uLi9FbXVsYXRvckNvbW1vbic7XHJcbmltcG9ydCBMb2dSZXBvc2l0b3J5IGZyb20gJy4vTG9nUmVwb3NpdG9yeSc7XHJcblxyXG5jb25zdCBmaWVsZHMgPSB7XHJcbiAgYWJpbGl0eUlkOiAyLFxyXG4gIGFiaWxpdHlOYW1lOiAzLFxyXG4gIGR1cmF0aW9uU3RyaW5nOiA0LFxyXG4gIGlkOiA1LFxyXG4gIG5hbWU6IDYsXHJcbiAgdGFyZ2V0SWQ6IDcsXHJcbiAgdGFyZ2V0TmFtZTogOCxcclxuICBzdGFja3M6IDksXHJcbiAgdGFyZ2V0SHA6IDEwLFxyXG4gIHNvdXJjZUhwOiAxMSxcclxufSBhcyBjb25zdDtcclxuXHJcbi8vIEdhaW4gc3RhdHVzIGVmZmVjdCBldmVudFxyXG4vLyBEZWxpYmVyYXRlbHkgZG9uJ3QgZmxhZyB0aGlzIGFzIExpbmVFdmVudFNvdXJjZSBvciBMaW5lRXZlbnRUYXJnZXRcclxuLy8gYmVjYXVzZSAweDFBIGxpbmUgdmFsdWVzIGFyZW4ndCBhY2N1cmF0ZVxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MHgxQSBleHRlbmRzIExpbmVFdmVudCBpbXBsZW1lbnRzIExpbmVFdmVudEFiaWxpdHkge1xyXG4gIHB1YmxpYyByZWFkb25seSByZXNvbHZlZE5hbWU6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgcmVzb2x2ZWRUYXJnZXROYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGZhbGxiYWNrUmVzb2x2ZWRUYXJnZXROYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHByb3BlckNhc2VDb252ZXJ0ZWRMaW5lOiBzdHJpbmc7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBhYmlsaXR5SWQ6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgYWJpbGl0eU5hbWU6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgZHVyYXRpb25GbG9hdDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBkdXJhdGlvblN0cmluZzogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBpZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRhcmdldElkOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRhcmdldE5hbWU6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgc3RhY2tzOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRhcmdldEhwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGhwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGlzQWJpbGl0eSA9IHRydWU7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJlcG86IExvZ1JlcG9zaXRvcnksIGxpbmU6IHN0cmluZywgcGFydHM6IHN0cmluZ1tdKSB7XHJcbiAgICBzdXBlcihyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcblxyXG4gICAgdGhpcy5hYmlsaXR5SWQgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMuYWJpbGl0eUlkXT8udG9VcHBlckNhc2UoKSA/PyAnJyk7XHJcbiAgICB0aGlzLmFiaWxpdHlOYW1lID0gcGFydHNbZmllbGRzLmFiaWxpdHlOYW1lXSA/PyAnJztcclxuICAgIHRoaXMuZHVyYXRpb25TdHJpbmcgPSBwYXJ0c1tmaWVsZHMuZHVyYXRpb25TdHJpbmddID8/ICcnO1xyXG4gICAgdGhpcy5kdXJhdGlvbkZsb2F0ID0gcGFyc2VGbG9hdCh0aGlzLmR1cmF0aW9uU3RyaW5nKTtcclxuICAgIHRoaXMuaWQgPSBwYXJ0c1tmaWVsZHMuaWRdPy50b1VwcGVyQ2FzZSgpID8/ICcnO1xyXG4gICAgdGhpcy5uYW1lID0gcGFydHNbZmllbGRzLm5hbWVdID8/ICcnO1xyXG4gICAgdGhpcy50YXJnZXRJZCA9IHBhcnRzW2ZpZWxkcy50YXJnZXRJZF0/LnRvVXBwZXJDYXNlKCkgPz8gJyc7XHJcbiAgICB0aGlzLnRhcmdldE5hbWUgPSBwYXJ0c1tmaWVsZHMudGFyZ2V0TmFtZV0gPz8gJyc7XHJcbiAgICB0aGlzLnN0YWNrcyA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5zdGFja3NdID8/ICcwJyk7XHJcbiAgICB0aGlzLnRhcmdldEhwID0gcGFyc2VJbnQocGFydHNbZmllbGRzLnRhcmdldEhwXSA/PyAnJyk7XHJcbiAgICB0aGlzLmhwID0gcGFyc2VJbnQocGFydHNbZmllbGRzLnNvdXJjZUhwXSA/PyAnJyk7XHJcblxyXG4gICAgcmVwby51cGRhdGVDb21iYXRhbnQodGhpcy5pZCwge1xyXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgIHNwYXduOiB0aGlzLnRpbWVzdGFtcCxcclxuICAgICAgZGVzcGF3bjogdGhpcy50aW1lc3RhbXAsXHJcbiAgICAgIGpvYjogdW5kZWZpbmVkLFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmVwby51cGRhdGVDb21iYXRhbnQodGhpcy50YXJnZXRJZCwge1xyXG4gICAgICBuYW1lOiB0aGlzLnRhcmdldE5hbWUsXHJcbiAgICAgIHNwYXduOiB0aGlzLnRpbWVzdGFtcCxcclxuICAgICAgZGVzcGF3bjogdGhpcy50aW1lc3RhbXAsXHJcbiAgICAgIGpvYjogdW5kZWZpbmVkLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5yZXNvbHZlZE5hbWUgPSByZXBvLnJlc29sdmVOYW1lKHRoaXMuaWQsIHRoaXMubmFtZSk7XHJcbiAgICB0aGlzLnJlc29sdmVkVGFyZ2V0TmFtZSA9IHJlcG8ucmVzb2x2ZU5hbWUodGhpcy50YXJnZXRJZCwgdGhpcy50YXJnZXROYW1lKTtcclxuXHJcbiAgICB0aGlzLmZhbGxiYWNrUmVzb2x2ZWRUYXJnZXROYW1lID1cclxuICAgICAgcmVwby5yZXNvbHZlTmFtZSh0aGlzLmlkLCB0aGlzLm5hbWUsIHRoaXMudGFyZ2V0SWQsIHRoaXMudGFyZ2V0TmFtZSk7XHJcblxyXG4gICAgbGV0IHN0YWNrQ291bnRUZXh0ID0gJyc7XHJcbiAgICBpZiAodGhpcy5zdGFja3MgPiAwICYmIHRoaXMuc3RhY2tzIDwgMjAgJiZcclxuICAgICAgTGluZUV2ZW50MHgxQS5zaG93U3RhY2tDb3VudEZvci5pbmNsdWRlcyh0aGlzLmFiaWxpdHlJZCkpXHJcbiAgICAgIHN0YWNrQ291bnRUZXh0ID0gJyAoJyArIHRoaXMuc3RhY2tzLnRvU3RyaW5nKCkgKyAnKSc7XHJcblxyXG4gICAgdGhpcy5jb252ZXJ0ZWRMaW5lID0gdGhpcy5wcmVmaXgoKSArIHRoaXMudGFyZ2V0SWQgK1xyXG4gICAgICAnOicgKyB0aGlzLnRhcmdldE5hbWUgK1xyXG4gICAgICAnIGdhaW5zIHRoZSBlZmZlY3Qgb2YgJyArIHRoaXMuYWJpbGl0eU5hbWUgK1xyXG4gICAgICAnIGZyb20gJyArIHRoaXMuZmFsbGJhY2tSZXNvbHZlZFRhcmdldE5hbWUgK1xyXG4gICAgICAnIGZvciAnICsgdGhpcy5kdXJhdGlvblN0cmluZyArICcgU2Vjb25kcy4nICsgc3RhY2tDb3VudFRleHQ7XHJcblxyXG4gICAgdGhpcy5wcm9wZXJDYXNlQ29udmVydGVkTGluZSA9IHRoaXMucHJlZml4KCkgKyB0aGlzLnRhcmdldElkICtcclxuICAgICAgJzonICsgRW11bGF0b3JDb21tb24ucHJvcGVyQ2FzZSh0aGlzLnRhcmdldE5hbWUpICtcclxuICAgICAgJyBnYWlucyB0aGUgZWZmZWN0IG9mICcgKyB0aGlzLmFiaWxpdHlOYW1lICtcclxuICAgICAgJyBmcm9tICcgKyBFbXVsYXRvckNvbW1vbi5wcm9wZXJDYXNlKHRoaXMuZmFsbGJhY2tSZXNvbHZlZFRhcmdldE5hbWUpICtcclxuICAgICAgJyBmb3IgJyArIHRoaXMuZHVyYXRpb25TdHJpbmcgKyAnIFNlY29uZHMuJyArIHN0YWNrQ291bnRUZXh0O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHNob3dTdGFja0NvdW50Rm9yOiByZWFkb25seSBudW1iZXJbXSA9IFtcclxuICAgIDMwNCwgLy8gQWV0aGVyZmxvd1xyXG4gICAgNDA2LCAvLyBWdWxuZXJhYmlsaXR5IERvd25cclxuICAgIDM1MCwgLy8gVnVsbmVyYWJpbGl0eSBEb3duXHJcbiAgICA3MTQsIC8vIFZ1bG5lcmFiaWxpdHkgVXBcclxuICAgIDUwNSwgLy8gRGFtYWdlIFVwXHJcbiAgICAxMjM5LCAvLyBFbWJvbGRlblxyXG4gICAgMTI5NywgLy8gRW1ib2xkZW5cclxuICBdIGFzIGNvbnN0O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MjYgZXh0ZW5kcyBMaW5lRXZlbnQweDFBIHt9XHJcbiIsImltcG9ydCBMaW5lRXZlbnQsIHsgTGluZUV2ZW50U291cmNlIH0gZnJvbSAnLi9MaW5lRXZlbnQnO1xyXG5pbXBvcnQgTG9nUmVwb3NpdG9yeSBmcm9tICcuL0xvZ1JlcG9zaXRvcnknO1xyXG5cclxuY29uc3QgZmllbGRzID0ge1xyXG4gIHRhcmdldElkOiAyLFxyXG4gIHRhcmdldE5hbWU6IDMsXHJcbiAgaGVhZG1hcmtlcklkOiA2LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gSGVhZCBtYXJrZXIgZXZlbnRcclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDB4MUIgZXh0ZW5kcyBMaW5lRXZlbnQgaW1wbGVtZW50cyBMaW5lRXZlbnRTb3VyY2Uge1xyXG4gIHB1YmxpYyByZWFkb25seSBpZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGhlYWRtYXJrZXJJZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBpc1NvdXJjZSA9IHRydWU7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJlcG86IExvZ1JlcG9zaXRvcnksIGxpbmU6IHN0cmluZywgcGFydHM6IHN0cmluZ1tdKSB7XHJcbiAgICBzdXBlcihyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcblxyXG4gICAgdGhpcy5pZCA9IHBhcnRzW2ZpZWxkcy50YXJnZXRJZF0/LnRvVXBwZXJDYXNlKCkgPz8gJyc7XHJcbiAgICB0aGlzLm5hbWUgPSBwYXJ0c1tmaWVsZHMudGFyZ2V0TmFtZV0gPz8gJyc7XHJcbiAgICB0aGlzLmhlYWRtYXJrZXJJZCA9IHBhcnRzW2ZpZWxkcy5oZWFkbWFya2VySWRdID8/ICcnO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDI3IGV4dGVuZHMgTGluZUV2ZW50MHgxQiB7fVxyXG4iLCJpbXBvcnQgTGluZUV2ZW50IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmNvbnN0IGZpZWxkcyA9IHtcclxuICBvcGVyYXRpb246IDIsXHJcbiAgd2F5bWFyazogMyxcclxuICBpZDogNCxcclxuICBuYW1lOiA1LFxyXG4gIHg6IDYsXHJcbiAgeTogNyxcclxuICB6OiA4LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gRmxvb3Igd2F5bWFya2VyIGV2ZW50XHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQweDFDIGV4dGVuZHMgTGluZUV2ZW50IHtcclxuICBwdWJsaWMgcmVhZG9ubHkgb3BlcmF0aW9uOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHdheW1hcms6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB4OiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHk6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgejogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihyZXBvOiBMb2dSZXBvc2l0b3J5LCBsaW5lOiBzdHJpbmcsIHBhcnRzOiBzdHJpbmdbXSkge1xyXG4gICAgc3VwZXIocmVwbywgbGluZSwgcGFydHMpO1xyXG5cclxuICAgIHRoaXMub3BlcmF0aW9uID0gcGFydHNbZmllbGRzLm9wZXJhdGlvbl0gPz8gJyc7XHJcbiAgICB0aGlzLndheW1hcmsgPSBwYXJ0c1tmaWVsZHMud2F5bWFya10gPz8gJyc7XHJcbiAgICB0aGlzLmlkID0gcGFydHNbZmllbGRzLmlkXT8udG9VcHBlckNhc2UoKSA/PyAnJztcclxuICAgIHRoaXMubmFtZSA9IHBhcnRzW2ZpZWxkcy5uYW1lXSA/PyAnJztcclxuICAgIHRoaXMueCA9IHBhcnRzW2ZpZWxkcy54XSA/PyAnJztcclxuICAgIHRoaXMueSA9IHBhcnRzW2ZpZWxkcy55XSA/PyAnJztcclxuICAgIHRoaXMueiA9IHBhcnRzW2ZpZWxkcy56XSA/PyAnJztcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQyOCBleHRlbmRzIExpbmVFdmVudDB4MUMge31cclxuIiwiaW1wb3J0IExpbmVFdmVudCBmcm9tICcuL0xpbmVFdmVudCc7XHJcbmltcG9ydCBMb2dSZXBvc2l0b3J5IGZyb20gJy4vTG9nUmVwb3NpdG9yeSc7XHJcblxyXG5jb25zdCBmaWVsZHMgPSB7XHJcbiAgb3BlcmF0aW9uOiAyLFxyXG4gIHdheW1hcms6IDMsXHJcbiAgaWQ6IDQsXHJcbiAgbmFtZTogNSxcclxuICB0YXJnZXRJZDogNixcclxuICB0YXJnZXROYW1lOiA3LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gV2F5bWFya2VyXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQweDFEIGV4dGVuZHMgTGluZUV2ZW50IHtcclxuICBwdWJsaWMgcmVhZG9ubHkgb3BlcmF0aW9uOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHdheW1hcms6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRJZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXROYW1lOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJlcG86IExvZ1JlcG9zaXRvcnksIGxpbmU6IHN0cmluZywgcGFydHM6IHN0cmluZ1tdKSB7XHJcbiAgICBzdXBlcihyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcblxyXG4gICAgdGhpcy5vcGVyYXRpb24gPSBwYXJ0c1tmaWVsZHMub3BlcmF0aW9uXSA/PyAnJztcclxuICAgIHRoaXMud2F5bWFyayA9IHBhcnRzW2ZpZWxkcy53YXltYXJrXSA/PyAnJztcclxuICAgIHRoaXMuaWQgPSBwYXJ0c1tmaWVsZHMuaWRdPy50b1VwcGVyQ2FzZSgpID8/ICcnO1xyXG4gICAgdGhpcy5uYW1lID0gcGFydHNbZmllbGRzLm5hbWVdID8/ICcnO1xyXG4gICAgdGhpcy50YXJnZXRJZCA9IHBhcnRzW2ZpZWxkcy50YXJnZXRJZF0/LnRvVXBwZXJDYXNlKCkgPz8gJyc7XHJcbiAgICB0aGlzLnRhcmdldE5hbWUgPSBwYXJ0c1tmaWVsZHMudGFyZ2V0TmFtZV0gPz8gJyc7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MjkgZXh0ZW5kcyBMaW5lRXZlbnQweDFEIHt9XHJcbiIsImltcG9ydCB7IExpbmVFdmVudDB4MUEgfSBmcm9tICcuL0xpbmVFdmVudDB4MUEnO1xyXG5pbXBvcnQgRW11bGF0b3JDb21tb24gZnJvbSAnLi4vLi4vRW11bGF0b3JDb21tb24nO1xyXG5pbXBvcnQgTG9nUmVwb3NpdG9yeSBmcm9tICcuL0xvZ1JlcG9zaXRvcnknO1xyXG5cclxuLy8gTG9zZSBzdGF0dXMgZWZmZWN0IGV2ZW50XHJcbi8vIEV4dGVuZCB0aGUgZ2FpbiBzdGF0dXMgZXZlbnQgdG8gcmVkdWNlIGR1cGxpY2F0ZSBjb2RlIHNpbmNlIHRoZXkncmVcclxuLy8gdGhlIHNhbWUgZnJvbSBhIGRhdGEgcGVyc3BlY3RpdmVcclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDB4MUUgZXh0ZW5kcyBMaW5lRXZlbnQweDFBIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVyQ2FzZUNvbnZlcnRlZExpbmU6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IocmVwbzogTG9nUmVwb3NpdG9yeSwgbGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHN1cGVyKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuXHJcbiAgICBsZXQgc3RhY2tDb3VudFRleHQgPSAnJztcclxuICAgIGlmICh0aGlzLnN0YWNrcyA+IDAgJiYgdGhpcy5zdGFja3MgPCAyMCAmJlxyXG4gICAgICBMaW5lRXZlbnQweDFBLnNob3dTdGFja0NvdW50Rm9yLmluY2x1ZGVzKHRoaXMuYWJpbGl0eUlkKSlcclxuICAgICAgc3RhY2tDb3VudFRleHQgPSAnICgnICsgdGhpcy5zdGFja3MudG9TdHJpbmcoKSArICcpJztcclxuXHJcbiAgICB0aGlzLmNvbnZlcnRlZExpbmUgPSB0aGlzLnByZWZpeCgpICsgdGhpcy50YXJnZXRJZCArXHJcbiAgICAgICc6JyArIHRoaXMudGFyZ2V0TmFtZSArXHJcbiAgICAgICcgbG9zZXMgdGhlIGVmZmVjdCBvZiAnICsgdGhpcy5hYmlsaXR5TmFtZSArXHJcbiAgICAgICcgZnJvbSAnICsgdGhpcy5mYWxsYmFja1Jlc29sdmVkVGFyZ2V0TmFtZSArXHJcbiAgICAgICcgZm9yICcgKyB0aGlzLmR1cmF0aW9uU3RyaW5nICsgJyBTZWNvbmRzLicgKyBzdGFja0NvdW50VGV4dDtcclxuXHJcbiAgICB0aGlzLnByb3BlckNhc2VDb252ZXJ0ZWRMaW5lID0gdGhpcy5wcmVmaXgoKSArIHRoaXMudGFyZ2V0SWQgK1xyXG4gICAgICAnOicgKyBFbXVsYXRvckNvbW1vbi5wcm9wZXJDYXNlKHRoaXMudGFyZ2V0TmFtZSkgK1xyXG4gICAgICAnIGxvc2VzIHRoZSBlZmZlY3Qgb2YgJyArIHRoaXMuYWJpbGl0eU5hbWUgK1xyXG4gICAgICAnIGZyb20gJyArIEVtdWxhdG9yQ29tbW9uLnByb3BlckNhc2UodGhpcy5mYWxsYmFja1Jlc29sdmVkVGFyZ2V0TmFtZSkgK1xyXG4gICAgICAnIGZvciAnICsgdGhpcy5kdXJhdGlvblN0cmluZyArICcgU2Vjb25kcy4nICsgc3RhY2tDb3VudFRleHQ7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MzAgZXh0ZW5kcyBMaW5lRXZlbnQweDFFIHsgfVxyXG4iLCJpbXBvcnQgTGluZUV2ZW50IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IEVtdWxhdG9yQ29tbW9uIGZyb20gJy4uLy4uL0VtdWxhdG9yQ29tbW9uJztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmNvbnN0IHNwbGl0RnVuYyA9IChzOiBzdHJpbmcpID0+IFtcclxuICBzLnN1YnN0cig2LCAyKSxcclxuICBzLnN1YnN0cig0LCAyKSxcclxuICBzLnN1YnN0cigyLCAyKSxcclxuICBzLnN1YnN0cigwLCAyKSxcclxuXTtcclxuXHJcbmNvbnN0IGZpZWxkcyA9IHtcclxuICBpZDogMixcclxuICBkYXRhQnl0ZXMxOiAzLFxyXG4gIGRhdGFCeXRlczI6IDQsXHJcbiAgZGF0YUJ5dGVzMzogNSxcclxuICBkYXRhQnl0ZXM0OiA2LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gSm9iIGdhdWdlIGV2ZW50XHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQweDFGIGV4dGVuZHMgTGluZUV2ZW50IHtcclxuICBwdWJsaWMgcmVhZG9ubHkgam9iR2F1Z2VCeXRlczogc3RyaW5nW107XHJcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVyQ2FzZUNvbnZlcnRlZExpbmU6IHN0cmluZztcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGlkOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGRhdGFCeXRlczE6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgZGF0YUJ5dGVzMjogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBkYXRhQnl0ZXMzOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGRhdGFCeXRlczQ6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IocmVwbzogTG9nUmVwb3NpdG9yeSwgbGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHN1cGVyKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gcGFydHNbZmllbGRzLmlkXT8udG9VcHBlckNhc2UoKSA/PyAnJztcclxuICAgIHRoaXMuZGF0YUJ5dGVzMSA9IEVtdWxhdG9yQ29tbW9uLnplcm9QYWQocGFydHNbZmllbGRzLmRhdGFCeXRlczFdID8/ICcnKTtcclxuICAgIHRoaXMuZGF0YUJ5dGVzMiA9IEVtdWxhdG9yQ29tbW9uLnplcm9QYWQocGFydHNbZmllbGRzLmRhdGFCeXRlczJdID8/ICcnKTtcclxuICAgIHRoaXMuZGF0YUJ5dGVzMyA9IEVtdWxhdG9yQ29tbW9uLnplcm9QYWQocGFydHNbZmllbGRzLmRhdGFCeXRlczNdID8/ICcnKTtcclxuICAgIHRoaXMuZGF0YUJ5dGVzNCA9IEVtdWxhdG9yQ29tbW9uLnplcm9QYWQocGFydHNbZmllbGRzLmRhdGFCeXRlczRdID8/ICcnKTtcclxuXHJcbiAgICB0aGlzLmpvYkdhdWdlQnl0ZXMgPSBbXHJcbiAgICAgIC4uLnNwbGl0RnVuYyh0aGlzLmRhdGFCeXRlczEpLFxyXG4gICAgICAuLi5zcGxpdEZ1bmModGhpcy5kYXRhQnl0ZXMyKSxcclxuICAgICAgLi4uc3BsaXRGdW5jKHRoaXMuZGF0YUJ5dGVzMyksXHJcbiAgICAgIC4uLnNwbGl0RnVuYyh0aGlzLmRhdGFCeXRlczQpLFxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLm5hbWUgPSByZXBvLkNvbWJhdGFudHNbdGhpcy5pZF0/Lm5hbWUgfHwgJyc7XHJcblxyXG4gICAgcmVwby51cGRhdGVDb21iYXRhbnQodGhpcy5pZCwge1xyXG4gICAgICBuYW1lOiByZXBvLkNvbWJhdGFudHNbdGhpcy5pZF0/Lm5hbWUsXHJcbiAgICAgIHNwYXduOiB0aGlzLnRpbWVzdGFtcCxcclxuICAgICAgZGVzcGF3bjogdGhpcy50aW1lc3RhbXAsXHJcbiAgICAgIGpvYjogdGhpcy5qb2JHYXVnZUJ5dGVzWzBdPy50b1VwcGVyQ2FzZSgpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5jb252ZXJ0ZWRMaW5lID0gdGhpcy5wcmVmaXgoKSArXHJcbiAgICAgIHRoaXMuaWQgKyAnOicgKyB0aGlzLm5hbWUgK1xyXG4gICAgICAnOicgKyB0aGlzLmRhdGFCeXRlczEgK1xyXG4gICAgICAnOicgKyB0aGlzLmRhdGFCeXRlczIgK1xyXG4gICAgICAnOicgKyB0aGlzLmRhdGFCeXRlczMgK1xyXG4gICAgICAnOicgKyB0aGlzLmRhdGFCeXRlczQ7XHJcbiAgICB0aGlzLnByb3BlckNhc2VDb252ZXJ0ZWRMaW5lID0gdGhpcy5wcmVmaXgoKSArXHJcbiAgICAgIHRoaXMuaWQgKyAnOicgKyAoRW11bGF0b3JDb21tb24ucHJvcGVyQ2FzZSh0aGlzLm5hbWUpKSArXHJcbiAgICAgICc6JyArIHRoaXMuZGF0YUJ5dGVzMSArXHJcbiAgICAgICc6JyArIHRoaXMuZGF0YUJ5dGVzMiArXHJcbiAgICAgICc6JyArIHRoaXMuZGF0YUJ5dGVzMyArXHJcbiAgICAgICc6JyArIHRoaXMuZGF0YUJ5dGVzNDtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQzMSBleHRlbmRzIExpbmVFdmVudDB4MUYge31cclxuIiwiaW1wb3J0IExpbmVFdmVudCwgeyBMaW5lRXZlbnRTb3VyY2UgfSBmcm9tICcuL0xpbmVFdmVudCc7XHJcbmltcG9ydCBMb2dSZXBvc2l0b3J5IGZyb20gJy4vTG9nUmVwb3NpdG9yeSc7XHJcblxyXG5jb25zdCBmaWVsZHMgPSB7XHJcbiAgaWQ6IDIsXHJcbiAgbmFtZTogMyxcclxuICB0YXJnZXRJZDogNCxcclxuICB0YXJnZXROYW1lOiA1LFxyXG4gIHRhcmdldGFibGU6IDYsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vLyBOYW1lcGxhdGUgdG9nZ2xlXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQweDIyIGV4dGVuZHMgTGluZUV2ZW50IGltcGxlbWVudHMgTGluZUV2ZW50U291cmNlIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRJZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXROYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRhcmdldGFibGU6IGJvb2xlYW47XHJcbiAgcHVibGljIHJlYWRvbmx5IGlzU291cmNlID0gdHJ1ZTtcclxuXHJcbiAgY29uc3RydWN0b3IocmVwbzogTG9nUmVwb3NpdG9yeSwgbGluZTogc3RyaW5nLCBwYXJ0czogc3RyaW5nW10pIHtcclxuICAgIHN1cGVyKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gcGFydHNbZmllbGRzLmlkXT8udG9VcHBlckNhc2UoKSA/PyAnJztcclxuICAgIHRoaXMubmFtZSA9IHBhcnRzW2ZpZWxkcy5uYW1lXSA/PyAnJztcclxuICAgIHRoaXMudGFyZ2V0SWQgPSBwYXJ0c1tmaWVsZHMudGFyZ2V0SWRdPy50b1VwcGVyQ2FzZSgpID8/ICcnO1xyXG4gICAgdGhpcy50YXJnZXROYW1lID0gcGFydHNbZmllbGRzLnRhcmdldE5hbWVdID8/ICcnO1xyXG4gICAgdGhpcy50YXJnZXRhYmxlID0gISFwYXJzZUludChwYXJ0c1tmaWVsZHMudGFyZ2V0YWJsZV0gPz8gJycsIDE2KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQzNCBleHRlbmRzIExpbmVFdmVudDB4MjIge31cclxuIiwiaW1wb3J0IExpbmVFdmVudCBmcm9tICcuL0xpbmVFdmVudCc7XHJcbmltcG9ydCBMb2dSZXBvc2l0b3J5IGZyb20gJy4vTG9nUmVwb3NpdG9yeSc7XHJcblxyXG5jb25zdCBmaWVsZHMgPSB7XHJcbiAgaWQ6IDIsXHJcbiAgbmFtZTogMyxcclxuICB0YXJnZXRJZDogNCxcclxuICB0YXJnZXROYW1lOiA1LFxyXG4gIHRldGhlcklkOiA4LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gVGV0aGVyIGV2ZW50XHJcbmV4cG9ydCBjbGFzcyBMaW5lRXZlbnQweDIzIGV4dGVuZHMgTGluZUV2ZW50IHtcclxuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRJZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXROYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRldGhlcklkOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJlcG86IExvZ1JlcG9zaXRvcnksIGxpbmU6IHN0cmluZywgcGFydHM6IHN0cmluZ1tdKSB7XHJcbiAgICBzdXBlcihyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcblxyXG4gICAgdGhpcy5pZCA9IHBhcnRzW2ZpZWxkcy5pZF0/LnRvVXBwZXJDYXNlKCkgPz8gJyc7XHJcbiAgICB0aGlzLm5hbWUgPSBwYXJ0c1tmaWVsZHMubmFtZV0gPz8gJyc7XHJcbiAgICB0aGlzLnRhcmdldElkID0gcGFydHNbZmllbGRzLnRhcmdldElkXT8udG9VcHBlckNhc2UoKSA/PyAnJztcclxuICAgIHRoaXMudGFyZ2V0TmFtZSA9IHBhcnRzW2ZpZWxkcy50YXJnZXROYW1lXSA/PyAnJztcclxuICAgIHRoaXMudGV0aGVySWQgPSBwYXJ0c1tmaWVsZHMudGV0aGVySWRdID8/ICcnO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDM1IGV4dGVuZHMgTGluZUV2ZW50MHgyMyB7fVxyXG4iLCJpbXBvcnQgTGluZUV2ZW50IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmNvbnN0IGZpZWxkcyA9IHtcclxuICB2YWx1ZUhleDogMixcclxuICBiYXJzOiAzLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gTGltaXQgZ2F1Z2UgZXZlbnRcclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDB4MjQgZXh0ZW5kcyBMaW5lRXZlbnQge1xyXG4gIHB1YmxpYyByZWFkb25seSB2YWx1ZUhleDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSB2YWx1ZURlYzogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBiYXJzOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJlcG86IExvZ1JlcG9zaXRvcnksIGxpbmU6IHN0cmluZywgcGFydHM6IHN0cmluZ1tdKSB7XHJcbiAgICBzdXBlcihyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcblxyXG4gICAgdGhpcy52YWx1ZUhleCA9IHBhcnRzW2ZpZWxkcy52YWx1ZUhleF0gPz8gJyc7XHJcbiAgICB0aGlzLnZhbHVlRGVjID0gcGFyc2VJbnQodGhpcy52YWx1ZUhleCwgMTYpO1xyXG4gICAgdGhpcy5iYXJzID0gcGFydHNbZmllbGRzLmJhcnNdID8/ICcnO1xyXG5cclxuICAgIHRoaXMuY29udmVydGVkTGluZSA9IHRoaXMucHJlZml4KCkgKyAnTGltaXQgQnJlYWs6ICcgKyB0aGlzLnZhbHVlSGV4O1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDM2IGV4dGVuZHMgTGluZUV2ZW50MHgyNCB7fVxyXG4iLCJpbXBvcnQgTGluZUV2ZW50LCB7IExpbmVFdmVudFNvdXJjZSB9IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmNvbnN0IGZpZWxkcyA9IHtcclxuICBpZDogMixcclxuICBuYW1lOiAzLFxyXG4gIHNlcXVlbmNlSWQ6IDQsXHJcbiAgY3VycmVudEhwOiA1LFxyXG4gIG1heEhwOiA2LFxyXG4gIGN1cnJlbnRNcDogNyxcclxuICBtYXhNcDogOCxcclxuICBjdXJyZW50VHA6IDksXHJcbiAgbWF4VHA6IDEwLFxyXG4gIHg6IDExLFxyXG4gIHk6IDEyLFxyXG4gIHo6IDEzLFxyXG4gIGhlYWRpbmc6IDE0LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gQWN0aW9uIHN5bmMgZXZlbnRcclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDB4MjUgZXh0ZW5kcyBMaW5lRXZlbnQgaW1wbGVtZW50cyBMaW5lRXZlbnRTb3VyY2Uge1xyXG4gIHB1YmxpYyByZWFkb25seSBpZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHNlcXVlbmNlSWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgaHA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWF4SHA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbXA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWF4TXA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgdHA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWF4VHA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB5OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHo6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaGVhZGluZzogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBpc1NvdXJjZSA9IHRydWU7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJlcG86IExvZ1JlcG9zaXRvcnksIGxpbmU6IHN0cmluZywgcGFydHM6IHN0cmluZ1tdKSB7XHJcbiAgICBzdXBlcihyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcblxyXG4gICAgdGhpcy5pZCA9IHBhcnRzW2ZpZWxkcy5pZF0/LnRvVXBwZXJDYXNlKCkgPz8gJyc7XHJcbiAgICB0aGlzLm5hbWUgPSBwYXJ0c1tmaWVsZHMubmFtZV0gPz8gJyc7XHJcbiAgICB0aGlzLnNlcXVlbmNlSWQgPSBwYXJ0c1tmaWVsZHMuc2VxdWVuY2VJZF0gPz8gJyc7XHJcbiAgICB0aGlzLmhwID0gcGFyc2VJbnQocGFydHNbZmllbGRzLmN1cnJlbnRIcF0gPz8gJycpO1xyXG4gICAgdGhpcy5tYXhIcCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5tYXhIcF0gPz8gJycpO1xyXG4gICAgdGhpcy5tcCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5jdXJyZW50TXBdID8/ICcnKTtcclxuICAgIHRoaXMubWF4TXAgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMubWF4TXBdID8/ICcnKTtcclxuICAgIHRoaXMudHAgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMuY3VycmVudFRwXSA/PyAnJyk7XHJcbiAgICB0aGlzLm1heFRwID0gcGFyc2VJbnQocGFydHNbZmllbGRzLm1heFRwXSA/PyAnJyk7XHJcbiAgICB0aGlzLnggPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy54XSA/PyAnJyk7XHJcbiAgICB0aGlzLnkgPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy55XSA/PyAnJyk7XHJcbiAgICB0aGlzLnogPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy56XSA/PyAnJyk7XHJcbiAgICB0aGlzLmhlYWRpbmcgPSBwYXJzZUZsb2F0KHBhcnRzW2ZpZWxkcy5oZWFkaW5nXSA/PyAnJyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MzcgZXh0ZW5kcyBMaW5lRXZlbnQweDI1IHt9XHJcbiIsImltcG9ydCBMaW5lRXZlbnQsIHsgTGluZUV2ZW50Sm9iTGV2ZWwsIExpbmVFdmVudFNvdXJjZSB9IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IEVtdWxhdG9yQ29tbW9uIGZyb20gJy4uLy4uL0VtdWxhdG9yQ29tbW9uJztcclxuaW1wb3J0IFV0aWwgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3V0aWwnO1xyXG5pbXBvcnQgTG9nUmVwb3NpdG9yeSBmcm9tICcuL0xvZ1JlcG9zaXRvcnknO1xyXG5cclxuY29uc3QgZmllbGRzID0ge1xyXG4gIGlkOiAyLFxyXG4gIG5hbWU6IDMsXHJcbiAgam9iTGV2ZWxEYXRhOiA0LFxyXG4gIGN1cnJlbnRIcDogNSxcclxuICBtYXhIcDogNixcclxuICBjdXJyZW50TXA6IDcsXHJcbiAgbWF4TXA6IDgsXHJcbiAgY3VycmVudFRwOiA5LFxyXG4gIG1heFRwOiAxMCxcclxuICB4OiAxMSxcclxuICB5OiAxMixcclxuICB6OiAxMyxcclxuICBoZWFkaW5nOiAxNCxcclxufSBhcyBjb25zdDtcclxuXHJcbi8vIE5ldHdvcmsgc3RhdHVzIGVmZmVjdCBldmVudFxyXG5leHBvcnQgY2xhc3MgTGluZUV2ZW50MHgyNiBleHRlbmRzIExpbmVFdmVudCBpbXBsZW1lbnRzIExpbmVFdmVudFNvdXJjZSwgTGluZUV2ZW50Sm9iTGV2ZWwge1xyXG4gIHB1YmxpYyByZWFkb25seSBqb2JJZEhleDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBqb2JJZDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBqb2I6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbGV2ZWw6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBqb2JMZXZlbERhdGE6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgaHA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWF4SHA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbXA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWF4TXA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgdHA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWF4VHA6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgeDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB5OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHo6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaGVhZGluZzogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBpc1NvdXJjZSA9IHRydWU7XHJcbiAgcHVibGljIHJlYWRvbmx5IGlzSm9iTGV2ZWwgPSB0cnVlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihyZXBvOiBMb2dSZXBvc2l0b3J5LCBsaW5lOiBzdHJpbmcsIHBhcnRzOiBzdHJpbmdbXSkge1xyXG4gICAgc3VwZXIocmVwbywgbGluZSwgcGFydHMpO1xyXG5cclxuICAgIHRoaXMuaWQgPSBwYXJ0c1tmaWVsZHMuaWRdPy50b1VwcGVyQ2FzZSgpID8/ICcnO1xyXG4gICAgdGhpcy5uYW1lID0gcGFydHNbZmllbGRzLm5hbWVdID8/ICcnO1xyXG5cclxuICAgIHRoaXMuam9iTGV2ZWxEYXRhID0gcGFydHNbZmllbGRzLmpvYkxldmVsRGF0YV0gPz8gJyc7XHJcblxyXG4gICAgdGhpcy5ocCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5jdXJyZW50SHBdID8/ICcnKTtcclxuICAgIHRoaXMubWF4SHAgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMubWF4SHBdID8/ICcnKTtcclxuICAgIHRoaXMubXAgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMuY3VycmVudE1wXSA/PyAnJyk7XHJcbiAgICB0aGlzLm1heE1wID0gcGFyc2VJbnQocGFydHNbZmllbGRzLm1heE1wXSA/PyAnJyk7XHJcbiAgICB0aGlzLnRwID0gcGFyc2VJbnQocGFydHNbZmllbGRzLmN1cnJlbnRUcF0gPz8gJycpO1xyXG4gICAgdGhpcy5tYXhUcCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5tYXhUcF0gPz8gJycpO1xyXG4gICAgdGhpcy54ID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMueF0gPz8gJycpO1xyXG4gICAgdGhpcy55ID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMueV0gPz8gJycpO1xyXG4gICAgdGhpcy56ID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMuel0gPz8gJycpO1xyXG4gICAgdGhpcy5oZWFkaW5nID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMuaGVhZGluZ10gPz8gJycpO1xyXG5cclxuICAgIGNvbnN0IHBhZGRlZCA9IEVtdWxhdG9yQ29tbW9uLnplcm9QYWQodGhpcy5qb2JMZXZlbERhdGEsIDgpO1xyXG5cclxuICAgIHRoaXMuam9iSWRIZXggPSBwYWRkZWQuc3Vic3RyKDYsIDIpLnRvVXBwZXJDYXNlKCk7XHJcbiAgICB0aGlzLmpvYklkID0gcGFyc2VJbnQodGhpcy5qb2JJZEhleCwgMTYpO1xyXG4gICAgdGhpcy5qb2IgPSBVdGlsLmpvYkVudW1Ub0pvYih0aGlzLmpvYklkKTtcclxuXHJcbiAgICB0aGlzLmxldmVsID0gcGFyc2VJbnQocGFkZGVkLnN1YnN0cig0LCAyKSwgMTYpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDM4IGV4dGVuZHMgTGluZUV2ZW50MHgyNiB7fVxyXG4iLCJpbXBvcnQgTGluZUV2ZW50LCB7IExpbmVFdmVudFNvdXJjZSB9IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmNvbnN0IGZpZWxkcyA9IHtcclxuICBpZDogMixcclxuICBuYW1lOiAzLFxyXG4gIGN1cnJlbnRIcDogNCxcclxuICBtYXhIcDogNSxcclxuICBjdXJyZW50TXA6IDYsXHJcbiAgbWF4TXA6IDcsXHJcbiAgY3VycmVudFRwOiA4LFxyXG4gIG1heFRwOiA5LFxyXG4gIHg6IDEwLFxyXG4gIHk6IDExLFxyXG4gIHo6IDEyLFxyXG4gIGhlYWRpbmc6IDEzLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gTmV0d29yayB1cGRhdGUgaHAgZXZlbnRcclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDB4MjcgZXh0ZW5kcyBMaW5lRXZlbnQgaW1wbGVtZW50cyBMaW5lRXZlbnRTb3VyY2Uge1xyXG4gIHB1YmxpYyByZWFkb25seSBpZDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IGhwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1heEhwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1wOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1heE1wOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1heFRwOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHg6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgeTogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB6OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGhlYWRpbmc6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNTb3VyY2UgPSB0cnVlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihyZXBvOiBMb2dSZXBvc2l0b3J5LCBsaW5lOiBzdHJpbmcsIHBhcnRzOiBzdHJpbmdbXSkge1xyXG4gICAgc3VwZXIocmVwbywgbGluZSwgcGFydHMpO1xyXG5cclxuICAgIHRoaXMuaWQgPSBwYXJ0c1tmaWVsZHMuaWRdPy50b1VwcGVyQ2FzZSgpID8/ICcnO1xyXG4gICAgdGhpcy5uYW1lID0gcGFydHNbZmllbGRzLm5hbWVdID8/ICcnO1xyXG4gICAgdGhpcy5ocCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5jdXJyZW50SHBdID8/ICcnKTtcclxuICAgIHRoaXMubWF4SHAgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMubWF4SHBdID8/ICcnKTtcclxuICAgIHRoaXMubXAgPSBwYXJzZUludChwYXJ0c1tmaWVsZHMuY3VycmVudE1wXSA/PyAnJyk7XHJcbiAgICB0aGlzLm1heE1wID0gcGFyc2VJbnQocGFydHNbZmllbGRzLm1heE1wXSA/PyAnJyk7XHJcbiAgICB0aGlzLnRwID0gcGFyc2VJbnQocGFydHNbZmllbGRzLmN1cnJlbnRUcF0gPz8gJycpO1xyXG4gICAgdGhpcy5tYXhUcCA9IHBhcnNlSW50KHBhcnRzW2ZpZWxkcy5tYXhUcF0gPz8gJycpO1xyXG4gICAgdGhpcy54ID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMueF0gPz8gJycpO1xyXG4gICAgdGhpcy55ID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMueV0gPz8gJycpO1xyXG4gICAgdGhpcy56ID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMuel0gPz8gJycpO1xyXG4gICAgdGhpcy5oZWFkaW5nID0gcGFyc2VGbG9hdChwYXJ0c1tmaWVsZHMuaGVhZGluZ10gPz8gJycpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpbmVFdmVudDM5IGV4dGVuZHMgTGluZUV2ZW50MHgyNyB7fVxyXG4iLCJpbXBvcnQgTGluZUV2ZW50IGZyb20gJy4vTGluZUV2ZW50JztcclxuaW1wb3J0IHsgTGluZUV2ZW50MDAgfSBmcm9tICcuL0xpbmVFdmVudDB4MDAnO1xyXG5pbXBvcnQgeyBMaW5lRXZlbnQwMSB9IGZyb20gJy4vTGluZUV2ZW50MHgwMSc7XHJcbmltcG9ydCB7IExpbmVFdmVudDAyIH0gZnJvbSAnLi9MaW5lRXZlbnQweDAyJztcclxuaW1wb3J0IHsgTGluZUV2ZW50MDMgfSBmcm9tICcuL0xpbmVFdmVudDB4MDMnO1xyXG5pbXBvcnQgeyBMaW5lRXZlbnQwNCB9IGZyb20gJy4vTGluZUV2ZW50MHgwNCc7XHJcbmltcG9ydCB7IExpbmVFdmVudDEyIH0gZnJvbSAnLi9MaW5lRXZlbnQweDBDJztcclxuaW1wb3J0IHsgTGluZUV2ZW50MjAgfSBmcm9tICcuL0xpbmVFdmVudDB4MTQnO1xyXG5pbXBvcnQgeyBMaW5lRXZlbnQyMSB9IGZyb20gJy4vTGluZUV2ZW50MHgxNSc7XHJcbmltcG9ydCB7IExpbmVFdmVudDIyIH0gZnJvbSAnLi9MaW5lRXZlbnQweDE2JztcclxuaW1wb3J0IHsgTGluZUV2ZW50MjMgfSBmcm9tICcuL0xpbmVFdmVudDB4MTcnO1xyXG5pbXBvcnQgeyBMaW5lRXZlbnQyNCB9IGZyb20gJy4vTGluZUV2ZW50MHgxOCc7XHJcbmltcG9ydCB7IExpbmVFdmVudDI1IH0gZnJvbSAnLi9MaW5lRXZlbnQweDE5JztcclxuaW1wb3J0IHsgTGluZUV2ZW50MjYgfSBmcm9tICcuL0xpbmVFdmVudDB4MUEnO1xyXG5pbXBvcnQgeyBMaW5lRXZlbnQyNyB9IGZyb20gJy4vTGluZUV2ZW50MHgxQic7XHJcbmltcG9ydCB7IExpbmVFdmVudDI4IH0gZnJvbSAnLi9MaW5lRXZlbnQweDFDJztcclxuaW1wb3J0IHsgTGluZUV2ZW50MjkgfSBmcm9tICcuL0xpbmVFdmVudDB4MUQnO1xyXG5pbXBvcnQgeyBMaW5lRXZlbnQzMCB9IGZyb20gJy4vTGluZUV2ZW50MHgxRSc7XHJcbmltcG9ydCB7IExpbmVFdmVudDMxIH0gZnJvbSAnLi9MaW5lRXZlbnQweDFGJztcclxuaW1wb3J0IHsgTGluZUV2ZW50MzQgfSBmcm9tICcuL0xpbmVFdmVudDB4MjInO1xyXG5pbXBvcnQgeyBMaW5lRXZlbnQzNSB9IGZyb20gJy4vTGluZUV2ZW50MHgyMyc7XHJcbmltcG9ydCB7IExpbmVFdmVudDM2IH0gZnJvbSAnLi9MaW5lRXZlbnQweDI0JztcclxuaW1wb3J0IHsgTGluZUV2ZW50MzcgfSBmcm9tICcuL0xpbmVFdmVudDB4MjUnO1xyXG5pbXBvcnQgeyBMaW5lRXZlbnQzOCB9IGZyb20gJy4vTGluZUV2ZW50MHgyNic7XHJcbmltcG9ydCB7IExpbmVFdmVudDM5IH0gZnJvbSAnLi9MaW5lRXZlbnQweDI3JztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlTGluZSB7XHJcbiAgc3RhdGljIHBhcnNlKHJlcG86IExvZ1JlcG9zaXRvcnksIGxpbmU6IHN0cmluZyk6IExpbmVFdmVudCB8IHVuZGVmaW5lZCB7XHJcbiAgICBsZXQgcmV0O1xyXG5cclxuICAgIGNvbnN0IHBhcnRzID0gbGluZS5zcGxpdCgnfCcpO1xyXG4gICAgY29uc3QgZXZlbnQgPSBwYXJ0c1swXTtcclxuXHJcbiAgICAvLyBEb24ndCBwYXJzZSByYXcgbmV0d29yayBwYWNrZXQgbGluZXNcclxuICAgIGlmICghZXZlbnQgfHwgZXZlbnQgPT09ICcyNTInKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgLy8gVGhpcyBpcyB1Z2x5LCBidXQgV2VicGFjayBwcmVmZXJzIGJlaW5nIGV4cGxpY2l0XHJcbiAgICBzd2l0Y2ggKCdMaW5lRXZlbnQnICsgZXZlbnQpIHtcclxuICAgIGNhc2UgJ0xpbmVFdmVudDAwJzpcclxuICAgICAgcmV0ID0gbmV3IExpbmVFdmVudDAwKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdMaW5lRXZlbnQwMSc6XHJcbiAgICAgIHJldCA9IG5ldyBMaW5lRXZlbnQwMShyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnTGluZUV2ZW50MDInOlxyXG4gICAgICByZXQgPSBuZXcgTGluZUV2ZW50MDIocmVwbywgbGluZSwgcGFydHMpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ0xpbmVFdmVudDAzJzpcclxuICAgICAgcmV0ID0gbmV3IExpbmVFdmVudDAzKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdMaW5lRXZlbnQwNCc6XHJcbiAgICAgIHJldCA9IG5ldyBMaW5lRXZlbnQwNChyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnTGluZUV2ZW50MTInOlxyXG4gICAgICByZXQgPSBuZXcgTGluZUV2ZW50MTIocmVwbywgbGluZSwgcGFydHMpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ0xpbmVFdmVudDIwJzpcclxuICAgICAgcmV0ID0gbmV3IExpbmVFdmVudDIwKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdMaW5lRXZlbnQyMSc6XHJcbiAgICAgIHJldCA9IG5ldyBMaW5lRXZlbnQyMShyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnTGluZUV2ZW50MjInOlxyXG4gICAgICByZXQgPSBuZXcgTGluZUV2ZW50MjIocmVwbywgbGluZSwgcGFydHMpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ0xpbmVFdmVudDIzJzpcclxuICAgICAgcmV0ID0gbmV3IExpbmVFdmVudDIzKHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdMaW5lRXZlbnQyNCc6XHJcbiAgICAgIHJldCA9IG5ldyBMaW5lRXZlbnQyNChyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnTGluZUV2ZW50MjUnOlxyXG4gICAgICByZXQgPSBuZXcgTGluZUV2ZW50MjUocmVwbywgbGluZSwgcGFydHMpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ0xpbmVFdmVudDI2JzpcclxuICAgICAgcmV0ID0gbmV3IExpbmVFdmVudDI2KHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdMaW5lRXZlbnQyNyc6XHJcbiAgICAgIHJldCA9IG5ldyBMaW5lRXZlbnQyNyhyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnTGluZUV2ZW50MjgnOlxyXG4gICAgICByZXQgPSBuZXcgTGluZUV2ZW50MjgocmVwbywgbGluZSwgcGFydHMpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ0xpbmVFdmVudDI5JzpcclxuICAgICAgcmV0ID0gbmV3IExpbmVFdmVudDI5KHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdMaW5lRXZlbnQzMCc6XHJcbiAgICAgIHJldCA9IG5ldyBMaW5lRXZlbnQzMChyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnTGluZUV2ZW50MzEnOlxyXG4gICAgICByZXQgPSBuZXcgTGluZUV2ZW50MzEocmVwbywgbGluZSwgcGFydHMpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ0xpbmVFdmVudDM0JzpcclxuICAgICAgcmV0ID0gbmV3IExpbmVFdmVudDM0KHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdMaW5lRXZlbnQzNSc6XHJcbiAgICAgIHJldCA9IG5ldyBMaW5lRXZlbnQzNShyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnTGluZUV2ZW50MzYnOlxyXG4gICAgICByZXQgPSBuZXcgTGluZUV2ZW50MzYocmVwbywgbGluZSwgcGFydHMpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ0xpbmVFdmVudDM3JzpcclxuICAgICAgcmV0ID0gbmV3IExpbmVFdmVudDM3KHJlcG8sIGxpbmUsIHBhcnRzKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdMaW5lRXZlbnQzOCc6XHJcbiAgICAgIHJldCA9IG5ldyBMaW5lRXZlbnQzOChyZXBvLCBsaW5lLCBwYXJ0cyk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnTGluZUV2ZW50MzknOlxyXG4gICAgICByZXQgPSBuZXcgTGluZUV2ZW50MzkocmVwbywgbGluZSwgcGFydHMpO1xyXG4gICAgICBicmVhaztcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldCA9IG5ldyBMaW5lRXZlbnQocmVwbywgbGluZSwgcGFydHMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFsc28gZG9uJ3QgcGFyc2UgbGluZXMgd2l0aCBhIG5vbi1zYW5lIGRhdGUuIFRoaXMgaXMgMjAwMC0wMS0wMSAwMDowMDowMFxyXG4gICAgaWYgKHJldCAmJiByZXQudGltZXN0YW1wIDwgOTQ2Njg0ODAwKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgLy8gRmluYWxseSwgaWYgdGhlIG9iamVjdCBtYXJrcyBpdHNlbGYgYXMgaW52YWxpZCwgc2tpcCBpdFxyXG4gICAgaWYgKHJldCAmJiByZXQuaW52YWxpZClcclxuICAgICAgcmV0dXJuO1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBFdmVudEJ1cyBmcm9tICcuLi9FdmVudEJ1cyc7XHJcbmltcG9ydCBMaW5lRXZlbnQgZnJvbSAnLi9uZXR3b3JrX2xvZ19jb252ZXJ0ZXIvTGluZUV2ZW50JztcclxuaW1wb3J0IExvZ1JlcG9zaXRvcnkgZnJvbSAnLi9uZXR3b3JrX2xvZ19jb252ZXJ0ZXIvTG9nUmVwb3NpdG9yeSc7XHJcbmltcG9ydCBQYXJzZUxpbmUgZnJvbSAnLi9uZXR3b3JrX2xvZ19jb252ZXJ0ZXIvUGFyc2VMaW5lJztcclxuXHJcbmNvbnN0IGlzTGluZUV2ZW50ID0gKGxpbmU/OiBMaW5lRXZlbnQpOiBsaW5lIGlzIExpbmVFdmVudCA9PiB7XHJcbiAgcmV0dXJuICEhbGluZTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5ldHdvcmtMb2dDb252ZXJ0ZXIgZXh0ZW5kcyBFdmVudEJ1cyB7XHJcbiAgY29udmVydEZpbGUoZGF0YTogc3RyaW5nKTogTGluZUV2ZW50W10ge1xyXG4gICAgY29uc3QgcmVwbyA9IG5ldyBMb2dSZXBvc2l0b3J5KCk7XHJcbiAgICByZXR1cm4gdGhpcy5jb252ZXJ0TGluZXMoXHJcbiAgICAgICAgLy8gU3BsaXQgZGF0YSBpbnRvIGFuIGFycmF5IG9mIHNlcGFyYXRlIGxpbmVzLCByZW1vdmluZyBhbnkgYmxhbmsgbGluZXMuXHJcbiAgICAgICAgZGF0YS5zcGxpdChOZXR3b3JrTG9nQ29udmVydGVyLmxpbmVTcGxpdFJlZ2V4KS5maWx0ZXIoKGwpID0+IGwgIT09ICcnKSxcclxuICAgICAgICByZXBvLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGNvbnZlcnRMaW5lcyhsaW5lczogc3RyaW5nW10sIHJlcG86IExvZ1JlcG9zaXRvcnkpOiBMaW5lRXZlbnRbXSB7XHJcbiAgICBsZXQgbGluZUV2ZW50cyA9IGxpbmVzLm1hcCgobCkgPT4gUGFyc2VMaW5lLnBhcnNlKHJlcG8sIGwpKS5maWx0ZXIoaXNMaW5lRXZlbnQpO1xyXG4gICAgLy8gQ2FsbCBgY29udmVydGAgdG8gY29udmVydCB0aGUgbmV0d29yayBsaW5lIHRvIG5vbi1uZXR3b3JrIGZvcm1hdCBhbmQgdXBkYXRlIGluZGV4aW5nIHZhbHVlc1xyXG4gICAgbGluZUV2ZW50cyA9IGxpbmVFdmVudHMubWFwKChsLCBpKSA9PiB7XHJcbiAgICAgIGwuaW5kZXggPSBpO1xyXG4gICAgICByZXR1cm4gbDtcclxuICAgIH0pO1xyXG4gICAgLy8gU29ydCB0aGUgbGluZXMgYmFzZWQgb24gYCR7dGltZXN0YW1wfV8ke2luZGV4fWAgdG8gaGFuZGxlIG91dC1vZi1vcmRlciBsaW5lcyBwcm9wZXJseVxyXG4gICAgLy8gQFRPRE86IFJlbW92ZSB0aGlzIG9uY2UgdW5kZXJseWluZyBDb21iYXRhbnRUcmFja2VyIHVwZGF0ZSBpc3N1ZXMgYXJlIHJlc29sdmVkXHJcbiAgICByZXR1cm4gbGluZUV2ZW50cy5zb3J0KChsLCByKSA9PiAoYCR7bC50aW1lc3RhbXB9XyR7bC5pbmRleH1gKS5sb2NhbGVDb21wYXJlKGAke3IudGltZXN0YW1wfV8ke3IuaW5kZXh9YCkpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGxpbmVTcGxpdFJlZ2V4ID0gL1xccj9cXG4vZ207XHJcbn1cclxuIiwiZXhwb3J0IGNvbnN0IGxhbmd1YWdlcyA9IFsnZW4nLCAnZGUnLCAnZnInLCAnamEnLCAnY24nLCAna28nXSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCB0eXBlIExhbmcgPSB0eXBlb2YgbGFuZ3VhZ2VzW251bWJlcl07XHJcblxyXG5leHBvcnQgdHlwZSBOb25FbkxhbmcgPSBFeGNsdWRlPExhbmcsICdlbic+O1xyXG5cclxuZXhwb3J0IGNvbnN0IGlzTGFuZyA9IChsYW5nPzogc3RyaW5nKTogbGFuZyBpcyBMYW5nID0+IHtcclxuICBjb25zdCBsYW5nU3RyczogcmVhZG9ubHkgc3RyaW5nW10gPSBsYW5ndWFnZXM7XHJcbiAgaWYgKCFsYW5nKVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIHJldHVybiBsYW5nU3Rycy5pbmNsdWRlcyhsYW5nKTtcclxufTtcclxuIiwiaW1wb3J0IENvbWJhdGFudFRyYWNrZXIgZnJvbSAnLi9Db21iYXRhbnRUcmFja2VyJztcclxuaW1wb3J0IFBldE5hbWVzQnlMYW5nIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy9wZXRfbmFtZXMnO1xyXG5pbXBvcnQgRW11bGF0b3JDb21tb24gZnJvbSAnLi4vRW11bGF0b3JDb21tb24nO1xyXG5pbXBvcnQgTG9nUmVwb3NpdG9yeSBmcm9tICcuL25ldHdvcmtfbG9nX2NvbnZlcnRlci9Mb2dSZXBvc2l0b3J5JztcclxuaW1wb3J0IE5ldHdvcmtMb2dDb252ZXJ0ZXIgZnJvbSAnLi9OZXR3b3JrTG9nQ29udmVydGVyJztcclxuaW1wb3J0IHsgTGFuZywgaXNMYW5nIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL2xhbmd1YWdlcyc7XHJcbmltcG9ydCBMaW5lRXZlbnQsIHsgaXNMaW5lRXZlbnRTb3VyY2UsIGlzTGluZUV2ZW50VGFyZ2V0IH0gZnJvbSAnLi9uZXR3b3JrX2xvZ19jb252ZXJ0ZXIvTGluZUV2ZW50JztcclxuaW1wb3J0IHsgVW5yZWFjaGFibGVDb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25vdF9yZWFjaGVkJztcclxuXHJcbmNvbnN0IGlzUGV0TmFtZSA9IChuYW1lOiBzdHJpbmcsIGxhbmd1YWdlPzogTGFuZykgPT4ge1xyXG4gIGlmIChsYW5ndWFnZSlcclxuICAgIHJldHVybiBQZXROYW1lc0J5TGFuZ1tsYW5ndWFnZV0uaW5jbHVkZXMobmFtZSk7XHJcblxyXG4gIGZvciAoY29uc3QgbGFuZyBpbiBQZXROYW1lc0J5TGFuZykge1xyXG4gICAgaWYgKCFpc0xhbmcobGFuZykpXHJcbiAgICAgIHRocm93IG5ldyBVbnJlYWNoYWJsZUNvZGUoKTtcclxuICAgIGlmIChQZXROYW1lc0J5TGFuZ1tsYW5nXS5pbmNsdWRlcyhuYW1lKSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5jb25zdCBpc1ZhbGlkVGltZXN0YW1wID0gKHRpbWVzdGFtcDogbnVtYmVyKSA9PiB7XHJcbiAgcmV0dXJuIHRpbWVzdGFtcCA+IDAgJiYgdGltZXN0YW1wIDwgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbmNvdW50ZXIge1xyXG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IGVuY291bnRlclZlcnNpb24gPSAxO1xyXG4gIHB1YmxpYyBpZD86IG51bWJlcjtcclxuICB2ZXJzaW9uOiBudW1iZXI7XHJcbiAgaW5pdGlhbE9mZnNldCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xyXG4gIGVuZFN0YXR1cyA9ICdVbmtub3duJztcclxuICBzdGFydFN0YXR1cyA9ICdVbmtub3duJztcclxuICBwcml2YXRlIGVuZ2FnZUF0ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XHJcbiAgcHJpdmF0ZSBmaXJzdFBsYXllckFiaWxpdHkgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcclxuICBwcml2YXRlIGZpcnN0RW5lbXlBYmlsaXR5ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XHJcbiAgZmlyc3RMaW5lSW5kZXggPSAwO1xyXG4gIGNvbWJhdGFudFRyYWNrZXI/OiBDb21iYXRhbnRUcmFja2VyO1xyXG4gIHN0YXJ0VGltZXN0YW1wID0gMDtcclxuICBlbmRUaW1lc3RhbXAgPSAwO1xyXG4gIGR1cmF0aW9uID0gMDtcclxuICBwbGF5YmFja09mZnNldCA9IDA7XHJcbiAgbGFuZ3VhZ2U6IExhbmcgPSAnZW4nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHB1YmxpYyBlbmNvdW50ZXJEYXk6IHN0cmluZyxcclxuICAgIHB1YmxpYyBlbmNvdW50ZXJab25lSWQ6IHN0cmluZyxcclxuICAgIHB1YmxpYyBlbmNvdW50ZXJab25lTmFtZTogc3RyaW5nLFxyXG4gICAgcHVibGljIGxvZ0xpbmVzOiBMaW5lRXZlbnRbXSkge1xyXG4gICAgdGhpcy52ZXJzaW9uID0gRW5jb3VudGVyLmVuY291bnRlclZlcnNpb247XHJcbiAgfVxyXG5cclxuICBpbml0aWFsaXplKCk6IHZvaWQge1xyXG4gICAgY29uc3Qgc3RhcnRTdGF0dXNlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG5cclxuICAgIHRoaXMubG9nTGluZXMuZm9yRWFjaCgobGluZSwgaSkgPT4ge1xyXG4gICAgICBpZiAoIWxpbmUpXHJcbiAgICAgICAgdGhyb3cgbmV3IFVucmVhY2hhYmxlQ29kZSgpO1xyXG5cclxuICAgICAgbGV0IHJlcyA9IEVtdWxhdG9yQ29tbW9uLm1hdGNoU3RhcnQobGluZS5uZXR3b3JrTGluZSk7XHJcbiAgICAgIGlmIChyZXMpIHtcclxuICAgICAgICB0aGlzLmZpcnN0TGluZUluZGV4ID0gaTtcclxuICAgICAgICBpZiAocmVzLmdyb3Vwcz8uU3RhcnRUeXBlKVxyXG4gICAgICAgICAgc3RhcnRTdGF0dXNlcy5hZGQocmVzLmdyb3Vwcy5TdGFydFR5cGUpO1xyXG4gICAgICAgIGlmIChyZXMuZ3JvdXBzPy5TdGFydEluKSB7XHJcbiAgICAgICAgICBjb25zdCBzdGFydEluID0gcGFyc2VJbnQocmVzLmdyb3Vwcy5TdGFydEluKTtcclxuICAgICAgICAgIGlmIChzdGFydEluID49IDApXHJcbiAgICAgICAgICAgIHRoaXMuZW5nYWdlQXQgPSBNYXRoLm1pbihsaW5lLnRpbWVzdGFtcCArIHN0YXJ0SW4sIHRoaXMuZW5nYWdlQXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXMgPSBFbXVsYXRvckNvbW1vbi5tYXRjaEVuZChsaW5lLm5ldHdvcmtMaW5lKTtcclxuICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICBpZiAocmVzLmdyb3Vwcz8uRW5kVHlwZSlcclxuICAgICAgICAgICAgdGhpcy5lbmRTdGF0dXMgPSByZXMuZ3JvdXBzLkVuZFR5cGU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc0xpbmVFdmVudFNvdXJjZShsaW5lKSAmJiBpc0xpbmVFdmVudFRhcmdldChsaW5lKSkge1xyXG4gICAgICAgICAgaWYgKGxpbmUuaWQuc3RhcnRzV2l0aCgnMScpIHx8XHJcbiAgICAgICAgICAgIChsaW5lLmlkLnN0YXJ0c1dpdGgoJzQnKSAmJiBpc1BldE5hbWUobGluZS5uYW1lLCB0aGlzLmxhbmd1YWdlKSkpIHtcclxuICAgICAgICAgICAgLy8gUGxheWVyIG9yIHBldCBhYmlsaXR5XHJcbiAgICAgICAgICAgIGlmIChsaW5lLnRhcmdldElkLnN0YXJ0c1dpdGgoJzQnKSAmJiAhaXNQZXROYW1lKGxpbmUudGFyZ2V0TmFtZSwgdGhpcy5sYW5ndWFnZSkpIHtcclxuICAgICAgICAgICAgICAvLyBUYXJnZXR0aW5nIG5vbiBwbGF5ZXIgb3IgcGV0XHJcbiAgICAgICAgICAgICAgdGhpcy5maXJzdFBsYXllckFiaWxpdHkgPSBNYXRoLm1pbih0aGlzLmZpcnN0UGxheWVyQWJpbGl0eSwgbGluZS50aW1lc3RhbXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGxpbmUuaWQuc3RhcnRzV2l0aCgnNCcpICYmICFpc1BldE5hbWUobGluZS5uYW1lLCB0aGlzLmxhbmd1YWdlKSkge1xyXG4gICAgICAgICAgICAvLyBOb24tcGxheWVyIGFiaWxpdHlcclxuICAgICAgICAgICAgaWYgKGxpbmUudGFyZ2V0SWQuc3RhcnRzV2l0aCgnMScpIHx8IGlzUGV0TmFtZShsaW5lLnRhcmdldE5hbWUsIHRoaXMubGFuZ3VhZ2UpKSB7XHJcbiAgICAgICAgICAgICAgLy8gVGFyZ2V0dGluZyBwbGF5ZXIgb3IgcGV0XHJcbiAgICAgICAgICAgICAgdGhpcy5maXJzdEVuZW15QWJpbGl0eSA9IE1hdGgubWluKHRoaXMuZmlyc3RFbmVteUFiaWxpdHksIGxpbmUudGltZXN0YW1wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjb25zdCBtYXRjaGVkTGFuZyA9IHJlcz8uZ3JvdXBzPy5sYW5ndWFnZTtcclxuICAgICAgaWYgKGlzTGFuZyhtYXRjaGVkTGFuZykpXHJcbiAgICAgICAgdGhpcy5sYW5ndWFnZSA9IG1hdGNoZWRMYW5nO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5jb21iYXRhbnRUcmFja2VyID0gbmV3IENvbWJhdGFudFRyYWNrZXIodGhpcy5sb2dMaW5lcywgdGhpcy5sYW5ndWFnZSk7XHJcbiAgICB0aGlzLnN0YXJ0VGltZXN0YW1wID0gdGhpcy5jb21iYXRhbnRUcmFja2VyLmZpcnN0VGltZXN0YW1wO1xyXG4gICAgdGhpcy5lbmRUaW1lc3RhbXAgPSB0aGlzLmNvbWJhdGFudFRyYWNrZXIubGFzdFRpbWVzdGFtcDtcclxuICAgIHRoaXMuZHVyYXRpb24gPSB0aGlzLmVuZFRpbWVzdGFtcCAtIHRoaXMuc3RhcnRUaW1lc3RhbXA7XHJcblxyXG4gICAgaWYgKHRoaXMuaW5pdGlhbE9mZnNldCA9PT0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHtcclxuICAgICAgaWYgKHRoaXMuZW5nYWdlQXQgPCBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUilcclxuICAgICAgICB0aGlzLmluaXRpYWxPZmZzZXQgPSB0aGlzLmVuZ2FnZUF0IC0gdGhpcy5zdGFydFRpbWVzdGFtcDtcclxuICAgICAgZWxzZSBpZiAodGhpcy5maXJzdFBsYXllckFiaWxpdHkgPCBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUilcclxuICAgICAgICB0aGlzLmluaXRpYWxPZmZzZXQgPSB0aGlzLmZpcnN0UGxheWVyQWJpbGl0eSAtIHRoaXMuc3RhcnRUaW1lc3RhbXA7XHJcbiAgICAgIGVsc2UgaWYgKHRoaXMuZmlyc3RFbmVteUFiaWxpdHkgPCBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUilcclxuICAgICAgICB0aGlzLmluaXRpYWxPZmZzZXQgPSB0aGlzLmZpcnN0RW5lbXlBYmlsaXR5IC0gdGhpcy5zdGFydFRpbWVzdGFtcDtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHRoaXMuaW5pdGlhbE9mZnNldCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlyc3RMaW5lID0gdGhpcy5sb2dMaW5lc1t0aGlzLmZpcnN0TGluZUluZGV4XTtcclxuXHJcbiAgICBpZiAoZmlyc3RMaW5lICYmIGZpcnN0TGluZS5vZmZzZXQpXHJcbiAgICAgIHRoaXMucGxheWJhY2tPZmZzZXQgPSBmaXJzdExpbmUub2Zmc2V0O1xyXG5cclxuICAgIHRoaXMuc3RhcnRTdGF0dXMgPSBbLi4uc3RhcnRTdGF0dXNlc10uc29ydCgpLmpvaW4oJywgJyk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGluaXRpYWxUaW1lc3RhbXAoKSA6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5zdGFydFRpbWVzdGFtcCArIHRoaXMuaW5pdGlhbE9mZnNldDtcclxuICB9XHJcblxyXG4gIHNob3VsZFBlcnNpc3RGaWdodCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBpc1ZhbGlkVGltZXN0YW1wKHRoaXMuZmlyc3RQbGF5ZXJBYmlsaXR5KSAmJiBpc1ZhbGlkVGltZXN0YW1wKHRoaXMuZmlyc3RFbmVteUFiaWxpdHkpO1xyXG4gIH1cclxuXHJcbiAgdXBncmFkZSh2ZXJzaW9uOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgIGlmIChFbmNvdW50ZXIuZW5jb3VudGVyVmVyc2lvbiA8PSB2ZXJzaW9uKVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgY29uc3QgcmVwbyA9IG5ldyBMb2dSZXBvc2l0b3J5KCk7XHJcbiAgICBjb25zdCBjb252ZXJ0ZXIgPSBuZXcgTmV0d29ya0xvZ0NvbnZlcnRlcigpO1xyXG4gICAgdGhpcy5sb2dMaW5lcyA9IGNvbnZlcnRlci5jb252ZXJ0TGluZXMoXHJcbiAgICAgICAgdGhpcy5sb2dMaW5lcy5tYXAoKGwpID0+IGwubmV0d29ya0xpbmUpLFxyXG4gICAgICAgIHJlcG8sXHJcbiAgICApO1xyXG4gICAgdGhpcy52ZXJzaW9uID0gRW5jb3VudGVyLmVuY291bnRlclZlcnNpb247XHJcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEVtdWxhdG9yQ29tbW9uIGZyb20gJy4uL0VtdWxhdG9yQ29tbW9uJztcclxuaW1wb3J0IEV2ZW50QnVzIGZyb20gJy4uL0V2ZW50QnVzJztcclxuaW1wb3J0IExpbmVFdmVudCBmcm9tICcuL25ldHdvcmtfbG9nX2NvbnZlcnRlci9MaW5lRXZlbnQnO1xyXG5pbXBvcnQgeyBMaW5lRXZlbnQweDAxIH0gZnJvbSAnLi9uZXR3b3JrX2xvZ19jb252ZXJ0ZXIvTGluZUV2ZW50MHgwMSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2dFdmVudEhhbmRsZXIgZXh0ZW5kcyBFdmVudEJ1cyB7XHJcbiAgcHVibGljIGN1cnJlbnRGaWdodDogTGluZUV2ZW50W10gPSBbXTtcclxuICBwdWJsaWMgY3VycmVudFpvbmVOYW1lID0gJ1Vua25vd24nO1xyXG4gIHB1YmxpYyBjdXJyZW50Wm9uZUlkID0gJy0xJztcclxuXHJcbiAgcGFyc2VMb2dzKGxvZ3M6IExpbmVFdmVudFtdKTogdm9pZCB7XHJcbiAgICBmb3IgKGNvbnN0IGxpbmVPYmogb2YgbG9ncykge1xyXG4gICAgICB0aGlzLmN1cnJlbnRGaWdodC5wdXNoKGxpbmVPYmopO1xyXG5cclxuICAgICAgbGluZU9iai5vZmZzZXQgPSBsaW5lT2JqLnRpbWVzdGFtcCAtIHRoaXMuY3VycmVudEZpZ2h0U3RhcnQ7XHJcblxyXG4gICAgICBjb25zdCByZXMgPSBFbXVsYXRvckNvbW1vbi5tYXRjaEVuZChsaW5lT2JqLm5ldHdvcmtMaW5lKTtcclxuICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgIHRoaXMuZW5kRmlnaHQoKTtcclxuICAgICAgfSBlbHNlIGlmIChsaW5lT2JqIGluc3RhbmNlb2YgTGluZUV2ZW50MHgwMSkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFpvbmVJZCA9IGxpbmVPYmouem9uZUlkO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFpvbmVOYW1lID0gbGluZU9iai56b25lTmFtZTtcclxuICAgICAgICB0aGlzLmVuZEZpZ2h0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0IGN1cnJlbnRGaWdodFN0YXJ0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50RmlnaHRbMF0/LnRpbWVzdGFtcCA/PyAwO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXQgY3VycmVudEZpZ2h0RW5kKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50RmlnaHQuc2xpY2UoLTEpWzBdPy50aW1lc3RhbXAgPz8gMDtcclxuICB9XHJcblxyXG4gIGVuZEZpZ2h0KCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuY3VycmVudEZpZ2h0Lmxlbmd0aCA8IDIpXHJcbiAgICAgIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBzdGFydCA9IG5ldyBEYXRlKHRoaXMuY3VycmVudEZpZ2h0U3RhcnQpLnRvSVNPU3RyaW5nKCk7XHJcbiAgICBjb25zdCBlbmQgPSBuZXcgRGF0ZSh0aGlzLmN1cnJlbnRGaWdodEVuZCkudG9JU09TdHJpbmcoKTtcclxuXHJcbiAgICBjb25zb2xlLmRlYnVnKGBEaXNwYXRjaGluZyBuZXcgZmlnaHRcclxuU3RhcnQ6ICR7c3RhcnR9XHJcbkVuZDogJHtlbmR9XHJcblpvbmU6ICR7dGhpcy5jdXJyZW50Wm9uZU5hbWV9XHJcbkxpbmUgQ291bnQ6ICR7dGhpcy5jdXJyZW50RmlnaHQubGVuZ3RofVxyXG5gKTtcclxuICAgIHZvaWQgdGhpcy5kaXNwYXRjaCgnZmlnaHQnLCBzdGFydC5zdWJzdHIoMCwgMTApLCB0aGlzLmN1cnJlbnRab25lSWQsIHRoaXMuY3VycmVudFpvbmVOYW1lLCB0aGlzLmN1cnJlbnRGaWdodCk7XHJcblxyXG4gICAgdGhpcy5jdXJyZW50RmlnaHQgPSBbXTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IEVtdWxhdG9yQ29tbW9uIGZyb20gJy4uL0VtdWxhdG9yQ29tbW9uJztcclxuaW1wb3J0IEVuY291bnRlciBmcm9tICcuL0VuY291bnRlcic7XHJcbmltcG9ydCBMb2dFdmVudEhhbmRsZXIgZnJvbSAnLi9Mb2dFdmVudEhhbmRsZXInO1xyXG5pbXBvcnQgTmV0d29ya0xvZ0NvbnZlcnRlciBmcm9tICcuL05ldHdvcmtMb2dDb252ZXJ0ZXInO1xyXG5pbXBvcnQgTG9nUmVwb3NpdG9yeSBmcm9tICcuL25ldHdvcmtfbG9nX2NvbnZlcnRlci9Mb2dSZXBvc2l0b3J5JztcclxuXHJcbm9ubWVzc2FnZSA9IGFzeW5jIChtc2cpID0+IHtcclxuICBjb25zdCBsb2dDb252ZXJ0ZXIgPSBuZXcgTmV0d29ya0xvZ0NvbnZlcnRlcigpO1xyXG4gIGNvbnN0IGxvY2FsTG9nSGFuZGxlciA9IG5ldyBMb2dFdmVudEhhbmRsZXIoKTtcclxuICBjb25zdCByZXBvID0gbmV3IExvZ1JlcG9zaXRvcnkoKTtcclxuXHJcbiAgLy8gTGlzdGVuIGZvciBMb2dFdmVudEhhbmRsZXIgdG8gZGlzcGF0Y2ggZmlnaHRzIGFuZCBwZXJzaXN0IHRoZW1cclxuICBsb2NhbExvZ0hhbmRsZXIub24oJ2ZpZ2h0JywgYXN5bmMgKGRheSwgem9uZUlkLCB6b25lTmFtZSwgbGluZXMpID0+IHtcclxuICAgIGNvbnN0IGVuYyA9IG5ldyBFbmNvdW50ZXIoZGF5LCB6b25lSWQsIHpvbmVOYW1lLCBsaW5lcyk7XHJcbiAgICBlbmMuaW5pdGlhbGl6ZSgpO1xyXG4gICAgaWYgKGVuYy5zaG91bGRQZXJzaXN0RmlnaHQoKSkge1xyXG4gICAgICBwb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogJ2VuY291bnRlcicsXHJcbiAgICAgICAgZW5jb3VudGVyOiBlbmMsXHJcbiAgICAgICAgbmFtZTogZW5jLmNvbWJhdGFudFRyYWNrZXIuZ2V0TWFpbkNvbWJhdGFudE5hbWUoKSxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8vIENvbnZlcnQgdGhlIG1lc3NhZ2UgbWFudWFsbHkgZHVlIHRvIG1lbW9yeSBpc3N1ZXMgd2l0aCBleHRyZW1lbHkgbGFyZ2UgZmlsZXNcclxuICBjb25zdCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCdVVEYtOCcpO1xyXG4gIGxldCBidWYgPSBuZXcgVWludDhBcnJheShtc2cuZGF0YSk7XHJcbiAgbGV0IG5leHRPZmZzZXQgPSAwO1xyXG4gIGxldCBsaW5lcyA9IFtdO1xyXG4gIGxldCBsaW5lQ291bnQgPSAwO1xyXG4gIGZvciAobGV0IGN1cnJlbnRPZmZzZXQgPSBuZXh0T2Zmc2V0O1xyXG4gICAgbmV4dE9mZnNldCA8IGJ1Zi5sZW5ndGggJiYgbmV4dE9mZnNldCAhPT0gLTE7XHJcbiAgICBjdXJyZW50T2Zmc2V0ID0gbmV4dE9mZnNldCkge1xyXG4gICAgbmV4dE9mZnNldCA9IGJ1Zi5pbmRleE9mKDB4MEEsIG5leHRPZmZzZXQgKyAxKTtcclxuICAgIGNvbnN0IGxpbmUgPSBkZWNvZGVyLmRlY29kZShidWYuc2xpY2UoY3VycmVudE9mZnNldCwgbmV4dE9mZnNldCkpLnRyaW0oKTtcclxuICAgIGlmIChsaW5lLmxlbmd0aCkge1xyXG4gICAgICArK2xpbmVDb3VudDtcclxuICAgICAgbGluZXMucHVzaChsaW5lKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobGluZXMubGVuZ3RoID49IDEwMDApIHtcclxuICAgICAgbGluZXMgPSBsb2dDb252ZXJ0ZXIuY29udmVydExpbmVzKGxpbmVzLCByZXBvKTtcclxuICAgICAgbG9jYWxMb2dIYW5kbGVyLnBhcnNlTG9ncyhsaW5lcyk7XHJcbiAgICAgIHBvc3RNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiAncHJvZ3Jlc3MnLFxyXG4gICAgICAgIGxpbmVzOiBsaW5lQ291bnQsXHJcbiAgICAgICAgYnl0ZXM6IG5leHRPZmZzZXQsXHJcbiAgICAgICAgdG90YWxCeXRlczogYnVmLmxlbmd0aCxcclxuICAgICAgfSk7XHJcbiAgICAgIGxpbmVzID0gW107XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChsaW5lcy5sZW5ndGggPiAwKSB7XHJcbiAgICBsaW5lcyA9IGxvZ0NvbnZlcnRlci5jb252ZXJ0TGluZXMobGluZXMsIHJlcG8pO1xyXG4gICAgbG9jYWxMb2dIYW5kbGVyLnBhcnNlTG9ncyhsaW5lcyk7XHJcbiAgICBsaW5lcyA9IFtdO1xyXG4gIH1cclxuICBwb3N0TWVzc2FnZSh7XHJcbiAgICB0eXBlOiAncHJvZ3Jlc3MnLFxyXG4gICAgbGluZXM6IGxpbmVDb3VudCxcclxuICAgIGJ5dGVzOiBidWYubGVuZ3RoLFxyXG4gICAgdG90YWxCeXRlczogYnVmLmxlbmd0aCxcclxuICB9KTtcclxuICBidWYgPSBudWxsO1xyXG5cclxuICBsb2NhbExvZ0hhbmRsZXIuZW5kRmlnaHQoKTtcclxuXHJcbiAgcG9zdE1lc3NhZ2Uoe1xyXG4gICAgdHlwZTogJ2RvbmUnLFxyXG4gIH0pO1xyXG59O1xyXG4iXSwic291cmNlUm9vdCI6IiJ9