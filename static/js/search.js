// Client-side Lunr.js search logic
// Loads the generated PagesIndex.json and performs searches as the user types.

(function () {
  const searchInput = document.getElementById("search");
  const resultsEl = document.getElementById("results");
  if (!searchInput) return; // Not on the search page

  let lunrIndex;
  let pagesIndex;

  // Fetch the index and initialise lunr
  fetch("/js/lunr/PagesIndex.json")
    .then((response) => response.json())
    .then((index) => {
      pagesIndex = index;
      lunrIndex = lunr(function () {
        // Disable default stemmer & stop word filter to better support Arabic
        this.pipeline.reset();
        this.searchPipeline.reset();

        this.field("title", { boost: 10 });
        this.field("tags", { boost: 5 });
        this.field("content");
        this.ref("href");

        pagesIndex.forEach(function (doc) {
          // Strip diacritics from title/tags/content before adding
          const processed = {
            ...doc,
            title: stripDiacritics(doc.title),
            tags: Array.isArray(doc.tags) ? doc.tags.map(stripDiacritics) : [],
            content: stripDiacritics(doc.content),
          };
          this.add(processed);
        }, this);

        // Custom tokenizer separator to split on Arabic punctuation as well
        lunr.tokenizer.separator = /[\s،؛\-\.]+/;
      });
    })
    .catch((err) => {
      console.error("Unable to load Lunr index:", err);
    });

  // Utility to strip Arabic diacritics
  function stripDiacritics(str) {
    return str.replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, "");
  }

  function performSearch(term) {
    // Strip diacritics from user query
    const raw = stripDiacritics(term);
    const tokens = raw.split(/[\s،؛]+/).filter(Boolean);
    // Require each token to appear (+) and allow prefix match (*)
    const wildcardQuery = tokens.map((t) => `+${t}*`).join(" ");
    const results = lunrIndex.search(wildcardQuery);
    let pages = results.map((res) => pagesIndex.find((page) => page.href === res.ref));

    // If the query contains multiple words, further narrow results to those containing the exact phrase
    if (tokens.length > 1) {
      const phrase = raw.toLowerCase();
      pages = pages.filter((page) => {
        const haystack = stripDiacritics(
          `${page.title} ${Array.isArray(page.tags) ? page.tags.join(" ") : ""} ${page.content}`
        ).toLowerCase();
        return haystack.includes(phrase);
      });
    }

    return pages;
  }

  function displayResults(results) {
    resultsEl.innerHTML = "";

    if (!results.length) {
      const msg = document.createElement("p");
      msg.textContent = "لا توجد نتائج";
      resultsEl.appendChild(msg);
      return;
    }

    results.forEach((page) => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        window.location.href = page.href;
      });

      const snippet = page.content ? page.content.slice(0, 120) + "…" : "";

      card.innerHTML = `
        <h3><a href="${page.href}">${page.title}</a></h3>
        <p>${snippet}</p>
      `;

      resultsEl.appendChild(card);
    });
  }

  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.trim();
    if (!lunrIndex || term.length < 2) {
      resultsEl.innerHTML = "";
      return;
    }
    const results = performSearch(term);
    displayResults(results);
  });
})(); 