import Link from 'next/link';
import { Archive } from '../../components/pipeline';
import { PageIntro, SiteFooter, SiteHeader } from '../../components/site-shell';

export const metadata = { title: 'Archive — Файли зі спільною пам’яттю' };
export default function FilesPage() {
  return <><SiteHeader current="files" /><main><PageIntro label="03 / FILE MANAGEMENT" title={<>Файли є.<br /><span className="muted">Тепер є й зв’язки.</span></>} text="Роки записів, проєктів і рендерів. Garbage Genie відновлює контекст, а постійний Archivist не дає новим матеріалам знову перетворитися на хаос." /><section className="wrap route-demo"><Archive /></section><section className="section wrap"><div className="hub-principles"><div><span>01 / INDEX</span><h3>Знайти й зрозуміти.</h3><p>Папки, назви, дати, метадані, RAW, рендери, дублікати, проєкти та історія подій. Спочатку лише індекс.</p></div><div><span>02 / VERIFY</span><h3>Перевірити зв’язки.</h3><p>Людина підтверджує відповідність події й артисту. Невпевнені знахідки залишаються на розгляд.</p></div><div><span>03 / REORGANIZE</span><h3>Підтримувати порядок.</h3><p>Погоджений план структурує архів. Нові записи одразу отримують контекст, версії та статус доставки.</p></div></div><p className="principle-line">Невідомий файл — не зайвий файл.</p><div className="hub-cta"><Link className="primary-button" href="/media#pipeline">Звідки приходять нові записи <span>↗</span></Link><Link className="text-button" href="/team#start-together">Взяти маленьку задачу з архівом →</Link></div></section></main><SiteFooter /></>;
}
