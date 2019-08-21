module.exports = async ({ page, request, selectors, Apify }) => {
    const { url } = request;
    let results = await page.evaluate((url) => {
        const results = [];

        if ($('div.rendered-markdown').length || $('section').length === 0) {
            // Scraping tutorials + CLI docs
            let h1;
            let h2;
            let h3;
            let sectionHtml = [];
            const mainDiv = $('div.rendered-markdown').length ? $('div.rendered-markdown') : $('#home');
            const docElements = mainDiv.children();
            docElements.each(function(index) {
                if ($(this).is('h1')) {
                    h1 = $(this);
                } else if ($(this).is('h2')) {
                    if (h2) {
                        results.push({
                            url: `${url}#${h2.attr('id')}`,
                            title: [h1.html(), h2.html()].join(': '),
                            text:  sectionHtml.join(' '),
                        });
                    } else {
                        results.push({
                            url,
                            title: h1.html(),
                            text: sectionHtml.join(' '),
                        });
                    }
                    sectionHtml = [];
                    h2 = $(this);
                }
                // We do not index h3, it doesn't make sense in tutorials
                // else if ($(this).is('h3')) {
                //     if (h3) {
                //         results.push({
                //             url: `${url}#${h3.attr('id')}`,
                //             title: [h1.html(), h2.html(), h3.html()].join(' - '),
                //             text:  sectionHtml.join(' '),
                //         });
                //     } else {
                //         results.push({
                //             url,
                //             title: [h1.html(), h2.html()].join(' - '),
                //             text: sectionHtml.join(' '),
                //         });
                //     }
                //     sectionHtml = [];
                //     h3 = $(this);
                // }
                else {
                    sectionHtml.push($(this).html())
                    if (docElements.length === index + 1) {
                        results.push({
                            url: `${url}#${h2.attr('id')}`,
                            title: [h1.html(), h2.html()].join(': '),
                            text:  sectionHtml.join(' '),
                        });
                    }
                }
            });
        } else {
            // Other pages from doc
            const h1 = $('h1').eq(0);
            const h1html = h1.html();
            const h1TextHtml = h1.next().html();
            results.push({ url, title: h1html, text: h1TextHtml });

            const h2s = $('h2');

            h2s.each(function() {
                const sectionId = $(this).parent().attr('id') || $(this).attr('id');
                const h2Html = $(this).html();

                results.push({
                    url: `${url}#${sectionId}`,
                    title: [h1html, h2Html].join(': '),
                    text:  $(this).siblings('p').map(function() {return $(this).html()}).toArray().join(' '),
                });

                const h3s = $(this).parent().attr('id') ? $(this).parent().find('h3') : $(this).find('h3');

                h3s.each(function() {
                    const sectionId = $(this).parent().attr('id') || $(this).attr('id');
                    results.push({
                        url: `${url}#${sectionId}`,
                        title: [h2Html, $(this).html()].join(': '),
                        text: $(this).siblings().map(function () {return $(this).html()}).toArray().join(' '),
                    });
                });
            });
        }

        return results;
    }, url);

    results = results.map((item) => {
        Object.keys(item).forEach((key) => {
            item[key] = Apify.utils.htmlToText(item[key]).substring(0, 9500);
        });
        return item;
    });

    return results;
};
