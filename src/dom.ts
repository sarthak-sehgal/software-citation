import "bootstrap";
import * as jQuery from "jquery";
import { getDoi, getGHData, generateCff, downloadCff } from "./apiReq";
import { resObjType, cffDataType, authorType } from "./config";
const delay = require("delay");
let $: any = jQuery;

/** Variables */
const getStartedBtnDiv = <HTMLButtonElement>(
  document.getElementById("get-started-btn")!
);
const learnMoreBtn = <HTMLButtonElement>(
  document.getElementById("learn-more-btn")!
);
const navItems = document.getElementsByClassName("nav-link")!;
const warningModalContinueBtn = <HTMLButtonElement>(
  document.getElementById("warningModalContinueBtn")!
);
const warningModalStayBtn = <HTMLButtonElement>(
  document.getElementById("warningModalStayBtn")!
);
const step1Form = <HTMLFormElement>document.getElementById("step1-form")!;
const zenodoToken = <HTMLInputElement>document.getElementById("zenodoToken")!;
const githubURL = <HTMLInputElement>document.getElementById("githubURL")!;
const step1Error = document.getElementById("step1-error")!;
const spinnerMsg = document.getElementById("spinner-msg")!;
const ghUrlWarning = document.getElementById("ghUrlWarning")!;
const step2Form = <HTMLFormElement>document.getElementById("step2-form")!;
const step2BackBtn = <HTMLButtonElement>(
  document.getElementById("step2-back-btn")
);
const step2Error = document.getElementById("step2-error")!;
const progressBar = document.getElementById("progress-bar")!;
const step3BackBtn = <HTMLButtonElement>(
  document.getElementById("step3-back-btn")!
);
const downloadCffBtn = <HTMLButtonElement>(
  document.getElementById("download-cff")!
);
const step3Error = document.getElementById("step3-error")!;
const doiListItem = document.getElementById("doi-list-item")!;

const step2FormFields: {
  title: HTMLInputElement;
  ["date-released"]: HTMLInputElement;
  version: HTMLInputElement;
  doi: HTMLInputElement;
  message: HTMLInputElement;
  abstract: HTMLInputElement;
} = {
  title: <HTMLInputElement>document.getElementById("form-title")!,
  ["date-released"]: <HTMLInputElement>(
    document.getElementById("form-release-date")!
  ),
  version: <HTMLInputElement>document.getElementById("form-release-version")!,
  doi: <HTMLInputElement>document.getElementById("form-doi")!,
  message: <HTMLInputElement>document.getElementById("form-message")!,
  abstract: <HTMLInputElement>document.getElementById("form-abstract")!,
};

let isGettingStartedClicked = false;
let navItemUrl: string;
let fileName = "";
let data: cffDataType = {};

/** Utility Functions */
function fadeOutDiv(id: string, dur: number) {
  $("#" + id).fadeOut(dur);
}

function fadeInDiv(id: string, dur: number) {
  $("#" + id).fadeIn(dur);
}

function crossFadeDivs(
  idOut: string,
  idIn: string,
  dur: number,
  cb?: () => void
) {
  (async () => {
    fadeOutDiv(idOut, dur / 2);
    setTimeout(() => fadeInDiv(idIn, dur / 2), 0.8 * dur);
    if (cb) {
      await delay(dur);
      cb();
    }
  })();
}

/** DOM changes */
// startup changes
fadeOutDiv("spinnerDiv", 0);

// cross fade on get started button click
getStartedBtnDiv.addEventListener("click", () => {
  isGettingStartedClicked = true;
  crossFadeDivs("landing", "steps", 500);
});

// show warning modal on clicking nav item
for (let i = 0; i < navItems.length; i++) {
  navItems[i].addEventListener("click", () => {
    if (isGettingStartedClicked == true) {
      navItemUrl = navItems[i].getAttribute("data-url")!;
      $("#warningModal").modal("show");
    } else {
      window.location.href = navItems[i].getAttribute("data-url")!;
    }
  });
}

// actions for the warning modal
warningModalContinueBtn.addEventListener("click", () => {
  isGettingStartedClicked = false;
  window.location.href = navItemUrl;
});
warningModalStayBtn.addEventListener("click", () => {
  $("#warningModal").modal("hide");
});

// on going from step1->step2
step1Form.addEventListener(
  "submit",
  (e) => {
    step1Error.innerHTML = "";
    e.preventDefault();
    e.stopPropagation();
    if (step1Form.checkValidity() === false) {
      step1Form.classList.add("was-validated");
      return;
    }

    // simply cross fade without server request for now
    // crossFadeDivs('step1', 'step2', 300);
    // progressBar.style.width = "66%";

    crossFadeDivs("step1", "spinnerDiv", 300);
    spinnerMsg.innerHTML = "Fetching data...";
    (async () => {
      await delay(300);
      getDoi(zenodoToken.value, (res: resObjType) => {
        if (res.status == 0) {
          crossFadeDivs("spinnerDiv", "step1", 100);
          fadeInDiv("step1-error", 150);
          step1Error.innerHTML = res.message;
        } else {
          data.doi = res.message;
          console.log("Getting data from GitHub");
          getGHData(githubURL.value, (res: resObjType) => {
            if (res.status == 0) {
              crossFadeDivs("spinnerDiv", "step1", 100);
              fadeInDiv("step1-error", 150);
              step1Error.innerHTML = res.message;
            } else {
              if (res.status == 2) {
                ghUrlWarning.style.display = "block";
              } else {
                data.title = res.data?.title?.replace(/[^\x00-\x7F]/g, "");
                data.abstract = res.data?.description?.replace(
                  /[^\x00-\x7F]/g,
                  ""
                );
              }

              setFormData();
              crossFadeDivs("spinnerDiv", "step2", 100);
              progressBar.style.width = "66%";
            }
          });
        }
      });
    })();
  },
  false
);

let setFormData = () => {
  step2FormFields.title.value = data.title || "";
  step2FormFields.doi.value = data.doi || "";
  step2FormFields.abstract.value = data.abstract || "";
  step2FormFields["date-released"].value = getDate();
};

function getDate() {
  let date = new Date();
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() + offset * 60 * 1000);
  return date.toISOString().split("T")[0];
}

// on going from step2->step3
step2Form.addEventListener(
  "submit",
  (e) => {
    step2Error.innerHTML = "";
    e.preventDefault();
    e.stopPropagation();
    if (step2Form.checkValidity() === false) {
      step2Form.classList.add("was-validated");
      return;
    }
    data.title = step2FormFields.title.value;
    data.message = step2FormFields.message.value;
    data.abstract = step2FormFields.abstract.value;
    data["date-released"] = step2FormFields["date-released"].value;
    data.version = step2FormFields.version.value;
    // replace {{DOI}} with actual DOI
    let str = doiListItem.innerHTML;
    str = str.replace("{{DOI}}", data.doi || "");
    doiListItem.innerHTML = str;

    crossFadeDivs("step2", "spinnerDiv", 300);
    spinnerMsg.innerHTML = "Generating CITATION.cff...";
    (async () => {
      await delay(300);
      generateCff(data, (res: resObjType) => {
        if (res.status == 1) {
          crossFadeDivs("spinnerDiv", "step3", 300);
          progressBar.style.width = "100%";
          fileName = res.message;
        } else {
          crossFadeDivs("spinnerDiv", "step2", 100);
          fadeInDiv("step2-error", 150);
          step2Error.innerHTML = res.message;
        }
      });
    })();
  },
  false
);

// on going back: step2->step1
step2BackBtn.addEventListener("click", () => {
  crossFadeDivs("step2", "step1", 300);
  progressBar.style.width = "33%";
  (async () => {
    await delay(400);
    step2Form.reset();
  })();
});

// on going back: step3->step2
step3BackBtn.addEventListener("click", () => {
  crossFadeDivs("step3", "step2", 300);
  progressBar.style.width = "66%";
});

// on going from step3->download cff
downloadCffBtn.addEventListener(
  "click",
  (e) => {
    step3Error.innerHTML = "";
    e.preventDefault();
    e.stopPropagation();
    if (fileName.trim() == "") {
      fadeInDiv("step3-error", 150);
      step3Error.innerHTML =
        "Some error occurred. Please go back and try again.";
      return;
    }

    downloadCff(fileName);
  },
  false
);
