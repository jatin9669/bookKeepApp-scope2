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

test.describe('return-book-requests page', () => {
    test('should have a title and a heading', async ({ page }) => {
        await login(page, 'j@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/return-book-request');
        await expect(page).toHaveTitle('Vite + React + TS');
        await expect(page.getByRole('heading', { name: 'Return books Request' })).toBeVisible();
    })

    test('should handle no books found', async ({ page }) => {
        await login(page, 'j@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/return-book-request');

        if(await page.getByText('No return Request found').isVisible()) {
            await expect(page.getByText('No return Request found')).toBeVisible();
        }
    })

    test('should handle books found', async ({ page }) => {
        await login(page, 'j@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/return-book-request');

        if(await page.getByText('No return Request found').isVisible()) {
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
    
    test('should have accept and reject button', async ({ page }) => {
        await login(page, 'j@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/return-book-request');
        
        if(await page.getByText('No return Request found').isVisible()) {
            test.skip();
        }

        await expect(page.locator('button').filter({ hasText: 'Accept' }).first()).toBeVisible();
        await expect(page.locator('button').filter({ hasText: 'Reject' }).first()).toBeVisible();
    })

    test('should handle accept', async ({ page }) => {
        await login(page, 'j@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/return-book-request');
        
        if(await page.getByText('No return Request found').isVisible()) {
            test.skip();
        }

        await page.locator('button').filter({ hasText: 'Accept' }).first().click();
        await expect(page.getByText('Book return request approved successfully!')).toBeVisible();
        
    })

    test('should handle reject', async ({ page }) => {
        await login(page, 'j@g.com', 'jatinn');
        await page.waitForLoadState('networkidle');
        await page.goto('http://localhost:5173/return-book-request');
        
        if(await page.getByText('No return Request found').isVisible()) {
            test.skip();
        }

        await page.locator('button').filter({ hasText: 'Reject' }).last().click();
        await expect(page.getByText('Book return request rejected successfully!')).toBeVisible();
        
    })

    test('should handle when user is not signed in', async ({ page }) => {
        await page.goto('http://localhost:5173/request-return');
        await expect(page.getByText('you are not authorized to return books')).toBeVisible();
        expect(page.url()).toBe('http://localhost:5173/');
    })

});
