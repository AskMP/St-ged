The transition from "bulk scraping" to a "curated + user-import" model is a strategically sound legal move. As of 2026, recipe platforms are increasingly using technical and legal walls to protect their content, particularly against AI-driven aggregation.

### 1. Copyright Law: The "Functional" vs. "Creative" Split

The legal status of a recipe is split into two categories under US law:

* **Non-Copyrightable (The Ingredients):** Under the **"Idea-Expression Dichotomy,"** a list of ingredients and basic measurements are considered "facts" or "formulas." You cannot copyright the fact that a cake needs 2 cups of flour.
* **Copyrightable (The Expression):** The "Headnotes" (stories, tips), original photography, and **substantial literary expression** in the instructions *are* protected. Using the exact wording of a recipe's method can trigger a DMCA notice or a copyright claim.

> **Landmark Rule:** In *Tomaydo-Tomahdo, LLC v. Vozary*, the court reaffirmed that instructions are "functional directions" and statutorily excluded from protection unless they contain "minimal creative expression."

---

### 2. The ToS Landscape & Scraping Risk

While scraping public data is generally legal under the **CFAA (Computer Fraud and Abuse Act)** (reaffirmed by *hiQ Labs v. LinkedIn*), it can still be a **Breach of Contract**.

* **The "Browse-Wrap" Trap:** Most major sites (NYT Cooking, Bon Appétit) have Terms of Service that explicitly forbid "automated data collection" or "crawling."
* **Infrastructure Harm:** If your scraper hits a site too hard, they can sue for **Trespass to Chattels**, claiming you are damaging their server performance.
* **Enforcement 2026:** Leading sites now use **AI-detection** (like Cloudflare or Akamai) to block scrapers in real-time. Bypassing these "technical measures" could potentially risk a violation of the **DMCA’s anti-circumvention provisions**.

---

### 3. User-Initiated Import: The "Safe Harbor" Shield

Allowing a user to paste a URL and "clipping" it into a private library is the safest growth loop for Stàged.

* **Section 512 (DMCA):** As long as the **user** directs the storage of the content, Stàged acts as a "Service Provider." You are shielded from monetary damages provided you have a **Designated Copyright Agent** and a clear **Notice-and-Takedown** process.
* **Private Copying vs. Public Display:** Storing a recipe in a user's *private* account is generally seen as "Fair Use" (similar to a VCR/DVR recording). Legal risk only escalates if Stàged then "re-publishes" that user's private clip into a public, searchable directory.

---

### 4. Content Acquisition Options (2026)

| Option | Legality | Cost | Content Volume |
| --- | --- | --- | --- |
| **Edamam Recipe Search API** | Fully Licensed | $9 - $399+/mo | 2.3M+ Recipes |
| **Spoonacular API** | Fully Licensed | $0 - $300+/mo | 380,000+ Recipes |
| **Open Recipe Data (GitHub)** | CC-BY-3.0 | **Free** | ~13,000 Recipes |
| **Kaggle Datasets** | Public Domain/CC0 | **Free** | 500k+ (Variable Quality) |

---

### 5. Legal Risk Matrix

| Approach | Risk Level | Primary Mitigation |
| --- | --- | --- |
| **Direct Web Scraping** | **High** | Strictly follow `robots.txt` and implement low-velocity crawls. |
| **User URL Import** | **Low** | Register a DMCA Agent and prevent "Public Sharing" of imported recipes. |
| **API Licensing** | **Zero** | Ensure the license permits "Redistribution" to end-users (Commercial Use). |
| **LLM Recipe Generation** | **Medium** | AI "hallucinations" in measurements can lead to **Product Liability** (failed recipes). |

---

### 6. Source List

1. **U.S. Copyright Office (2026):** *Compendium of U.S. Copyright Office Practices, Chapter 313.4(F).*
2. **Edamam (2026):** *Recipe Licensing & Search API Terms.*
3. **Microsoft/Spoonacular (2025):** *Spoonacular Recipe Connector Documentation.*
4. **9th Circuit Court of Appeals:** *hiQ Labs, Inc. v. LinkedIn Corp. (Scraping Precedent).*
5. **Creative Commons:** *Open Recipe Project (CC BY 3.0).*

---

**Would you like me to draft a "Terms of Service" snippet for Stàged that covers your DMCA Safe Harbor requirements for the URL import feature?**