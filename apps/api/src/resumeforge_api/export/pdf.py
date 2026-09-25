from pathlib import Path

from playwright.async_api import async_playwright


WINDOWS_CHROME_PATH = Path(
    r"C:\Program Files\Google\Chrome\Application\chrome.exe"
)


async def html_to_pdf(
    html: str,
    output_path: Path,
) -> None:
    async with async_playwright() as playwright:
        executable_path = None

        # Local Windows development:
        # use installed Google Chrome when available.
        if WINDOWS_CHROME_PATH.exists():
            executable_path = str(WINDOWS_CHROME_PATH)

        browser = await playwright.chromium.launch(
            headless=True,
            executable_path=executable_path,
        )

        try:
            page = await browser.new_page()

            await page.set_content(
                html,
                wait_until="networkidle",
            )

            await page.pdf(
                path=str(output_path),
                format="A4",
                print_background=True,
                margin={
                    "top": "0",
                    "right": "0",
                    "bottom": "0",
                    "left": "0",
                },
            )
        finally:
            await browser.close()