const Scraper = require("./Scraper");
const express = require("express");
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());
const scraper = new Scraper();

const ScrapperService = async () => {
  const minutesToLinkedinScraper = 1;

  await scraper.linkedinScraper();

  setInterval(async () => {
    await scraper.linkedinScraper();
  }, minutesToLinkedinScraper * 60000);
};

app.get("/", async (_req, res) => {
  const jobs = scraper.linkedinJobs;
  return res.status(200).json(jobs);
});

ScrapperService();

app.listen(port, () => {
    console.log(`Application is alive! Scraping will start soon`);
});
  