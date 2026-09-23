import { test, expect } from '@playwright/test';

test('four routes preserve separate progress and require confirmation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:3000/start');
  await expect(page.getByRole('heading', { name: 'Перевір доступ до акаунта' })).toBeVisible();
  await page.getByRole('button', { name: 'Вийшло · Підтвердити' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '1');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Відкрий термінал' })).toBeVisible();

  for (const os of ['Windows', 'macOS']) for (const tool of ['Claude Code', 'Codex CLI']) {
    await page.getByRole('button', { name: new RegExp(`^${os} `) }).click();
    await page.getByRole('button', { name: new RegExp(`^${tool} `) }).click();
    await page.getByRole('navigation', { name: 'Кроки встановлення' }).getByRole('button', { name: /Встанови/ }).click();
    const command = page.locator('.setup-command pre');
    await expect(command).toContainText(tool === 'Claude Code' ? 'claude.ai' : 'chatgpt.com/codex');
    await expect(command).toContainText(os === 'Windows' ? 'install.ps1' : 'install.sh');
    await page.getByRole('button', { name: 'У мене інший результат' }).click();
    await expect(page.getByRole('heading', { name: 'Знайдемо, де ти застряг.' })).toBeVisible();
    await page.getByRole('button', { name: 'Переглянути далі без підтвердження' }).click();
    await expect(page.getByRole('progressbar')).toHaveAttribute('value', os === 'Windows' && tool === 'Claude Code' ? '1' : '0');
  }
  await page.getByRole('navigation', { name: 'Кроки встановлення' }).getByRole('button', { name: 'Підсумок' }).click();
  await expect(page.getByRole('heading', { name: 'Залишилось перевірити.' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Кроки встановлення' }).getByRole('button', { name: /Перевір доступ/ }).click();
  for (let i = 0; i < 9; i++) await page.getByRole('button', { name: 'Вийшло · Підтвердити' }).click();
  await expect(page.getByRole('heading', { name: 'Перший запуск — є.' })).toBeVisible();
  await expect(page.locator('.setup-command pre')).toContainText('9/9');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Перший запуск — є.' })).toBeVisible();
  await page.getByText('Почати маршрут заново', { exact: true }).click();
  await page.getByRole('button', { name: 'Скинути позначки' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
  expect(errors).toEqual([]);
});

test('mobile layout, copy fallback and unavailable storage', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'setItem', { value() { throw new Error('storage denied'); } });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('clipboard denied'); } } });
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://127.0.0.1:3000/start');
  await expect(page.getByText('Браузер не дозволяє зберігати прогрес.', { exact: false })).toBeVisible();
  await page.getByRole('navigation', { name: 'Кроки встановлення' }).getByRole('button', { name: /Встанови/ }).click();
  await page.getByRole('button', { name: 'Скопіювати', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Виділи текст нижче та скопіюй вручну.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: 'test-results/setup-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: 'test-results/setup-desktop.png', fullPage: true });
});
