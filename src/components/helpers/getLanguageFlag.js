import De from '~/assets/images/languages/de.svg';
import EnGb from '~/assets/images/languages/en-gb.svg';
import EnUs from '~/assets/images/languages/en-us.svg';
import EsAr from '~/assets/images/languages/es-ar.svg';
import EsMx from '~/assets/images/languages/es-mx.svg';
import Es from '~/assets/images/languages/es.svg';
import FrFr from '~/assets/images/languages/fr-fr.svg';
import Ja from '~/assets/images/languages/ja.svg';
import Ko from '~/assets/images/languages/ko.svg';
import Nl from '~/assets/images/languages/nl.svg';
import PtBr from '~/assets/images/languages/pt-br.svg';
import Pt from '~/assets/images/languages/pt.svg';
import Ru from '~/assets/images/languages/ru.svg';
import ZhCn from '~/assets/images/languages/zh-cn.svg';
import Unkown from '~/assets/images/languages/unknown.svg';

const flagMap = {
  de: De,
  'en-gb': EnGb,
  'en-us': EnUs,
  'es-ar': EsAr,
  'es-mx': EsMx,
  es: Es,
  'fr-fr': FrFr,
  ja: Ja,
  ko: Ko,
  nl: Nl,
  'pt-br': PtBr,
  pt: Pt,
  ru: Ru,
  'zh-cn': ZhCn,
};

export default function getLanguageFlag(code) {
  return flagMap[code] || Unkown;
}
