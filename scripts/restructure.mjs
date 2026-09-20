import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, data) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), data); };
if (!fs.existsSync(path.join(root, 'app/media/page.tsx'))) {
  let media = read('app/page.tsx').replaceAll("from '../components/", "from '../../components/");
  media = media.replace("import { useEffect, useState } from 'react';", "import { useEffect, useState } from 'react';\nimport { SiteHeader } from '../../components/site-shell';");
  media = media.replace(/    <header className="header">.*?<\/header>/, '    <SiteHeader current="media" />');
  write('app/media/page.tsx', media);
}
const pkg = JSON.parse(read('package.json'));
pkg.type = 'module';
write('package.json', JSON.stringify(pkg, null, 2) + '\n');
write('app/globals.css', read('app/globals.css').replace("@import url('data:text/css,');\n", ''));
write('app/layout.tsx', read('app/layout.tsx').replace("title: 'ClubOS / Media — Сет закінчився. Робота теж.',", "title: { default: 'ClubOS — Важлива робота. Спільна система.', template: '%s / ClubOS' },").replace("description: 'Інтерактивне бачення BRUKXT Media Engine. Машини контролюють машини. Люди контролюють систему.',", "description: 'Спільна візія BRUKXT: операції, реактивне світло, медіа й архів. Команда створює власні інструменти разом з AI-агентами.',"));
console.log('Media preserved at /media; shared app metadata updated.');
