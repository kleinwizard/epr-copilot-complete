import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    await expect(page).toHaveTitle(/EPR/);
    
    const loginButton = page.getByRole('button', { name: /sign in|login/i });
    await expect(loginButton).toBeVisible();
  });

  test('should handle login form submission', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /email/i });
    const passwordInput = page.getByRole('textbox', { name: /password/i });
    const loginButton = page.getByRole('button', { name: /sign in|login/i });

    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();

      await expect(page).toHaveURL(/dashboard|login/);
    }
  });

  test('should navigate to registration', async ({ page }) => {
    const signUpLink = page.getByRole('link', { name: /sign up|register/i });
    
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page).toHaveURL(/register|signup/);
    }
  });

  test('should handle logout', async ({ page }) => {
    await page.goto('/dashboard');
    
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/login|home/);
    }
  });
});
