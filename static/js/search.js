// Client-side Lunr.js search logic
// Loads the generated PagesIndex.json and performs searches as the user types.

(function () {
  const searchInput = document.getElementById("search");
  const resultsEl = document.getElementById("results");
  const clearBtn = document.getElementById("clear-search");
  if (!searchInput) return; // Not on the search page

  let lunrIndex;
  let pagesIndex;
  // Debounce timer id for the input handler
  let searchDebounce;
  const DEBOUNCE_DELAY = 300; // Restored standard debounce delay

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

    if (clearBtn) {
      clearBtn.style.display = results.length ? "block" : "none";
    }

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

  // Debounced input handler – performs the search only after the user has stopped
  // typing for `DEBOUNCE_DELAY` ms. This avoids expensive Lunr queries on every
  // single keystroke while still providing an instant-search experience.
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.trim();

    // Immediately toggle the clear-button visibility so UI feels responsive
    if (clearBtn) {
      clearBtn.style.display = term.length ? "block" : "none";
    }

    // Clear any pending search triggered by earlier keystrokes
    clearTimeout(searchDebounce);

    // If the query is too short or index is not ready, just clear results.
    if (!lunrIndex || term.length < 2) {
      resultsEl.innerHTML = "";
      return;
    }

    // Schedule the actual search after the debounce delay
    searchDebounce = setTimeout(() => {
      const results = performSearch(term);
      displayResults(results);
    }, DEBOUNCE_DELAY);
  });

  // Clear helper
  function clearSearch() {
    searchInput.value = "";
    resultsEl.innerHTML = "";
    if (clearBtn) clearBtn.style.display = "none";
    clearTimeout(searchDebounce);
    searchInput.focus();
  }

  // Clear button click
  if (clearBtn) {
    clearBtn.addEventListener("click", clearSearch);
  }

  // ESC key handling
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      clearSearch();
      clearTimeout(searchDebounce);
    }
  });
})(); 