import { test, expect } from '@playwright/test';

test.describe('Navbar component', () => {
  test('should navigate to home page when clicking on logo', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByText('BookKeeper').click();
    await expect(page.url()).toBe('http://localhost:5173/');
  });

  test('should display login and signup buttons when not logged in', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.getByText('Login')).toBeVisible();
    await expect(page.getByText('Sign Up')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByText('Login').click();
    await expect(page.url()).toBe('http://localhost:5173/login');
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByText('Sign Up').click();
    await expect(page.url()).toBe('http://localhost:5173/signup');
  });

  test('logged in user flow', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login');
    await page.locator('#email').fill('j2@g.com');
    await page.locator('#password').fill('jatinn');
    await page.getByRole('button', { name: 'Log in' }).click();
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle');
    
    // Check if user elements are visible
    await expect(page.locator('button[title="Account Menu"]')).toBeVisible();
    
    // Check My Collection link is visible for non-admin users
    // Note: This might fail if logged in as admin
    await expect(page.getByText('My Collection')).toBeVisible();
    
    // Test user dropdown
    await page.locator('button[title="Account Menu"]').click();
    await expect(page.getByText('Account Settings')).toBeVisible();
    await expect(page.getByText('Sign out')).toBeVisible();
    
    // Test dropdown dismiss when clicking outside
    await page.click('body', { position: { x: 10, y: 10 } });
    await expect(page.getByText('Account Settings')).not.toBeVisible();
    
    // Test navigating to My Collection
    await page.getByText('My Collection').click();
    await expect(page.url()).toContain('/my-books');
    
    // Test logout
    await page.locator('button[title="Account Menu"]').click();
    await page.getByText('Sign out').click();
    
    // Verify logged out state
    await expect(page.getByText('Login')).toBeVisible();
  });
  
  test('admin user sees admin links', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5173/login');
    await page.locator('#email').fill('j@g.com');
    await page.locator('#password').fill('jatinn');
    await page.getByRole('button', { name: 'Log in' }).click();
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle');
    
    // Check if admin-specific links are visible
    await expect(page.getByText('Return Books Requests')).toBeVisible();
    await expect(page.getByText('Issue Books Requests')).toBeVisible();
    
    // Test navigating to admin pages
    await page.getByText('Return Books Requests').click();
    await expect(page.url()).toContain('/return-book-request');
    
    await page.getByText('Issue Books Requests').click();
    await expect(page.url()).toContain('/issue-book-request');
  });
  
  test('notifications are displayed and disappear', async ({ page }) => {
    // This test requires triggering notifications
    // Let's use login success which should trigger a notice
    await page.goto('http://localhost:5173/login');
    await page.locator('#email').fill('j2@g.com');
    await page.locator('#password').fill('jatinn');
    await page.getByRole('button', { name: 'Log in' }).click();
    
    // Check if success notification appears
    await expect(page.locator('.bg-green-50')).toBeVisible();
    
    // Wait for notification to disappear (3000ms timeout)
    await page.waitForTimeout(3100);
    await expect(page.locator('.bg-green-50')).not.toBeVisible();
    
    // For error notification, we can try incorrect login
    await page.goto('http://localhost:5173/logout'); // Logout first
    await page.goto('http://localhost:5173/login');
    await page.locator('#email').fill('j2@g.com');
    await page.locator('#password').fill('jatin');
    await page.getByRole('button', { name: 'Log in' }).click();
    
    // Check if error notification appears
    await expect(page.locator('.bg-red-50')).toBeVisible();
    
    // Wait for notification to disappear
    await page.waitForTimeout(3100);
    await expect(page.locator('.bg-red-50')).not.toBeVisible();
  });
}); 
