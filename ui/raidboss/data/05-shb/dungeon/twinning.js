import Conditions from '../../../../../resources/conditions';
import NetRegexes from '../../../../../resources/netregexes';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';

export default {
  zoneId: ZoneId.TheTwinning,
  timelineFile: 'twinning.txt',
  triggers: [
    {
      id: 'Twinning Main Head',
      netRegex: NetRegexes.startsUsing({ id: '3DBC', source: 'Surplus Kaliya' }),
      netRegexDe: NetRegexes.startsUsing({ id: '3DBC', source: 'Massengefertigt(?:e|er|es|en) Kaliya' }),
      netRegexFr: NetRegexes.startsUsing({ id: '3DBC', source: 'Kaliya De Surplus' }),
      netRegexJa: NetRegexes.startsUsing({ id: '3DBC', source: '量産型カーリア' }),
      netRegexCn: NetRegexes.startsUsing({ id: '3DBC', source: '量产型卡利亚' }),
      netRegexKo: NetRegexes.startsUsing({ id: '3DBC', source: '양산형 칼리아' }),
      condition: (data) => {
        return data.CanStun() || data.CanSilence();
      },
      response: Responses.stun(),
    },
    {
      id: 'Twinning Berserk',
      netRegex: NetRegexes.startsUsing({ id: '3DC0', source: 'Vitalized Reptoid' }),
      netRegexDe: NetRegexes.startsUsing({ id: '3DC0', source: 'Gestärkt(?:e|er|es|en) Reptoid' }),
      netRegexFr: NetRegexes.startsUsing({ id: '3DC0', source: 'Reptoïde Vitalisé' }),
      netRegexJa: NetRegexes.startsUsing({ id: '3DC0', source: 'ヴァイタライズ・レプトイド' }),
      netRegexCn: NetRegexes.startsUsing({ id: '3DC0', source: '活力化爬虫半人马' }),
      netRegexKo: NetRegexes.startsUsing({ id: '3DC0', source: '활성된 파충류' }),
      condition: (data) => {
        return data.CanStun() || data.CanSilence();
      },
      response: Responses.interrupt(),
    },
    {
      id: 'Twinning 128 Tonze Swing',
      netRegex: NetRegexes.startsUsing({ id: '3DBA', source: 'Servomechanical Minotaur' }),
      netRegexDe: NetRegexes.startsUsing({ id: '3DBA', source: 'Servomechanisch(?:e|er|es|en) Minotaurus' }),
      netRegexFr: NetRegexes.startsUsing({ id: '3DBA', source: 'Minotaure Servomécanique' }),
      netRegexJa: NetRegexes.startsUsing({ id: '3DBA', source: 'サーヴォ・ミノタウロス' }),
      netRegexCn: NetRegexes.startsUsing({ id: '3DBA', source: '自控化弥诺陶洛斯' }),
      netRegexKo: NetRegexes.startsUsing({ id: '3DBA', source: '자동제어 미노타우로스' }),
      condition: (data) => {
        return data.CanSilence();
      },
      response: Responses.interrupt(),
    },
    {
      // The handling for these mechanics is similar enough it makes sense to combine the trigger
      id: 'Twinning Impact + Pounce',
      netRegex: NetRegexes.headMarker({ id: ['003[2-5]', '005A'], capture: false }),
      suppressSeconds: 10,
      infoText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'Spread (avoid cages)',
          de: 'Verteilen (Vermeide "Käfige")',
          fr: 'Dispersez-vous (évitez les cages)',
          ja: '散開 (檻に近づかない)',
          cn: '分散（躲避笼子）',
          ko: '산개 (몬스터 우리 피하기)',
        },
      },
    },
    {
      id: 'Twinning Beastly Roar',
      netRegex: NetRegexes.startsUsing({ id: '3D64', source: 'Alpha Zaghnal', capture: false }),
      netRegexDe: NetRegexes.startsUsing({ id: '3D64', source: 'Alpha-Zaghnal', capture: false }),
      netRegexFr: NetRegexes.startsUsing({ id: '3D64', source: 'Zaghnal Alpha', capture: false }),
      netRegexJa: NetRegexes.startsUsing({ id: '3D64', source: 'アルファ・ザグナル', capture: false }),
      netRegexCn: NetRegexes.startsUsing({ id: '3D64', source: '扎戈斧龙一型', capture: false }),
      netRegexKo: NetRegexes.startsUsing({ id: '3D64', source: '알파 자그날', capture: false }),
      condition: Conditions.caresAboutAOE(),
      response: Responses.aoe(),
    },
    {
      id: 'Twinning Augurium',
      netRegex: NetRegexes.startsUsing({ id: '3D65', source: 'Alpha Zaghnal' }),
      netRegexDe: NetRegexes.startsUsing({ id: '3D65', source: 'Alpha-Zaghnal' }),
      netRegexFr: NetRegexes.startsUsing({ id: '3D65', source: 'Zaghnal Alpha' }),
      netRegexJa: NetRegexes.startsUsing({ id: '3D65', source: 'アルファ・ザグナル' }),
      netRegexCn: NetRegexes.startsUsing({ id: '3D65', source: '扎戈斧龙一型' }),
      netRegexKo: NetRegexes.startsUsing({ id: '3D65', source: '알파 자그날' }),
      response: Responses.tankCleave(),
    },
    {
      id: 'Twinning Charge Eradicated',
      netRegex: NetRegexes.headMarker({ id: '005D' }),
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Twinning Thunder Beam',
      netRegex: NetRegexes.startsUsing({ id: '3DED', source: 'Mithridates' }),
      netRegexDe: NetRegexes.startsUsing({ id: '3DED', source: 'Mithridates' }),
      netRegexFr: NetRegexes.startsUsing({ id: '3DED', source: 'Mithridate' }),
      netRegexJa: NetRegexes.startsUsing({ id: '3DED', source: 'ミトリダテス' }),
      netRegexCn: NetRegexes.startsUsing({ id: '3DED', source: '米特里达梯' }),
      netRegexKo: NetRegexes.startsUsing({ id: '3DED', source: '미트리다테스' }),
      condition: (data, matches) => {
        return matches.target === data.me || data.role === 'healer';
      },
      response: Responses.tankBuster(),
    },
    {
      // Alternatively, we could use 1B:\y{ObjectId}:(\y{Name}):....:....:00A0
      id: 'Twinning Allagan Thunder',
      netRegex: NetRegexes.startsUsing({ id: '3DEF', source: 'Mithridates' }),
      netRegexDe: NetRegexes.startsUsing({ id: '3DEF', source: 'Mithridates' }),
      netRegexFr: NetRegexes.startsUsing({ id: '3DEF', source: 'Mithridate' }),
      netRegexJa: NetRegexes.startsUsing({ id: '3DEF', source: 'ミトリダテス' }),
      netRegexCn: NetRegexes.startsUsing({ id: '3DEF', source: '米特里达梯' }),
      netRegexKo: NetRegexes.startsUsing({ id: '3DEF', source: '미트리다테스' }),
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Twinning Magitek Crossray',
      netRegex: NetRegexes.startsUsing({ id: '3DF8', source: 'The Tycoon', capture: false }),
      netRegexDe: NetRegexes.startsUsing({ id: '3DF8', source: 'Tycoon', capture: false }),
      netRegexFr: NetRegexes.startsUsing({ id: '3DF8', source: 'Le Magnat', capture: false }),
      netRegexJa: NetRegexes.startsUsing({ id: '3DF8', source: 'タイクーン', capture: false }),
      netRegexCn: NetRegexes.startsUsing({ id: '3DF8', source: '泰空', capture: false }),
      netRegexKo: NetRegexes.startsUsing({ id: '3DF8', source: '타이쿤', capture: false }),
      suppressSeconds: 15,
      infoText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'cardinal lasers',
          de: 'Himmelrichtungs-Lasers',
          fr: 'Lasers cardinaux',
          ja: '十字レーザー',
          cn: '正点激光',
          ko: '십자 레이저',
        },
      },
    },
    {
      id: 'Twinning Defensive Array',
      netRegex: NetRegexes.startsUsing({ id: '3DF2', source: 'The Tycoon', capture: false }),
      netRegexDe: NetRegexes.startsUsing({ id: '3DF2', source: 'Tycoon', capture: false }),
      netRegexFr: NetRegexes.startsUsing({ id: '3DF2', source: 'Le Magnat', capture: false }),
      netRegexJa: NetRegexes.startsUsing({ id: '3DF2', source: 'タイクーン', capture: false }),
      netRegexCn: NetRegexes.startsUsing({ id: '3DF2', source: '泰空', capture: false }),
      netRegexKo: NetRegexes.startsUsing({ id: '3DF2', source: '타이쿤', capture: false }),
      suppressSeconds: 15,
      infoText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'outer lasers',
          de: 'Lasers am Rand',
          fr: 'Lasers extérieurs',
          ja: '外周レーザー',
          cn: '外侧激光',
          ko: '외곽 레이저',
        },
      },
    },
    {
      id: 'Twinning Rail Cannon',
      netRegex: NetRegexes.startsUsing({ id: '3DFB', source: 'The Tycoon' }),
      netRegexDe: NetRegexes.startsUsing({ id: '3DFB', source: 'Tycoon' }),
      netRegexFr: NetRegexes.startsUsing({ id: '3DFB', source: 'Le Magnat' }),
      netRegexJa: NetRegexes.startsUsing({ id: '3DFB', source: 'タイクーン' }),
      netRegexCn: NetRegexes.startsUsing({ id: '3DFB', source: '泰空' }),
      netRegexKo: NetRegexes.startsUsing({ id: '3DFB', source: '타이쿤' }),
      condition: (data, matches) => {
        return matches.target === data.me || data.role === 'healer';
      },
      response: Responses.tankBuster(),
    },
    {
      // An alternative is 1B:\y{ObjectId}:\y{Name}:....:....:00A9
      id: 'Twinning Magicrystal',
      netRegex: NetRegexes.startsUsing({ id: '3E0C', source: 'The Tycoon', capture: false }),
      netRegexDe: NetRegexes.startsUsing({ id: '3E0C', source: 'Tycoon', capture: false }),
      netRegexFr: NetRegexes.startsUsing({ id: '3E0C', source: 'Le Magnat', capture: false }),
      netRegexJa: NetRegexes.startsUsing({ id: '3E0C', source: 'タイクーン', capture: false }),
      netRegexCn: NetRegexes.startsUsing({ id: '3E0C', source: '泰空', capture: false }),
      netRegexKo: NetRegexes.startsUsing({ id: '3E0C', source: '타이쿤', capture: false }),
      response: Responses.spread('alert'),
    },
    {
      id: 'Twinning Discharger',
      netRegex: NetRegexes.startsUsing({ id: '3DFC', source: 'The Tycoon', capture: false }),
      netRegexDe: NetRegexes.startsUsing({ id: '3DFC', source: 'Tycoon', capture: false }),
      netRegexFr: NetRegexes.startsUsing({ id: '3DFC', source: 'Le Magnat', capture: false }),
      netRegexJa: NetRegexes.startsUsing({ id: '3DFC', source: 'タイクーン', capture: false }),
      netRegexCn: NetRegexes.startsUsing({ id: '3DFC', source: '泰空', capture: false }),
      netRegexKo: NetRegexes.startsUsing({ id: '3DFC', source: '타이쿤', capture: false }),
      condition: Conditions.caresAboutAOE(),
      response: Responses.aoe(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'vitalized reptoid': 'gestärkt(?:e|er|es|en) Reptoid',
        'The Tycoon': 'Tycoon',
        'surplus Kaliya': 'massengefertigt(?:e|er|es|en) Kaliya',
        'Alpha Zaghnal': 'Alpha-Zaghnal',
        '(?<! )Zaghnal': 'Zaghnal',
        'Servomechanical Minotaur': 'Servomechanisch(?:e|er|es|en) Minotaurus',
        'Mithridates': 'Mithridates',
        'Levinball': 'Donnerkugel',
        'The Cornice': 'Schnittstelle',
        'Aetherial Observation': 'Ätherobservationsdeck',
        'Repurposing': 'Umrüstanlage',
        'Cladoselache': 'Cladoselache',
      },
      'replaceText': {
        'Thunder Beam': 'Gewitterstrahl',
        'Temporal Paradox': 'Zeitparadox',
        'Temporal Flow': 'Zeitfluss',
        'Shock': 'Entladung',
        'Shattered Crystal': 'Berstender Kristall',
        'Rail Cannon': 'Magnetschienenkanone',
        'Pounce Errant': 'Tobende Tatze',
        'Magitek Ray': 'Magitek-Laser',
        'Magitek Crossray': 'Magitek-Kreuzlaser',
        'Magicrystal': 'Magitek-Kristall',
        'Laserblade': 'Laserklingen',
        'High-Tension Discharger': 'Hochspannungsentlader',
        'High Gravity': 'Hohe Gravitation',
        'Forlorn Impact': 'Einsamer Einschlag',
        'Electric Discharge': 'Elektrische Entladung',
        'Defensive Array': 'Magitek-Schutzlaser',
        'Charge Eradicated': 'Ausrottung',
        'Beastly Roar': 'Bestialisches Brüllen',
        'Beast Rampant': 'Ungezügelt',
        'Beast Passant': 'Stahlpranke',
        'Augurium': 'Schmetterbohrer',
        'Artificial Gravity': 'Künstliche Gravitation',
        'Allagan Thunder': 'Allagischer Blitzschlag',
        '(?<! )Gravity': 'Gravitation',
        '(?<! )Crossray': 'Kreuzlaser',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'vitalized reptoid': 'Reptoïde vitalisé',
        'The Tycoon': 'Le Magnat',
        'surplus Kaliya': 'Kaliya de surplus',
        'alpha zaghnal': 'Zaghnal alpha',
        'Servomechanical Minotaur': 'Minotaure Servomécanique',
        'Mithridates': 'Mithridate',
        'Levinball': 'boule foudroyante',
        'The Cornice': 'Cœur du propulseur dimensionnel',
        'Aetherial Observation': 'Observatoire des flux éthérés',
        'Repurposing': 'Atelier d\'opti-rénovation',
        'Cladoselache': 'Cladoselache',
      },
      'replaceText': {
        'Thunder Beam': 'Rayon de foudre',
        'Temporal Paradox': 'Paradoxe temporel',
        'Temporal Flow': 'Flux temporel',
        'Shock': 'Décharge électrostatique',
        'Shattered Crystal': 'Éclatement de cristal',
        'Rail Cannon': 'Canon électrique',
        'Pounce Errant': 'Attaque subite XXX',
        'Magitek Ray': 'Rayon magitek',
        'Magitek Crossray': 'Rayon croisé magitek',
        'Magicrystal': 'Cristal magitek',
        'Laserblade': 'Lame laser',
        'High-Tension Discharger': 'Déchargeur haute tension',
        'High Gravity': 'Haute gravité',
        '(?<! )Gravity/(?! )Crossray\\?\\?': 'Gravité/Rayon ??',
        'Forlorn Impact': 'Déflagration affligeante',
        'Electric Discharge': 'Décharge électrique',
        'Defensive Array': 'Rayon protecteur magitek',
        'Charge Eradicated': 'Éradicateur',
        'Beastly Roar': 'Rugissement bestial',
        'Beast Rampant': 'Rampant',
        'Beast Passant': 'Passant',
        'Augurium': 'Coup de tarière',
        'Artificial Gravity': 'Gravité artificielle',
        'Allagan Thunder': 'Foudre d\'Allag',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'vitalized reptoid': 'ヴァイタライズ・レプトイド',
        'The Tycoon': 'タイクーン',
        'surplus Kaliya': '量産型カーリア',
        'alpha zaghnal': 'アルファ・ザグナル',
        'Servomechanical Minotaur': 'サーヴォ・ミノタウロス',
        'Mithridates': 'ミトリダテス',
        'Levinball': '雷弾',
        'The Cornice': '次元潜行装置中枢',
        'Aetherial Observation': 'エーテル観測台',
        'Repurposing': '改装作業拠点',
        'Cladoselache': 'クラドセラケ',
      },
      'replaceText': {
        'Thunder Beam': 'サンダービーム',
        'Temporal Paradox': 'タイムパラドックス',
        'Temporal Flow': '時間解凍',
        'Shock': '放電',
        'Shattered Crystal': 'クリスタル破裂',
        'Rail Cannon': 'レールキャノン',
        'Pounce Errant': 'XXXパウンス',
        'Magitek Ray': '魔導レーザー',
        'Magitek Crossray': '魔導クロスレーザー',
        'Magicrystal': '魔導クリスタル',
        'Laserblade': 'レーザーブレード',
        'High-Tension Discharger': 'ハイテンション・ディスチャージャー',
        'High Gravity': '高重力',
        'Forlorn Impact': 'フォローンインパクト',
        'Electric Discharge': 'エレクトリック・ディスチャージ',
        'Defensive Array': '魔導プロテクティブレーザー',
        'Charge Eradicated': 'エラディケイター',
        'Beastly Roar': 'ビーストロア',
        'Beast Rampant': 'ランパント',
        'Beast Passant': 'パッサント',
        'Augurium': 'アウガースマッシュ',
        'Artificial Gravity': 'アーティフィシャル・グラビティ',
        'Allagan Thunder': 'アラガン・サンダー',
        '(?<! )Gravity': '(?<! )重力',
        '(?<! )Crossray': '(?<! )クロスレイ',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'vitalized reptoid': '活力化爬虫半人马',
        'The Tycoon': '泰空',
        'surplus Kaliya': '量产型卡利亚',
        'alpha zaghnal': '扎戈斧龙一型',
        'Servomechanical Minotaur': '自控化弥诺陶洛斯',
        'Mithridates': '米特里达梯',
        'Levinball': '雷弹',
        'The Cornice': '时空潜行装置中枢',
        'Aetherial Observation': '以太观测台',
        'Repurposing': '改造据点',
        'Cladoselache': '裂口鲨',
      },
      'replaceText': {
        'Thunder Beam': '电光束',
        'Temporal Paradox': '时间悖论',
        'Temporal Flow': '时间解冻',
        'Shock': '放电',
        'Shattered Crystal': '水晶破裂',
        'Rail Cannon': '轨道炮',
        'Pounce Errant': 'XXX突袭',
        'Magitek Ray': '魔导激光',
        'Magitek Crossray': '魔导交叉激光',
        'Magicrystal': '魔导水晶',
        'Laserblade': '激光剑',
        'High-Tension Discharger': '高压排电',
        'High Gravity': '高重力',
        'Forlorn Impact': '绝望冲击',
        'Electric Discharge': '排电',
        'Defensive Array': '魔导防护激光',
        'Charge Eradicated': '歼灭弹',
        'Beastly Roar': '残虐咆哮',
        'Beast Rampant': '人立而起',
        'Beast Passant': '四足着地',
        'Augurium': '预兆',
        'Artificial Gravity': '人造重力',
        'Allagan Thunder': '亚拉戈闪雷',
        '(?<! )Gravity': '(?<! )重力',
        '(?<! )Crossray': '(?<! )交叉激光',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'vitalized reptoid': '활성된 파충류',
        'The Tycoon': '타이쿤',
        'surplus Kaliya': '양산형 칼리아',
        'alpha zaghnal': '알파 자그날',
        'Servomechanical Minotaur': '자동제어 미노타우로스',
        'Mithridates': '미트리다테스',
        'Levinball': '뇌탄',
        'Cladoselache': '클라도셀라케',
        'The Cornice': '차원 잠행 장치 중추',
        'Aetherial Observation': '에테르 관측대',
        'Repurposing': '개조 작업 거점',
      },
      'replaceText': {
        'Thunder Beam': '번개 광선',
        'Temporal Paradox': '시간 역설',
        'Temporal Flow': '시간 해동',
        'Shock': '방전',
        'Shattered Crystal': '크리스탈 파열',
        'Rail Cannon': '전자기포',
        'Pounce Errant': 'XXX 덮치기',
        'Magitek Ray': '마도 레이저',
        'Magitek Crossray': '마도 십자 레이저',
        'Magicrystal': '마도 크리스탈',
        'Laserblade': '레이저 칼날',
        'High-Tension Discharger': '고압 전류 방출',
        'High Gravity': '고중력',
        'Forlorn Impact': '쓸쓸한 충격',
        'Electric Discharge': '전류 방출',
        'Defensive Array': '마도 방어 레이저',
        'Charge Eradicated': '박멸',
        'Beastly Roar': '야수의 포효',
        'Beast Rampant': '두발걷기',
        'Beast Passant': '네발걷기',
        'Augurium': '공격 조짐',
        'Artificial Gravity': '인공 중력',
        'Allagan Thunder': '알라그 선더',
        '(?<! )Gravity': '그라비데',
        '(?<! )Crossray': '십자 레이저',
      },
    },
  ],
};
