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

test.describe('request-return page', () => {
    test('should have a title and a heading', async ({ page }) => {
        await login(page, 'j2@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/request-return');
        await expect(page).toHaveTitle('Vite + React + TS');
        await expect(page.getByRole('heading', { name: 'Books to return' })).toBeVisible();
    })

    test('should handle no books found', async ({ page }) => {
        await login(page, 'j4@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/request-return');
        await expect(page.getByText('No books found')).toBeVisible();
    })

    test('should handle books found', async ({ page }) => {
        await login(page, 'j2@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/request-return');

        if(await page.getByText('No books found').isVisible()) {
            test.skip();
        }

        await expect(page.locator('.grid-cols-1 > div').first()).toBeVisible();
    })

    test('should show quantity of books', async ({ page }) => {
        await login(page, 'j2@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/request-return');
        
        if(await page.getByText('No books found').isVisible()) {
            test.skip();
        }

        await expect(page.locator('.grid-cols-1 > div').first()).toBeVisible();
        await expect(page.locator('h2').filter({ hasText: 'book' }).filter({ hasText: 'left' }).first()).toBeVisible();
    })
    
    test('should take us to a particular book page when clicked', async ({ page }) => {
        await login(page, 'j2@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/request-return');
        
        if(await page.getByText('No books found').isVisible()) {
            test.skip();
        }

        await page.locator('.grid-cols-1 > div').first().click();
        expect(page.url()).toContain('/book/');
        await expect(page.locator('p').filter({ hasText: 'by' })).toBeVisible();
    })

    test('should handle request to return', async ({ page }) => {
        await login(page, 'j2@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/request-return');
        
        if(await page.getByText('No books found').isVisible()) {
            test.skip();
        }

        await page.getByRole('button', { name: 'Request to Return' }).first().click();
        await expect(page.getByRole('button', { name: '+' })).toBeVisible();
        await expect(page.getByRole('button', { name: '-' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Confirm Return' })).toBeVisible();

        await page.getByRole('button', { name: 'Confirm Return' }).first().click();
        await expect(page.getByText('Book returned successfully!')).toBeVisible();
    })

    test('should handle when user is not signed in', async ({ page }) => {
        await page.goto('http://localhost:5173/request-return');
        await expect(page.getByText('you are not authorized to return books')).toBeVisible();
        expect(page.url()).toBe('http://localhost:5173/');
    })

});
