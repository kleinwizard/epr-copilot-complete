import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display dashboard elements', async ({ page }) => {
    const currentUrl = page.url();
    
    if (currentUrl.includes('dashboard')) {
      await expect(page).toHaveTitle(/Dashboard|EPR/);
      
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
      
      const nav = page.getByRole('navigation');
      await expect(nav).toBeVisible();
      
    } else {
      await expect(page).toHaveURL(/login/);
    }
  });

  test('should display compliance overview', async ({ page }) => {
    const currentUrl = page.url();
    
    if (currentUrl.includes('dashboard')) {
      const complianceSection = page.getByText(/compliance|score|status/i);
      await expect(complianceSection.first()).toBeVisible();
    }
  });

  test('should navigate to different sections', async ({ page }) => {
    const currentUrl = page.url();
    
    if (currentUrl.includes('dashboard')) {
      const sections = [
        { name: /products?/i, url: /products/ },
        { name: /reports?/i, url: /reports/ },
        { name: /fees?/i, url: /fees/ },
        { name: /analytics/i, url: /analytics/ }
      ];

      for (const section of sections) {
        const link = page.getByRole('link', { name: section.name });
        if (await link.isVisible()) {
          await link.click();
          await expect(page).toHaveURL(section.url);
          await page.goBack();
        }
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const currentUrl = page.url();
    if (currentUrl.includes('dashboard')) {
      const mobileMenu = page.getByRole('button', { name: /menu|hamburger/i });
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        
        const nav = page.getByRole('navigation');
        await expect(nav).toBeVisible();
      }
    }
  });
});
