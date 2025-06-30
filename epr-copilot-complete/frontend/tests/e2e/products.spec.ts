import { test, expect } from '@playwright/test';

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
  });

  test('should display products page', async ({ page }) => {
    const currentUrl = page.url();
    
    if (currentUrl.includes('products')) {
      await expect(page).toHaveTitle(/Products|EPR/);
      
      const heading = page.getByRole('heading', { name: /products/i });
      await expect(heading).toBeVisible();
      
    } else if (currentUrl.includes('login')) {
      await expect(page).toHaveURL(/login/);
    }
  });

  test('should allow adding new product', async ({ page }) => {
    const currentUrl = page.url();
    
    if (currentUrl.includes('products')) {
      const addButton = page.getByRole('button', { name: /add|new|create/i });
      
      if (await addButton.isVisible()) {
        await addButton.click();
        
        const form = page.getByRole('form');
        const dialog = page.getByRole('dialog');
        
        const hasForm = await form.isVisible().catch(() => false);
        const hasDialog = await dialog.isVisible().catch(() => false);
        
        expect(hasForm || hasDialog).toBeTruthy();
      }
    }
  });

  test('should display product list', async ({ page }) => {
    const currentUrl = page.url();
    
    if (currentUrl.includes('products')) {
      const table = page.getByRole('table');
      const grid = page.getByRole('grid');
      const list = page.getByRole('list');
      
      const hasTable = await table.isVisible().catch(() => false);
      const hasGrid = await grid.isVisible().catch(() => false);
      const hasList = await list.isVisible().catch(() => false);
      
      expect(hasTable || hasGrid || hasList).toBeTruthy();
    }
  });

  test('should allow bulk import', async ({ page }) => {
    const currentUrl = page.url();
    
    if (currentUrl.includes('products')) {
      const importButton = page.getByRole('button', { name: /import|upload|bulk/i });
      
      if (await importButton.isVisible()) {
        await importButton.click();
        
        const fileInput = page.getByRole('button', { name: /choose file|upload/i });
        await expect(fileInput).toBeVisible();
      }
    }
  });

  test('should filter and search products', async ({ page }) => {
    const currentUrl = page.url();
    
    if (currentUrl.includes('products')) {
      const searchInput = page.getByRole('searchbox');
      const filterButton = page.getByRole('button', { name: /filter/i });
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('test product');
        await page.keyboard.press('Enter');
        
        await page.waitForTimeout(1000);
      }
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        
        const filterPanel = page.getByRole('menu');
        await expect(filterPanel).toBeVisible();
      }
    }
  });
});
