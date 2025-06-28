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
          this.add(doc);
        }, this);

        // Custom tokenizer separator to split on Arabic punctuation as well
        lunr.tokenizer.separator = /[\s،؛\-\.]+/;
      });
    })
    .catch((err) => {
      console.error("Unable to load Lunr index:", err);
    });

  function performSearch(term) {
    // Add trailing wildcard to each token for partial matches
    const tokens = term.split(/[\s،؛]+/).filter(Boolean);
    const wildcardQuery = tokens.map((t) => `${t}*`).join(" ");
    const results = lunrIndex.search(wildcardQuery);
    return results.map((res) => pagesIndex.find((page) => page.href === res.ref));
  }

  function displayResults(results) {
    resultsEl.innerHTML = "";
    if (!results.length) {
      resultsEl.innerHTML = "<li>لا توجد نتائج</li>";
      return;
    }

    results.forEach((page) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${page.href}">${page.title}</a>`;
      resultsEl.appendChild(li);
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