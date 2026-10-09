import { expect, test } from '@playwright/test';

test('owner can sign in and navigate the complete dashboard', async ({ page }, testInfo) => {
  const reactErrors: string[] = [];
  page.on('console', message => { if (message.type() === 'error' && message.text().includes('component')) reactErrors.push(`${page.url()}: ${message.text()}`); });
  await page.goto('/login');
  await expect(page.getByPlaceholder('Owner Email')).toBeVisible();
  await page.screenshot({ path: `test-results/${testInfo.project.name}-login.png`, fullPage: true });
  await page.getByPlaceholder('Owner Email').fill('owner@mostlyvers.test');
  await page.getByPlaceholder('Password').fill('Preview123!');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
  await page.screenshot({ path: `test-results/${testInfo.project.name}-dashboard.png`, fullPage: true });
  const navigateFromMenu = async (label: string) => {
    const menu = page.getByRole('button', { name: 'Open menu' });
    if (await menu.isVisible()) await menu.click();
    await page.getByRole('link', { name: label, exact: true }).click();
  };
  await navigateFromMenu('Books');
  await expect(page.getByRole('heading', { name: /Books/ })).toBeVisible();
  await page.getByRole('link', { name: /ADD NEW BOOK/ }).click();
  await expect(page.getByRole('heading', { name: /Add New Book/ })).toBeVisible();

  const routes = [
    ['Readers', 'Readers'], ['Sales', 'Sales & Revenue'], ['Feedback', 'Private Feedback'],
    ['Songs & QR', 'Songs & QR'], ['About Author', 'About Author'], ['Contact', 'Contact'],
    ['Owner Profile', 'Owner Profile'], ['Payment Settings', 'Payment Settings'], ['App Settings', 'App Settings'],
  ];
  for (const [link, heading] of routes) {
    await navigateFromMenu(link);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  expect(reactErrors).toEqual([]);
});
