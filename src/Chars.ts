type NormalizationConfig = {
  alphaUpperCase: boolean;
  noSmallKana: boolean;
}

const kanaConvertMap = new Map();

kanaConvertMap.set("ぁ", "あ");
kanaConvertMap.set("ぃ", "い");
kanaConvertMap.set("ぅ", "う");
kanaConvertMap.set("ぇ", "え");
kanaConvertMap.set("ぉ", "お");
kanaConvertMap.set("っ", "つ");
kanaConvertMap.set("ゃ", "や");
kanaConvertMap.set("ゅ", "ゆ");
kanaConvertMap.set("ょ", "よ");
kanaConvertMap.set("ァ", "ア");
kanaConvertMap.set("ィ", "イ");
kanaConvertMap.set("ゥ", "ウ");
kanaConvertMap.set("ェ", "エ");
kanaConvertMap.set("ォ", "オ");
kanaConvertMap.set("ッ", "ツ");
kanaConvertMap.set("ャ", "ヤ");
kanaConvertMap.set("ュ", "ユ");
kanaConvertMap.set("ョ", "ヨ");

export function normalize(text: string, config: NormalizationConfig): string {
  let result = text;
  if (config.alphaUpperCase) {
    result = result.toUpperCase();
  }
  if (config.noSmallKana) {
    const converted = [];
    for (let i = 0; i < result.length; ++i) {
      const c = result.charAt(i);
      if (kanaConvertMap.has(c)) {
        converted.push(kanaConvertMap.get(c));
      } else {
        converted.push(c);
      }
    }
    result = converted.join("");
  }
  return result;
}
