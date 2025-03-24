import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page, email, password) {
  await page.goto('http://localhost:5173/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  // Wait for redirection to complete
  console.log("Waiting for redirection to complete");
  await page.waitForURL('http://localhost:5173');
}

test.describe('Book Library Application', () => {
  test('should load home page correctly for guest users', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Check page title
    await expect(page).toHaveTitle('Vite + React + TS');
    
    // Check main heading is visible
    await expect(page.getByRole('heading', { name: 'Books', exact: true })).toBeVisible();
    
    // Check if books are displayed or "No books found" message
    const booksDoNotExist = await page.getByText('No books found').isVisible();
    if (!booksDoNotExist) {
      // Check if at least one book card is visible
      await expect(page.locator('.grid-cols-1 > div').first()).toBeVisible();
    }
  });

  test('should show book details when clicking on a book', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for network requests to settle - give time for books to load
    await page.waitForLoadState('networkidle');

    if (await page.getByText('No books found').isVisible()) {
      test.skip();
      return;
    }
    
    // Click on the first book
    await page.locator('.grid-cols-1 > div').first().click();
    
    // Check if redirected to book details page
    expect(page.url()).toContain('/book/');
    
    // Verify book details are displayed
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(page.getByText('by', { exact: false })).toBeVisible();
  });

  test('should show "Request to borrow" button when signed in', async ({ page }) => {
    // Login as a regular user
    await login(page, 'j2@g.com', 'jatinn'); 
    
    await page.waitForLoadState('networkidle');

    if (await page.getByText('No books found').isVisible()) {
      test.skip();
      return;
    }
    await expect(page.getByRole('button', { name: 'Request to borrow' }).first()).toBeVisible();
  });

  test('should allow requesting to borrow a book when signed in', async ({ page }) => {
    // Login as a regular user
    await login(page, 'j2@g.com', 'jatinn');

    await page.waitForLoadState('networkidle');
    
    // Skip test if no books are available
    if(await page.getByText('No books found').isVisible() || !await page.getByRole('button', { name: 'Request to borrow' }).first().isVisible()) {
      test.skip();
    }
    
    // Click on "Request to borrow" for the first book
    await page.getByRole('button', { name: 'Request to borrow' }).first().click();
    
    // Check if quantity controls appear
    await expect(page.getByRole('button', { name: '+' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '-' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirm Purchase' }).first()).toBeVisible();
    
    // Confirm the borrow request
    await page.getByRole('button', { name: 'Confirm Purchase' }).first().click();
    
    // Check for success notification
    await expect(page.getByText('Book purchase request sent successfully!')).toBeVisible();
  });

  test('should show admin controls when logged in as admin', async ({ page }) => {
    // Login as admin
    await login(page, 'j@g.com', 'jatinn');
    await page.waitForLoadState('networkidle');
    
    // Check if "New Book" button is visible (admin only)
    await expect(page.getByRole('button', { name: 'New Book' })).toBeVisible();
    
    // Skip remaining tests if no books are available
    if (await page.getByText('No books found').isVisible()) {
      return;
    }
    
    // Check if edit and delete buttons are visible
    await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' }).first()).toBeVisible();
  });

  test('should allow admin to navigate to create new book page', async ({ page }) => {
    // Login as admin
    await login(page, 'j@g.com', 'jatinn');
    await page.waitForLoadState('networkidle');
    // Click on "New Book" button
    await page.getByRole('button', { name: 'New Book' }).click();
    
    // Check if redirected to book creation page
    await expect(page.url()).toContain('/book/new');
    
    // Verify book creation form is displayed
    await expect(page.getByRole('heading', { name: 'Create New Book' })).toBeVisible();
  });

  test('should handle "Not Available" books correctly', async ({ page }) => {
    // Login as a regular user to see the availability
    await login(page, 'j2@g.com', 'jatinn');
    await page.waitForLoadState('networkidle');

    // Skip test if no books are available
    if (await page.getByText('No books found').isVisible()) {
      test.skip();
    }
    
    // Check if there's any book with "Not Available" button
    const notAvailableButton = page.getByRole('button', { name: 'Not Available' }).first();
    if (await notAvailableButton.isVisible()) {
      // Verify the button is disabled
      await expect(notAvailableButton).toBeDisabled();
    }
  });

  test('should display book quantities correctly for signed in users', async ({ page }) => {
    // Login as a regular user
    await login(page, 'j2@g.com', 'jatinn');
    await page.waitForLoadState('networkidle');

    // Skip test if no books are available
    if (await page.getByText('No books found').isVisible()) {
      test.skip();
    }
    
    // Check if book quantity information is displayed
    await expect(page.locator('h2').filter({ hasText: 'book' }).filter({ hasText: 'left' }).first()).toBeVisible();
  });
});
