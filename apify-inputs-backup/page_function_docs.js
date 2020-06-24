module.exports = async ({ page, request, Apify, requestQueue }) => {
    const { url, userData } = request;
    const nonIndexPaths = ['index', 'apify-client-js'];

    // Enqueue all pages on start urls
    if (userData && userData.isStartUrl) {
        const pageData = await page.evaluate(() => {
            const dataJson = $('#__NEXT_DATA__').text();
            return JSON.parse(dataJson);
        });
        const origin = pageData.props.pageProps.locals.docsBaseUrl;
        const pages = [];
        const getPages = (pageList) => {
            pageList.forEach((page) => {
                // Filter out index page
                // Filter apify client doc, we need to rewrite this doc completely
                if(!nonIndexPaths.includes(page.path)) {
                    pages.push(page);
                    if (Array.isArray(page.children)) {
                        getPages(page.children);
                    }
                }
            });
        }
        getPages(Object.values(pageData.query.page.pagesList))
        for(const page of pages) {
            await requestQueue.addRequest({
                url: `${origin}/${page.path}`,
            })
        }
        return {};
    }

    const pageFunction = (url) => {
        let h1; let h2; let result;
        const pageResults = [];
        const markdownElements = $('div.markdown-body').children();
        markdownElements.each(function(i) {
            const parsedText = $(this).text();
            if ($(this).is('h1')) {
                h1 = {
                    parsedText,
                    hash: $(this).attr('id'),
                };
                result = {
                    url: url,
                    title: h1.parsedText,
                    htmlContent: [],
                };
            } else if ($(this).is('h2')) {
                if (h1 || h2) {
                    pageResults.push(result);
                }
                h2 = {
                    parsedText,
                    hash: $(this).attr('id'),
                };
                result = {
                    url: `${url}#${h2.hash}`,
                    title: `${h1.parsedText}: ${h2.parsedText}`,
                    htmlContent: [],
                };
            } else {
                result.htmlContent.push($(this).html());
            }

            if (markdownElements.length === i + 1) {
                pageResults.push(result);
            }
        });
        return pageResults
    };

    const results = await page.evaluate(pageFunction, url);

    return results.map((result) => {
        const html = result.htmlContent.join(' ');
        result.text = Apify.utils.htmlToText(html).substring(0, 9500);
        delete result.htmlContent;
        return result;
    });
};
