const cheerio = require("cheerio");
const unirest = require("unirest");

class Scraper {
  linkedinJobs = [];
  currentlyScrapingLinkedin = false;
  linkedinKeyWord = "desenvolvedor";
  currentlyScrapingLinkedin = false;

  linkedinScraper = async () => {
    if (this.currentlyScrapingLinkedin) return;
    this.currentlyScrapingLinkedin = true;
    try {
      let range = 3;
      let pageNum = 0;
      let jobs_data = [];
      for (let i = 0; i < range; i++) {
        let url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${this.linkedinKeyWord}&location=Brasil&locationId=&geoId=106057199&f_TPR=r86400&f_WT=1%2C2%2C3&position=1&start=${pageNum}`;
        let response = await unirest.get(url).headers({
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
        });

        if(response.body.error) {
          this.linkedinScraper();
          return;
        }
        const $ = cheerio.load(response.body);

        $(".job-search-card").each(async (i, el) => {
          jobs_data.push({
            title: $(el).find(".base-search-card__title").text()?.trim(),
            company: $(el).find("h4.base-search-card__subtitle").text()?.trim(),
            applyLink: $(el)
              .find("a.base-card__full-link")
              .attr("href")
              ?.trim(),
            id: $(el).attr("data-entity-urn")?.split("urn:li:jobPosting:")[1],
            location: $(el).find(".job-search-card__location").text()?.trim(),
            date: $(el).find(".job-search-card__listdate").text()?.trim(),
          });
        });
      }

      for (let j = 0; j < jobs_data.length; j++) {
        let url2 = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobs_data[j].id}`;

        let response2 = await unirest.get(url2).headers({
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
        });
        const $2 = cheerio.load(response2.body);
        let level = $2("li.description__job-criteria-item:nth-child(1) span")
          .text()
          .trim();

        let type = $2("li.description__job-criteria-item:nth-child(2) span")
          .text()
          .trim();
        let jobDescription = $2(".show-more-less-html__markup").html();
        jobDescription = jobDescription
          ?.replaceAll("<br>", "\n")
          ?.replaceAll("<ul>", "\n")
          ?.replaceAll("<li>", "*")
          ?.replaceAll("</li>", "\n")
          ?.replaceAll("</ul>", "\n");

        jobs_data[j].description = jobDescription;
        jobs_data[j].level = level;
        jobs_data[j].type = type;
      }
      this.currentlyScrapingLinkedin = false;
      this.linkedinJobs = jobs_data;
      console.log(
        `linkedin scraper finished with: ${this.linkedinJobs.length}`
      );
    } catch (e) {
      console.log(e);
    }
  };
}

module.exports = Scraper;
