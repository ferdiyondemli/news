const express = require("express");
const app = express();
const port = 3000;
const ejs = require("ejs");
const dotenv = require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const url = "https://www.google.com/";

var expressLayouts = require("express-ejs-layouts");

app.set("view engine", "ejs");

app.use(expressLayouts);

app.use(express.json());
 
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/", async (req, res) => {
  await clearfile();
  var string = req.body.textarea;
  var array = string.split(",");
  console.log(array[0]);

   for (const element of array) {
     await startBrowser(element);
   }

   await second()
  console.log("finished");

  setTimeout(() => {
    res.download("./" + getToday());
  }, 2000);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Example app listening on port ${port}`);
});

async function startBrowser(keyword) {
  let browser, page;
  let names;
  console.log("Opening the browser......");
  browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-setuid-sandbox"],
    ignoreHTTPSErrors: true,
  });

  page = await browser.newPage();
  await page.goto(
    "https://www.google.com/search?q=" +
      keyword +
      "&newwindow=1&biw=2133&bih=414&tbs=qdr%3Ad&tbm=nws&ei=AYUcY9K1GdiPxc8Pupuw6AM&ved=0ahUKEwiSuoPknor6AhXYR_EDHboNDD0Q4dUDCA0&uact=5&oq=tayyip&gs_lcp=Cgxnd3Mtd2l6LW5ld3MQAzILCAAQgAQQsQMQgwEyCwgAEIAEELEDEIMBMggIABCABBCxAzILCAAQgAQQsQMQgwEyCwgAEIAEELEDEIMBMggIABCxAxCDATIICAAQsQMQgwEyCAgAELEDEIMBMggIABCxAxCDATILCAAQgAQQsQMQgwE6BggAEB4QDToECAAQAzoKCAAQsQMQgwEQQ1D1DliNF2C3HGgBcAB4AYAB3QGIAesKkgEFMC42LjKYAQCgAQHAAQE&sclient=gws-wiz-news"
  );

  try {
    names = await page.evaluate(async () => {
      return await Array.from(
        document.querySelectorAll("#rso > div > div > div")
      ).map((x) => {
        let adana =
          "\n\n" +
          x.querySelector("div > a > div > div.iRPxbe> div:nth-child(2)")
            .textContent +
          "\r\n" +
          x.querySelector("div a");

        return adana;
      });
    });
  } catch (error) {
    console.log("geting content error: " + error);
  }

  console.log(names);

  fs.appendFile(getToday(), names.join("\r\n"), (err) => {
    if (err) {
      console.log(err);
    }
  });
  console.log("file created");

  browser.close();
}

async function clearfile() {
  await fs.writeFileSync(getToday(), "");
}

function getToday() {
  let date = new Date().toLocaleDateString("tr-TR", { dateStyle: "short" });

  let today = date + ".txt";
  return today;
}

async function second() {
  let browser, page;
  browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-setuid-sandbox"],
    ignoreHTTPSErrors: true,
  });
  const context = browser.defaultBrowserContext();
  context.overridePermissions("https://www.resmigazete.gov.tr/", [
    "clipboard-read",
  ]);

  page = await browser.newPage();
  await page.goto("https://www.resmigazete.gov.tr/");

  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.press("KeyC");

  let adana ="\n\n\n"
  adana +=await page.evaluate(() => navigator.clipboard.readText());

  await fs.appendFile(
    getToday(),
    adana,
    "utf8",

    function (err) {
      if (err) throw err;
    }
  );

  browser.close();
}
