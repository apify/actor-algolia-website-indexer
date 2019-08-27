module.exports = async ({ page, request, selectors, Apify }) => {
    const { url } = request;
    const rawResults = [];

    // Load the whole page as one object
    rawResults.push({
        url,
        title: await page.$eval('h1.postHeaderTitle', (el) => el.innerHTML),
        text: await page.$eval('article', (el) => el.innerHTML),
    });

    // Get all methods, just on reference pages
    if (url.includes('/api/')) {
        const h2Results = await page.evaluate((url) => {
            const results = [];
            $('article h2').each(function() {
                const anchor = $(this).find('a.anchor').attr('id');
                const methodName = $(this).find('code').eq(0).text().trim()

                const content = [];
                let nextEl = $(this).next();
                while (nextEl.length) {
                    if (nextEl.prop('tagName') === 'H2') break;
                    // Skip table with params
                    if (nextEl.prop('tagName') !== 'TABLE') content.push(nextEl.html());
                    nextEl = nextEl.next();
                }
                results.push({
                    url: `${url}#${anchor}`,
                    title: methodName,
                    text: content.join(' ')
                })
            });
            return results;
        }, url);
        rawResults.push(...h2Results);
    }

    const results = rawResults.map((item) => {
        Object.keys(item).forEach((key) => {
            item[key] = Apify.utils.htmlToText(item[key]).substring(0, 9500);
        });
        return item;
    });

    return results;
};
